import Image from 'next/image';
import Link from 'next/link';
import { admin } from '@/lib/db';
import { firstImage } from './utils'; 

async function getProducts() {
  const db = admin();
  const { data } = await db
    .from('products')
    .select('id, name, thumbnail_url, category')
    .order('updated_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

type P = { id: string; name: string; thumbnail_url?: string | null; category?: string | null };

export default async function Bento() {
  const rows = (await getProducts()) as P[];

  if (!rows.length) return null;

  
  const safe = [...rows];
  while (safe.length < 5) safe.push(safe[safe.length - 1] ?? rows[0]);

  const [a, b, c, d, e] = safe.slice(0, 5);

  const Card = ({
    p,
    className,
    large = false,
  }: {
    p: P;
    className: string;
    large?: boolean;
  }) => {
    
    const url = firstImage(p?.thumbnail_url || null);

    return (
      <article className={`card bento-item ${className}`}>
        {/* Image plein cadre */}
        {url && (
          <Image
            src={url}
            alt={p?.name ?? 'Produit'}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="bento-img"
            priority={large}
          />
        )}

        {/* Overlay */}
        <div className="bento-inner">
          <span className="badge">{p?.category ?? 'Produit'}</span>
          <h3 className={large ? 'bento-title-lg' : 'bento-title'}>{p?.name}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn btn-primary btn-bento" href={`/product/${p?.id}`}>Voir</Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="container">
      <div className="bento">
        <Card p={a} className="bento-a" large />
        <Card p={b} className="bento-b" />
        <Card p={c} className="bento-c" />
        <Card p={d} className="bento-d" />
        <Card p={e} className="bento-e" />
      </div>
    </section>
  );
}
