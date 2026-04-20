"use client";

import { Leaf } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductReviews } from "./product-reviews";

interface TabProps {
  description: string;
  materials: string[];
  care: string;
  reviewCount: number;
  averageRating: number;
  leadTime: string;
  productSlug: string;
  productName: string;
  reviews: Array<{
    id?: number;
    author_name: string;
    rating: number;
    title: string;
    body: string;
    created_at: string;
    is_verified_purchase?: boolean;
  }>;
}

export function ProductTabs({
  description,
  materials,
  care,
  reviewCount,
  averageRating,
  leadTime,
  productSlug,
  productName,
  reviews,
}: TabProps) {
  const [active, setActive] = useState<"detay" | "malzeme" | "bakim" | "kargo" | "yorumlar">("detay");

  const tabs = [
    { id: "detay" as const, label: "Ürün Detayı" },
    { id: "malzeme" as const, label: "Malzeme" },
    { id: "bakim" as const, label: "Bakım" },
    { id: "kargo" as const, label: "Kargo & İade" },
    { id: "yorumlar" as const, label: `Yorumlar (${reviewCount})` },
  ];

  return (
    <div className="mt-20">
      <div className="border-ek-line border-b">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-3.5 text-sm font-medium transition-colors -mb-px",
                active === t.id
                  ? "text-ek-ink border-ek-ink"
                  : "text-ek-ink-3 hover:text-ek-ink border-transparent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl py-10">
        {active === "detay" && (
          <div className="space-y-4">
            <p className="text-ek-ink-2 text-base leading-relaxed">{description}</p>
            <p className="text-ek-ink-2 text-base leading-relaxed">
              Her ürün el yapılır ve farklılıklar barındırır. Renkte küçük ton farkları, dokuda hafif
              izler — bunlar ürünün zanaat eseri olduğunun göstergesidir, kusur değil.
            </p>
          </div>
        )}

        {active === "malzeme" && (
          <ul className="space-y-0">
            {materials.length === 0 ? (
              <li className="text-ek-ink-3 text-sm">Malzeme bilgisi girilmemiş.</li>
            ) : (
              materials.map((m) => (
                <li
                  key={m}
                  className="border-ek-line-2 flex items-center gap-3 border-b py-3 last:border-0"
                >
                  <Leaf size={16} className="text-ek-forest" />
                  <span className="text-ek-ink-2">{m}</span>
                </li>
              ))
            )}
          </ul>
        )}

        {active === "bakim" && (
          <p className="text-ek-ink-2 text-base leading-relaxed">{care || "Normal oda koşullarında saklayın. Nemli bezle silin."}</p>
        )}

        {active === "kargo" && (
          <div className="space-y-5">
            <div>
              <h4 className="h-3 mb-1.5">Kargo</h4>
              <p className="text-ek-ink-2">
                500₺ üzeri ücretsiz; stokta olanlar 1-3 iş gününde. Kişiselleştirilmiş ürünlerde +3-5
                iş günü ek üretim süresi. Tahmini: <strong>{leadTime || "3-5 gün"}</strong>.
              </p>
            </div>
            <div>
              <h4 className="h-3 mb-1.5">İade</h4>
              <p className="text-ek-ink-2">
                14 gün koşulsuz iade; kişiselleştirilmiş ürünler iade kapsamı dışındadır.
              </p>
            </div>
          </div>
        )}

        {active === "yorumlar" && (
          <ProductReviews
            averageRating={averageRating}
            totalCount={reviewCount}
            reviews={reviews}
            productSlug={productSlug}
            productName={productName}
          />
        )}
      </div>
    </div>
  );
}
