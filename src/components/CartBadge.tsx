"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient, type SupabaseClient } from "@supabase/auth-helpers-nextjs";

type Props = { userId: string };

export default function CartBadge({ userId }: Props) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let channel: ReturnType<SupabaseClient["channel"]> | null = null;

    async function bootstrap() {
      const { data: open } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["cart", "draft", "pending"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let oid = open?.id as string | undefined;

      if (!oid) {
        const { data: noStatus } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .is("status", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        oid = noStatus?.id;
      }

      setOrderId(oid ?? null);

      if (oid) {
        await refreshCount(oid);

        channel = supabase
          .channel(`cart-lines-${oid}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "order_items", filter: `order_id=eq.${oid}` },
            () => refreshCount(oid!)
          )
          .subscribe();
      } else {
        setCount(0);
      }
    }

    async function refreshCount(oid: string) {
      const { count } = await supabase
        .from("order_items")
        .select("id", { head: true, count: "exact" })
        .eq("order_id", oid);
      setCount(count ?? 0);
    }

    bootstrap();

    const onFocus = () => orderId && supabase
      .from("order_items")
      .select("id", { head: true, count: "exact" })
      .eq("order_id", orderId)
      .then(({ count }) => setCount(count ?? 0));

    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
      channel?.unsubscribe();
    };
  }, [userId]);

  return (
    <Link className="btn btn-ghost icon-btn" href="/cart" aria-label={`Panier (${count})`} title="Panier">
      <ShoppingCart className="icon" aria-hidden="true" />
      {count > 0 && <span className="badge-count">{count}</span>}
    </Link>
  );
}
