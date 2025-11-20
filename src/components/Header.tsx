// components/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  user: { id: string } | null;
  logout: () => Promise<void>;
  CartBadge?: React.ComponentType<{ userId: string }>;
};

export default function Header({ user, logout, CartBadge }: Props) {
  const [open, setOpen] = useState(false);
  const clusterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!clusterRef.current) return;
      if (clusterRef.current.contains(e.target as Node)) return;
      setOpen(false);
      document.documentElement.classList.remove("no-scroll");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", open);
  }, [open]);



  return (
    <header className="header">
      <div className="container header__inner">
        <Link href="/" className="brand">
          <Image
            src="/logo-ipp-blanc.webp"
            alt="Anda"
            width={140}
            height={40}
            className="brand_logo"
            priority
          />
        </Link>
        <div className="nav-cluster" ref={clusterRef}>
          <button
            className={`hamburger ${open ? "is-active" : ""}`}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(v => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <div id="primary-nav" className={`nav-wrap ${open ? "nav-wrap--open" : ""}`}>
            <nav className="nav">
              <Link className="btn btn-ghost" href="/catalog" onClick={() => setOpen(false)}>
                Catalogue
              </Link>
              <Link href="/categories" className="nav-link">
                Catégories
              </Link>


              {user ? (
                <>
                  <Link className="btn btn-primary" href="/dashboard" onClick={() => setOpen(false)}>
                    Mon espace
                  </Link>
                  {CartBadge ? <CartBadge userId={user.id} /> : null}
                  <form action={logout} className="nav-logout">
                    <button className="btn btn-ghost" type="submit" onClick={() => setOpen(false)}>
                      Se déconnecter
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <a className="btn btn-primary" href="#devis" onClick={() => setOpen(false)}>
                    Demander un devis
                  </a>
                  <Link className="btn btn-outline" href="/login" onClick={() => setOpen(false)}>
                    Se connecter
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
