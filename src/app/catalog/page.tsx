// src/app/catalog/page.tsx
import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";
import Link from "next/link";

const PAGE_SIZE = 48;

type CatalogPageProps = {
  searchParams?: {
    q?: string;
    page?: string;
    category?: string;
  };
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const db = admin();

  const q = (searchParams?.q ?? "").trim();
  const pageParam = parseInt(searchParams?.page ?? "1", 10);
  const categoryFilter = (searchParams?.category ?? "").trim();

  let query = db
    .from("products")
    .select("id, name, thumbnail_url, min_qty, id_anda, category")
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return <p>Impossible de charger le catalogue.</p>;
  }

  const rows = data ?? [];

  // 1) Regrouper par "code racine" d'ANDA (avant le premier "-")
  const byFamily = new Map<string, (typeof rows)[number]>();

  for (const row of rows) {
    const idAnda = (row as any).id_anda as string | null;
    const family =
      idAnda && idAnda.includes("-")
        ? idAnda.split("-")[0]
        : idAnda ?? row.id; // fallback

    if (!byFamily.has(family)) {
      byFamily.set(family, row);
    }
  }

  const allFamilies = Array.from(byFamily.values());

  // 2) Pagination après regroupement
  const totalItems = allFamilies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam || 1, 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageRows = allFamilies.slice(start, end);

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
      </p>

      {/* barre de recherche */}
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

      <ClientGrid rows={pageRows as any[]} />

      {/* Pagination simple */}
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
