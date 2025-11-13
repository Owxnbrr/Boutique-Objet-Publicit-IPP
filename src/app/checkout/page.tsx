// src/app/checkout/page.tsx
import CheckoutClient from '@/components/CheckoutClient';

export const metadata = { title: 'Paiement / Checkout' };

export default function CheckoutPage() {
  return (
    <section className="container" style={{paddingTop: 24}}>
      <h1 className="h1">Paiement</h1>
      <p className="muted" style={{marginBottom: 16}}>
        Vérifiez votre panier et indiquez vos informations.
      </p>
      <CheckoutClient />
    </section>
  );
}
