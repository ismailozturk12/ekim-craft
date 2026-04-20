"use client";

import {
  BarChart3,
  Bell,
  Box,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";

const NAV = [
  { href: "/yonetim", label: "Pano", icon: LayoutDashboard, exact: true },
  { href: "/yonetim/siparisler", label: "Siparişler", icon: ShoppingBag, badge: 3 },
  { href: "/yonetim/urunler", label: "Ürünler", icon: Package },
  { href: "/yonetim/stok", label: "Stok", icon: Box, badge: 2 },
  { href: "/yonetim/musteriler", label: "Müşteriler", icon: Users },
  { href: "/yonetim/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  { href: "/yonetim/kargo", label: "Kargo", icon: Truck },
  { href: "/yonetim/finans", label: "Finans", icon: Wallet },
  { href: "/yonetim/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/yonetim/bildirimler", label: "Bildirimler", icon: Bell, badge: 5 },
  { href: "/yonetim/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push(`/giris?next=${encodeURIComponent(pathname)}`);
    else if (!user.is_staff) router.push("/");
  }, [hydrated, user, router, pathname]);

  if (!hydrated) {
    return (
      <div className="bg-ek-bg flex min-h-screen items-center justify-center">
        <div className="text-ek-ink-3 text-sm">Yükleniyor...</div>
      </div>
    );
  }
  if (!user || !user.is_staff) return null;

  return (
    <div className="bg-ek-bg flex min-h-screen">
      <aside className="bg-ek-forest text-ek-cream flex w-[240px] shrink-0 flex-col">
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl">Ekim</span>
            <span className="bg-ek-terra h-2 w-2 rounded-full" />
            <span className="font-serif text-xl">Craft</span>
          </div>
          <div className="mono text-ek-cream/50 mt-1 uppercase">YÖNETİM · v0.1</div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-ek-terra text-white"
                    : "text-ek-cream/80 hover:bg-ek-forest-2 hover:text-ek-cream"
                )}
              >
                <n.icon size={16} strokeWidth={1.75} />
                <span className="flex-1">{n.label}</span>
                {n.badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      active ? "bg-white/20" : "bg-ek-terra/80 text-white"
                    )}
                  >
                    {n.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-ek-forest-2 border-t p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-ek-cream text-ek-forest flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
              {(user.first_name || user.email)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">{user.first_name || user.email}</div>
              <div className="text-ek-cream/50 truncate text-[10px]">{user.email}</div>
            </div>
          </div>
          <Link
            href="/"
            className="text-ek-cream/60 hover:text-ek-cream block text-xs"
          >
            <Store size={13} className="inline" /> Mağaza görünümü
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-ek-cream/60 hover:text-ek-cream mt-1 flex items-center gap-1.5 text-xs"
          >
            <LogOut size={13} /> Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
