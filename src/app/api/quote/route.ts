import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Destinataire interne (patron)
const INTERNAL_TO = process.env.QUOTES_TO_EMAIL || "contact@ipp-imprimerie.fr";

/**
 * IMPORTANT :
 * Tant que ton domaine Resend n'est pas "Verified" côté Sending,
 * garde un FROM Resend (onboarding@resend.dev) pour éviter les blocages.
 * Quand tout est Verified côté Resend, tu pourras passer à :
 * "IPP Imprimerie <contact@ipp-imprimerie.fr>"
 */
const FROM_EMAIL = "Devis IPP <onboarding@resend.dev>";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { product_id, variant_sku, quantity, name, email, company, message } =
      body ?? {};

    const qty = Number(quantity);

    if (!product_id || !Number.isFinite(qty) || qty <= 0 || !name || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (ou quantité invalide)." },
        { status: 400 }
      );
    }

    const db = admin();

    // 1) Récupérer le produit pour enrichir le mail
    const { data: product } = await db
      .from("products")
      .select("id, name, id_anda")
      .eq("id", product_id)
      .maybeSingle();

    const productLabel = product
      ? `${product.name}${product.id_anda ? ` (${product.id_anda})` : ""}`
      : `Produit #${product_id}`;

    // 2) Enregistrer la demande dans Supabase (table quotes)
    const { data: quote, error: dbError } = await db
      .from("quotes")
      .insert({
        product_id,
        variant_sku,
        quantity: qty,
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

    // 3) Envoi via Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY manquant." },
        { status: 500 }
      );
    }

    // 3a) Mail interne
    const internalHtml = `
      <h1>Nouvelle demande de devis</h1>
      <p><strong>Produit :</strong> ${productLabel}</p>
      <p><strong>Variante :</strong> ${variant_sku || "-"}</p>
      <p><strong>Quantité :</strong> ${qty}</p>
      <hr/>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Société :</strong> ${company || "-"}</p>
      <h2>Message</h2>
      <p>${(message || "(aucun message)").toString().replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><small>Quote ID: ${quote?.id ?? "?"}</small></p>
    `;

    const subjectInternal = `[DEVIS] ${productLabel} | Qté:${qty} | ${name} | #${quote.id}`;

    const { error: internalMailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [INTERNAL_TO, "noah.bucheton27@gmail.com"], // test double destinataire
      replyTo: email as string, // ✅ ICI: replyTo doit être string/string[]
      subject: subjectInternal,
      html: internalHtml,
    });

    if (internalMailError) {
      console.error("Erreur envoi mail interne:", internalMailError);
      return NextResponse.json(
        { error: "Erreur Resend (mail interne).", details: internalMailError },
        { status: 502 }
      );
    }

    // 3b) Mail confirmation client
    const clientHtml = `
      <h1>Votre demande de devis a bien été reçue</h1>
      <p>Bonjour ${name},</p>
      <p>
        Merci pour votre demande de devis pour :
        <strong>${productLabel}</strong>
        (variante : ${variant_sku || "non précisée"}).
      </p>
      <p><strong>Quantité :</strong> ${qty}</p>
      ${company ? `<p><strong>Société :</strong> ${company}</p>` : ""}
      ${
        message
          ? `<h2>Votre message</h2><p>${message
              .toString()
              .replace(/\n/g, "<br/>")}</p>`
          : ""
      }
      <p>Nous vous répondrons dans les plus brefs délais.</p>
      <p>Cordialement,<br/><strong>IPP Imprimerie</strong></p>
    `;

    const { error: clientMailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email as string,
      subject: `Confirmation de votre demande de devis – ${productLabel}`,
      html: clientHtml,
    });

    if (clientMailError) {
      console.error("Erreur envoi mail client:", clientMailError);
      // on ne bloque pas forcément si seul le mail client échoue
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
