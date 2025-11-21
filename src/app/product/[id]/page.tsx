// src/app/product/[id]/page.tsx
import { admin } from "@/lib/db";
import ProductClient from "@/components/ProductClient";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  lead_time_days: number | null;
  min_qty: number | null;
  thumbnail_url: string | null;
  base_price: number | null;
};

type VariantRow = {
  sku: string;
  color: string | null;
  size: string | null;
};

type ImageRow = {
  url: string;
};

type PriceRow = {
  variant_sku: string;
  unit_price: number;
  qty_break: number;
};

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const db = admin();

  // Produit
  const { data: productData, error: productError } = await db
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single<ProductRow>();

  if (productError || !productData) {
    console.error(productError);
    return <div>Produit introuvable</div>;
  }

  const product = productData;

  // Variantes
  const { data: variantData } = await db
    .from("variants")
    .select("sku, color, size")
    .eq("product_id", params.id);

  const variants = (variantData ?? []) as VariantRow[];

  // Images
  const { data: imageData } = await db
    .from("assets")
    .select("url")
    .eq("product_id", params.id);

  const images = (imageData ?? []) as ImageRow[];

  // Prix
  const priceBySku: Record<string, number> = {};

  if (variants.length > 0) {
    const skus = variants.map((v) => v.sku);

    const { data: priceData } = await db
      .from("prices")
      .select("variant_sku, unit_price, qty_break")
      .in("variant_sku", skus)
      .order("qty_break", { ascending: true });

    const rows = (priceData ?? []) as PriceRow[];

    for (const row of rows) {
      if (priceBySku[row.variant_sku] == null) {
        priceBySku[row.variant_sku] = Number(row.unit_price) || 0;
      }
    }
  }

  const defaultSku = variants[0]?.sku;
  const minQty = product.min_qty ?? 1;

  return (
    <ProductClient
      product={product}
      variants={variants}
      images={images}
      priceBySku={priceBySku}
      defaultSku={defaultSku}
      minQty={minQty}
    />
  );
}
