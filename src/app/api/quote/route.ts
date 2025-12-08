import { NextResponse } from "next/server";
import { admin } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, variant_sku, quantity, name, email, company, message } =
      body ?? {};

    if (!product_id || !quantity || !name || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const db = admin();

    const { data: product } = await db
      .from("products")
      .select("id, name, id_anda")
      .eq("id", product_id)
      .maybeSingle();

    const productLabel = product
      ? `${product.name}${product.id_anda ? ` (${product.id_anda})` : ""}`
      : `Produit #${product_id}`;

    const { data: quote, error: dbError } = await db
      .from("quotes")
      .insert({
        product_id,
        variant_sku,
        quantity,
        name,
        email,
        company,
        message,
        product_label: productLabel, 
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("Erreur Supabase (quotes):", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du devis." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, quote_id: quote.id });
  } catch (e) {
    console.error("Erreur /api/quote:", e);
    return NextResponse.json(
      { error: "Erreur serveur lors de la demande de devis." },
      { status: 500 }
    );
  }
}
