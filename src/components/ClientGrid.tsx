'use client';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';

type Row = { id: string; name: string; thumbnail_url?: string | null; min_qty?: number };

export default function ClientGrid({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => (r.name ?? '').toLowerCase().includes(s));
  }, [q, rows]);

  return (
    <div>

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            thumbnail_url={p.thumbnail_url}
            min_qty={p.min_qty}
          />
        ))}
      </div>
    </div>
  );
}
