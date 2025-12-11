// src/components/QuoteForms.tsx
"use client";

import { useState } from "react";

type Variant = {
  sku: string;
  color?: string | null;
  size?: string | null;
};

type QuoteFormProps = {
  productId: string;
  productLabel: string;
  variants: Variant[];
  minQty: number;
  defaultSku?: string;
  selectedSku?: string;
};

export default function QuoteForm({
  productId,
  productLabel,
  variants,
  minQty,
  defaultSku,
  selectedSku,
}: QuoteFormProps) {
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const effectiveSku = selectedSku || defaultSku || variants[0]?.sku || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const params = new URLSearchParams();
    fd.forEach((value, key) => params.append(key, String(value)));

    params.set("form-name", "quote");
    params.set("product_id", productId);
    params.set("variant_sku", effectiveSku);
    params.set("product_label", productLabel);

    try {
      const res = await fetch("/netlify-forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        setError("Une erreur s'est produite lors de l'envoi du devis.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le serveur. Réessaie.");
      setStatus("error");
    }
  }

  return (
    <form
      name="quote"
      method="POST"
      action="/netlify-forms.html"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 10 }}
      aria-describedby="quote-status"
    >
      {/* requis pour Netlify */}
      <input type="hidden" name="form-name" value="quote" />

      {/* honeypot */}
      <p hidden>
        <label>
          Don’t fill this out: <input name="bot-field" />
        </label>
      </p>

      {/* infos produit */}
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="variant_sku" value={effectiveSku} />
      <input type="hidden" name="product_label" value={productLabel} />

      <p className="muted" style={{ fontSize: 14 }}>
        Variante sélectionnée pour le devis : <strong>{effectiveSku}</strong>
      </p>

      <label>
        Quantité
        <input
          className="input"
          name="quantity"
          type="number"
          min={minQty}
          defaultValue={minQty}
          required
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

      <button
        className="btn btn-primary"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Envoi…" : "Envoyer la demande"}
      </button>

      <div id="quote-status" style={{ minHeight: 20 }}>
        {status === "success" && (
          <p style={{ color: "#16a34a", fontSize: 14 }}>
            ✅ Votre demande de devis a bien été envoyée.
          </p>
        )}
        {status === "error" && error && (
          <p style={{ color: "#dc2626", fontSize: 14 }}>⚠️ {error}</p>
        )}
      </div>
    </form>
  );
}
