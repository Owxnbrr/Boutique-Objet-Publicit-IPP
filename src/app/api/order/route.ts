// src/app/api/order/route.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type CartItem = {
  id: string;            // = product_id
  sku?: string | null;
  name: string;
  unitPrice: number;     // EN EUROS côté client
  qty: number;
  image?: string | null;
};

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env variable");
}
const stripe = new Stripe(stripeKey);

export async function POST(req: Request) {
  try {
    // Cookies + client Supabase
    const cookieStore = cookies();
    
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = (await req.json()) as {
      items: CartItem[];
      currency?: string;
    };

    const rawItems = body?.items ?? [];
    const currency = (body?.currency || "EUR").toLowerCase();

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return new Response("Empty cart", { status: 400 });
    }

    // ✅ On convertit les prix en centimes pour la base + Stripe
    const items = rawItems.map((it) => {
      const unitEur = Number(it.unitPrice) || 0;
      const unitCents = Math.round(unitEur * 100); // 72.5€ → 7250
      const qty = Number.isFinite(it.qty) && it.qty > 0 ? it.qty : 1;

      return {
        ...it,
        qty,
        unitCents,
      };
    });

    // --- 1) Recalcul serveur des montants (en CENTIMES) ---
    const subTotal = items.reduce(
      (s, it) => s + it.unitCents * it.qty,
      0
    );
    const tvaRate = 0.2;
    const taxTotal = Math.round(subTotal * tvaRate);
    const total = subTotal + taxTotal; // tout en centimes

    // --- 2) Créer la commande ---
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        currency: currency.toUpperCase(),
        sub_total: subTotal,     // bigint en centimes
        tax_total: taxTotal,     // bigint en centimes
        total,                   // bigint en centimes
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
      unit_price: it.unitCents,            // bigint en centimes
      line_total: it.unitCents * it.qty,   // bigint en centimes
      thumbnail_url: it.image ?? null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(rows);

    if (itemsErr) {
      return Response.json({ error: itemsErr.message }, { status: 400 });
    }

    // --- 4) PaymentIntent Stripe (en centimes) ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order.id),
        userId: user.id,
      },
    });

    // --- 5) Sauvegarder l’id du PaymentIntent ---
    try {
      await supabase
        .from("orders")
        .update({ payment_intent_id: paymentIntent.id })
        .eq("id", order.id);
    } catch {
      // pas bloquant
    }

    // --- 6) Réponse client ---
    return Response.json({
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
