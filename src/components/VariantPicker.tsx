// src/components/VariantPicker.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AddToCart from "@/components/ui/AddToCart";
import { getUnitPrice } from "@/lib/cartDb";

export type Variant = { sku: string; color?: string | null; size?: string | null };

type Props = {
  variants: Variant[];
  productName: string;
  minQty: number;
  thumbnailUrl?: string | null;
  baseUnit: number;
  productId: string;
};

export default function VariantPicker({
  variants,
  productName,
  minQty,
  thumbnailUrl,
  baseUnit,
  productId,
}: Props) {
  const [sku, setSku] = useState<string | undefined>(variants[0]?.sku);
  const [unit, setUnit] = useState<number>(baseUnit);

  // Mettre à jour le prix quand la variante change (pour qty = minQty)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getUnitPrice(productId, sku ?? null, minQty);
      if (mounted) setUnit(u || 0);
    })();
    return () => {
      mounted = false;
    };
  }, [productId, sku, minQty]);

  const eur = useMemo(
    () => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }),
    []
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {variants.length > 0 && (
        <label>
          Variante
          <select
            className="input"
            value={sku}
            onChange={(e) => setSku(e.target.value || undefined)}
            style={{ marginTop: 6 }}
          >
            {variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.sku} {v.color ? `• ${v.color}` : ""} {v.size ? `• ${v.size}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="muted">
        Prix unitaire (dès {minQty}) : <strong>{eur.format(unit)}</strong>
      </div>

      <AddToCart
        withQtyPicker
        product={{
          id: productId,
          sku,
          name: productName,
          unitPrice: unit,
          image: thumbnailUrl ?? undefined,
          minQty,
        }}
      />
    </div>
  );
}
