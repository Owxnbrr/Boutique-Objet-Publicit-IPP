// src/app/cart/CartClient.tsx
"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useCart } from "@/lib/useCart";
import { clearCart, removeCartItem, updateCartQty } from "@/lib/cartDb";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback } from "react";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Math.max(0, Number.isFinite(n) ? n : 0)
  );

const clamp = (n: number, min: number) =>
  Number.isFinite(n) ? Math.max(min, Math.floor(n)) : min;

export default function CartClient() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const items = useCart((s) => s.items);
  const setQtyLocal = useCart((s) => s.setQty);
  const removeLocal = useCart((s) => s.remove);
  const clearLocal = useCart((s) => s.clear);

  async function syncQty(productId: string, sku: string | undefined, nextQty: number, minQty?: number) {
    const min = minQty ?? 1;
    const safeQty = clamp(nextQty, min);

    // UI instantanée
    setQtyLocal(productId, sku, safeQty);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await updateCartQty(user.id, productId, sku ?? null, safeQty);
      window.location.reload();
    }
  }

  async function onRemove(productId: string, sku?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await removeCartItem(user.id, productId, sku ?? null);

    removeLocal(productId, sku);
    window.location.reload();
  }

  async function onClear() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await clearCart(user.id);

    clearLocal();
    window.location.reload();
  }

  const subTotal = items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * it.qty, 0);
  const tvaRate = 0.2;
  const tva = subTotal * tvaRate;
  const total = subTotal + tva;
  const onCheckout = useCallback(() => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/cart");
        return;
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          currency: "EUR"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Order failed:", data?.error || res.statusText);
        return;
      }

      router.push(`/order/${data.orderId}`);
    });
  }, [items, subTotal, tva, total, router, supabase]);


  return (
    <div className="panel" style={{ padding: 18 }}>
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "28px 0",
            borderRadius: 12,
            background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))",
            border: "1px solid var(--line)",
          }}
        >
          <div className="h2" style={{ marginBottom: 10 }}>
            Votre panier est vide.
          </div>
          <a className="btn btn-primary" href="/catalog">
            Parcourir le catalogue
          </a>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((it) => {
              const unit = Number(it.unitPrice) || 0;
              const line = unit * it.qty;
              const min = it.minQty ?? 1;

              return (
                <div key={`${it.id}-${it.sku ?? ""}`} className="cart-row">
                  <div className="cart-col media">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.name}
                        width={72}
                        height={54}
                        className="cart-thumb"
                      />
                    ) : (
                      <div className="cart-thumb placeholder" />
                    )}
                  </div>

                  <div className="cart-col grow">
                    <div className="title">{it.name}</div>
                    <div className="muted" style={{ marginTop: 2 }}>
                      {it.sku ? `SKU : ${it.sku}` : "—"}
                    </div>
                    <div className="muted" style={{ marginTop: 2 }}>
                      Prix unitaire : <strong>{eur(unit)}</strong>
                    </div>
                  </div>

                  <div className="cart-col qty">
                    <button
                      className="btn btn-ghost btn-sm icon-only"
                      aria-label="Diminuer"
                      onClick={() => syncQty(it.id, it.sku, it.qty - 1, min)}
                      disabled={isPending}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      className="input"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={it.qty}
                      onChange={(e) =>
                        syncQty(it.id, it.sku, parseInt(e.target.value || "0", 10), min)
                      }
                      style={{ width: 72, textAlign: "center", height: 36 }}
                      aria-label="Quantité"
                      disabled={isPending}
                    />
                    <button
                      className="btn btn-ghost btn-sm icon-only"
                      aria-label="Augmenter"
                      onClick={() => syncQty(it.id, it.sku, it.qty + 1, min)}
                      disabled={isPending}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="cart-col price">{eur(line)}</div>

                  <div className="cart-col actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onRemove(it.id, it.sku)}
                      disabled={isPending}
                    >
                      <Trash2 size={16} />
                      Retirer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-actions">
            <button className="btn btn-ghost" onClick={onClear} disabled={isPending}>
              Vider le panier
            </button>

            <div className="cart-summary">
              <div className="row">
                <span>Sous-total</span>
                <strong>{eur(subTotal)}</strong>
              </div>
              <div className="row">
                <span>TVA (20 %)</span>
                <strong>{eur(tva)}</strong>
              </div>
              <div className="row total">
                <span>Total TTC</span>
                <strong>{eur(total)}</strong>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} disabled={isPending} onClick={onCheckout} >
                Passer au paiement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

