// src/app/order/[id]/PayForm.tsx
"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function InnerForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onPay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);
      setMsg(null);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
        },
      });

      if (error) {
        setMsg(error.message || "Le paiement a échoué.");
        setLoading(false);
      }
    },
    [stripe, elements, orderId]
  );

  return (
    <form onSubmit={onPay} style={{ maxWidth: 460 }}>
      <PaymentElement />
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%", marginTop: 12 }}
        disabled={loading || !stripe || !elements}
      >
        {loading ? "Traitement…" : "Payer maintenant"}
      </button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}

export default function PayForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "fr",
        appearance: { theme: "stripe" },
      }}
    >
      <InnerForm orderId={orderId} />
    </Elements>
  );
}
