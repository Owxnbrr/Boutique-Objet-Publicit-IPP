// src/app/product/[id]/page.tsx
import { admin } from "@/lib/db";
import ProductClient from "@/components/ProductClient";

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

  // 2) Famille ANDA = tout ce qui est avant le premier "-"
  const idAnda = (product as any).id_anda as string | null;
  let familyVariants: any[] = [];

  if (idAnda) {
    const family =
      idAnda && idAnda.includes("-") ? idAnda.split("-")[0] : idAnda;

    const { data: siblings, error: siblingsError } = await db
      .from("products")
      .select("id, id_anda, name, thumbnail_url, base_price, min_qty, category")
      .like("id_anda", `${family}%`)
      .order("id_anda");

    if (siblingsError) {
      console.error(siblingsError);
      familyVariants = [product];
    } else {
      familyVariants = siblings ?? [product];
    }
  } else {
    familyVariants = [product];
  }

  // 3) Images du produit de base
  const { data: baseImages = [] } = await db
    .from("assets")
    .select("url")
    .eq("product_id", product.id);

  // 4) Images par variante (clé = id_anda)
  const imagesByVariant: Record<string, { url: string }[]> = {};

  for (const v of familyVariants) {
    const { data: imgs = [] } = await db
      .from("assets")
      .select("url")
      .eq("product_id", v.id);

    if (v.id_anda) {
      imagesByVariant[v.id_anda] = imgs ?? [];
    }
  }

  // 5) Prix de base : on regarde la première variante, sinon base_price
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

  // 6) Server action pour la demande de devis
  async function submitQuote(formData: FormData) {
    "use server";

    const variant_sku =
      (formData.get("variant_sku") as string) ??
      (familyVariants[0] as any)?.id_anda ??
      "";

    const quantity = Number(formData.get("quantity") || minQty || 1);

    const payload = {
      product_id: product.id,
      variant_sku,
      quantity,
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };

    // Même endpoint qu'avant
    await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return (
    <ProductClient
      product={product}
      variants={familyVariants}
      baseImages={baseImages ?? []}
      imagesByVariant={imagesByVariant}
      baseUnit={baseUnit}
      minQty={minQty}
      submitQuote={submitQuote}
    />
  );
}
