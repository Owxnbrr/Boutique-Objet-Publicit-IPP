'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;             
  sku?: string;           
  name: string;
  image?: string;
  unitPrice: number;      
  currency: 'EUR';
  qty: number;
  minQty?: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string, sku?: string) => void;
  setQty: (id: string, sku: string | undefined, qty: number) => void;
  clear: () => void;
  count: number;         
  total: number;          
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const items = [...get().items];
        const i = items.findIndex(x => x.id === item.id && x.sku === item.sku);
        if (i >= 0) {
          items[i] = { ...items[i], qty: items[i].qty + item.qty };
        } else {
          items.push(item);
        }
        set({ items, count: items.reduce((a,b)=>a+b.qty,0), total: items.reduce((a,b)=>a+b.unitPrice*b.qty,0) });
      },
      remove: (id, sku) => {
        const items = get().items.filter(x => !(x.id===id && x.sku===sku));
        set({ items, count: items.reduce((a,b)=>a+b.qty,0), total: items.reduce((a,b)=>a+b.unitPrice*b.qty,0) });
      },
      setQty: (id, sku, qty) => {
        const items = get().items.map(x => (x.id===id && x.sku===sku ? { ...x, qty: Math.max(qty, x.minQty ?? 1) } : x));
        set({ items, count: items.reduce((a,b)=>a+b.qty,0), total: items.reduce((a,b)=>a+b.unitPrice*b.qty,0) });
      },
      clear: () => set({ items: [], count: 0, total: 0 }),
      count: 0,
      total: 0,
    }),
    { name: 'gs:cart' }
  )
);
