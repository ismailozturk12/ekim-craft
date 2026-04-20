"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { ProductCard } from "@/components/ekim/product-card";
import { apiErrorMessage, authedFetch, useAuthHydrated } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types/catalog";

interface ApiWishItem {
  id: number;
  product: number;
  product_detail: {
    id: number;
    slug: string;
    name: string;
    category: number;
    category_slug: string;
    artisan: string;
    artisan_city: string;
    price: string;
    old_price: string | null;
    rating: string;
    review_count: number;
    tags: string[];
    customizable: boolean;
    size_type: string;
    currency: string;
  };
}

function mapProduct(d: ApiWishItem["product_detail"]): Product {
  return {
    id: String(d.id),
    slug: d.slug,
    name: d.name,
    category: (d.category_slug ?? "all") as Product["category"],
    artisan: d.artisan,
    artisanCity: d.artisan_city,
    price: parseFloat(d.price),
    oldPrice: d.old_price ? parseFloat(d.old_price) : undefined,
    currency: d.currency,
    stock: 10,
    rating: parseFloat(d.rating),
    reviews: d.review_count,
    tags: d.tags as Product["tags"],
    customizable: d.customizable,
    sizeType: d.size_type as Product["sizeType"],
    sizes: [],
    colors: [],
    desc: "",
    materials: [],
    care: "",
    leadTime: "",
    coverImage: (d as { cover_image?: string | null }).cover_image ?? null,
  };
}

export default function WishlistPage() {
  const hydrated = useAuthHydrated();
  const wishlistSync = useWishlist((s) => s.load);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const res = await authedFetch("/catalog/wishlist/");
        if (!res.ok) {
          toast.error(await apiErrorMessage(res));
          return;
        }
        const data = (await res.json()) as ApiWishItem[] | { results: ApiWishItem[] };
        const list = Array.isArray(data) ? data : data.results;
        setItems(list.map((w) => mapProduct(w.product_detail)));
        wishlistSync();
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, wishlistSync]);

  if (loading) {
    return (
      <div>
        <h1 className="h-1 mb-6">Favorilerim</h1>
        <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="h-1 mb-6">Favorilerim</h1>
        <EmptyState
          icon={<Heart size={32} />}
          title="Favori listen boş"
          description="Beğendiğin ürünlerdeki kalp ikonuna dokunarak favorilere ekleyebilirsin."
          action={{ label: "Mağazaya git", href: "/kategori/all" }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="h-1 mb-6">Favorilerim ({items.length})</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
