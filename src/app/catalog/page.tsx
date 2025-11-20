// src/app/catalog/page.tsx
import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";

const PAGE_SIZE = 48;

type CatalogPageProps = {
  searchParams?: {
    page?: string;
    q?: string;
  };
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const db = admin();

  const pageParam = Number(searchParams?.page ?? "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const rawQ = (searchParams?.q ?? "").trim();
  const q = rawQ.length > 0 ? rawQ : "";

  // --- Construire la requête Supabase ---
  let query = db
    .from("products")
    .select("id, name, thumbnail_url, min_qty", { count: "exact" });

  // Filtre global sur le nom (tu peux ajouter category / brand si tu veux)
  if (q) {
    query = query.ilike("name", `%${q}%`);
    // exemple pour filtrer aussi sur la catégorie :
    // query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Erreur Supabase /catalog :", error);
  }

  const rows = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const makePageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
      </p>

      {/* Barre de recherche globale */}
      <form
        method="GET"
        style={{ margin: "18px 0 24px", maxWidth: 420 }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un produit…"
          className="input"
        />
      </form>

      {/* Résultats */}
      {rows.length === 0 ? (
        <p style={{ marginTop: 24 }}>
          {q
            ? `Aucun produit ne correspond à « ${q} ».`
            : "Aucun produit à afficher."}
        </p>
      ) : (
        <ClientGrid rows={rows as any[]} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination catalogue"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 32,
          }}
        >
          <a
            href={makePageHref(Math.max(1, currentPage - 1))}
            className="btn btn-ghost"
            aria-disabled={currentPage === 1}
          >
            Précédent
          </a>

          {/* Page actuelle */}
          <span style={{ padding: "6px 12px", borderRadius: 9999, background: "#27272f" }}>
            {currentPage}
          </span>

          <span style={{ opacity: 0.7 }}>
            / {totalPages}
          </span>

          <a
            href={makePageHref(Math.min(totalPages, currentPage + 1))}
            className="btn btn-ghost"
            aria-disabled={currentPage === totalPages}
          >
            Suivant
          </a>
        </nav>
      )}
    </section>
  );
}
