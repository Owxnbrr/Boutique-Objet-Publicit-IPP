// app/layout.tsx
import Link from "next/link";
import "./globals.css";
import { supabaseServer } from "@/lib/supabaseServer";
import SupabaseListener from "@/components/SupabaseListener";
import CartBadge from "@/components/CartBadge";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

import type { Metadata } from "next";

import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://ippcom-goodies.netlify.app"),

  title: {
    default: "IPPCom Goodies | Objets pub & goodies personnalisés",
    template: "%s | IPPCom Goodies",
  },

  description:
    "Objets publicitaires et goodies personnalisés pour entreprises, associations et événements. Catalogue, devis rapide et livraison en France. IPPCom (Montdidier).",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "IPPCom Goodies",
    title: "IPPCom Goodies | Objets pub & goodies personnalisés",
    description:
      "Objets publicitaires et goodies personnalisés. Catalogue, devis rapide, livraison en France.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "IPPCom Goodies",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IPPCom Goodies | Objets pub & goodies personnalisés",
    description:
      "Objets publicitaires et goodies personnalisés. Catalogue, devis rapide, livraison en France.",
    images: ["/og.jpg"],
  },

  verification: {
    google: "CKyIlQ8uhJYfTaSG6yAA259gEPoqFb_AnOEVKZUtzxo",
  },
};

import CookiePopup from "@/components/CookiePopup";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function logout() {
    "use server";
    const sb = createServerActionClient({ cookies });
    await sb.auth.signOut();
    redirect("/");
  }

  return (
    <html lang="fr">
      <body>
        <SupabaseListener />

        <Header user={user} logout={logout} CartBadge={CartBadge} />

        <main className="container">{children}
        </main>

        <footer className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
          <hr className="hr" />

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              paddingTop: 12,
            }}
          >
            <p className="muted" style={{ margin: 0 }}>
              © {new Date().getFullYear()} IPPCom - Montdidier
            </p>

            <nav aria-label="Liens légaux" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link className="mutedF" href="/mentions-legales">Mentions légales</Link>
              <Link className="mutedF" href="/confidentialite">Confidentialité</Link>
              <Link className="mutedF" href="/cookies">Cookies</Link>
              <Link className="mutedF" href="/cgv">CGV</Link>
              <Link className="mutedF" href="/contact">Contact</Link>
            </nav>
          </div>
        </footer>
            <CookiePopup />
      </body>
    </html>
  );
}
