// src/app/catalog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";

const PAGE_SIZE = 48;
const SITE_URL = "https://ippcom-goodies.netlify.app";

type CatalogRow = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  min_qty: number | null;
  id_anda: string | null;
  category: string | null;
  anda_root: string | null;
};

type CatalogPageProps = {
  searchParams?: {
    q?: string;
    page?: string;
    category?: string;
  };
};

function normalizeKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire accents
    .replace(/[^a-z0-9]+/g, " ") // garde alphanum
    .trim();
}

function getFamilyKey(row: CatalogRow): string {
  // 1) meilleur identifiant de "famille" si dispo
  if (row.anda_root && row.anda_root.trim()) return row.anda_root.trim().toLowerCase();

  // 2) fallback : root de id_anda (ex AP721585-10 => AP721585)
  if (row.id_anda && row.id_anda.trim()) return row.id_anda.split("-")[0].trim().toLowerCase();

  // 3) dernier recours : nom normalisé
  return normalizeKey(row.name);
}

/**
 * Dédoublonne par famille et garde le "meilleur" candidat :
 * - préfère un produit qui a une thumbnail_url
 * - sinon garde le premier
 */
function dedupeByFamily(rows: CatalogRow[]): CatalogRow[] {
  const map = new Map<string, CatalogRow>();

  for (const row of rows) {
    const key = getFamilyKey(row);
    const prev = map.get(key);

    if (!prev) {
      map.set(key, row);
      continue;
    }

    // Remplace si l'ancien n'a pas d'image mais le nouveau oui
    if (!prev.thumbnail_url && row.thumbnail_url) {
      map.set(key, row);
    }
  }

  return Array.from(map.values());
}

function buildCanonicalPath(searchParams?: CatalogPageProps["searchParams"]) {
  const q = (searchParams?.q ?? "").trim();
  const category = (searchParams?.category ?? "").trim();
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);

  // pages recherche = on les indexe pas (mais canonical quand même)
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);

  const qs = params.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const q = (searchParams?.q ?? "").trim();
  const category = (searchParams?.category ?? "").trim();
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);

  const baseTitle = "Catalogue";
  const titleParts = [baseTitle];

  if (category) titleParts.push(category);
  if (q) titleParts.push(`Recherche : ${q}`);
  if (page > 1) titleParts.push(`Page ${page}`);

  const title = titleParts.join(" • ");

  const description =
    q
      ? `Résultats de recherche pour “${q}” dans le catalogue IPPCom Goodies. Goodies et objets publicitaires personnalisés, devis rapide et livraison en France.`
      : category
        ? `Découvrez notre sélection “${category}” : objets publicitaires et goodies personnalisés. Devis rapide, production maîtrisée et livraison en France.`
        : `Découvrez notre catalogue de goodies, objets publicitaires et textiles personnalisés. Devis rapide, production 5–10 jours (selon références) et livraison en France.`;

  const canonicalPath = buildCanonicalPath(searchParams);
  const ogImage = "/og.jpg";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },

    // Très important : on évite que Google indexe les pages de recherche interne
    robots: q
      ? { index: false, follow: true }
      : { index: true, follow: true },

    openGraph: {
      url: canonicalPath,
      title: `${title} | IPPCom Goodies`,
      description,
      images: [ogImage],
      type: "website",
      siteName: "IPPCom Goodies",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | IPPCom Goodies`,
      description,
      images: [ogImage],
    },
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const db = admin();

  const q = (searchParams?.q ?? "").trim();
  const pageParam = parseInt(searchParams?.page ?? "1", 10);
  const categoryFilter = (searchParams?.category ?? "").trim();

  let query = db
    .from("products")
    .select("id, name, thumbnail_url, min_qty, id_anda, category, anda_root")
    .order("name");

  if (q) query = query.ilike("name", `%${q}%`);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return <p>Impossible de charger le catalogue.</p>;
  }

  const rows = (data ?? []) as CatalogRow[];
  const deduped = dedupeByFamily(rows);

  const totalItems = deduped.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam || 1, 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageRows = deduped.slice(start, end);

  // JSON-LD Breadcrumbs
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${SITE_URL}/catalog` },
    ],
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <h1 className="h1">
        Catalogue de la catégorie {categoryFilter || "Tous les produits"}
      </h1>

      <p className="muted" style={{ maxWidth: 720 }}>
        Explorez notre sélection de goodies et objets publicitaires personnalisables.
        Vous pouvez rechercher un produit ou filtrer par catégorie.
      </p>

      <form
        className="catalog-search"
        action="/catalog"
        style={{ margin: "1rem 0 1.5rem", maxWidth: 420 }}
      >
        <input
          className="input"
          type="text"
          name="q"
          placeholder="Rechercher un produit..."
          defaultValue={q}
        />

        {/* Si tu veux garder le filtre category dans le form quand il est actif */}
        {categoryFilter ? (
          <input type="hidden" name="category" value={categoryFilter} />
        ) : null}
      </form>

      <ClientGrid rows={pageRows} />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
        }}
      >
        <PagerButton
          page={currentPage - 1}
          disabled={currentPage <= 1}
          q={q}
          category={categoryFilter}
        />
        <span className="badge">
          Page {currentPage} / {totalPages}
        </span>
        <PagerButton
          page={currentPage + 1}
          disabled={currentPage >= totalPages}
          q={q}
          category={categoryFilter}
          label="Suivant"
        />
      </div>
    </section>
  );
}

function PagerButton({
  page,
  disabled,
  q,
  category,
  label,
}: {
  page: number;
  disabled: boolean;
  q: string;
  category: string;
  label?: string;
}) {
  if (disabled) {
    return (
      <button className="btn btn-ghost" disabled style={{ opacity: 0.4 }}>
        {label ?? "Précédent"}
      </button>
    );
  }

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  params.set("page", String(page));

  return (
    <Link className="btn btn-ghost" href={`/catalog?${params.toString()}`}>
      {label ?? "Précédent"}
    </Link>
  );
}
