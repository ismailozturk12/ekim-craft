"use client";

import { Grid3x3, LayoutGrid, List, RotateCcw, Rows3, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MasonryGrid } from "@/components/ekim/masonry-grid";
import { ProductCard } from "@/components/ekim/product-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

interface ApiCategory {
  slug: string;
  name: string;
  count?: number;
}

interface CategoryViewProps {
  slug: string;
  categoryName: string;
  description?: string;
  categories: ApiCategory[];
  products: Product[];
}

type Layout = "masonry" | "grid" | "list";
type Sort = "featured" | "new" | "price-asc" | "price-desc" | "rating";

const SORT_LABEL: Record<Sort, string> = {
  featured: "Öne çıkanlar",
  new: "Yeni gelenler",
  "price-asc": "Fiyat: artan",
  "price-desc": "Fiyat: azalan",
  rating: "En çok beğenilen",
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BRANDS = ["Ekim Craft", "Ekim Atelier", "Ekim Studio"];
const CATEGORY_COPY: Record<string, string> = {
  all: "Tüm el yapımı koleksiyon — 24 farklı ürün.",
  oyuncak: "3+ yaşa uygun, su bazlı boyalarla bitirilmiş ahşap oyuncaklar.",
  hediyelik: "İsim, tarih, fotoğrafla kişiselleştirilebilir hediyeler.",
  tablo: "Kanvas, poster ve ahşap baskı tablolar — asmaya hazır.",
  saat: "Sessiz mekanizmalı duvar ve masa saatleri.",
  aksesuar: "Bileklik, cüzdan, güneş gözlüğü — doğal malzemeler.",
  dekor: "Soy isim, tabela, boy ölçer — kişiye özel dekor parçaları.",
};

export function CategoryView({
  slug,
  categoryName,
  categories,
  products,
}: CategoryViewProps) {
  const [layout, setLayout] = useState<Layout>("grid");
  const [sort, setSort] = useState<Sort>("featured");
  const [priceMax, setPriceMax] = useState(6000);
  const [customOnly, setCustomOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => m.set(c.name, c.hex)));
    return Array.from(m.entries()).slice(0, 12);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (customOnly) list = list.filter((p) => p.customizable);
    if (saleOnly) list = list.filter((p) => !!p.oldPrice);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    list = list.filter((p) => p.price <= priceMax);
    if (selectedColors.size > 0) {
      list = list.filter((p) => p.colors.some((c) => selectedColors.has(c.name)));
    }
    if (selectedBrands.size > 0) {
      list = list.filter((p) => selectedBrands.has(p.artisan));
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        list.sort((a, b) => (b.tags.includes("Yeni") ? 1 : 0) - (a.tags.includes("Yeni") ? 1 : 0));
        break;
      default:
        // featured: çok satan üste, sonra yeni, sonra genel
        list.sort((a, b) => {
          const af = (a.tags.includes("Çok satan") ? 2 : 0) + (a.tags.includes("Yeni") ? 1 : 0);
          const bf = (b.tags.includes("Çok satan") ? 2 : 0) + (b.tags.includes("Yeni") ? 1 : 0);
          return bf - af;
        });
    }
    return list;
  }, [products, customOnly, saleOnly, inStockOnly, priceMax, selectedColors, selectedBrands, sort]);

  const toggleSet = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const reset = () => {
    setCustomOnly(false);
    setSaleOnly(false);
    setInStockOnly(false);
    setPriceMax(6000);
    setSelectedColors(new Set());
    setSelectedBrands(new Set());
    setSelectedSizes(new Set());
  };

  const activeFilters =
    (customOnly ? 1 : 0) +
    (saleOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceMax < 6000 ? 1 : 0) +
    selectedColors.size +
    selectedBrands.size +
    selectedSizes.size;

  return (
    <>
      {/* Breadcrumb + header */}
      <div className="mono mb-4 flex flex-wrap items-center gap-2">
        <Link href="/" className="hover:text-ek-ink">Ana sayfa</Link>
        <span className="opacity-40">/</span>
        <Link href="/kategori/all" className="hover:text-ek-ink">Mağaza</Link>
        {slug !== "all" && (
          <>
            <span className="opacity-40">/</span>
            <span className="text-ek-ink">{categoryName}</span>
          </>
        )}
      </div>

      <div className="mb-8">
        <h1 className="h-1">{categoryName}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="mono">{filtered.length} ürün</span>
          {CATEGORY_COPY[slug] && (
            <p className="text-ek-ink-3 max-w-xl text-sm leading-relaxed">
              {CATEGORY_COPY[slug]}
            </p>
          )}
        </div>
      </div>

      {/* Kategori chip'leri */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/kategori/all"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs transition-colors whitespace-nowrap",
            slug === "all"
              ? "bg-ek-ink text-ek-cream border-ek-ink"
              : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3"
          )}
        >
          Tümü
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/kategori/${c.slug}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors whitespace-nowrap",
              c.slug === slug
                ? "bg-ek-ink text-ek-cream border-ek-ink"
                : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3"
            )}
          >
            {c.name} <span className="opacity-60">{c.count}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* SIDEBAR — desktop only */}
        <aside className="hidden h-fit lg:sticky lg:top-[120px] lg:block">
          <FiltersHeader activeFilters={activeFilters} onReset={reset} />
          <FiltersBody
            allColors={allColors}
            customOnly={customOnly}
            setCustomOnly={setCustomOnly}
            saleOnly={saleOnly}
            setSaleOnly={setSaleOnly}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            toggleSet={toggleSet}
          />
        </aside>

        {/* Mobile filters Sheet */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="!bg-[var(--ek-bg-elevated)] flex w-[92vw] max-w-[400px] flex-col !gap-0 !p-0 shadow-2xl"
          >
            <SheetHeader className="sr-only !p-0">
              <SheetTitle>Filtreler</SheetTitle>
            </SheetHeader>

            {/* Sticky header */}
            <div className="border-ek-line-2 bg-ek-bg-elevated sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} strokeWidth={1.75} />
                <span className="text-base font-medium">Filtreler</span>
                {activeFilters > 0 && (
                  <span className="bg-ek-terra flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white">
                    {activeFilters}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {activeFilters > 0 && (
                  <button
                    onClick={reset}
                    className="text-ek-ink-3 hover:text-ek-warn flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider"
                  >
                    <RotateCcw size={11} />
                    Sıfırla
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Kapat"
                  className="hover:bg-ek-bg -mr-1 flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-28 pt-2">
              <FiltersBody
                allColors={allColors}
                customOnly={customOnly}
                setCustomOnly={setCustomOnly}
                saleOnly={saleOnly}
                setSaleOnly={setSaleOnly}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                toggleSet={toggleSet}
                touchTargets
              />
            </div>

            {/* Sticky footer */}
            <div className="border-ek-line-2 bg-ek-bg-elevated absolute inset-x-0 bottom-0 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => setFiltersOpen(false)}
                className="bg-ek-ink text-ek-cream hover:bg-ek-forest w-full rounded-full py-3.5 text-sm font-medium"
              >
                {filtered.length === 0
                  ? "Sonuç bulunamadı"
                  : `${filtered.length} ürünü göster`}
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* MAIN */}
        <div className="min-w-0">
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3 flex items-center gap-2 rounded-full border px-4 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              <span>Filtrele</span>
              {activeFilters > 0 && (
                <span className="bg-ek-terra rounded-full px-1.5 text-[10px] font-semibold text-white">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex flex-wrap gap-2">
              {customOnly && (
                <ActiveChip label="Kişiselleştirilebilir" onRemove={() => setCustomOnly(false)} />
              )}
              {saleOnly && <ActiveChip label="İndirimde" onRemove={() => setSaleOnly(false)} />}
              {inStockOnly && (
                <ActiveChip label="Stokta var" onRemove={() => setInStockOnly(false)} />
              )}
              {priceMax < 6000 && (
                <ActiveChip label={`≤ ${formatTL(priceMax)}`} onRemove={() => setPriceMax(6000)} />
              )}
              {Array.from(selectedColors).map((c) => (
                <ActiveChip
                  key={c}
                  label={c}
                  onRemove={() => toggleSet(selectedColors, c, setSelectedColors)}
                />
              ))}
              {Array.from(selectedBrands).map((b) => (
                <ActiveChip
                  key={b}
                  label={b}
                  onRemove={() => toggleSet(selectedBrands, b, setSelectedBrands)}
                />
              ))}
              {Array.from(selectedSizes).map((s) => (
                <ActiveChip
                  key={s}
                  label={s}
                  onRemove={() => toggleSet(selectedSizes, s, setSelectedSizes)}
                />
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border-ek-line bg-ek-bg-elevated cursor-pointer rounded-md border px-3 py-2 text-xs"
              >
                {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABEL[s]}
                  </option>
                ))}
              </select>

              <div className="border-ek-line flex overflow-hidden rounded-md border">
                {(
                  [
                    { id: "masonry" as const, icon: LayoutGrid, title: "Masonry" },
                    { id: "grid" as const, icon: Grid3x3, title: "Izgara" },
                    { id: "list" as const, icon: List, title: "Liste" },
                  ]
                ).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setLayout(v.id)}
                    title={v.title}
                    className={cn(
                      "p-2 transition-colors",
                      layout === v.id
                        ? "bg-ek-cream text-ek-ink"
                        : "text-ek-ink-3 hover:bg-ek-bg-elevated"
                    )}
                  >
                    <v.icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="border-ek-line-2 bg-ek-bg-elevated rounded-xl border border-dashed py-20 text-center">
              <Rows3 size={24} className="mx-auto mb-3 opacity-40" />
              <div className="h-3 mb-1">Bu filtrelere uygun ürün bulunamadı</div>
              <div className="mono mb-4">Filtreleri gevşetip tekrar deneyin</div>
              <button
                onClick={reset}
                className="border-ek-line hover:border-ek-ink rounded-full border px-4 py-1.5 text-xs"
              >
                Filtreleri sıfırla
              </button>
            </div>
          ) : layout === "masonry" ? (
            <MasonryGrid products={filtered} />
          ) : layout === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} variant="list" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="bg-ek-ink text-ek-cream hover:bg-ek-forest flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
    >
      {label}
      <X size={11} />
    </button>
  );
}

function FiltersHeader({
  activeFilters,
  onReset,
}: {
  activeFilters: number;
  onReset: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="h-3">
        Filtreler
        {activeFilters > 0 && (
          <span className="text-ek-terra-2 font-sans text-sm"> · {activeFilters}</span>
        )}
      </h3>
      <button onClick={onReset} className="mono hover:text-ek-ink">
        SIFIRLA
      </button>
    </div>
  );
}

interface FiltersBodyProps {
  allColors: [string, string][];
  customOnly: boolean;
  setCustomOnly: (v: boolean) => void;
  saleOnly: boolean;
  setSaleOnly: (v: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  priceMax: number;
  setPriceMax: (v: number) => void;
  selectedColors: Set<string>;
  setSelectedColors: (s: Set<string>) => void;
  selectedBrands: Set<string>;
  setSelectedBrands: (s: Set<string>) => void;
  selectedSizes: Set<string>;
  setSelectedSizes: (s: Set<string>) => void;
  toggleSet: (set: Set<string>, value: string, setter: (s: Set<string>) => void) => void;
  touchTargets?: boolean;
}

function FiltersBody({
  allColors,
  customOnly,
  setCustomOnly,
  saleOnly,
  setSaleOnly,
  inStockOnly,
  setInStockOnly,
  priceMax,
  setPriceMax,
  selectedColors,
  setSelectedColors,
  selectedBrands,
  setSelectedBrands,
  selectedSizes,
  setSelectedSizes,
  toggleSet,
  touchTargets = false,
}: FiltersBodyProps) {
  // Touch mode = mobile; arttırılmış targetler
  const swatchCls = touchTargets ? "h-10 w-10" : "h-7 w-7";
  const sizeCls = touchTargets
    ? "min-w-11 min-h-11 rounded-lg px-3.5 py-2 text-sm"
    : "min-w-9 rounded-full px-3 py-1.5 text-xs";
  const checkboxRow = touchTargets
    ? "flex cursor-pointer items-center gap-3 py-2.5 text-sm"
    : "flex cursor-pointer items-center gap-2 text-sm";
  const checkboxCls = touchTargets
    ? "h-5 w-5 accent-[var(--ek-forest)]"
    : "accent-[var(--ek-forest)]";

  return (
    <>
      {/* Özellik */}
      <section className="border-ek-line-2 border-b pb-5">
        <div className="label mb-3">Özellik</div>
        <div className={touchTargets ? "divide-ek-line-2 divide-y" : "space-y-2"}>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(e) => setCustomOnly(e.target.checked)}
              className={checkboxCls}
            />
            <span className="flex-1">Kişiselleştirilebilir</span>
          </label>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={saleOnly}
              onChange={(e) => setSaleOnly(e.target.checked)}
              className={checkboxCls}
            />
            <span className="flex-1">İndirimde</span>
          </label>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className={checkboxCls}
            />
            <span className="flex-1">Stokta var</span>
          </label>
        </div>
      </section>

      {/* Fiyat */}
      <section className="border-ek-line-2 border-b py-5">
        <div className="label mb-3 flex items-center justify-between">
          <span>Fiyat aralığı</span>
          <span className="text-ek-ink-3 font-normal normal-case">
            ≤ {formatTL(priceMax)}
          </span>
        </div>
        <input
          type="range"
          min={200}
          max={6000}
          step={100}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className={cn(
            "w-full",
            touchTargets && "h-6",
          )}
          style={{ accentColor: "var(--ek-forest)" }}
        />
        <div className="mono mt-1.5 flex justify-between">
          <span>{formatTL(200)}</span>
          <span>{formatTL(6000)}</span>
        </div>
      </section>

      {/* Renk */}
      {allColors.length > 0 && (
        <section className="border-ek-line-2 border-b py-5">
          <div className="label mb-3">Renk</div>
          <div className={cn("flex flex-wrap", touchTargets ? "gap-2.5" : "gap-2")}>
            {allColors.map(([name, hex]) => {
              const active = selectedColors.has(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleSet(selectedColors, name, setSelectedColors)}
                  title={name}
                  className={cn(
                    "rounded-full transition-transform",
                    swatchCls,
                    active
                      ? "ring-ek-ink ring-offset-ek-bg-elevated ring-2 ring-offset-2"
                      : "border-ek-line hover:scale-110 border",
                  )}
                  style={{ background: hex }}
                  aria-label={name}
                />
              );
            })}
          </div>
          {touchTargets && selectedColors.size > 0 && (
            <div className="mono mt-2 text-ek-ink-3">
              Seçili: {Array.from(selectedColors).join(", ")}
            </div>
          )}
        </section>
      )}

      {/* Marka */}
      <section className="border-ek-line-2 border-b py-5">
        <div className="label mb-3">Marka</div>
        <div className={touchTargets ? "divide-ek-line-2 divide-y" : "space-y-2"}>
          {BRANDS.map((b) => (
            <label key={b} className={checkboxRow}>
              <input
                type="checkbox"
                checked={selectedBrands.has(b)}
                onChange={() => toggleSet(selectedBrands, b, setSelectedBrands)}
                className={checkboxCls}
              />
              <span className="flex-1">{b}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Beden */}
      <section className="pt-5">
        <div className="label mb-3">Beden</div>
        <div className={cn("flex flex-wrap", touchTargets ? "gap-2" : "gap-1.5")}>
          {SIZES.map((s) => {
            const active = selectedSizes.has(s);
            return (
              <button
                key={s}
                onClick={() => toggleSet(selectedSizes, s, setSelectedSizes)}
                className={cn(
                  "border transition-colors",
                  sizeCls,
                  active
                    ? "bg-ek-ink text-ek-cream border-ek-ink"
                    : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
