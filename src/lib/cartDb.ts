// lib/cartDb.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const CART_STATUSES = ["cart", "draft", "pending"] as const;

export async function getOrCreateOpenOrder(userId: string) {
  const supabase = createClientComponentClient();

  const { data: open } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .in("status", CART_STATUSES as unknown as string[])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (open?.id) return open.id as string;

  const { data, error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, status: "cart", currency: "EUR", total: 0 }])
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function getUnitPrice(productId: string, sku: string | undefined | null, qty: number) {
  const supabase = createClientComponentClient();

  if (sku) {
    const { data: priceRow } = await supabase
      .from("prices")
      .select("unit_price, qty_break")
      .eq("variant_sku", sku)
      .lte("qty_break", qty)
      .order("qty_break", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (priceRow?.unit_price != null) return Number(priceRow.unit_price);
  }

  const { data: product } = await supabase
    .from("products")
    .select("base_price")
    .eq("id", productId)
    .maybeSingle();

  if (product?.base_price != null) return Number(product.base_price);

  return 0;
}

export async function upsertCartItem(params: {
  userId: string;
  product: { id: string; sku?: string | null; name: string; unitPrice?: number; thumbnail_url?: string | null };
  qty: number;
}) {
  const supabase = createClientComponentClient();
  const orderId = await getOrCreateOpenOrder(params.userId);

  const itemsBase = supabase
    .from("order_items")
    .select("id, qty")
    .eq("order_id", orderId)
    .eq("product_id", params.product.id);

  const itemsQuery = params.product.sku
    ? itemsBase.eq("sku", params.product.sku)
    : itemsBase.is("sku", null);

  const { data: existing } = await itemsQuery.maybeSingle();

  const unit = params.product.unitPrice ?? (await getUnitPrice(params.product.id, params.product.sku ?? null, params.qty));

  if (existing?.id) {
    const newQty = (existing.qty ?? 0) + params.qty;
    await supabase
      .from("order_items")
      .update({
        qty: newQty,
        unit_price: unit,
        line_total: unit * newQty,
        name: params.product.name,
        thumbnail_url: params.product.thumbnail_url ?? null,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("order_items").insert([
      {
        order_id: orderId,
        product_id: params.product.id,
        sku: params.product.sku ?? null,
        name: params.product.name,
        qty: params.qty,
        unit_price: unit,
        line_total: unit * params.qty,
        thumbnail_url: params.product.thumbnail_url ?? null,
      },
    ]);
  }
  return orderId;
}

export async function updateCartQty(userId: string, productId: string, sku: string | undefined | null, qty: number) {
  const supabase = createClientComponentClient();
  const orderId = await getOrCreateOpenOrder(userId);

  if (!Number.isFinite(qty) || qty <= 0) {
    return removeCartItem(userId, productId, sku);
  }

  const unit = await getUnitPrice(productId, sku, qty);

  const q = supabase
    .from("order_items")
    .update({ qty, unit_price: unit, line_total: unit * qty })
    .eq("order_id", orderId)
    .eq("product_id", productId);

  if (sku) {
    await q.eq("sku", sku);
  } else {
    await q.is("sku", null);
  }
}

export async function removeCartItem(userId: string, productId: string, sku?: string | null) {
  const supabase = createClientComponentClient();
  const orderId = await getOrCreateOpenOrder(userId);

  const q = supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId)
    .eq("product_id", productId);

  if (sku) {
    await q.eq("sku", sku);
  } else {
    await q.is("sku", null);
  }
}

export async function clearCart(userId: string) {
  const supabase = createClientComponentClient();

  const { data: orders = [], error: e1 } = await supabase
    .from("orders")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", CART_STATUSES as unknown as string[]);
  if (e1) throw e1;

  const ids = (orders ?? []).map((o) => o.id).filter(Boolean) as string[];
  if (!ids.length) return;

  const { error: e2 } = await supabase
    .from("order_items")
    .delete({ count: "exact" })
    .in("order_id", ids as string[]);

  if (e2) {
    for (const id of ids) {
      await supabase.from("order_items").delete().eq("order_id", id);
    }
  }

  await supabase.from("orders").update({ total: 0 }).in("id", ids);

}
