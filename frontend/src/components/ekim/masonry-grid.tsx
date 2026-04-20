import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import type { Product } from "@/types/catalog";

interface MasonryGridProps {
  products: Product[];
  className?: string;
  onToggleWishlist?: (id: string) => void;
  onQuickAdd?: (id: string) => void;
}

/**
 * Pinterest tarzı masonry — CSS columns tekniği.
 * Responsive: 4→3→2→1 kolon
 */
export function MasonryGrid({ products, className, onToggleWishlist, onQuickAdd }: MasonryGridProps) {
  return (
    <div
      className={cn(
        "masonry-grid",
        // Tailwind v4 arbitrary CSS — break-inside: avoid için children className
        className
      )}
      style={{
        columnCount: 4,
        columnGap: "1.25rem",
      }}
    >
      {/* Inline responsive kolonlar */}
      <style>{`
        @media (max-width: 1280px) { .masonry-grid { column-count: 3 !important; } }
        @media (max-width: 900px)  { .masonry-grid { column-count: 2 !important; } }
        @media (max-width: 560px)  { .masonry-grid { column-count: 1 !important; } }
        .masonry-item { break-inside: avoid; margin-bottom: 1.25rem; display: block; }
      `}</style>
      {products.map((p) => (
        <div key={p.id} className="masonry-item">
          <ProductCard product={p} onToggleWishlist={onToggleWishlist} onQuickAdd={onQuickAdd} />
        </div>
      ))}
    </div>
  );
}
