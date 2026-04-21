"use client";

import { Camera, ChevronLeft, ChevronRight, Sparkles, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { Tag } from "@/components/ekim/tag";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
const VISIBLE_THUMBS = 5;

export function ProductGallery({
  productId,
  name,
  tags,
  price,
  oldPrice,
  images = [],
}: ProductGalleryProps) {
  const realImages = [...images]
    .filter((i) => !!i.image)
    .sort((a, b) => {
      if (a.is_cover) return -1;
      if (b.is_cover) return 1;
      return a.sort_order - b.sort_order;
    });

  const hasReal = realImages.length > 0;
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const base = toneForProduct(productId);
  const discount = discountPercent(price, oldPrice);

  // Thumbnail slot sayısı: gösterilecek, en fazla VISIBLE_THUMBS
  const slotCount = hasReal
    ? Math.min(VISIBLE_THUMBS, Math.max(4, realImages.length))
    : 4;
  const extraCount = Math.max(0, realImages.length - VISIBLE_THUMBS);
  const activeImage = realImages[active];

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }, []);

  const nextLightbox = useCallback(() => {
    setLightboxIdx((i) => (i + 1) % realImages.length);
  }, [realImages.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIdx((i) => (i - 1 + realImages.length) % realImages.length);
  }, [realImages.length]);

  // Klavye navigasyonu (lightbox açıkken)
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextLightbox();
      else if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, nextLightbox, prevLightbox]);

  // Swipe (mobil)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 40) {
      if (delta < 0) nextLightbox();
      else prevLightbox();
    }
    setTouchStart(null);
  };

  const lightboxImage = realImages[lightboxIdx];

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
        {/* Thumbnails */}
        <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col">
          {Array.from({ length: slotCount }).map((_, i) => {
            const img = realImages[i];
            const isLast = i === VISIBLE_THUMBS - 1 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isLast) {
                    openLightbox(VISIBLE_THUMBS - 1);
                  } else {
                    setActive(i);
                  }
                }}
                disabled={!img && !hasReal}
                className={cn(
                  "relative w-20 shrink-0 overflow-hidden rounded-md transition-all",
                  active === i && !isLast && (img || !hasReal)
                    ? "ring-ek-ink ring-2 ring-offset-2 ring-offset-[var(--ek-bg)]"
                    : "",
                )}
                aria-label={isLast ? `${extraCount} tane daha göster` : `Fotoğraf ${i + 1}`}
              >
                {img?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.image}
                    alt={img.alt || name}
                    className="aspect-square h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Placeholder
                    tone={i === 0 ? base : TONES[i % TONES.length]}
                    ratio="1"
                    className="opacity-70"
                  />
                )}
                {isLast && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                    <span className="text-lg font-medium">+{extraCount}</span>
                    <span className="mono text-[9px]">daha</span>
                  </div>
                )}
              </button>
            );
          })}
          {realImages.length <= VISIBLE_THUMBS && (
            <div className="border-ek-line text-ek-ink-3 flex aspect-square w-20 shrink-0 cursor-default flex-col items-center justify-center rounded-md border border-dashed">
              <Camera size={16} />
              <div className="mono mt-0.5 text-[9px]">360°</div>
            </div>
          )}
        </div>

        {/* Main image */}
        <div className="order-1 lg:order-2">
          <button
            type="button"
            onClick={() => hasReal && openLightbox(active)}
            className="group relative block w-full overflow-hidden rounded-lg"
            aria-label="Fotoğrafı büyüt"
          >
            {activeImage?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.image}
                alt={activeImage.alt || name}
                className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <Placeholder
                tone={active === 0 ? base : TONES[active % TONES.length]}
                label={name}
                ratio="4 / 5"
              />
            )}
            {/* Zoom overlay (hover) */}
            {hasReal && (
              <div className="bg-ek-bg-elevated/90 mono absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn size={12} />
                Büyüt
              </div>
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
              AR&apos;da görüntüle
            </div>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="!bg-black/95 flex h-[95vh] !max-w-[95vw] items-center justify-center border-0 p-0 !gap-0 sm:!max-w-[95vw]"
        >
          <DialogTitle className="sr-only">{name} — {lightboxIdx + 1} / {realImages.length}</DialogTitle>

          {/* Kapat butonu */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Kapat"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {/* Sayaç */}
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white">
            {lightboxIdx + 1} / {realImages.length}
          </div>

          {/* Prev */}
          {realImages.length > 1 && (
            <button
              type="button"
              onClick={prevLightbox}
              aria-label="Önceki"
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="relative flex h-full w-full items-center justify-center"
          >
            {lightboxImage?.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={lightboxImage.image}
                alt={lightboxImage.alt || name}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>

          {/* Next */}
          {realImages.length > 1 && (
            <button
              type="button"
              onClick={nextLightbox}
              aria-label="Sonraki"
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Alt thumbnail şeridi */}
          {realImages.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-white/10 p-2 backdrop-blur">
                {realImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxIdx(i)}
                    className={cn(
                      "h-12 w-12 shrink-0 overflow-hidden rounded transition-opacity",
                      i === lightboxIdx ? "ring-2 ring-white" : "opacity-60 hover:opacity-100",
                    )}
                    aria-label={`${i + 1}. fotoğraf`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
