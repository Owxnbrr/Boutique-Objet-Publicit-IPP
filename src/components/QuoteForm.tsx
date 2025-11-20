"use client";

import { useState } from "react";

type Variant = {
  sku: string;
  label: string;
};

type QuoteFormProps = {
  productId: string;
  productName: string;
  variants: Variant[];
  defaultVariantSku?: string;
};

export default function QuoteForm({
  productId,
  productName,
  variants,
  defaultVariantSku,
}: QuoteFormProps) {
  const [variantSku, setVariantSku] = useState(
    defaultVariantSku || variants[0]?.sku || ""
  );
  const [quantity, setQuantity] = useState(10);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setError(null);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_sku: variantSku || undefined,
          quantity: Number(quantity),
          name,
          email,
          company: company || undefined,
          message:
            message ||
            `Demande de devis pour le produit ${productName} (${variantSku}).`,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Erreur lors de l’envoi du devis.");
      }

      setStatus("ok");
      // on nettoie un peu le formulaire
      // (tu peux choisir ce que tu veux garder)
      // setQuantity(10);
      // setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Variante */}
      {variants.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Variante</label>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={variantSku}
            onChange={(e) => setVariantSku(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantité */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Quantité</label>
        <input
          type="number"
          min={1}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {/* Infos contact */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nom / Prénom</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Société (optionnel)</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Message */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Message (optionnel)</label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Précisions, date limite, marquage, couleurs..."
        />
      </div>

      {/* Bouton + feedback */}
      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "Envoyer la demande"}
        </button>

        {status === "ok" && (
          <p className="text-sm text-emerald-400">
            ✅ Votre demande a bien été envoyée. Nous vous recontacterons
            rapidement.
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-400">
            ❌ Erreur : {error ?? "Impossible d’envoyer la demande."}
          </p>
        )}
      </div>
    </form>
  );
}
