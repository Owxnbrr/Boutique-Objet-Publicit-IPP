// src/components/ClientGrid.tsx
"use client";

import { ProductCard } from "@/components/ProductCard";

export type Row = {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  min_qty?: number | null;
};

export default function ClientGrid({ rows }: { rows: Row[] }) {
  return (
    <div className="grid">
      {rows.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          thumbnail_url={p.thumbnail_url}
          min_qty={p.min_qty ?? undefined}
        />
      ))}
    </div>
  );
}
