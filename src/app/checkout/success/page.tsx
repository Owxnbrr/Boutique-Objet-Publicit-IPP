// src/app/checkout/success/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, status, total, currency, created_at, customer_name")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        setOrder(data);
      } catch (e: any) {
        setErr(e.message ?? "Impossible de charger la commande.");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, supabase]);

  const totalEuros =
    order && typeof order.total === "number"
      ? order.total / 100
      : 0;

  return (
    <div className="dashboard">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {loading && <p>Chargement…</p>}
        {!loading && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 className="h1">Paiement réussi 🎉</h1>
              <p className="muted">
                Merci ! Votre paiement a bien été pris en compte.
              </p>
            </div>

            {err && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(248,113,113,.3)",
                  background: "rgba(127,29,29,.15)",
                  color: "#fecaca",
                  fontSize: 14,
                }}
              >
                {err}
              </div>
            )}

            <div className="card" style={{ maxWidth: 720 }}>
              <h2 className="h2" style={{ marginBottom: 12 }}>
                Récapitulatif de votre commande
              </h2>

              {!order && !err && (
                <p className="muted">
                  Nous n’avons pas trouvé la commande associée.  
                  Vous pouvez consulter l’historique de vos commandes depuis votre espace.
                </p>
              )}

              {order && (
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <span className="muted">N° de commande</span>
                    <div style={{ fontWeight: 600 }}>{order.id}</div>
                  </div>

                  <div>
                    <span className="muted">Client</span>
                    <div>{order.customer_name ?? "—"}</div>
                  </div>

                  <div>
                    <span className="muted">Date</span>
                    <div>
                      {new Date(order.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>

                  <div>
                    <span className="muted">Montant réglé</span>
                    <div style={{ fontWeight: 700 }}>
                      {fmtEur(totalEuros)}
                    </div>
                  </div>

                  <div>
                    <span className="muted">Statut</span>
                    <div style={{ fontWeight: 600 }}>
                      {order.status === "paid" ? "Payée" : order.status}
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                {order && (
                  <button
                    className="btn btn-primary btn-md"
                    onClick={() => router.push(`/order/${order.id}`)}
                  >
                    Voir le détail de la commande
                  </button>
                )}

                <button
                  className="btn btn-ghost btn-md"
                  onClick={() => router.push("/dashboard")}
                >
                  Retour à mon espace
                </button>

                <button
                  className="btn btn-ghost btn-md"
                  onClick={() => router.push("/catalog")}
                >
                  Continuer mes achats
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
