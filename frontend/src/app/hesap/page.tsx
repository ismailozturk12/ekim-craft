"use client";

import { Heart, Package, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/store/auth";

export default function AccountHomePage() {
  const user = useAuth((s) => s.user);
  if (!user) return null;

  const stats = [
    { label: "TOPLAM SİPARİŞ", value: 0, icon: Package, href: "/hesap/siparisler" },
    { label: "FAVORİLER", value: 0, icon: Heart, href: "/hesap/favoriler" },
    { label: "YORUMLARIM", value: 0, icon: Star, href: "/hesap/siparisler" },
  ];

  return (
    <div>
      <h1 className="h-1 mb-2">Merhaba {user.first_name || "👋"}</h1>
      <p className="text-ek-ink-3 mb-8">
        Hesap özetin ve hızlı erişimler aşağıda.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex items-start justify-between rounded-xl border p-5 transition-colors"
          >
            <div>
              <div className="eyebrow mb-2">{s.label}</div>
              <div className="font-serif text-3xl">{s.value}</div>
            </div>
            <div className="bg-ek-cream text-ek-forest flex h-10 w-10 items-center justify-center rounded-full">
              <s.icon size={18} />
            </div>
          </Link>
        ))}
      </div>

      <section className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
        <h2 className="h-3 mb-3">Son hareketler</h2>
        <p className="text-ek-ink-3 text-sm">
          Henüz sipariş vermedin. <Link href="/kategori/all" className="text-ek-terra-2 hover:underline">Mağazaya göz at →</Link>
        </p>
      </section>
    </div>
  );
}
