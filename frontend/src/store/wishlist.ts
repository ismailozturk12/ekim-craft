"use client";

import { create } from "zustand";
import { apiErrorMessage, authedFetch, useAuth } from "./auth";

interface WishlistState {
  slugs: Set<string>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  toggle: (slug: string) => Promise<boolean>;
  has: (slug: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  slugs: new Set(),
  loaded: false,
  loading: false,

  load: async () => {
    const user = useAuth.getState().user;
    if (!user) {
      set({ slugs: new Set(), loaded: true });
      return;
    }
    set({ loading: true });
    try {
      const res = await authedFetch("/catalog/wishlist/");
      if (!res.ok) return;
      const data = await res.json();
      const items = (Array.isArray(data) ? data : data.results) as Array<{
        product_detail: { slug: string };
      }>;
      set({ slugs: new Set(items.map((w) => w.product_detail.slug)), loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  has: (slug) => get().slugs.has(slug),

  toggle: async (slug: string) => {
    const state = get();
    const currentlyFav = state.slugs.has(slug);
    // Optimistic
    const next = new Set(state.slugs);
    if (currentlyFav) next.delete(slug);
    else next.add(slug);
    set({ slugs: next });

    try {
      if (currentlyFav) {
        const res = await authedFetch(`/catalog/wishlist/by-product/${slug}/`, { method: "DELETE" });
        if (!res.ok) {
          // revert
          const reverted = new Set(state.slugs);
          set({ slugs: reverted });
          throw new Error(await apiErrorMessage(res));
        }
        return false;
      } else {
        const res = await authedFetch("/catalog/wishlist/", {
          method: "POST",
          body: JSON.stringify({ product_slug: slug }),
        });
        if (!res.ok) {
          const reverted = new Set(state.slugs);
          reverted.delete(slug);
          set({ slugs: reverted });
          throw new Error(await apiErrorMessage(res));
        }
        return true;
      }
    } catch (err) {
      throw err;
    }
  },

  clear: () => set({ slugs: new Set(), loaded: false }),
}));
