// src/app/api/checkout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type OrderLineInput = {
  product_id: string;
  sku?: string | null;
  name: string;
  qty: number;
  unit_price: number;
  line_total?: number | null;
  thumbnail_url?: string | null;
};

type CheckoutBody = {
  customer_name: string;
  customer_email: string;
  customer_company?: string | null;
  customer_address?: string | null;
  customer_note?: string | null;

  currency: string;
  total: number;      
  lines: OrderLineInput[];

  shipping_method?: "delivery" | "pickup" | null;
  pickup_store?: string | null;
};

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = (await req.json()) as CheckoutBody;

    if (
      !body?.customer_name ||
      !body?.customer_email ||
      !Array.isArray(body?.lines) ||
      body.lines.length === 0
    ) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        currency: body.currency ?? "EUR",
        total: body.total ?? 0,

        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_company: body.customer_company ?? null,
        customer_address: body.customer_address ?? null,
        customer_note: body.customer_note ?? null,

        shipping_method: body.shipping_method ?? null,
        pickup_store: body.pickup_store ?? null,

        user_id: userId,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("order insert error:", orderErr);
      return NextResponse.json(
        { error: "Création commande échouée" },
        { status: 500 }
      );
    }

    const linesToInsert = body.lines.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      sku: l.sku ?? null,
      name: l.name,
      qty: l.qty,
      unit_price: l.unit_price,
      line_total: l.line_total ?? Math.round(l.unit_price * l.qty * 100) / 100,
      thumbnail_url: l.thumbnail_url ?? null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(linesToInsert);

    if (itemsErr) {
      console.error("order_items insert error:", itemsErr);
      return NextResponse.json(
        { error: "Insertion lignes échouée" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: order.id }, { status: 200 });
  } catch (e: any) {
    console.error("checkout route error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
