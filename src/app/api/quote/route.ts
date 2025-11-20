// src/app/api/quote/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    } = body;

    if (!product_id || !quantity || !name || !email) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants.' },
        { status: 400 }
      );
    }

    const db = admin();

    // 1) On enregistre la demande dans Supabase (table "quotes")
    const { error: insertError } = await db.from('quotes').insert({
      product_id,
      variant_sku,
      quantity,
      name,
      email,
      company,
      message,
    });

    if (insertError) {
      console.error('Supabase insert error', insertError);
      // on continue quand même pour l’email, mais tu peux décider de return 500 ici
    }

    // 2) On récupère quelques infos produit pour le mail
    const { data: product } = await db
      .from('products')
      .select('name, id_anda')
      .eq('id', product_id)
      .maybeSingle();

    const productLabel = product
      ? `${product.name} ${product.id_anda ? `(${product.id_anda})` : ''}`
      : product_id;

    // 3) Email vers TOI (notification interne)
    await resend.emails.send({
      from: 'Devis IPP <onboarding@resend.dev>', // ou ton domaine Resend
      to: ['noah.bucheton27@gmail.com'],        // 🔴 remplace par ton adresse si besoin
      subject: `Nouvelle demande de devis – ${productLabel}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <p><strong>Produit :</strong> ${productLabel}</p>
        <p><strong>Variante :</strong> ${variant_sku ?? 'Non précisée'}</p>
        <p><strong>Quantité :</strong> ${quantity}</p>
        <hr/>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Société :</strong> ${company || '-'}</p>
        <p><strong>Message :</strong><br/>${(message || '')
          .toString()
          .replace(/\n/g, '<br/>')}</p>
      `,
    });

    // 4) Email de confirmation au client
    await resend.emails.send({
      from: 'IPP & Ippcom <onboarding@resend.dev>',
      to: [email as string],
      subject: 'Votre demande de devis a bien été reçue',
      html: `
        <p>Bonjour ${name},</p>
        <p>Merci pour votre demande de devis sur <strong>${productLabel}</strong>.</p>
        <p>Nous vous répondrons dans les plus brefs délais.</p>
        <p>— L'équipe IPP & Ippcom</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Erreur /api/quote', e);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du devis." },
      { status: 500 }
    );
  }
}
