// src/lib/mailer.ts
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const toEmail = process.env.QUOTES_TO_EMAIL;
const fromEmail =
  process.env.QUOTES_FROM_EMAIL || 'no-reply@ipp-customs.local';

if (!apiKey) {
  console.warn('[mailer] RESEND_API_KEY manquant, aucun mail ne sera envoyé');
}

const resend = apiKey ? new Resend(apiKey) : null;

export type QuoteEmailPayload = {
  productName: string;
  variantSku?: string;
  quantity: number;
  name: string;
  email: string;
  company?: string | null;
  message?: string | null;
};

export async function sendQuoteEmail(payload: QuoteEmailPayload) {
  if (!resend || !toEmail) {
    console.warn('[mailer] Config mail incomplète, skip envoi', {
      hasResend: !!resend,
      toEmail,
    });
    return;
  }

  const {
    productName,
    variantSku,
    quantity,
    name,
    email,
    company,
    message,
  } = payload;

  const subject = `Nouvelle demande de devis - ${productName}`;
  const bodyLines = [
    `Produit : ${productName}`,
    variantSku ? `Variante : ${variantSku}` : null,
    `Quantité : ${quantity}`,
    '',
    `Nom : ${name}`,
    `Email : ${email}`,
    company ? `Société : ${company}` : null,
    '',
    'Message :',
    message || '(aucun message)',
  ].filter(Boolean);

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    text: bodyLines.join('\n'),
  });
}
