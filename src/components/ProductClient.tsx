// src/components/ProductClient.tsx
"use client";

import { useState } from "react";
import Gallery from "./Gallery";
import VariantPicker from "./VariantPicker";
import QuoteForm from "./QuoteForm";

type Variant = {
  sku: string;
  color: string | null;
  size: string | null;
};

type ImageRow = {
  url: string;
};

type Sibling = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  id_anda: string | null;
};

type Props = {
  product: any;
  variants: Variant[];
  images: ImageRow[];
  priceBySku: Record<string, number>;
  defaultSku?: string;
  minQty: number;
  basePrice: number;
  siblings?: Sibling[];
};

export default function ProductClient({
  product,
  variants,
  images,
  priceBySku,
  defaultSku,
  minQty,
  basePrice,
  siblings = [],
}: Props) {
  const initialSku = defaultSku || variants[0]?.sku || product.id_anda || "";
  const [selectedSku, setSelectedSku] = useState(initialSku);

  const unitPrice =
    (selectedSku && priceBySku[selectedSku]) || basePrice || 0;

  const safeImages = images ?? [];

  return (
    <section className="row">
      <Gallery images={safeImages} alt={product.name} />

      <aside className="panel">
        <h1 className="h1" style={{ marginTop: 0 }}>
          {product.name}
        </h1>

        <p className="muted">
          MOQ: {minQty} • Délai: {product.lead_time_days ?? "-"} j
        </p>

        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px" }}>
          <span className="badge">ANDA</span>
          {product.category && <span className="badge">{product.category}</span>}
        </div>

        {/* Variantes = tous les produits de la même famille ANDA */}
        <VariantPicker
          variants={variants}
          productName={product.name}
          minQty={minQty}
          thumbnailUrl={product.thumbnail_url}
          baseUnit={unitPrice}
          productId={product.id}
          selectedSku={selectedSku}
          onChangeSku={setSelectedSku}
        />

        <hr className="hr" />

        {/* Autres variantes (liens vers les autres produits de la famille) */}
        {siblings.length > 1 && (
          <>
            <h3 className="h2">Autres variantes</h3>
            <div className="grid" style={{ marginBottom: 16 }}>
              {siblings
                .filter((p) => p.id !== product.id)
                .map((p) => (
                  <a
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="mini-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8, 
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        overflow: "hidden",
                        aspectRatio: "1/1",
                        width: "20%",
                        height: 100,
                        display:"flex",

                      }}
                    >
                      {/* tu peux remplacer par <Image> si tu veux */}
                      <img
                        src={p.thumbnail_url ?? "/placeholder.jpg"}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ fontSize: 14 }}>
                      <strong>{p.name}</strong>
                      <div className="muted">{p.id_anda}</div>
                    </div>
                  </a>
                ))}
            </div>
          </>
        )}

        <h3 className="h2">Demander un devis</h3>

        <QuoteForm
          productId={product.id}
          variants={variants}
          minQty={minQty}
          defaultSku={selectedSku}
          selectedSku={selectedSku}
        />
      </aside>
    </section>
  );
}
