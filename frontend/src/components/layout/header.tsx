"use client";

import { Heart, LogIn, LogOut, Menu, Package, Search, Settings, ShoppingBag, User, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartDrawer } from "@/components/ekim/cart-drawer";
import { Container } from "@/components/ekim/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";
import { itemCount, useCart } from "@/store/cart";

const NAV = [
  { label: "Mağaza", href: "/kategori/all" },
  { label: "Oyuncak", href: "/kategori/oyuncak" },
  { label: "Hediyelik", href: "/kategori/hediyelik" },
  { label: "Tablo", href: "/kategori/tablo" },
  { label: "Saat", href: "/kategori/saat" },
  { label: "Aksesuar", href: "/kategori/aksesuar" },
  { label: "Dekor", href: "/kategori/dekor" },
];

const POPULAR_SEARCHES = ["Ahşap tren", "İsim süsü", "Anahtarlık", "Duvar saati", "Yapboz", "Kupa"];

export function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const cartItems = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const count = itemCount(cartItems);
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const isLoggedIn = hydrated && !!user;

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ek-forest text-ek-cream">
        <Container className="mono flex items-center justify-center gap-4 py-2 text-[11px] uppercase tracking-wider">
          <span>500 ₺ üstü ücretsiz kargo</span>
          <span className="opacity-50">·</span>
          <span>Elde yapıldı · Türkiye'de üretim</span>
        </Container>
      </div>

      <header className="bg-background/85 border-ek-line-2 sticky top-0 z-40 border-b backdrop-blur">
        <Container className="flex items-center gap-6 py-4">
          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="text-ek-ink hover:text-ek-terra md:hidden"
            aria-label="Menü"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent
              side="left"
              className="!bg-[var(--ek-bg-elevated)] flex w-[88vw] max-w-[340px] flex-col !p-0 shadow-2xl"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Menü</SheetTitle>
              </SheetHeader>

              {/* User section — logged in vs guest */}
              {isLoggedIn ? (
                <div className="bg-ek-forest text-ek-cream px-5 pb-5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-ek-cream text-ek-forest flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-lg">
                      {(user.first_name || user.email)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {user.first_name || user.email.split("@")[0]}
                      </div>
                      <div className="text-ek-cream/60 truncate text-[11px]">{user.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-ek-forest text-ek-cream px-5 pb-5 pt-6">
                  <div className="mono text-ek-cream/60 mb-3 uppercase">HOŞ GELDİN</div>
                  <div className="mb-4 font-serif text-xl leading-tight">
                    Siparişlerin ve
                    <br />
                    favorilerin için giriş yap
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/giris"
                      onClick={() => setMenuOpen(false)}
                      className="bg-ek-terra hover:bg-ek-terra-2 flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium text-white"
                    >
                      <LogIn size={14} /> Giriş yap
                    </Link>
                    <Link
                      href="/giris?mode=signup"
                      onClick={() => setMenuOpen(false)}
                      className="bg-ek-cream/10 hover:bg-ek-cream/20 flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium"
                    >
                      <UserPlus size={14} /> Kaydol
                    </Link>
                  </div>
                </div>
              )}

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                {/* Categories */}
                <div className="px-5 py-4">
                  <div className="label mb-3">Kategoriler</div>
                  <nav className="flex flex-col">
                    {NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="border-ek-line-2 hover:text-ek-terra flex items-center justify-between border-b py-3 text-sm font-medium last:border-b-0"
                      >
                        <span>{item.label}</span>
                        <span className="text-ek-ink-4">→</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Account shortcuts — only when logged in */}
                {isLoggedIn && (
                  <div className="border-ek-line-2 border-t px-5 py-4">
                    <div className="label mb-3">Hesabım</div>
                    <div className="grid grid-cols-2 gap-2">
                      <MobileMenuTile
                        href="/hesap"
                        icon={User}
                        label="Hesabım"
                        onClick={() => setMenuOpen(false)}
                      />
                      <MobileMenuTile
                        href="/hesap/siparisler"
                        icon={Package}
                        label="Siparişlerim"
                        onClick={() => setMenuOpen(false)}
                      />
                      <MobileMenuTile
                        href="/hesap/favoriler"
                        icon={Heart}
                        label="Favorilerim"
                        onClick={() => setMenuOpen(false)}
                      />
                      <MobileMenuTile
                        href="/hesap/ayarlar"
                        icon={Settings}
                        label="Ayarlar"
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                    {user.is_staff && (
                      <Link
                        href="/yonetim"
                        onClick={() => setMenuOpen(false)}
                        className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
                      >
                        <Settings size={14} /> Yönetim paneli
                      </Link>
                    )}
                  </div>
                )}

                {/* Quick links */}
                <div className="border-ek-line-2 border-t px-5 py-4">
                  <div className="label mb-3">Yardım</div>
                  <div className="flex flex-col text-sm">
                    <Link
                      href="/sss"
                      onClick={() => setMenuOpen(false)}
                      className="text-ek-ink-2 hover:text-ek-ink py-1.5"
                    >
                      Sık sorulan sorular
                    </Link>
                    <Link
                      href="/iletisim"
                      onClick={() => setMenuOpen(false)}
                      className="text-ek-ink-2 hover:text-ek-ink py-1.5"
                    >
                      İletişim
                    </Link>
                    <Link
                      href="/kargo"
                      onClick={() => setMenuOpen(false)}
                      className="text-ek-ink-2 hover:text-ek-ink py-1.5"
                    >
                      Kargo & teslimat
                    </Link>
                    <Link
                      href="/iade"
                      onClick={() => setMenuOpen(false)}
                      className="text-ek-ink-2 hover:text-ek-ink py-1.5"
                    >
                      İade koşulları
                    </Link>
                    <Link
                      href="/hakkimizda"
                      onClick={() => setMenuOpen(false)}
                      className="text-ek-ink-2 hover:text-ek-ink py-1.5"
                    >
                      Hakkımızda
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer — logout for logged-in users */}
              {isLoggedIn && (
                <div className="border-ek-line-2 border-t px-5 py-3">
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="text-ek-ink-3 hover:text-ek-ink flex w-full items-center gap-2 py-1.5 text-sm"
                  >
                    <LogOut size={14} /> Çıkış yap
                  </button>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="h-1 !text-[22px] !leading-none">Ekim</span>
            <span className="bg-ek-terra h-2 w-2 rounded-full" />
            <span className="font-serif text-[22px] leading-none">Craft</span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-6 hidden items-center gap-5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ek-ink-2 hover:text-ek-ink text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:bg-ek-bg-elevated flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              aria-label="Ara"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>
            <Link
              href={isLoggedIn ? "/hesap/favoriler" : "/giris?next=%2Fhesap%2Ffavoriler"}
              className="hover:bg-ek-bg-elevated hidden h-10 w-10 items-center justify-center rounded-full transition-colors md:flex"
              aria-label="Favoriler"
            >
              <Heart size={18} strokeWidth={1.75} />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Hesabım"
                className="hover:bg-ek-bg-elevated hidden h-10 items-center justify-center gap-2 rounded-full px-2.5 transition-colors md:flex"
              >
                {isLoggedIn ? (
                  <span className="bg-ek-cream text-ek-ink flex h-8 w-8 items-center justify-center rounded-full font-serif text-sm">
                    {(user.first_name || user.email)[0]?.toUpperCase()}
                  </span>
                ) : (
                  <User size={18} strokeWidth={1.75} />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isLoggedIn ? (
                  <>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-ek-ink-3 truncate text-[11px] font-normal">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/hesap")}>
                      <User size={14} /> Hesabım
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/hesap/siparisler")}>
                      <Package size={14} /> Siparişlerim
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/hesap/favoriler")}>
                      <Heart size={14} /> Favorilerim
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/hesap/ayarlar")}>
                      <Settings size={14} /> Ayarlar
                    </DropdownMenuItem>
                    {user.is_staff && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/yonetim")}>
                          <Settings size={14} /> Yönetim paneli
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="text-ek-warn"
                    >
                      <LogOut size={14} /> Çıkış yap
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Hesabına gir</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/giris")}>
                      <LogIn size={14} /> Giriş yap
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/giris?mode=signup")}>
                      <UserPlus size={14} /> Kayıt ol
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={openCart}
              className="bg-ek-ink text-ek-cream hover:bg-ek-forest relative flex h-10 items-center gap-2 rounded-full px-4 transition-colors"
              aria-label="Sepet"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              <span className="hidden text-xs font-medium sm:inline">Sepet</span>
              <span className="bg-ek-terra flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white">
                {count}
              </span>
            </button>
          </div>
        </Container>
      </header>

      <CartDrawer />

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="bg-ek-bg-card top-[20%] max-w-2xl translate-y-0 p-0 sm:top-[20%]">
          <div className="border-ek-line-2 flex items-center gap-3 border-b px-5 py-4">
            <Search size={20} className="text-ek-ink-3" />
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Ne arıyorsun?"
              className="placeholder:text-ek-ink-4 flex-1 bg-transparent text-base outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-ek-ink-3 hover:text-ek-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">
            <div className="eyebrow mb-3">POPÜLER ARAMALAR</div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchQ(q);
                  }}
                  className={cn(
                    "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3 rounded-full border px-3 py-1.5 text-xs transition-colors"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MobileMenuTile({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="border-ek-line bg-ek-bg hover:border-ek-ink-3 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium"
    >
      <Icon size={14} strokeWidth={1.75} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
