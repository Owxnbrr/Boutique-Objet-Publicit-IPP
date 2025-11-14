// src/app/order/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";
import PayForm from "./PayForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "cancelled"
  | "refunded";

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "En attente", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  paid: { label: "Payée", bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  processing: { label: "Traitement", bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  shipped: { label: "Expédiée", bg: "#EDE9FE", text: "#4C1D95", dot: "#8B5CF6" },
  cancelled: { label: "Annulée", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  refunded: { label: "Remboursée", bg: "#F3F4F6", text: "#1F2937", dot: "#6B7280" },
};

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env variable");
}
const stripe = new Stripe(stripeKey);

export default async function OrderPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();

  const supabase = createServerComponentClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );

  // 1) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="container" style={{ paddingTop: 24 }}>
        Vous devez être connecté pour voir cette commande.
      </section>
    );
  }

  // 2) Lecture de la commande (sécurisée par user_id)
  let { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return (
      <section className="container" style={{ paddingTop: 24 }}>
        Commande introuvable.
      </section>
    );
  }

  // 3) Lignes de commande
  const { data: itemsRaw } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", params.id)
    .order("id", { ascending: true });

  const items = itemsRaw ?? [];

  const eur = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: order.currency || "EUR",
    }).format(Math.max(0, Number.isFinite(n) ? n : 0));

  let status = (order.status as OrderStatus) || "pending";
  let meta = STATUS_META[status];

  // 4) Récupérer / rafraîchir le client_secret Stripe
  let clientSecret: string | null = null;

  try {
    if (order.payment_intent_client_secret) {
      // si tu as une colonne payment_intent_client_secret
      clientSecret = order.payment_intent_client_secret as string;
    } else if (order.payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(
        order.payment_intent_id as string
      );

      // ✅ Si Stripe dit que le paiement est réussi, on marque la commande comme payée
      if (pi.status === "succeeded" && order.status !== "paid") {
        const { data: updatedOrder } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_intent_client_secret: pi.client_secret ?? null,
          })
          .eq("id", order.id)
          .select("*")
          .single();

        if (updatedOrder) {
          order = updatedOrder;
          status = "paid";
          meta = STATUS_META[status];
        }
      }

      clientSecret = (pi.client_secret as string) ?? null;
    }
  } catch (e) {
    console.error("Erreur Stripe ou mise à jour commande :", e);
    clientSecret = null;
  }

  return (
    <section className="container" style={{ paddingTop: 24 }}>
      <h1 className="h1">
        {status === "paid" ? "Merci !" : "Paiement de votre commande"}
      </h1>

      {/* Badge statut */}
      <div style={{ marginTop: 8 }}>
        <span
          className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: meta.bg, color: meta.text }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: meta.dot,
              display: "inline-block",
            }}
          />
          {meta.label}
        </span>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>
        Commande <strong>{order.id}</strong>
      </p>

      {/* Récapitulatif */}
      <div className="panel" style={{ marginTop: 16 }}>
        <h3 className="h2" style={{ marginTop: 0 }}>
          Récapitulatif
        </h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((it: any) => (
            <li key={it.id}>
              {it.name} {it.sku ? `(${it.sku})` : ""} – {it.qty} ×{" "}
              {eur(Number(it.unit_price))} = {eur(Number(it.line_total))}
            </li>
          ))}
        </ul>
        <div
          style={{ textAlign: "right", marginTop: 10, fontWeight: 600 }}
        >
          Total : {eur(Number(order.total || 0))} {order.currency}
        </div>
      </div>

      {/* Paiement */}
      {status !== "paid" ? (
        <div className="panel" style={{ marginTop: 16 }}>
          {clientSecret ? (
            <PayForm
              clientSecret={clientSecret}
              orderId={String(order.id)}
            />
          ) : (
            <div style={{ padding: 12 }}>
              <p style={{ marginBottom: 8 }}>
                Impossible d&apos;initialiser le paiement (client secret
                manquant).
              </p>
              <a className="btn btn-ghost" href="/cart">
                Retourner au panier
              </a>
            </div>
          )}
        </div>
      ) : (
        <a
          className="btn btn-primary"
          href="/catalog"
          style={{ marginTop: 16 }}
        >
          Retour au catalogue
        </a>
      )}
    </section>
  );
}
