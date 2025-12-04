import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      product_id,
      variant_sku,
      quantity,
      name,
      email,
      company,
      message,
    } = body ?? {};

    if (!product_id || !quantity || !name || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const db = admin();

    // 1) On récupère le produit pour enrichir le mail
    const { data: product } = await db
      .from("products")
      .select("id, name, id_anda")
      .eq("id", product_id)
      .maybeSingle();

    const productLabel = product
      ? `${product.name}${product.id_anda ? ` (${product.id_anda})` : ""}`
      : `Produit #${product_id}`;

    // 2) On enregistre la demande dans Supabase (table quotes)
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

    // 3) ENVOI DES EMAILS VIA RESEND
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[/api/quote] RESEND_API_KEY manquant, les emails ne seront pas envoyés."
      );
    } else {
      // 3a) Mail interne (vers toi)
      const internalHtml = `
        <h1>Nouvelle demande de devis</h1>
        <p><strong>Produit :</strong> ${productLabel}</p>
        <p><strong>Variante :</strong> ${variant_sku || "-"}</p>
        <p><strong>Quantité :</strong> ${quantity}</p>
        <hr/>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Société :</strong> ${company || "-"}</p>
        <h2>Message</h2>
        <p>${(message || "(aucun message)")
          .toString()
          .replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p><small>Quote ID: ${quote?.id ?? "?"}</small></p>
      `;

      const { error: internalMailError } = await resend.emails.send({
        from: "IPP Customs Devis <onboarding@resend.dev>", // à changer quand tu auras ton propre domaine
        to: "contact@ipp-imprimerie.fr",
        subject: `Nouvelle demande de devis – ${productLabel}`,
        html: internalHtml,
      });

      if (internalMailError) {
        console.error("Erreur envoi mail interne:", internalMailError);
      }

      // 3b) Mail de confirmation au client
      const clientHtml = `
        <h1>Votre demande de devis a bien été reçue</h1>
        <p>Bonjour ${name},</p>
        <p>
          Merci pour votre demande de devis pour :
          <strong>${productLabel}</strong>
          (variante : ${variant_sku || "non précisée"}).
        </p>
        <p><strong>Quantité :</strong> ${quantity}</p>
        ${
          company
            ? `<p><strong>Société :</strong> ${company}</p>`
            : ""
        }
        ${
          message
            ? `<h2>Votre message</h2><p>${message
                .toString()
                .replace(/\n/g, "<br/>")}</p>`
            : ""
        }
        <p>
          Nous vous répondrons dans les plus brefs délais.
        </p>
        <p>Cordialement,<br/><strong>IPP Customs</strong></p>
      `;

      const { error: clientMailError } = await resend.emails.send({
        from: "IPP Customs Devis <onboarding@resend.dev>",
        to: email as string, // 👉 mail du client
        subject: `Confirmation de votre demande de devis – ${productLabel}`,
        html: clientHtml,
      });

      if (clientMailError) {
        console.error("Erreur envoi mail client:", clientMailError);
      }
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
