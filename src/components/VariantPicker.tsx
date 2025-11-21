// src/components/VariantPicker.tsx
"use client";

import { useEffect, useState } from "react";

type Variant = {
  sku: string;
  color?: string | null;
  size?: string | null;
};

type Props = {
  variants: Variant[];
  productName: string;
  minQty: number;
  thumbnailUrl: string | null;
  baseUnit: number;
  productId: string;
  selectedSku?: string;
  onChangeSku?: (sku: string) => void;
};

export default function VariantPicker({
  variants,
  productName,
  minQty,
  thumbnailUrl,
  baseUnit,
  productId,
  selectedSku,
  onChangeSku,
}: Props) {
  // si le parent ne donne rien, on garde un état interne
  const [localSku, setLocalSku] = useState(
    selectedSku || variants[0]?.sku || ""
  );

  useEffect(() => {
    if (selectedSku && selectedSku !== localSku) {
      setLocalSku(selectedSku);
    }
  }, [selectedSku]);

  function chooseSku(sku: string) {
    setLocalSku(sku);
    onChangeSku?.(sku); // <--- très important
  }

  // et dans ton rendu, partout où tu avais un onClick sur une variante :
  // on remplace par chooseSku()

  return (
    <div className="variant-picker">
      {/* EXEMPLE : boutons de couleur */}
      <div className="variant-list">
        {variants.map((v) => (
          <button
            key={v.sku}
            type="button"
            onClick={() => chooseSku(v.sku)}
            className={
              "variant-pill" + (v.sku === localSku ? " variant-pill--active" : "")
            }
          >
            {v.sku}
            {v.color ? ` • ${v.color}` : ""}
            {v.size ? ` • ${v.size}` : ""}
          </button>
        ))}
      </div>

      {/* … le reste de ta logique d’ajout au panier, en utilisant localSku
          comme sku sélectionné */}
    </div>
  );
}
