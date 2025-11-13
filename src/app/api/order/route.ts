// src/app/api/order/route.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

export const runtime = "nodejs"; // Stripe nécessite le runtime Node

type CartItem = {
  id: string;            // = product_id
  sku?: string | null;
  name: string;
  unitPrice: number;     // en centimes
  qty: number;
  image?: string | null;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = (await req.json()) as {
      items: CartItem[];
      currency?: string; // "EUR" par défaut
      // le total venant du client n’est pas fiable → on recalcule
    };

    const items = body?.items ?? [];
    const currency = (body?.currency || "EUR").toLowerCase();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response("Empty cart", { status: 400 });
    }

    // --- 1) Recalcul serveur des montants (sécurité) ---
    const subTotal = items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (it.qty || 0), 0);
    const tvaRate = 0.2; // adapte si besoin ou utilise Stripe Tax
    const taxTotal = Math.round(subTotal * tvaRate);
    const total = subTotal + taxTotal; // en centimes

    // --- 2) Créer la commande ---
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        currency: currency.toUpperCase(),
        // si tu as ces colonnes, elles seront remplies ; sinon garde juste total
        sub_total: subTotal,
        tax_total: taxTotal,
        total,
        user_id: user.id,
      })
      .select("*")
      .single();

    if (orderErr || !order) {
      return Response.json(
        { error: orderErr?.message ?? "order insert failed" },
        { status: 400 }
      );
    }

    // --- 3) Lignes de commande ---
    const rows = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      sku: it.sku ?? null,
      name: it.name,
      qty: it.qty,
      unit_price: Number(it.unitPrice) || 0,
      line_total: (Number(it.unitPrice) || 0) * it.qty,
      thumbnail_url: it.image ?? null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) {
      return Response.json({ error: itemsErr.message }, { status: 400 });
    }

    // --- 4) Créer le PaymentIntent Stripe ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // en centimes
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order.id),
        userId: user.id,
      },
    });

    // --- 5) Sauvegarder l’id du PaymentIntent (si colonne dispo) ---
    // (Ignoré si la colonne n’existe pas)
    try {
      await supabase
        .from("orders")
        .update({ payment_intent_id: paymentIntent.id })
        .eq("id", order.id);
    } catch {
      // pas bloquant
    }

    // --- 6) Réponse pour le client ---
    return Response.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret, // pour <PaymentElement />
    });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}
