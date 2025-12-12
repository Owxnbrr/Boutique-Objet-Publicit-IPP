// src/app/quote/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // Vérif qu’on est bien connecté
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirectedFrom=/quote/${params.id}`);
  }

  const userEmail = session.user.email ?? "";

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(
      "id, created_at, product_id, variant_sku, quantity, name, email, company, message"
    )
    .eq("id", params.id)
    .eq("email", userEmail)
    .maybeSingle();

  if (error) {
    console.error("Error loading quote:", error);
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <p style={{ color: "#ef4444" }}>
          Une erreur est survenue lors du chargement du devis.
        </p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <p style={{ color: "var(--muted)" }}>
          Ce devis est introuvable ou vous n'y avez pas accès.
        </p>
      </div>
    );
  }

  let product: { id: string; name: string } | null = null;
  if (quote.product_id) {
    const { data: p } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", quote.product_id)
      .maybeSingle();
    if (p) product = p;
  }

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="card-header" style={{ marginBottom: 16 }}>
          <p className="card-title" style={{ marginBottom: 4 }}>
            Devis #{String(quote.id).slice(0, 8)}
          </p>
          <p className="muted" style={{ fontSize: 14 }}>
            Créé le {fmtDate(quote.created_at)}
          </p>
        </div>

        <div
          className="card-body"
          style={{ display: "grid", gap: 16, fontSize: 14 }}
        >
          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Informations client</h2>
            <dl className="dl">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Nom</dt>
                <dd>{quote.name}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Email</dt>
                <dd>{quote.email}</dd>
              </div>
              {quote.company && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <dt>Société</dt>
                  <dd>{quote.company}</dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              Détail du devis
            </h2>
            <dl className="dl">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Produit</dt>
                <dd>{product?.name ?? quote.product_id ?? "—"}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Variante</dt>
                <dd>{quote.variant_sku}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Quantité</dt>
                <dd>{quote.quantity}</dd>
              </div>
            </dl>
          </section>

          {quote.message && (
            <section>
              <h2 style={{ fontSize: 16, marginBottom: 8 }}>Message</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{quote.message}</p>
            </section>
          )}

          <div style={{ marginTop: 16 }}>
            <a href="/dashboard" className="btn btn-ghost">
              ← Retour au tableau de bord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
