// src/app/catalog/page.tsx
import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";
import Link from "next/link";

const PAGE_SIZE = 48;

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

// Clé de famille = nom normalisé (minuscules, trim)
function getFamilyKey(row: CatalogRow): string {
  return row.name.trim().toLowerCase();
}

function dedupeByFamily(rows: CatalogRow[]): CatalogRow[] {
  const seen = new Set<string>();
  const result: CatalogRow[] = [];

  for (const row of rows) {
    const key = getFamilyKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }

  return result;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const db = admin();

  const q = (searchParams?.q ?? "").trim();
  const pageParam = parseInt(searchParams?.page ?? "1", 10);
  const categoryFilter = (searchParams?.category ?? "").trim();

  let query = db
    .from("products")
    .select(
      "id, name, thumbnail_url, min_qty, id_anda, category, anda_root"
    )
    .order("name");

  if (q) query = query.ilike("name", `%${q}%`);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return <p>Impossible de charger le catalogue.</p>;
  }

  const rows = (data ?? []) as CatalogRow[];

  // Dédoublonnage par nom
  const deduped = dedupeByFamily(rows);

  // Pagination
  const totalItems = deduped.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(pageParam || 1, 1),
    totalPages
  );

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageRows = deduped.slice(start, end);

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
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
        <PagerButton page={currentPage - 1} disabled={currentPage <= 1} q={q} />
        <span className="badge">
          Page {currentPage} / {totalPages}
        </span>
        <PagerButton
          page={currentPage + 1}
          disabled={currentPage >= totalPages}
          q={q}
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
  label,
}: {
  page: number;
  disabled: boolean;
  q: string;
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
  params.set("page", String(page));

  return (
    <Link className="btn btn-ghost" href={`/catalog?${params.toString()}`}>
      {label ?? "Précédent"}
    </Link>
  );
}
