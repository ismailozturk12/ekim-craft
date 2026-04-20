"use client";

import { Camera, Sparkles } from "lucide-react";
import { useState } from "react";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { Tag } from "@/components/ekim/tag";
import { cn } from "@/lib/utils";
import { discountPercent } from "@/lib/format";

interface ProductImage {
  id: number;
  image: string | null;
  alt: string;
  is_cover: boolean;
  sort_order: number;
}

interface ProductGalleryProps {
  productId: string;
  name: string;
  tags: string[];
  price: number;
  oldPrice?: number;
  images?: ProductImage[];
}

const TONES = ["cream", "sage", "terra", "forest", "blue"] as const;

export function ProductGallery({
  productId,
  name,
  tags,
  price,
  oldPrice,
  images = [],
}: ProductGalleryProps) {
  // Yüklenmiş gerçek görselleri önce al (kapak en başta), sonra placeholder slot'ları
  const realImages = [...images]
    .filter((i) => !!i.image)
    .sort((a, b) => {
      if (a.is_cover) return -1;
      if (b.is_cover) return 1;
      return a.sort_order - b.sort_order;
    });

  const hasReal = realImages.length > 0;
  const [active, setActive] = useState(0);
  const base = toneForProduct(productId);
  const discount = discountPercent(price, oldPrice);

  // Thumbnail slot sayısı: en az 4, real'den daha fazlaysa real kadar
  const slotCount = Math.max(4, realImages.length);
  const activeImage = realImages[active];

  return (
    <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
      {/* Thumbnails */}
      <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col">
        {Array.from({ length: slotCount }).map((_, i) => {
          const img = realImages[i];
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              disabled={!img && !hasReal}
              className={cn(
                "w-20 shrink-0 overflow-hidden rounded-md transition-all",
                active === i && (img || !hasReal)
                  ? "ring-ek-ink ring-2 ring-offset-2 ring-offset-[var(--ek-bg)]"
                  : ""
              )}
            >
              {img?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.image}
                  alt={img.alt || name}
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                <Placeholder
                  tone={i === 0 ? base : TONES[i % TONES.length]}
                  ratio="1"
                  className="opacity-70"
                />
              )}
            </button>
          );
        })}
        <div className="border-ek-line text-ek-ink-3 flex aspect-square w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed">
          <Camera size={16} />
          <div className="mono mt-0.5 text-[9px]">360°</div>
        </div>
      </div>

      {/* Main image */}
      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden rounded-lg">
          {activeImage?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage.image}
              alt={activeImage.alt || name}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <Placeholder
              tone={active === 0 ? base : TONES[active % TONES.length]}
              label={name}
              ratio="4 / 5"
            />
          )}
          {/* Sol üst: tag badges */}
          <div className="absolute left-4 top-4 flex flex-col gap-1.5">
            {tags.slice(0, 3).map((t) => (
              <Tag key={t} label={t} variant={t as never} />
            ))}
            {discount !== null && <Tag label={`%${discount} İNDİRİM`} variant="İndirim" />}
          </div>
          {/* Sağ alt: AR badge */}
          <div className="bg-ek-bg-elevated/95 mono absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px]">
            <Sparkles size={12} />
            AR'da görüntüle
          </div>
        </div>
      </div>
    </div>
  );
}
