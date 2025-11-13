// app/layout.tsx
import Link from "next/link";
import "./globals.css";
import { supabaseServer } from "@/lib/supabaseServer";
import SupabaseListener from "@/components/SupabaseListener";
import CartBadge from "@/components/CartBadge";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

import Header from "@/components/Header";

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

        <main className="container">{children}</main>

        <footer className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
          <hr className="hr" />
          <p className="muted">
            © {new Date().getFullYear()} Imprimerie du Plateau Picard - Montdidier
          </p>
        </footer>
      </body>
    </html>
  );
}
