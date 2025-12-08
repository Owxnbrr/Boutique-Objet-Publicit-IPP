"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { upsertCartItem, getUnitPrice } from "@/lib/cartDb";
import { useCart } from "@/lib/useCart";
import { Minus, Plus } from "lucide-react";

type Props = {
  product: {
    id: string;
    sku?: string;
    name: string;
    unitPrice?: number; 
    image?: string;
    minQty?: number;
  };
  defaultQty?: number;
  className?: string;
  withQtyPicker?: boolean;
};

export default function AddToCart({
  product,
  defaultQty,
  className,
  withQtyPicker = true,
}: Props) {
  const supabase = createClientComponentClient();
  const add = useCart((s) => s.add);
  const [loading, setLoading] = useState(false);

  const min = product.minQty ?? 1;
  const [qty, setQty] = useState<number>(defaultQty ?? min);

  const inc = () => setQty((q) => Math.max(min, q + 1));
  const dec = () => setQty((q) => Math.max(min, q - 1));
  const onInput = (v: string) => {
    const n = parseInt(v || "0", 10);
    setQty(Number.isFinite(n) ? Math.max(min, n) : min);
  };

  async function handleClick() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const unit =
        product.unitPrice ??
        (await getUnitPrice(product.id, product.sku ?? null, qty));

      if (user) {
        await upsertCartItem({
          userId: user.id,
          product: {
            id: product.id,
            sku: product.sku,
            name: product.name,
            unitPrice: unit,
            thumbnail_url: product.image,
          },
          qty,
        });
      }

      add({
        id: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: unit,
        currency: "EUR",
        image: product.image,
        qty,
        minQty: product.minQty,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {withQtyPicker && (
        <>
          <button
            className="btn btn-ghost btn-sm"
            onClick={dec}
            aria-label="Diminuer"
            type="button"
          >
            <Minus size={16} />
          </button>
          <input
            className="input"
            style={{ width: 80, height: 36, textAlign: "center" }}
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => onInput(e.target.value)}
            aria-label="Quantité"
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={inc}
            aria-label="Augmenter"
            type="button"
          >
            <Plus size={16} />
          </button>
        </>
      )}

      <button
        className={`btn btn-primary ${className ?? ""}`}
        onClick={handleClick}
        disabled={loading}
        type="button"
      >
        {loading ? "Ajout..." : "Ajouter au panier"}
      </button>
    </div>
  );
}
