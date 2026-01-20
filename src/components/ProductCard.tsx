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
  <Link href={`/product/${id}`} className="product-card">
    <article className="card">
      {url && <Image src={url} alt={name} width={480} height={300} />}
      <h3>{name}</h3>

      <div className="card-items">
        <div className="actions">
          <span className="btn-product">Voir</span>
        </div>
      </div>
    </article>
  </Link>
);}
