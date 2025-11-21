// src/components/ProductClient.tsx
"use client";

import { useState, useMemo } from "react";
import Gallery from "./Gallery";
import VariantPicker from "./VariantPicker";
import QuoteForm from "./QuoteForm";

type Props = {
  product: any;
  variants: any[];
  images: { url: string; variant_sku?: string | null }[];
  priceBySku: Record<string, number>;
  defaultSku: string;
  minQty: number;
};

export default function ProductClient({
  product,
  variants,
  images,
  priceBySku,
  defaultSku,
  minQty,
}: Props) {
  const [selectedSku, setSelectedSku] = useState(defaultSku);

  const displayedImages = useMemo(() => {
    const variantImgs = images.filter((i) => i.variant_sku === selectedSku);
    if (variantImgs.length) return variantImgs;
    const common = images.filter((i) => !i.variant_sku);
    return common.length ? common : images;
  }, [selectedSku, images]);

  const unitPrice = priceBySku[selectedSku] ?? product.base_price ?? 0;

  return (
    <section className="row">
      <Gallery images={displayedImages} alt={product.name} />

      <aside className="panel">
        <h1 className="h1">{product.name}</h1>
        <p className="muted">
          MOQ: {minQty} • Délai: {product.lead_time_days ?? "-"} j
        </p>

        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px" }}>
          <span className="badge">ANDA</span>
          {product.category && <span className="badge">{product.category}</span>}
        </div>

        <VariantPicker
          variants={variants.map((v) => ({
            sku: v.id_anda,
            color: null,
            size: null,
          }))}
          productName={product.name}
          minQty={minQty}
          thumbnailUrl={product.thumbnail_url}
          baseUnit={unitPrice}
          productId={product.id}
          selectedSku={selectedSku}
          onChangeSku={setSelectedSku}
        />

        <hr className="hr" />
        <h2>Demander un devis</h2>

        <QuoteForm
          productId={product.id}
          variants={variants.map((v) => ({ sku: v.id_anda }))}
          minQty={minQty}
          defaultSku={selectedSku}
        />
      </aside>
    </section>
  );
}
