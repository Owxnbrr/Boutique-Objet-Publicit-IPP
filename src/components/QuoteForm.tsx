// src/components/QuoteForm.tsx
'use client';

import { useState } from 'react';

type Variant = {
  sku: string;
  color?: string | null;
  size?: string | null;
};

type QuoteFormProps = {
  productId: string;
  variants: Variant[];
  minQty: number;
  defaultSku?: string;
};

export default function QuoteForm({
  productId,
  variants,
  minQty,
  defaultSku,
}: QuoteFormProps) {
  const [status, setStatus] =
    useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      product_id: productId,
      variant_sku:
        (fd.get('variant_sku') as string) ||
        variants[0]?.sku ||
        defaultSku ||
        undefined,
      quantity: Number(fd.get('quantity') || minQty || 1),
      name: fd.get('name'),
      email: fd.get('email'),
      company: fd.get('company'),
      message: fd.get('message'),
    };

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ||
            "Une erreur s'est produite lors de l'envoi du devis. Réessaie plus tard."
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      setError(null);
      form.reset();
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de contacter le serveur. Vérifie ta connexion et réessaie."
      );
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: 10 }}
      aria-describedby="quote-status"
    >
      <label>
        Variante
        <select
          name="variant_sku"
          defaultValue={defaultSku || variants[0]?.sku}
          className="input"
        >
          {variants.map((v) => (
            <option key={v.sku} value={v.sku}>
              {v.sku}
              {v.color ? ` • ${v.color}` : ''}
              {v.size ? ` • ${v.size}` : ''}
            </option>
          ))}
        </select>
      </label>

      <label>
        Quantité
        <input
          className="input"
          name="quantity"
          type="number"
          min={minQty}
          defaultValue={minQty}
        />
      </label>

      <label>
        Nom / Prénom
        <input className="input" name="name" type="text" required />
      </label>

      <label>
        Email
        <input className="input" name="email" type="email" required />
      </label>

      <label>
        Société (facultatif)
        <input className="input" name="company" type="text" />
      </label>

      <label>
        Message (facultatif)
        <textarea className="input" name="message" rows={4} />
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
        </button>
        <a className="btn btn-ghost" href="/catalog">
          Retour catalogue
        </a>
      </div>

      <div id="quote-status" style={{ minHeight: 20 }}>
        {status === 'success' && (
          <p style={{ color: '#16a34a', fontSize: 14 }}>
            ✅ Votre demande de devis a bien été envoyée.  
            Nous vous répondrons dans les plus brefs délais !
          </p>
        )}
        {status === 'error' && error && (
          <p style={{ color: '#dc2626', fontSize: 14 }}>⚠️ {error}</p>
        )}
      </div>
    </form>
  );
}
