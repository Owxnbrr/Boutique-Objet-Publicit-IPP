// src/components/ClientGrid.tsx
"use client";

import Link from "next/link";

type Row = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  min_qty: number | null;
  base_price?: number | null;
};

interface Props {
  rows: Row[];
  page: number;
  pageCount: number;
  search: string;
}

function Pagination({
  page,
  pageCount,
  search,
}: {
  page: number;
  pageCount: number;
  search: string;
}) {
  if (pageCount <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  const pages: number[] = [];
  const maxPages = 5; // nb de boutons visibles
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + maxPages - 1);

  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        className={`px-3 py-1 rounded-full text-sm border border-white/10 ${
          page === 1 ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
        }`}
      >
        Précédent
      </Link>

      {start > 1 && (
        <>
          <Link
            href={makeHref(1)}
            className={`px-3 py-1 rounded-full text-sm ${
              page === 1
                ? "bg-violet-500 text-white"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            1
          </Link>
          {start > 2 && <span className="text-white/40 text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={`px-3 py-1 rounded-full text-sm ${
            p === page
              ? "bg-violet-500 text-white"
              : "bg-white/5 text-white/80 hover:bg-white/10"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < pageCount && (
        <>
          {end < pageCount - 1 && (
            <span className="text-white/40 text-sm">…</span>
          )}
          <Link
            href={makeHref(pageCount)}
            className={`px-3 py-1 rounded-full text-sm ${
              page === pageCount
                ? "bg-violet-500 text-white"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            {pageCount}
          </Link>
        </>
      )}

      <Link
        href={makeHref(Math.min(pageCount, page + 1))}
        className={`px-3 py-1 rounded-full text-sm border border-white/10 ${
          page === pageCount
            ? "opacity-50 pointer-events-none"
            : "hover:bg-white/5"
        }`}
      >
        Suivant
      </Link>
    </div>
  );
}

export default function ClientGrid({ rows, page, pageCount, search }: Props) {
  if (!rows.length) {
    return (
      <div className="mt-8 text-center text-white/60">
        Aucun produit trouvé.
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((p) => (
          <article
            key={p.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg shadow-black/40 hover:border-violet-400/80 transition-colors"
          >
            <Link href={`/product/${p.id}`} className="block relative aspect-[4/3]">
              {/* Image produit */}
              {p.thumbnail_url ? (
                <img
                  src={p.thumbnail_url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/40 text-sm">
                  Aucun visuel
                </div>
              )}
            </Link>

            <div className="p-4 flex flex-col gap-2">
              <h2 className="font-semibold text-white line-clamp-2 min-h-[3rem]">
                {p.name}
              </h2>

              <p className="text-xs text-white/60">
                MOQ {p.min_qty ?? 0}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <Link
                  href={`/product/${p.id}`}
                  className="flex-1 inline-flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium py-2 transition-colors"
                >
                  Voir
                </Link>
                <Link
                  href={`/product/${p.id}#devis`}
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-white/15 text-white/90 text-sm font-medium py-2 hover:bg-white/10 transition-colors"
                >
                  Devis
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={page} pageCount={pageCount} search={search} />
    </>
  );
}
