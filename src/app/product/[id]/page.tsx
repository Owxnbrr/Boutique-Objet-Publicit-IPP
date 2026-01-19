// src/app/product/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { admin } from "@/lib/db";
import ProductClient from "@/components/ProductClient";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  lead_time_days: number | null;
  min_qty: number | null;
  thumbnail_url: string | null;
  base_price: number | null;
  id_anda: string | null;
};

type ImageRow = {
  url: string;
};

type PriceRow = {
  variant_sku: string;
  unit_price: number;
  qty_break: number;
};

const SITE_URL = "https://ippcom-goodies.netlify.app";

function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const db = admin();

  const { data: product } = await db
    .from("products")
    .select("id, name, category, thumbnail_url, min_qty, lead_time_days, base_price, id_anda")
    .eq("id", params.id)
    .single<ProductRow>();

  if (!product) {
    return {
      title: "Produit introuvable",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name}${product.category ? ` - ${product.category}` : ""}`;

  const description =
    `Personnalisez ${product.name}` +
    (product.category ? ` (${product.category})` : "") +
    `. Quantité minimum ${product.min_qty ?? 1}. ` +
    `Délais ${product.lead_time_days ? `${product.lead_time_days} jours` : "sur demande"}. ` +
    `Devis rapide et livraison en France.`;

  const canonicalPath = `/product/${product.id}`;
  const canonical = absoluteUrl(canonicalPath);

  const image = absoluteUrl(product.thumbnail_url || "/og.jpg");

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: canonicalPath,
      title: `${title} | IPPCom Goodies`,
      description,
      images: [image],
      type: "website",
      siteName: "IPPCom Goodies",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | IPPCom Goodies`,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const db = admin();

  const { data: productData, error: productError } = await db
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single<ProductRow>();

  if (productError || !productData) {
    notFound();
  }

  const product = productData;
  const minQty = product.min_qty ?? 1;

  const { data: siblingsData } = await db
    .from("products")
    .select("id, name, thumbnail_url, id_anda")
    .eq("name", product.name)
    .order("id_anda");

  const siblings = (siblingsData ?? []) as ProductRow[];

  const variants = siblings.map((p) => ({
    sku: p.id_anda ?? p.id,
    color: null as string | null,
    size: null as string | null,
  }));

  const { data: imageData } = await db
    .from("assets")
    .select("url")
    .eq("product_id", product.id);

  const images = (imageData ?? []) as ImageRow[];

  const priceBySku: Record<string, number> = {};

  const variantSkus = variants.map((v) => v.sku).filter(Boolean);
  if (variantSkus.length > 0) {
    const { data: priceData } = await db
      .from("prices")
      .select("variant_sku, unit_price, qty_break")
      .in("variant_sku", variantSkus)
      .order("qty_break", { ascending: true });

    const rows = (priceData ?? []) as PriceRow[];
    for (const row of rows) {
      if (priceBySku[row.variant_sku] == null) {
        priceBySku[row.variant_sku] = Number(row.unit_price) || 0;
      }
    }
  }

  const defaultSku = variants[0]?.sku || product.id_anda || product.id;
  const basePrice =
    (defaultSku && priceBySku[defaultSku]) || Number(product.base_price ?? 0) || 0;

  // ---- JSON-LD (Product + Breadcrumbs) ----
  const canonicalUrl = `${SITE_URL}/product/${product.id}`;

  const imageUrls = (images ?? [])
    .map((i) => i.url)
    .filter(Boolean)
    .map((u) => absoluteUrl(u));

  const mainImage = absoluteUrl(product.thumbnail_url || imageUrls[0] || "/og.jpg");

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category || undefined,
    image: [mainImage, ...imageUrls].filter(Boolean),
    sku: defaultSku,
    brand: { "@type": "Brand", name: "IPPCom" },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "EUR",
      price: Number(basePrice || 0).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${SITE_URL}/catalogue` },
      { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ProductClient
        product={product}
        variants={variants}
        images={images}
        priceBySku={priceBySku}
        defaultSku={defaultSku}
        minQty={minQty}
        basePrice={basePrice}
        siblings={siblings}
      />
    </>
  );
}
