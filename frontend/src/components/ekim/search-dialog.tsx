"use client";

import { ArrowRight, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { API_URL, catalog, type ApiProductList } from "@/lib/api/client";
import { formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
  "Ahşap tren",
  "İsim süsü",
  "Anahtarlık",
  "Duvar saati",
  "Yapboz",
  "Kupa",
  "Tablo",
  "Hediyelik",
];

const RECENT_KEY = "ek:recent-search";
const RECENT_MAX = 5;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined") return;
  const trimmed = q.trim();
  if (!trimmed) return;
  const cur = getRecent().filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
  cur.unshift(trimmed);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, RECENT_MAX)));
}

function clearRecent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}

function resolveImage(u: string | null | undefined): string | null {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  return `${API_URL}${u}`;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiProductList[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef(0);

  // Load recent when opened
  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      setCursor(0);
      // Defer focus so the dialog has animated in
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const reqId = ++reqRef.current;
    const t = setTimeout(async () => {
      try {
        const data = await catalog.listProducts({ search: query, page_size: 6 });
        if (reqRef.current === reqId) {
          setResults(data.results);
          setCursor(0);
        }
      } catch {
        if (reqRef.current === reqId) setResults([]);
      } finally {
        if (reqRef.current === reqId) setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const submit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      pushRecent(trimmed);
      onOpenChange(false);
      router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
    },
    [onOpenChange, router],
  );

  const goToProduct = useCallback(
    (slug: string) => {
      pushRecent(q.trim());
      onOpenChange(false);
      router.push(`/urun/${slug}`);
    },
    [onOpenChange, router, q],
  );

  const maxCursor = results.length; // last index is "see all"
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setCursor((c) => (c >= maxCursor ? 0 : c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setCursor((c) => (c <= 0 ? maxCursor : c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && cursor < results.length) {
        goToProduct(results[cursor].slug);
      } else {
        submit(q);
      }
    }
  };

  const showResults = q.trim().length > 0;
  const hasResults = results.length > 0;

  const suggestions = useMemo(() => {
    if (recent.length > 0) return { kind: "recent" as const, items: recent };
    return { kind: "popular" as const, items: POPULAR_SEARCHES };
  }, [recent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!bg-[var(--ek-bg-elevated)] top-[10%] w-[calc(100vw-2rem)] max-w-2xl translate-y-0 overflow-hidden border-0 p-0 !gap-0 shadow-2xl sm:top-[15%] sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Arama</DialogTitle>
        {/* Input row */}
        <div className="border-ek-line-2 flex items-center gap-3 border-b px-4 py-3 sm:px-5 sm:py-4">
          <Search size={20} className="text-ek-ink-3 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ürün, kategori, sanatçı ara..."
            enterKeyHint="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="placeholder:text-ek-ink-4 flex-1 bg-transparent text-base outline-none"
          />
          {loading && <Loader2 size={16} className="text-ek-ink-3 animate-spin" />}
          {q && !loading && (
            <button
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
              aria-label="Temizle"
              className="text-ek-ink-3 hover:text-ek-ink hover:bg-ek-bg rounded-full p-1"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Kapat"
            className="text-ek-ink-3 hover:text-ek-ink hidden text-[11px] uppercase tracking-wider sm:block"
          >
            ESC
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[min(60vh,520px)] overflow-y-auto">
          {showResults ? (
            hasResults ? (
              <>
                <div className="px-4 pt-3 pb-1 sm:px-5">
                  <div className="eyebrow">ÜRÜNLER</div>
                </div>
                <ul>
                  {results.map((p, i) => {
                    const img = resolveImage(p.cover_image);
                    const price = parseFloat(p.price);
                    const oldPrice = p.old_price ? parseFloat(p.old_price) : null;
                    const active = i === cursor;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => goToProduct(p.slug)}
                          onMouseEnter={() => setCursor(i)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors sm:px-5",
                            active && "bg-ek-bg",
                          )}
                        >
                          <div className="border-ek-line bg-ek-bg relative h-14 w-14 shrink-0 overflow-hidden rounded-md border">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt={p.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="bg-ek-terra/10 h-full w-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{p.name}</div>
                            <div className="text-ek-ink-3 mono mt-0.5 truncate text-[11px]">
                              {p.artisan} · {p.artisan_city}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatTL(price)}</div>
                            {oldPrice && (
                              <div className="text-ek-ink-4 text-[11px] line-through">
                                {formatTL(oldPrice)}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}

                  {/* "See all" footer row */}
                  <li>
                    <button
                      type="button"
                      onClick={() => submit(q)}
                      onMouseEnter={() => setCursor(results.length)}
                      className={cn(
                        "border-ek-line-2 text-ek-ink-2 flex w-full items-center justify-between gap-2 border-t px-4 py-3 text-sm font-medium transition-colors sm:px-5",
                        cursor === results.length && "bg-ek-bg",
                      )}
                    >
                      <span>
                        &ldquo;{q}&rdquo; için tüm sonuçları gör
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className="px-5 py-10 text-center">
                <div className="text-ek-ink-2 text-sm">
                  &ldquo;{q}&rdquo; için sonuç bulunamadı
                </div>
                <div className="text-ek-ink-3 mt-1 text-xs">
                  Farklı bir kelime deneyin veya aşağıdan popüler aramalara bakın
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className="border-ek-line bg-ek-bg hover:border-ek-ink-3 rounded-full border px-3 py-1.5 text-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="px-4 py-4 sm:px-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="eyebrow">
                  {suggestions.kind === "recent" ? "SON ARAMALAR" : "POPÜLER ARAMALAR"}
                </div>
                {suggestions.kind === "recent" && (
                  <button
                    onClick={() => {
                      clearRecent();
                      setRecent([]);
                    }}
                    className="text-ek-ink-3 hover:text-ek-ink text-[11px] uppercase tracking-wider"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.items.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="border-ek-line bg-ek-bg hover:border-ek-ink-3 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                  >
                    <Search size={11} className="text-ek-ink-3" />
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <div className="eyebrow mb-3">KATEGORİLER</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { label: "Oyuncak", href: "/kategori/oyuncak" },
                    { label: "Hediyelik", href: "/kategori/hediyelik" },
                    { label: "Tablo", href: "/kategori/tablo" },
                    { label: "Saat", href: "/kategori/saat" },
                    { label: "Aksesuar", href: "/kategori/aksesuar" },
                    { label: "Dekor", href: "/kategori/dekor" },
                  ].map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => onOpenChange(false)}
                      className="border-ek-line bg-ek-bg hover:border-ek-ink-3 flex items-center justify-between rounded-md border px-3 py-2.5 text-xs font-medium"
                    >
                      <span>{c.label}</span>
                      <ArrowRight size={12} className="text-ek-ink-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-ek-line-2 text-ek-ink-3 hidden items-center justify-between border-t px-5 py-2 text-[10px] uppercase tracking-wider sm:flex">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="border-ek-line bg-ek-bg rounded border px-1 py-0.5 normal-case">↑↓</kbd>{" "}
              gezin
            </span>
            <span>
              <kbd className="border-ek-line bg-ek-bg rounded border px-1 py-0.5 normal-case">↵</kbd>{" "}
              aç
            </span>
            <span>
              <kbd className="border-ek-line bg-ek-bg rounded border px-1 py-0.5 normal-case">esc</kbd>{" "}
              kapat
            </span>
          </div>
          <span>Ekim Craft arama</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
