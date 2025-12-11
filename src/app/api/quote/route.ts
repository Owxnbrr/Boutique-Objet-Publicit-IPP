// src/app/api/quote/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client "admin" qui bypass les RLS pour les INSERT
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

type QuotePayload = {
  product_id: string;
  variant_sku: string;
  quantity: number;
  name: string;
  email: string;
  company?: string | null;
  message?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<QuotePayload>;

    if (
      !body.product_id ||
      !body.variant_sku ||
      !body.quantity ||
      !body.name ||
      !body.email
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload: QuotePayload = {
      product_id: body.product_id,
      variant_sku: body.variant_sku,
      quantity: Number(body.quantity) || 1,
      name: body.name,
      email: body.email,
      company: body.company ?? null,
      message: body.message ?? null,
    };

    const { error } = await supabase.from("quotes").insert(payload);

    if (error) {
      console.error("Supabase insert error (quotes):", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("API /api/quote error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
