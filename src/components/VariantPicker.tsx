// src/components/VariantPicker.tsx
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/useCart";

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
  baseUnit: number;      // prix unitaire de la variante sélectionnée
  productId: string;
  selectedSku?: string;  // sku piloté par le parent (ProductClient)
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
  // ⚠️ API Zustand existante : s.add (comme dans AddToCart.tsx)
  const add = useCart((s) => s.add);

  const initialSku = selectedSku || variants[0]?.sku || "";
  const [localSku, setLocalSku] = useState<string>(initialSku);
  const [quantity, setQuantity] = useState<number>(minQty);

  // Quand le parent change le sku (ProductClient)
  useEffect(() => {
    if (selectedSku && selectedSku !== localSku) {
      setLocalSku(selectedSku);
    }
  }, [selectedSku, localSku]);

  // Si la MOQ change, on réajuste la quantité
  useEffect(() => {
    setQuantity(minQty);
  }, [minQty]);

  function chooseSku(sku: string) {
    setLocalSku(sku);
    onChangeSku?.(sku);
  }

  function handleAddToCart() {
    if (!localSku) return;

    // On suit exactement le même shape que dans src/components/ui/AddToCart.tsx
    add({
      id: productId,
      sku: localSku,
      name: productName,
      unitPrice: baseUnit,
      currency: "EUR",
      image: thumbnailUrl ?? undefined,
      qty: quantity,
      minQty,
    });
  }

  const currentVariant = variants.find((v) => v.sku === localSku);

  return (
    <div className="variant-picker">
      {/* Choix de la variante */}
      {/* <div className="variant-list">
        {variants.map((v) => {
          const isActive = v.sku === localSku;
          const labelParts = [
            v.color ?? undefined,
            v.size ?? undefined,
          ].filter(Boolean);
          const label = labelParts.length ? labelParts.join(" • ") : v.sku;

          return (
            <button
              key={v.sku}
              type="button"
              onClick={() => chooseSku(v.sku)}
              className={
                "variant-pill" + (isActive ? " variant-pill--active" : "")
              }
            >
              {label}
            </button>
          );
        })}
      </div> */}

      {/* Prix / quantité / panier */}
      <div className="variant-actions">
        <div className="price-line">
          {baseUnit > 0 ? (
            <span className="price">
              {(baseUnit * quantity).toFixed(2)} € HT
              <span className="price-unit">
                {" "}
                ({baseUnit.toFixed(2)} € / u)
              </span>
            </span>
          ) : (
            <span className="muted">Prix sur devis</span>
          )}
        </div>

        <div className="quantity-row">
          <label>
            Quantité
            <input
              className="input"
              type="number"
              min={minQty}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(minQty, Number(e.target.value) || minQty)
                )
              }
            />
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={!localSku}
          >
            Ajouter au panier
          </button>
        </div>

        {currentVariant && (
          <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Variante sélectionnée : {currentVariant.sku}
          </p>
        )}
      </div>
    </div>
  );
}
