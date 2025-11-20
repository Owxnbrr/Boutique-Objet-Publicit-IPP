// src/app/catalog/page.tsx
import Link from "next/link";
import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";

type Props = {
  searchParams?: {
    page?: string;
    q?: string;
    category?: string;
  };
};

const PAGE_SIZE = 48;

export default async function CatalogPage({ searchParams }: Props) {
  const db = admin();

  const page = Math.max(parseInt(searchParams?.page ?? "1", 10) || 1, 1);
  const q = (searchParams?.q ?? "").trim();
  const category = (searchParams?.category ?? "").trim();

  let query = db
    .from("products")
    .select("id, name, thumbnail_url, min_qty, category", { count: "exact" });

  if (q) {
    // recherche sur TOUTES les lignes, pas juste sur la page courante
    query = query.ilike("name", `%${q}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query.order("name").range(from, to);

  if (error) {
    console.error(error);
    return <p>Erreur de chargement du catalogue.</p>;
  }

  const rows = data ?? [];
  const total = count ?? rows.length;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const makePageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
        {category && (
          <>
            {" "}
            • catégorie <strong>{category}</strong>
          </>
        )}
      </p>

      {/* Barre de recherche */}
      <form
        method="GET"
        style={{ margin: "18px 0 24px", maxWidth: 420 }}
      >
        <input
          className="input"
          type="text"
          name="q"
          placeholder="Rechercher un produit…"
          defaultValue={q}
        />
        {/* on garde la catégorie si on vient de /categories */}
        {category && (
          <input type="hidden" name="category" value={category} />
        )}
      </form>

      {rows.length === 0 ? (
        <p>Aucun produit trouvé pour cette recherche.</p>
      ) : (
        <>
          <ClientGrid rows={rows as any[]} />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination du catalogue"
              style={{
                display: "flex",
                gap: 8,
                marginTop: 24,
                alignItems: "center",
              }}
            >
              <Link
                href={makePageHref(Math.max(page - 1, 1))}
                aria-disabled={page === 1}
                style={{
                  pointerEvents: page === 1 ? "none" : undefined,
                  opacity: page === 1 ? 0.4 : 1,
                }}
                className="btn btn-ghost"
              >
                Précédent
              </Link>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  const start = Math.max(
                    1,
                    Math.min(page - 2, totalPages - 4)
                  );
                  p = start + i;
                }
                return (
                  <Link
                    key={p}
                    href={makePageHref(p)}
                    className={`btn btn-ghost ${
                      p === page ? "btn-primary" : ""
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                );
              })}

              {totalPages > 5 && page + 2 < totalPages && (
                <>
                  <span style={{ opacity: 0.7 }}>…</span>
                  <Link
                    href={makePageHref(totalPages)}
                    className="btn btn-ghost"
                  >
                    {totalPages}
                  </Link>
                </>
              )}

              <Link
                href={makePageHref(Math.min(page + 1, totalPages))}
                aria-disabled={page === totalPages}
                style={{
                  pointerEvents: page === totalPages ? "none" : undefined,
                  opacity: page === totalPages ? 0.4 : 1,
                }}
                className="btn btn-ghost"
              >
                Suivant
              </Link>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
