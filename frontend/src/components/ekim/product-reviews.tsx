"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Stars } from "@/components/ekim/stars";
import { WriteReviewDialog } from "@/components/ekim/write-review-dialog";
import { formatDateShort } from "@/lib/format";

interface Review {
  id?: number;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  is_verified_purchase?: boolean;
  photos?: number;
}

interface ProductReviewsProps {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
  productSlug: string;
  productName: string;
}

// Dağılım dummy (backend'de distribution endpoint yok — Faz 11'de gerçek)
const DIST = [
  { n: 5, pct: 78 },
  { n: 4, pct: 16 },
  { n: 3, pct: 4 },
  { n: 2, pct: 1 },
  { n: 1, pct: 1 },
];

export function ProductReviews({
  averageRating,
  totalCount,
  reviews,
  productSlug,
  productName,
}: ProductReviewsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-ek-bg-elevated grid gap-6 rounded-lg p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="font-serif text-5xl leading-none">{averageRating.toFixed(1).replace(".", ",")}</div>
          <Stars rating={averageRating} />
          <div className="mono">{totalCount} yorum</div>
        </div>

        <div className="space-y-1.5">
          {DIST.map((d) => (
            <div key={d.n} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right tabular-nums">{d.n}</span>
              <Star size={11} className="fill-ek-terra text-ek-terra" />
              <div className="bg-ek-cream h-1.5 flex-1 overflow-hidden rounded-full">
                <div className="bg-ek-terra h-full rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="mono w-10 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream rounded-full px-5 py-2.5 text-sm font-medium"
        >
          Yorum yaz
        </button>
      </div>

      <WriteReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productSlug={productSlug}
        productName={productName}
        onSuccess={() => {
          // Sayfa yenile — basit yol
          if (typeof window !== "undefined") window.location.reload();
        }}
      />

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-ek-ink-3 py-8 text-center text-sm">Henüz yorum yok.</div>
      ) : (
        <div className="divide-y divide-[var(--ek-line-2)]">
          {reviews.map((r, i) => (
            <div key={r.id ?? i} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-ek-cream font-serif flex h-10 w-10 items-center justify-center rounded-full text-sm">
                    {r.author_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{r.author_name}</span>
                      {r.is_verified_purchase && (
                        <span className="bg-ek-cream text-ek-ok mono rounded px-1.5 py-0.5 text-[9px]">
                          SATIN ALDI
                        </span>
                      )}
                    </div>
                    <div className="mono">{formatDateShort(r.created_at)}</div>
                  </div>
                </div>
                <Stars rating={r.rating} />
              </div>
              {r.title && <h4 className="font-serif text-base mt-3">{r.title}</h4>}
              <p className="text-ek-ink-2 mt-1.5 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
