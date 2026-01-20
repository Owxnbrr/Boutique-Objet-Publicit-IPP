// src/app/categories/page.tsx
import Link from "next/link";
import { admin } from "../../lib/db";

type CategoryCountRow = {
  category: string;
  nb_produits: number;
};

export default async function CategoriesPage() {
  const db = admin();

  const { data, error } = await db
    .from("category_counts")
    .select("category, nb_produits")
    .order("category", { ascending: true });

  if (error) {
    console.error(error);
    return <p>Impossible de charger les catégories.</p>;
  }

  const rows = (data ?? []) as CategoryCountRow[];

  return (
    <section className="categories-page">
      <header className="categories-header">
        <h1 className="h1">Catégories</h1>
      </header>

      <div className="categories-grid">
        {rows.map((row) => {
          const cat = row.category;
          const count = row.nb_produits;

          return (
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
                <span className="category-link">Voir la sélection →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
