import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Mail interne (patron) + mail de secours (toi)
const INTERNAL_TO = process.env.QUOTES_TO_EMAIL || "contact@ipp-imprimerie.fr";
const FALLBACK_TO = process.env.QUOTES_FALLBACK_EMAIL || "noah.bucheton27@gmail.com";

/**
 * IMPORTANT :
 * Tant que Resend n'a pas ton domaine en verified "sending",
 * utilise onboarding@resend.dev en FROM.
 * Quand tout est validé, tu pourras remettre:
 * "IPP Imprimerie <contact@ipp-imprimerie.fr>"
 */
const FROM_EMAIL = process.env.QUOTES_FROM_EMAIL || "Devis IPP <onboarding@resend.dev>";

function normalizeResendError(err: any) {
  if (!err) return null;
  return {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    details: err.details,
  };
}

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

    // 1) Récupérer le produit
    const { data: product } = await db
      .from("products")
      .select("id, name, id_anda")
      .eq("id", product_id)
      .maybeSingle();

    const productLabel = product
      ? `${product.name}${product.id_anda ? ` (${product.id_anda})` : ""}`
      : `Produit #${product_id}`;

    // 2) Enregistrer la demande en DB
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

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY manquant." }, { status: 500 });
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

    // Tentative 1: envoyer au mail interne (patron)
    const firstTry = await resend.emails.send({
      from: FROM_EMAIL,
      to: [INTERNAL_TO],
      replyTo: email as string,
      subject: subjectInternal,
      html: internalHtml,
    });

    // Si refus Resend (sandbox/recipient/etc.), on retente sur ton Gmail
    if (firstTry.error) {
      console.error("Resend error (internal first try):", firstTry.error);

      const retry = await resend.emails.send({
        from: FROM_EMAIL,
        to: [FALLBACK_TO],
        replyTo: email as string,
        subject: `[FALLBACK] ${subjectInternal}`,
        html: internalHtml,
      });

      if (retry.error) {
        console.error("Resend error (fallback retry):", retry.error);
        return NextResponse.json(
          {
            error: "Erreur Resend (mail interne).",
            resend: {
              internal_to: INTERNAL_TO,
              fallback_to: FALLBACK_TO,
              firstTry: normalizeResendError(firstTry.error),
              retry: normalizeResendError(retry.error),
            },
          },
          { status: 502 }
        );
      }
    }

    // 3b) Mail de confirmation client (peut aussi être bloqué si sandbox)
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

    const clientSend = await resend.emails.send({
      from: FROM_EMAIL,
      to: email as string,
      subject: `Confirmation de votre demande de devis – ${productLabel}`,
      html: clientHtml,
    });

    if (clientSend.error) {
      console.error("Resend error (client):", clientSend.error);
      // on ne bloque pas la requête : devis enregistré + mail interne ok
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
