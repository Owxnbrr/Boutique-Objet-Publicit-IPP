// src/app/catalog/page.tsx
import { admin } from "@/lib/db";
import ClientGrid from "@/components/ClientGrid";

type SearchParams = {
  q?: string;
  page?: string;
};

const PAGE_SIZE = 24;

// Déduplique les produits par "racine" d'id_anda (AP864057 pour AP864057-01, AP864057-10, etc.)
function dedupeByAndaRoot(rows: any[]) {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const row of rows) {
    const raw = (row as any).id_anda as string | null | undefined;
    const root =
      raw && raw.includes("-")
        ? raw.split("-")[0] // AP864057-01 -> AP864057
        : raw || (row as any).name; // fallback sur le nom si jamais

    if (seen.has(root)) continue;
    seen.add(root);
    result.push(row);
  }

  return result;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const search = (searchParams?.q ?? "").trim();
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);

  const db = admin();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = db
    .from("products")
    .select("id, id_anda, name, thumbnail_url, min_qty", {
      count: "exact",
    })
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    return (
      <section>
        <h1 className="h1">Catalogue</h1>
        <p className="muted">Erreur de chargement du catalogue.</p>
      </section>
    );
  }

  const rawRows = data ?? [];
  const rows = dedupeByAndaRoot(rawRows); // <-- déduplication ici

  const pageCount = count ? Math.ceil(count / PAGE_SIZE) : page;

  return (
    <section>
      <h1 className="h1">Catalogue</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Produits importés depuis votre flux ANDA
      </p>

      <ClientGrid
        rows={rows as any[]}
        page={page}
        pageCount={pageCount}
        search={search}
      />
    </section>
  );
}
