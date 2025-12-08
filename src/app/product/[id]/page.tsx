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
  id_anda: string | null;
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
  const minQty = product.min_qty ?? 1;

  const { data: siblingsData } = await db
    .from("products")
    .select("id, name, thumbnail_url, id_anda")
    .eq("name", product.name)
    .order("id_anda");

  const siblings = (siblingsData ?? []) as ProductRow[];

  const variants = siblings.map((p) => ({
    sku: p.id_anda ?? p.id,
    color: null as string | null,
    size: null as string | null,
  }));

  const { data: imageData } = await db
    .from("assets")
    .select("url")
    .eq("product_id", product.id);

  const images = (imageData ?? []) as ImageRow[];

  const priceBySku: Record<string, number> = {};

  const variantSkus = variants.map((v) => v.sku).filter(Boolean);
  if (variantSkus.length > 0) {
    const { data: priceData } = await db
      .from("prices")
      .select("variant_sku, unit_price, qty_break")
      .in("variant_sku", variantSkus)
      .order("qty_break", { ascending: true });

    const rows = (priceData ?? []) as PriceRow[];
    for (const row of rows) {
      if (priceBySku[row.variant_sku] == null) {
        priceBySku[row.variant_sku] = Number(row.unit_price) || 0;
      }
    }
  }

  const defaultSku = variants[0]?.sku || product.id_anda || product.id;
  const basePrice =
    (defaultSku && priceBySku[defaultSku]) ||
    Number(product.base_price ?? 0) ||
    0;

  return (
    <ProductClient
      product={product}
      variants={variants}
      images={images}
      priceBySku={priceBySku}
      defaultSku={defaultSku}
      minQty={minQty}
      basePrice={basePrice}
      siblings={siblings}
    />
  );
}
