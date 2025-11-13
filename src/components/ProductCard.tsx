import Link from 'next/link';
import Image from 'next/image';

function firstUrl(u?: string | null) {
  if (!u) return null;
  const s = String(u).trim();
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr[0]) return String(arr[0]);
    } catch {}
  }
  if (s.includes(',')) return s.split(',')[0].replace(/[\[\]"]/g, '').trim();
  return s;
}

type Props = { id: string; name: string; thumbnail_url?: string | null; min_qty?: number; from_price?: number };

export function ProductCard({ id, name, thumbnail_url, min_qty, from_price }: Props) {
  const url = firstUrl(thumbnail_url);

  return (
    <article className="card">
  {url && <Image src={url} alt={name} width={480} height={300} />}
  <h3>{name}</h3>

  <div className="card-items">
    <div className="meta">
      <span className="muted">MOQ {min_qty ?? 1}</span>
      {from_price
        ? <span className="price">à partir de {from_price.toFixed(2)}€</span>
        : <span className="badge">ANDA</span>}
    </div>

    <div className="actions">
      <Link className="btn-product" href={`/product/${id}`}>Voir</Link>
      <Link className="btn-ghost" href={`/product/${id}#devis`}>Devis</Link>
    </div>
  </div>
</article>

  );
}
