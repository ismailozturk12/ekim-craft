"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "ekim.cookie-consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const accept = (level: "all" | "required") => {
    localStorage.setItem(KEY, level);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:bottom-6 md:right-6 md:left-auto md:max-w-md">
      <div className="bg-ek-ink text-ek-cream rounded-xl p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie size={18} className="text-ek-terra" />
            <div className="font-medium">Çerezler</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-ek-cream/60 hover:text-ek-cream"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-ek-cream/70 mb-4 text-xs leading-relaxed">
          Siteyi daha iyi kullanman ve gizliliğin için zorunlu çerezler kullanılır. İstersen isteğe
          bağlı (analitik) çerezleri kabul edebilir ya da reddedebilirsin. Detay için{" "}
          <Link href="/gizlilik" className="text-ek-terra underline">
            Gizlilik Politikası
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => accept("required")}
            className="border-ek-cream/20 hover:bg-ek-cream/10 rounded-full border px-4 py-2 text-xs"
          >
            Sadece zorunlu
          </button>
          <button
            onClick={() => accept("all")}
            className="bg-ek-terra hover:bg-ek-terra-2 rounded-full px-4 py-2 text-xs font-medium text-white"
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
