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
  const add = useCart((s) => s.add);

  const initialSku = selectedSku || variants[0]?.sku || "";
  const [localSku, setLocalSku] = useState<string>(initialSku);
  const [quantity, setQuantity] = useState<number>(minQty);

  useEffect(() => {
    if (selectedSku && selectedSku !== localSku) {
      setLocalSku(selectedSku);
    }
  }, [selectedSku, localSku]);

  useEffect(() => {
    setQuantity(minQty);
  }, [minQty]);

  function chooseSku(sku: string) {
    setLocalSku(sku);
    onChangeSku?.(sku);
  }

  function handleAddToCart() {
    if (!localSku) return;

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

        <div className="quantity-row" style={{display:'flex', flexDirection:'column', gap:8 }}>
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
