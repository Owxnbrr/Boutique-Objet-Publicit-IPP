// src/app/api/order/route.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type CartItem = {
  id: string;           
  sku?: string | null;
  name: string;
  unitPrice: number;    
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

    const items = rawItems.map((it) => {
      const unitEur = Number(it.unitPrice) || 0;
      const unitCents = Math.round(unitEur * 100);
      const qty = Number.isFinite(it.qty) && it.qty > 0 ? it.qty : 1;

      return {
        ...it,
        qty,
        unitCents,
      };
    });

    const subTotal = items.reduce(
      (s, it) => s + it.unitCents * it.qty,
      0
    );
    const tvaRate = 0.2;
    const taxTotal = Math.round(subTotal * tvaRate);
    const total = subTotal + taxTotal;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        currency: currency.toUpperCase(),
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

    const rows = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      sku: it.sku ?? null,
      name: it.name,
      qty: it.qty,
      unit_price: it.unitCents,            
      line_total: it.unitCents * it.qty,   
      thumbnail_url: it.image ?? null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(rows);

    if (itemsErr) {
      return Response.json({ error: itemsErr.message }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order.id),
        userId: user.id,
      },
    });

    try {
      await supabase
        .from("orders")
        .update({ payment_intent_id: paymentIntent.id })
        .eq("id", order.id);
    } catch {
    }

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
