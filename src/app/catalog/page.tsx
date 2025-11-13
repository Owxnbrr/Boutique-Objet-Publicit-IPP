import { admin } from '@/lib/db';
import ClientGrid from '@/components/ClientGrid';

export default async function CatalogPage() {
    const db = admin();
    const { data } = await db
        .from('products')
        .select('id, name, thumbnail_url, min_qty')
        .order('name');
    const rows = data ?? [];

    return (
        <section>
        <h1 className="h1">Catalogue</h1>
        <p className="muted" style={{ marginTop: -6 }}>
            Produits importés depuis votre flux ANDA
        </p>

        <ClientGrid rows={rows as any[]} />
        </section>
    );
}
