'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  sku?: string | null;
  qty: number;
  unitPrice: number;           
  thumbnail_url?: string | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  setQty: (productId: string, sku: string | null | undefined, qty: number) => void;
  removeItem: (productId: string, sku: string | null | undefined) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items.slice();
        const idx = items.findIndex(
          (it) => it.productId === item.productId && (it.sku ?? null) === (item.sku ?? null)
        );

        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: (items[idx].qty ?? 0) + (item.qty ?? 0) };
        } else {
          items.push({ ...item, qty: item.qty ?? 1 });
        }
        set({ items });
      },

      setQty: (productId, sku, qty) => {
        const items = get().items.slice();
        const idx = items.findIndex(
          (it) => it.productId === productId && (it.sku ?? null) === (sku ?? null)
        );
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty };
          set({ items });
        }
      },

      removeItem: (productId, sku) => {
        set({
          items: get().items.filter(
            (it) => !(it.productId === productId && (it.sku ?? null) === (sku ?? null))
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-v2',
      storage: createJSONStorage(() =>
        (typeof window !== 'undefined' ? window.localStorage : undefined) as unknown as Storage
      ),
    }
  )
);
