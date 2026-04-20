"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Stars } from "@/components/ekim/stars";
import { Tag } from "@/components/ekim/tag";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { discountPercent, formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
  onToggleWishlist?: (id: string) => void;
  onQuickAdd?: (id: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = "grid",
  onQuickAdd,
  className,
}: ProductCardProps) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isFav = useWishlist((s) => s.slugs.has(product.slug ?? ""));
  const toggleFav = useWishlist((s) => s.toggle);
  const discount = discountPercent(product.price, product.oldPrice);
  const lowStock = product.stock > 0 && product.stock < 5;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/giris?next=%2Fhesap%2Ffavoriler`);
      return;
    }
    if (!product.slug) return;
    try {
      const added = await toggleFav(product.slug);
      toast.success(added ? "Favorilere eklendi" : "Favorilerden kaldırıldı");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const wished = isFav;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.(product.id);
  };

  if (variant === "list") {
    return (
      <Link
        href={`/urun/${product.slug ?? product.id}`}
        className={cn(
          "group border-ek-line-2 bg-ek-bg-card hover:bg-ek-bg-elevated flex gap-4 rounded-lg border p-3 transition-colors",
          className
        )}
      >
        <div className="relative w-36 shrink-0 overflow-hidden rounded">
          {product.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.coverImage}
              alt={product.name}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <Placeholder
              tone={toneForProduct(product.id)}
              label={product.name.split(" ")[0]}
              ratio="1"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="mono mb-1">{product.artisan}</div>
            <div className="text-ek-ink text-[15px] font-medium leading-snug">{product.name}</div>
            <Stars rating={product.rating} className="mt-2" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              {product.oldPrice && (
                <span className="text-ek-ink-4 mr-2 text-sm line-through">{formatTL(product.oldPrice)}</span>
              )}
              <span className="font-serif text-xl">{formatTL(product.price)}</span>
            </div>
            <button
              onClick={toggle}
              className="text-ek-ink-3 hover:text-ek-terra p-2 transition-colors"
              aria-label="Favorilere ekle"
            >
              <Heart size={18} className={wished ? "fill-ek-terra text-ek-terra" : ""} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/urun/${product.slug ?? product.id}`} className={cn("group block", className)}>
      <div className="relative mb-3 overflow-hidden rounded-lg">
        {product.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverImage}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <Placeholder
            tone={toneForProduct(product.id)}
            label={product.name.split(" ")[0]}
            ratio="4 / 5"
          />
        )}

        {/* Badges (sol üst) */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.tags.slice(0, 2).map((t) => (
            <Tag key={t} label={t} variant={t} />
          ))}
          {discount !== null && <Tag label={`-${discount}%`} variant="İndirim" />}
          {product.customizable && <Tag label="✦ Özel" variant="Elde yapıldı" />}
        </div>

        {/* Wishlist (sağ üst) */}
        <button
          onClick={toggle}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors",
            wished ? "bg-ek-terra text-white" : "bg-white/80 text-ek-ink hover:bg-white"
          )}
          aria-label="Favorilere ekle"
        >
          <Heart size={16} className={wished ? "fill-current" : ""} strokeWidth={1.75} />
        </button>

        {/* Hover'da hızlı ekle */}
        {onQuickAdd && (
          <button
            onClick={quickAdd}
            className="bg-ek-ink/90 text-ek-cream hover:bg-ek-ink absolute inset-x-3 bottom-3 translate-y-3 rounded-full py-2.5 text-xs font-medium uppercase tracking-wider opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100"
          >
            Hızlı ekle
          </button>
        )}

        {/* Düşük stok */}
        {lowStock && (
          <div className="bg-ek-warn/95 absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
            Son {product.stock}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="mono">{product.artisan}</div>
        <h3 className="text-ek-ink group-hover:text-ek-terra-2 text-[15px] font-medium leading-snug transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {product.oldPrice && (
              <span className="text-ek-ink-4 text-sm line-through">{formatTL(product.oldPrice)}</span>
            )}
            <span className="font-serif text-lg">{formatTL(product.price)}</span>
          </div>
          <Stars rating={product.rating} size={12} />
        </div>
        {/* Renk önizlemesi */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="border-ek-line h-3 w-3 rounded-full border"
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-ek-ink-4 ml-1 text-[10px]">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
