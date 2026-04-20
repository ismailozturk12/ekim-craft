"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  key: string; // product.slug + "|" + size + "|" + color (uniqueness)
  productId: number;
  slug: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  customizable?: boolean;
  personalization?: {
    imageUrl?: string;
    text?: string;
    note?: string;
  };
  addedAt: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  addItem: (line: Omit<CartLine, "addedAt">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (line) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === line.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === line.key ? { ...i, qty: i.qty + line.qty } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...line, addedAt: Date.now() }],
            isOpen: true,
          };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      updateQty: (key, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "ekim.cart", partialize: (s) => ({ items: s.items }) }
  )
);

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeShippingThreshold = 500;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 49.9;
  const total = subtotal + shipping;
  return { subtotal, shipping, total, freeShippingDelta: Math.max(0, freeShippingThreshold - subtotal) };
}

export function itemCount(items: CartLine[]) {
  return items.reduce((s, i) => s + i.qty, 0);
}
