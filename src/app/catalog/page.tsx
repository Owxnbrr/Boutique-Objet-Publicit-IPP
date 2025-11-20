// src/app/catalog/page.tsx
import { admin } from '@/lib/db';
import ClientGrid from '@/components/ClientGrid';

const PAGE_SIZE = 48; // tu peux mettre 24, 36, 60… comme tu veux

type CatalogPageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const db = admin();

  // page actuelle (par défaut 1)
  const currentPage =
    searchParams?.page && !Number.isNaN(Number(searchParams.page))
      ? Math.max(1, Number(searchParams.page))
      : 1;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await db
    .from('products')
    .select('id, name, thumbnail_url, min_qty', { count: 'exact' })
    .order('name')
    .range(from, to); // ⚠️ récupère seulement la "page" demandée

  if (error) {
    console.error('Erreur Supabase /catalog :', error);
  }

  const rows = data ?? [];
  const total = count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
      </p>

      {/* Grid existante avec la recherche côté client */}
      <ClientGrid rows={rows as any[]} />

      {/* Navigation entre les pages */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 2; // nb de pages affichées autour de la page courante
  const start = Math.max(1, currentPage - windowSize);
  const end = Math.min(totalPages, currentPage + windowSize);

  const pages: number[] = [];
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  const makeHref = (page: number) =>
    page === 1 ? '/catalog' : `/catalog?page=${page}`;

  return (
    <nav
      aria-label="Pagination catalogue"
      className="flex items-center justify-center gap-2 mt-10 mb-6"
    >
      {/* Précédent */}
      <a
        href={makeHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`btn btn-ghost px-3 py-1 text-sm ${
          currentPage === 1 ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        Précédent
      </a>

      {/* Première page + "…" si on est loin du début */}
      {start > 1 && (
        <>
          <a href={makeHref(1)} className="btn btn-ghost px-3 py-1 text-sm">
            1
          </a>
          {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {/* Fenêtre de pages autour de la page courante */}
      {pages.map((page) => (
        <a
          key={page}
          href={makeHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`btn px-3 py-1 text-sm ${
            page === currentPage ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          {page}
        </a>
      ))}

      {/* Dernière page + "…" si on est loin de la fin */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <a
            href={makeHref(totalPages)}
            className="btn btn-ghost px-3 py-1 text-sm"
          >
            {totalPages}
          </a>
        </>
      )}

      {/* Suivant */}
      <a
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`btn btn-ghost px-3 py-1 text-sm ${
          currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        Suivant
      </a>
    </nav>
  );
}
