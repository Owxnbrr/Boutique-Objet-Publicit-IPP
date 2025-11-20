// src/app/categories/page.tsx
import Link from "next/link";
import { admin } from "../../lib/db";


export default async function CategoriesPage() {
  const db = admin();

  // On récupère juste la colonne "category"
  const { data, error } = await db
    .from("products")
    .select("category");

  if (error) {
    console.error(error);
    return <p>Impossible de charger les catégories.</p>;
  }

  // On compte le nombre de produits par catégorie
  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const cat = (row as any).category as string | null;
    if (!cat) continue;
    const key = cat.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const list = Array.from(counts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "fr")
  );

  if (!list.length) {
    return <p>Aucune catégorie trouvée.</p>;
  }

  return (
    <section>
      <h1 className="h1">Catégories</h1>
      <p className="muted" style={{ marginTop: -6 }}>
        Basées sur le champ <code>category</code> de vos produits ANDA.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {list.map(([name, count]) => (
          <Link
            key={name}
            href={{
              pathname: "/catalog",
              query: { category: name },
            }}
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 600 }}>{name}</span>
            <span className="muted" style={{ fontSize: 13 }}>
              {count} produit{count > 1 ? "s" : ""}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
