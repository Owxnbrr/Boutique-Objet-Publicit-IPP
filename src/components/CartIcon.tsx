'use client';
import Link from 'next/link';
import { useCart } from '@/lib/useCart';

export default function CartIcon() {
  const count = useCart(s => s.count);
  return (
    <Link href="/cart" className="btn btn-ghost" aria-label="Panier">
      🛒
      {count > 0 && (
        <span style={{
          marginLeft:8, background:'var(--brand-500)', color:'#fff', borderRadius:999,
          padding:'2px 8px', fontSize:12, lineHeight:1
        }}>{count}</span>
      )}
    </Link>
  );
}
