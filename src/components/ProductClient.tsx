"use client";

import { useMemo, useState } from "react";
import Gallery from "@/components/Gallery";
import VariantPicker from "@/components/VariantPicker";

type Product = any;

type VariantRow = {
  id: string;
  id_anda: string;
  name: string;
  color?: string | null;
  size?: string | null;
};

type ImageRow = { url: string };

type ImagesByVariant = Record<string, ImageRow[]>;

type Props = {
  product: Product;
  variants: VariantRow[];
  baseImages: ImageRow[];
  imagesByVariant: ImagesByVariant;
  baseUnit: number;
  minQty: number;
  submitQuote: (formData: FormData) => Promise<void>;
};

export default function ProductClient({
  product,
  variants,
  baseImages,
  imagesByVariant,
  baseUnit,
  minQty,
  submitQuote,
}: Props) {
  // sku ANDA par défaut = première variante
  const defaultSku = variants[0]?.id_anda ?? "";
  const [selectedSku, setSelectedSku] = useState(defaultSku);

  // Images qui correspondent à la variante choisie
  const currentImages = useMemo(() => {
    return imagesByVariant[selectedSku] ?? baseImages;
  }, [imagesByVariant, selectedSku, baseImages]);

  return (
    <section className="row">
      {/* GALERIE : change dès que selectedSku change */}
      <Gallery images={currentImages ?? []} alt={product.name} />

      <aside className="panel">
        <h1 className="h1" style={{ marginTop: 0 }}>
          {product.name}
        </h1>

        <p className="muted">
          MOQ: {minQty} • Délai: {product.lead_time_days} j
        </p>

        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px" }}>
          <span className="badge">ANDA</span>
          {product.category && (
            <span className="badge">{product.category}</span>
          )}
        </div>

        {/* VARIANTES (ajout panier) */}
        <VariantPicker
          variants={variants.map((v) => ({
            sku: v.id_anda,
            color: v.color ?? null,
            size: v.size ?? null,
          }))}
          productName={product.name}
          minQty={minQty}
          thumbnailUrl={currentImages?.[0]?.url ?? product.thumbnail_url ?? null}
          baseUnit={baseUnit}
          productId={product.id as string}
          selectedSku={selectedSku}
          onChangeSku={setSelectedSku}
        />

        <hr className="hr" />

        {/* LISTE TEXTE DES VARIANTES */}
        <h3 className="h2">Variantes</h3>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {variants?.map((v) => (
            <li
              key={v.id}
              style={{
                fontWeight: v.id_anda === selectedSku ? 600 : 400,
              }}
            >
              {v.id_anda}
            </li>
          ))}
        </ul>

        <hr className="hr" />
        <h3 id="devis" className="h2">
          Demander un devis
        </h3>

        {/* FORMULAIRE DE DEVIS : on utilise la même selectedSku */}
        <form
          action={submitQuote}
          style={{ display: "grid", gap: 10, maxWidth: 420 }}
        >
          <label className="field">
            <span>Variante</span>
            <select
              name="variant_sku"
              className="input"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
            >
              {variants?.map((v) => (
                <option key={v.id} value={v.id_anda}>
                  {v.id_anda}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Quantité</span>
            <input
              className="input"
              name="quantity"
              type="number"
              min={minQty}
              defaultValue={minQty}
            />
          </label>

          <label className="field">
            <span>Nom / Prénom</span>
            <input className="input" name="name" type="text" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input className="input" name="email" type="email" required />
          </label>

          <label className="field">
            <span>Société</span>
            <input className="input" name="company" type="text" />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea className="input" name="message" rows={4} />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit">
              Envoyer la demande
            </button>
            <a className="btn btn-ghost" href="/catalog">
              Retour catalogue
            </a>
          </div>
        </form>
      </aside>
    </section>
  );
}
