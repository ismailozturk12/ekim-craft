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

export interface AppliedCoupon {
  code: string;
  name: string;
  type: "percent" | "fixed" | "free_ship";
  discount: number;
  free_shipping: boolean;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  addItem: (line: Omit<CartLine, "addedAt">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      coupon: null,
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
      clear: () => set({ items: [], coupon: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      applyCoupon: (c) => set({ coupon: c }),
      removeCoupon: () => set({ coupon: null }),
    }),
    { name: "ekim.cart", partialize: (s) => ({ items: s.items, coupon: s.coupon }) }
  )
);

export function cartTotals(items: CartLine[], coupon?: AppliedCoupon | null) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeShippingThreshold = 500;
  const baseShipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 49.9;

  let discount = 0;
  let shipping = baseShipping;
  if (coupon) {
    if (coupon.free_shipping) shipping = 0;
    else discount = Math.min(subtotal, coupon.discount);
  }
  const total = Math.max(0, subtotal - discount + shipping);
  return {
    subtotal,
    shipping,
    discount,
    total,
    freeShippingDelta: Math.max(0, freeShippingThreshold - subtotal),
  };
}

export function itemCount(items: CartLine[]) {
  return items.reduce((s, i) => s + i.qty, 0);
}
