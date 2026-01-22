// src/components/CheckoutClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { firstImage } from './utils';

type ShippingMethod = 'delivery' | 'pickup';

type CustomerPayload = {
  name: string;
  email: string;
  company?: string;
  address?: string;
  note?: string;
};

export default function CheckoutClient() {
  const router = useRouter();
  const items  = useCartStore((s) => s.items);
  const clear  = useCartStore((s) => s.clear);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.removeItem);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<CustomerPayload>({
    name: '',
    email: '',
    company: '',
    address: '',
    note: '',
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('delivery');
  const [pickupStore, setPickupStore] = useState<string>('Magasin principal');

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty ?? 0) * (Number(it.unitPrice) || 0), 0),
    [items]
  );

  const onSubmit = async () => {
    try {
      setErr(null);
      setSubmitting(true);

      if (!items.length) {
        setErr('Votre panier est vide.');
        setSubmitting(false);
        return;
      }
      if (!form.name || !form.email) {
        setErr('Nom et email sont requis.');
        setSubmitting(false);
        return;
      }
      if (shippingMethod === 'delivery' && !form.address) {
        setErr('Adresse requise pour une livraison à domicile.');
        setSubmitting(false);
        return;
      }

      const lines = items.map((it) => ({
        product_id: it.productId,
        sku: it.sku ?? null,
        name: it.name,
        qty: it.qty,
        unit_price: Number(it.unitPrice) || 0,
        line_total: Math.round((Number(it.unitPrice) * (it.qty ?? 0)) * 100) / 100,
        thumbnail_url: it.thumbnail_url ?? null,
      }));

      const total = lines.reduce((s, l) => s + (l.line_total ?? 0), 0);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_company: form.company || null,
          customer_address: shippingMethod === 'delivery' ? (form.address || null) : null,
          customer_note: form.note || null,
          currency: 'EUR',
          total,
          lines,
          shipping_method: shippingMethod,             
          pickup_store: shippingMethod === 'pickup' ? pickupStore : null,
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || 'Échec de la commande');

      clear();
      router.push(`/order?id=${data.id}`);
    } catch (e: any) {
      setErr(e?.message ?? 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="panel">
        <p>Votre panier est vide.</p>
        <a className="btn btn-primary" href="/catalog">Retour au catalogue</a>
      </div>
    );
  }

  return (
    <div className="panel" style={{ display: 'grid', gap: 24 }}>
      <div>
        <h3 className="h2" style={{ marginTop: 0 }}>Votre commande</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((it, i) => {
            const src = firstImage(it.thumbnail_url as any);
            return (
              <div key={i} className="card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 8, overflow: 'hidden' }}>
                  {src ? (
                    <Image src={src} alt={it.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#0f0f12' }} />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {it.sku ?? '—'} • {Number(it.unitPrice || 0).toFixed(2)} €
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      name={`qty-${it.productId}-${it.sku ?? 'NOSKU'}`}  
                      value={it.qty}
                      onChange={(e) =>
                        setQty(
                          it.productId,
                          it.sku ?? null,
                          Math.max(1, parseInt(e.target.value || '1', 10))
                        )
                      }
                      style={{ width: 90 }}
                    />
                    <button className="btn btn-ghost" onClick={() => remove(it.productId, it.sku ?? null)}>
                      Retirer
                    </button>
                  </div>
                </div>

                <div style={{ fontWeight: 800 }}>
                  {(Number(it.unitPrice || 0) * (it.qty ?? 0)).toFixed(2)} €
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Total : {total.toFixed(2)} €</div>
        </div>
      </div>

      <hr className="hr" />

      <div style={{ display: 'grid', gap: 12 }}>
        <h3 className="h2" style={{ marginTop: 0 }}>Mode de réception</h3>

        <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name="shippingMethod"
              checked={shippingMethod === 'delivery'}
              onChange={() => setShippingMethod('delivery')}
            />
            <span>Livraison à domicile</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name="shippingMethod"
              checked={shippingMethod === 'pickup'}
              onChange={() => setShippingMethod('pickup')}
            />
            <span>Retrait en magasin</span>
          </label>

          {shippingMethod === 'pickup' && (
            <label>
              Magasin de retrait
              <input
                className="input"
                placeholder="Magasin principal"
                value={pickupStore}
                onChange={(e) => setPickupStore(e.target.value)}
              />
            </label>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <h3 className="h2" style={{ marginTop: 0 }}>Informations client</h3>

        <label>
          Nom / Prénom *
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
          />
        </label>

        <label>
          Email *
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
          />
        </label>

        <label>
          Entreprise
          <input
            className="input"
            value={form.company}
            onChange={(e) => setForm((v) => ({ ...v, company: e.target.value }))}
          />
        </label>

        <label>
          Adresse {shippingMethod === 'delivery' ? '*' : '(si livraison)'}
          <textarea
            className="input"
            rows={3}
            value={form.address}
            onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))}
            disabled={shippingMethod === 'pickup'}
          />
        </label>

        <label>
          Note
          <textarea
            className="input"
            rows={3}
            value={form.note}
            onChange={(e) => setForm((v) => ({ ...v, note: e.target.value }))}
          />
        </label>

        {err && <div style={{ color: '#f87171' }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Envoi…' : 'Passer au paiement'}
          </button>
          <a className="btn btn-ghost" href="/catalog">Continuer les achats</a>
        </div>
      </div>
    </div>
  );
}
