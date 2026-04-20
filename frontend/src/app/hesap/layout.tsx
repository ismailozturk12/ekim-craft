"use client";

import {
  CreditCard,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";

const TABS = [
  { href: "/hesap", label: "Genel", icon: User },
  { href: "/hesap/siparisler", label: "Siparişlerim", icon: Package },
  { href: "/hesap/iadeler", label: "İadelerim", icon: RotateCcw },
  { href: "/hesap/favoriler", label: "Favorilerim", icon: Heart },
  { href: "/hesap/adresler", label: "Adreslerim", icon: MapPin },
  { href: "/hesap/kartlar", label: "Kartlarım", icon: CreditCard },
  { href: "/hesap/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/hesap/yardim", label: "Yardım", icon: HelpCircle },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (!user) router.push(`/giris?next=${encodeURIComponent(pathname)}`);
  }, [user, router, pathname]);

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-[260px_1fr]">
            <aside className="border-ek-line-2 bg-ek-bg-card h-fit rounded-xl border p-5">
              <div className="border-ek-line-2 mb-4 flex items-center gap-3 border-b pb-4">
                <div className="bg-ek-cream flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-lg">
                  {(user.first_name || user.email)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="mono truncate">{user.email}</div>
                </div>
              </div>
              <nav className="space-y-1">
                {TABS.map((t) => {
                  const active = pathname === t.href;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-ek-forest text-ek-cream"
                          : "text-ek-ink-2 hover:bg-ek-bg-elevated"
                      )}
                    >
                      <t.icon size={16} strokeWidth={1.75} />
                      {t.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="text-ek-ink-3 hover:text-ek-warn border-ek-line-2 mt-4 flex w-full items-center gap-3 border-t px-3 pt-4 text-sm transition-colors"
              >
                <LogOut size={16} strokeWidth={1.75} />
                Çıkış yap
              </button>
            </aside>

            <section>{children}</section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
