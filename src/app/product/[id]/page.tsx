// src/app/product/[id]/page.tsx
import { admin } from "@/lib/db";
import Gallery from "@/components/Gallery";
import VariantPicker from "@/components/VariantPicker";
import { redirect } from "next/navigation";

// 📨 Server Action : création d'une demande de devis
async function createQuote(formData: FormData) {
  "use server";

  const db = admin();

  const productId = formData.get("product_id")?.toString() || null;
  const variantSku = formData.get("variant_sku")?.toString() || null;
  const quantity = Number(formData.get("quantity") || 1);

  const name = formData.get("name")?.toString() || null;
  const email = formData.get("email")?.toString() || null;
  const company = formData.get("company")?.toString() || null;
  const message = formData.get("message")?.toString() || null;

  if (!productId || !name || !email) {
    console.error("quote: missing required fields", { productId, name, email });
    redirect("/catalog?quote=error");
  }

  const { error } = await db.from("quotes").insert({
    product_id: productId,
    variant_sku: variantSku,
    quantity,
    name,
    email,
    company,
    message,
  });

  if (error) {
    console.error("quote insert error", error);
    redirect("/catalog?quote=error");
  }

  redirect("/catalog?quote=ok");
}

export default async function ProductPage({ params }: { params: { id: string } }) {
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

        {/* 🧾 FORMULAIRE DE DEVIS */}
        <form
          action={createQuote}
          style={{ display: "grid", gap: 10, marginTop: 8 }}
        >
          {/* product_id caché pour la server action */}
          <input type="hidden" name="product_id" value={product.id as string} />

          {/* Variante */}
          <label className="field">
            <span>Variante</span>
            <select name="variant_sku" defaultValue={defaultSku ?? ""}>
              {variants?.map((v: any) => (
                <option key={v.sku} value={v.sku}>
                  {v.sku} {v.color ? `• ${v.color}` : ""}{" "}
                  {v.size ? `• ${v.size}` : ""}
                </option>
              ))}
            </select>
          </label>

          {/* Quantité */}
          <label className="field">
            <span>Quantité</span>
            <input
              className="input"
              name="quantity"
              type="number"
              min={minQty}
              defaultValue={minQty}
              required
            />
          </label>

          {/* Nom / email / société */}
          <div style={{ display: "flex", gap: 10 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Nom / Prénom</span>
              <input
                className="input"
                name="name"
                type="text"
                placeholder="Votre nom"
                required
              />
            </label>

            <label className="field" style={{ flex: 1 }}>
              <span>Société (optionnel)</span>
              <input
                className="input"
                name="company"
                type="text"
                placeholder="Nom de la société"
              />
            </label>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              required
            />
          </label>

          {/* Message libre */}
          <label className="field">
            <span>Message (optionnel)</span>
            <textarea
              className="input"
              name="message"
              rows={3}
              placeholder="Précisions, marquage, délais, etc."
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
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
