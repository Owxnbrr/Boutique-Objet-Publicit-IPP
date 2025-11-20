// src/app/product/[id]/page.tsx
import { admin } from "@/lib/db";
import Gallery from "@/components/Gallery";
import VariantPicker from "@/components/VariantPicker";
import { sendQuoteEmail } from "@/lib/mailer";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const db = admin();

  const { data: product } = await db
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) return <div>Produit introuvable</div>;

  const { data: variants = [] } = await db
    .from("variants")
    .select("*")
    .eq("product_id", params.id);

  const { data: images = [] } = await db
    .from("assets")
    .select("url")
    .eq("product_id", params.id);

  let baseUnit = 0;
  const defaultSku: string | undefined = variants?.[0]?.sku;

  if (defaultSku) {
    const { data: priceRow } = await db
      .from("prices")
      .select("unit_price, qty_break")
      .eq("variant_sku", defaultSku)
      .order("qty_break", { ascending: true })
      .limit(1)
      .maybeSingle();

    baseUnit = Number(priceRow?.unit_price) || 0;
  }

  if (!baseUnit && product.base_price != null) {
    baseUnit = Number(product.base_price) || 0;
  }

  const minQty = product.min_qty ?? 1;

  return (
    <section className="row">
      <Gallery images={images ?? []} alt={product.name} />

      <aside className="panel">
        <h1 className="h1" style={{ marginTop: 0 }}>
          {product.name}
        </h1>

        <p className="muted">
          MOQ: {minQty} • Délai: {product.lead_time_days} j
        </p>

        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px" }}>
          <span className="badge">ANDA</span>
          {product.category && <span className="badge">{product.category}</span>}
        </div>

        <VariantPicker
          variants={(variants || []).map((v: any) => ({
            sku: v.sku as string,
            color: v.color ?? null,
            size: v.size ?? null,
          }))}
          productName={product.name}
          minQty={minQty}
          thumbnailUrl={product.thumbnail_url ?? null}
          baseUnit={baseUnit}
          productId={product.id as string}
        />

        <hr className="hr" />

        <h3 className="h2">Variantes</h3>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {variants?.map((v: any) => (
            <li key={v.sku}>
              {v.sku} {v.color ? `• ${v.color}` : ""}{" "}
              {v.size ? `• ${v.size}` : ""}
            </li>
          ))}
        </ul>

        <hr className="hr" />
        <h3 id="devis" className="h2">
          Demander un devis
        </h3>

        <form
          action={async (fd) => {
            "use server";

            const db = admin();

            const variantSku =
              (fd.get("variant_sku") as string) ||
              variants?.[0]?.sku ||
              undefined;

            const quantity = Math.max(
              minQty,
              Number(fd.get("quantity") || minQty || 1)
            );

            const name = (fd.get("name") as string) ?? "";
            const email = (fd.get("email") as string) ?? "";
            const company = (fd.get("company") as string) || null;
            const message = (fd.get("message") as string) || null;

            // 1) Enregistrer dans Supabase (table quotes)
            const { error } = await db.from("quotes").insert({
              product_id: product.id,
              variant_sku: variantSku,
              quantity,
              name,
              email,
              company,
              message,
            });

            if (error) {
              console.error("Erreur insertion quote :", error);
              return;
            }

            // 2) T’envoyer un mail avec les infos
            await sendQuoteEmail({
              productName: product.name,
              variantSku,
              quantity,
              name,
              email,
              company: company ?? undefined,
              message: message ?? undefined,
            });
          }}
          style={{ display: "grid", gap: 10, marginTop: 10 }}
        >
          <label>
            Variante
            <select
              className="input"
              name="variant_sku"
              defaultValue={defaultSku}
            >
              {variants?.map((v: any) => (
                <option key={v.sku} value={v.sku}>
                  {v.sku} {v.color ? `• ${v.color}` : ""}{" "}
                  {v.size ? `• ${v.size}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantité
            <input
              className="input"
              name="quantity"
              type="number"
              min={minQty}
              defaultValue={minQty}
            />
          </label>

          <label>
            Nom complet
            <input className="input" name="name" type="text" required />
          </label>

          <label>
            Email
            <input className="input" name="email" type="email" required />
          </label>

          <label>
            Société (optionnel)
            <input className="input" name="company" type="text" />
          </label>

          <label>
            Message (optionnel)
            <textarea className="input" name="message" rows={4} />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button className="btn btn-primary" type="submit">
              Envoyer la demande
            </button>
            <a className="btn btn-ghost" href="/catalog">
              Retour catalogue
            </a>
          </div>
        </form>
      </aside>
    </section>
  );
}
