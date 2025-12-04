"use client";

import { useState } from "react";

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key] ?? "")}`
    )
    .join("&");
}

type Props = {
  productId: string;
  variantSku?: string;
  productLabel?: string;
};

export default function QuoteNetlifyForm({
  productId,
  variantSku,
  productLabel,
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    try {
      // ✅ Envoi vers Netlify Forms
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload),
      });

      if (!res.ok) throw new Error(`Netlify Forms error: ${res.status}`);

      setStatus("ok");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Impossible d'envoyer la demande. Réessaie.");
    }
  }

  return (
    <form
      name="quote"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={onSubmit}
    >
      {/* Obligatoire pour Netlify Forms */}
      <input type="hidden" name="form-name" value="quote" />
      {/* Honeypot anti-spam */}
      <p style={{ display: "none" }}>
        <label>
          Ne pas remplir: <input name="bot-field" />
        </label>
      </p>

      {/* Infos produit */}
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="variant_sku" value={variantSku || ""} />
      <input type="hidden" name="product_label" value={productLabel || ""} />

      <label>Quantité</label>
      <input name="quantity" type="number" min={1} defaultValue={1} required />

      <label>Nom / Prénom</label>
      <input name="name" type="text" required />

      <label>Email</label>
      <input name="email" type="email" required />

      <label>Société (facultatif)</label>
      <input name="company" type="text" />

      <label>Message (facultatif)</label>
      <textarea name="message" rows={4} />

      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi..." : "Envoyer la demande"}
      </button>

      {status === "ok" && (
        <p style={{ marginTop: 12, color: "limegreen" }}>
          ✔ Demande envoyée. Tu la verras dans Netlify → Forms.
        </p>
      )}

      {status === "error" && (
        <p style={{ marginTop: 12, color: "tomato" }}>⚠ {errorMsg}</p>
      )}
    </form>
  );
}
