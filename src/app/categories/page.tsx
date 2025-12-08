// src/app/categories/page.tsx
import Link from "next/link";
import { admin } from "../../lib/db";

export default async function CategoriesPage() {
  const db = admin();

  const { data, error } = await db
    .from("products")
    .select("category");

  if (error) {
    console.error(error);
    return <p>Impossible de charger les catégories.</p>;
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const cat = (row as any).category as string | null;
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section className="categories-page">
      <header className="categories-header">
        <h1 className="h1">Catégories</h1>
      </header>

      <div className="categories-grid">
        {sorted.map(([cat, count]) => (
          <Link
            key={cat}
            href={`/catalog?category=${encodeURIComponent(cat)}`}
            className="category-card"
          >
            <div className="category-card-top">
              <h2 className="category-title">{cat}</h2>
              <span className="category-badge">
                {count} produit{count > 1 ? "s" : ""}
              </span>
            </div>

            <p className="category-sub">
              Voir tous les articles de cette catégorie.
            </p>

            <div className="category-footer">
              <span className="category-link">
                Voir la sélection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
