// src/app/product/[id]/page.tsx
import { admin } from "@/lib/db";
import Gallery from "@/components/Gallery";
import VariantPicker from "@/components/VariantPicker";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const db = admin();

  // 1) Produit courant
  const { data: product, error } = await db
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !product) {
    console.error(error);
    return <div>Produit introuvable</div>;
  }

  // 2) Famille ANDA à partir de id_anda
  const idAnda = (product as any).id_anda as string | null;
  let familyVariants: any[] = [];

  if (idAnda) {
    const family =
      idAnda && idAnda.includes("-") ? idAnda.split("-")[0] : idAnda;

    const { data: siblings, error: siblingsError } = await db
      .from("products")
      .select("id, id_anda, name, thumbnail_url, base_price, min_qty")
      .like("id_anda", `${family}%`);

    if (!siblingsError && siblings) {
      familyVariants = siblings;
    }
  } else {
    // fallback : au moins une "variante" = le produit lui-même
    familyVariants = [product];
  }

  // 3) Images
  const { data: images = [] } = await db
    .from("assets")
    .select("url")
    .eq("product_id", product.id);

  // 4) Prix de base (on prend le prix de la 1ère variante si possible)
  let baseUnit = 0;
  const defaultSku: string | undefined =
    (familyVariants[0] as any)?.id_anda ?? undefined;

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
          {product.category && (
            <span className="badge">{product.category}</span>
          )}
        </div>

        {/* Variantes = toutes les références ANDA de la même famille */}
        <VariantPicker
          variants={(familyVariants || []).map((v: any) => ({
            sku: v.id_anda as string, // on affiche le code ANDA
            color: null, // si un jour tu rajoutes une colonne "color", tu l’utilises ici
            size: null,
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
          {familyVariants?.map((v: any) => (
            <li key={v.id}>
              {v.id_anda}
              {/* tu pourras ajouter ici la couleur ou la taille si tu les stockes */}
            </li>
          ))}
        </ul>

        <hr className="hr" />
        <h3 id="devis" className="h2">
          Demander un devis
        </h3>

        {/* Formulaire de devis */}
        <form
          action={async (fd) => {
            "use server";

            const payload = {
              product_id: product.id,
              variant_sku:
                (fd.get("variant_sku") as string) ||
                (familyVariants[0] as any)?.id_anda ||
                undefined,
              quantity: Number(fd.get("quantity") || minQty || 1),
              name: fd.get("name"),
              email: fd.get("email"),
              company: fd.get("company"),
              message: fd.get("message"),
            };

            await fetch("/api/quote", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }}
          style={{ display: "grid", gap: 10 }}
        >
          <label>
            Variante
            <select name="variant_sku" defaultValue={defaultSku}>
              {familyVariants?.map((v: any) => (
                <option key={v.id} value={v.id_anda}>
                  {v.id_anda}
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

          {/* tu gardes ici tes champs nom / mail / société / message comme avant */}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
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