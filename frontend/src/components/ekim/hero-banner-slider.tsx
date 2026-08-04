"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL_MS = 5000;

export interface HeroBanner {
  id: number | string;
  image?: string | null;
  imageMobile?: string | null;
  title?: string;
  link?: string;
  variant?: "katalog" | "ozel" | "kargo" | "iade";
}

// Banner linkini güvene al: yalnız site içi (/) veya http(s) — javascript:
// gibi şemaları düşür (backend de süzüyor, bu ikinci savunma hattı).
function safeSlideHref(link?: string) {
  const u = (link || "").trim();
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return "/kategori/all";
}

/* Panelden banner yüklenmemişse dönen markalı hazır slaytlar — şerit hiçbir
   zaman boş görünmez, banner yüklenince otomatik devreden çıkar. */
function BuiltinSlide({ variant }: { variant?: HeroBanner["variant"] }) {
  if (variant === "ozel") {
    return (
      <div
        className="flex h-full w-full items-center justify-between gap-6 px-[clamp(24px,5vw,72px)]"
        style={{ background: "linear-gradient(115deg, #965d0b 0%, #bd7714 70%)" }}
      >
        <div className="min-w-0">
          <div className="mono mb-2 !text-[11px] uppercase tracking-widest text-[#f6edd9]/85">
            En çok hediye edilen
          </div>
          <div className="font-heading text-[clamp(20px,3.2vw,42px)] font-bold leading-[1.08] tracking-tight text-white">
            Adını yaz, <em className="font-serif italic text-[#2a1a05]">sana özel üretelim</em>
          </div>
          <div className="mt-2 hidden text-[clamp(12px,1.4vw,16px)] text-white/85 sm:block">
            İsim, tarih ya da fotoğraf — 48 saatte tezgâhtan çıkar.
          </div>
          <span className="pointer-events-none mt-[clamp(10px,1.8vw,20px)] inline-flex rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-ek-terra-2 sm:text-sm">
            Kişiye özel yaptır →
          </span>
        </div>
        <div className="hidden shrink-0 rotate-[-2deg] md:block">
          <span className="kraft-tag !text-[13px]">adına özel ✦</span>
        </div>
      </div>
    );
  }
  if (variant === "kargo") {
    return (
      <div
        className="flex h-full w-full items-center justify-between gap-6 px-[clamp(24px,5vw,72px)]"
        style={{ background: "linear-gradient(115deg, #f2ead5 0%, #e4dcc0 100%)" }}
      >
        <div className="min-w-0">
          <div className="mono mb-2 !text-[11px] uppercase tracking-widest !text-ek-ok">Kampanya</div>
          <div className="font-heading text-ek-ink text-[clamp(20px,3.2vw,42px)] font-bold leading-[1.08] tracking-tight">
            500 ₺ üstü <em className="text-ek-ok font-serif italic">kargo bedava</em>
          </div>
          <div className="text-ek-ink-2 mt-2 hidden text-[clamp(12px,1.4vw,16px)] sm:block">
            Tüm Türkiye&apos;ye pamuklu kesesinde, koruyucu paketle
          </div>
          <span className="bg-ek-ok pointer-events-none mt-[clamp(10px,1.8vw,20px)] inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-white sm:text-sm">
            Alışverişe başla →
          </span>
        </div>
        <div className="hidden shrink-0 rotate-[-2deg] md:block">
          <span className="kraft-tag !text-[13px]">2-4 günde kapında</span>
        </div>
      </div>
    );
  }
  if (variant === "iade") {
    return (
      <div
        className="flex h-full w-full items-center justify-between gap-6 px-[clamp(24px,5vw,72px)]"
        style={{ background: "linear-gradient(115deg, #f9f0dd 0%, #efe3c6 100%)" }}
      >
        <div className="min-w-0">
          <div className="mono mb-2 !text-[11px] uppercase tracking-widest">İçin rahat olsun</div>
          <div className="font-heading text-ek-ink text-[clamp(20px,3.2vw,42px)] font-bold leading-[1.08] tracking-tight">
            14 gün <em className="text-ek-terra-2 font-serif italic">koşulsuz iade</em>
          </div>
          <div className="text-ek-ink-2 mt-2 hidden text-[clamp(12px,1.4vw,16px)] sm:block">
            Beğenmezsen sorgusuz geri al — güvenli ödeme
          </div>
          <span className="bg-ek-terra pointer-events-none mt-[clamp(10px,1.8vw,20px)] inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-[#1c1204] sm:text-sm">
            Ürünleri keşfet →
          </span>
        </div>
        <div className="hidden shrink-0 rotate-[-2deg] md:block">
          <span className="kraft-tag !text-[13px]">sorgusuz · sualsiz</span>
        </div>
      </div>
    );
  }
  // 'katalog' (varsayılan)
  return (
    <div className="walnut flex h-full w-full items-center justify-between gap-6 px-[clamp(24px,5vw,72px)]">
      <div className="min-w-0">
        <div className="mono mb-2 !text-[11px] uppercase tracking-widest !text-ek-terra">
          İstanbul atölyesinden
        </div>
        <div className="font-heading text-[clamp(20px,3.2vw,42px)] font-bold leading-[1.08] tracking-tight text-[#f6edd9]">
          Yeni işler <em className="text-ek-terra font-serif italic">tezgâhtan indi</em>
        </div>
        <div className="mt-2 hidden text-[clamp(12px,1.4vw,16px)] text-[#d9c7a4] sm:block">
          Lazer kesim, elde zımpara — 48 saatte kargoda
        </div>
        <span className="bg-ek-terra pointer-events-none mt-[clamp(10px,1.8vw,20px)] inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-[#1c1204] sm:text-sm">
          Atölyeden seç →
        </span>
      </div>
      <div className="hidden shrink-0 rotate-[-2deg] md:block">
        <span className="kraft-tag !text-[13px]">elde yapıldı</span>
      </div>
    </div>
  );
}

/* İlk slayt bal tonunda: hemen altındaki ceviz hero ile üst üste iki koyu
   blok binmesin diye sıra açıkla başlıyor. */
const BUILTIN: HeroBanner[] = [
  { id: "b1", link: "/kategori/all?customizable=true", title: "Kişiye özel yaptır", variant: "ozel" },
  { id: "b2", link: "/kategori/all", title: "500 ₺ üstü kargo bedava", variant: "kargo" },
  { id: "b3", link: "/kategori/all", title: "Yeni işler tezgâhtan indi", variant: "katalog" },
  { id: "b4", link: "/kategori/all", title: "14 gün koşulsuz iade", variant: "iade" },
];

export function HeroBannerSlider({ banners = [] }: { banners?: HeroBanner[] }) {
  const slides = banners.length > 0 ? banners : BUILTIN;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (n <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), INTERVAL_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  if (n === 0) return null;

  return (
    <div
      className="group border-ek-line bg-ek-bg-elevated relative overflow-hidden rounded-xl border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 44) go(idx + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-[550ms] ease-[cubic-bezier(.22,.61,.36,1)]"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {slides.map((s, i) => (
          <Link
            key={s.id}
            href={safeSlideHref(s.link)}
            aria-label={s.title || "Kampanya"}
            className="relative block aspect-[16/8] w-full shrink-0 grow-0 basis-full overflow-hidden md:aspect-[16/5]"
          >
            {s.image ? (
              /* Dar ekranda slayt 2:1'e düşüyor; masaüstü şeridi kırpılınca
                 kenardaki yazı kesilebilir — mobil görsel varsa onu kullan. */
              <picture className="block h-full w-full">
                {s.imageMobile && <source media="(max-width: 768px)" srcSet={s.imageMobile} />}
                {/* İlk slayt LCP: yüksek öncelik; diğerleri ekran dışında, lazy. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.title || "Kampanya banner"}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="block h-full w-full object-cover"
                />
              </picture>
            ) : (
              <BuiltinSlide variant={s.variant} />
            )}
          </Link>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            aria-label="Önceki banner"
            onClick={(e) => {
              e.preventDefault();
              go(idx - 1);
            }}
            className="text-ek-ink hover:text-ek-terra-2 absolute left-3.5 top-1/2 z-[3] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100 md:grid"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            aria-label="Sonraki banner"
            onClick={(e) => {
              e.preventDefault();
              go(idx + 1);
            }}
            className="text-ek-ink hover:text-ek-terra-2 absolute right-3.5 top-1/2 z-[3] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100 md:grid"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-3 z-[3] flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Banner ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(i);
                }}
                className={
                  "h-2 rounded-full shadow transition-all duration-300 " +
                  (i === idx ? "bg-ek-terra w-6" : "w-2 bg-white/60 hover:bg-white/90")
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
