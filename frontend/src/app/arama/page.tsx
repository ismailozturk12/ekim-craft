"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Container } from "@/components/ekim/container";
import { EmptyState } from "@/components/ekim/empty-state";
import { ProductCard } from "@/components/ekim/product-card";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { catalog } from "@/lib/api/client";
import type { Product } from "@/types/catalog";

function mapProduct(x: Awaited<ReturnType<typeof catalog.listProducts>>["results"][number]): Product {
  return {
    id: String(x.id),
    slug: x.slug,
    name: x.name,
    category: (x.category_slug ?? "all") as Product["category"],
    artisan: x.artisan,
    artisanCity: x.artisan_city,
    price: parseFloat(x.price),
    oldPrice: x.old_price ? parseFloat(x.old_price) : undefined,
    currency: x.currency,
    stock: 10,
    rating: parseFloat(x.rating),
    reviews: x.review_count,
    tags: x.tags as Product["tags"],
    customizable: x.customizable,
    sizeType: x.size_type as Product["sizeType"],
    sizes: [],
    colors: [],
    desc: "",
    materials: [],
    care: "",
    leadTime: "",
    coverImage: (x as { cover_image?: string | null }).cover_image ?? null,
  };
}

const POPULAR = ["Ahşap tren", "İsim süsü", "Anahtarlık", "Duvar saati", "Yapboz", "Kupa", "Tablo", "Bileklik"];

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="flex flex-1 items-center justify-center py-16">
            <div className="text-ek-ink-3 text-sm">Yükleniyor...</div>
          </main>
          <Footer />
        </>
      }
    >
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        setCount(0);
        return;
      }
      setLoading(true);
      try {
        const res = await catalog.listProducts({ search: q, page_size: 24 });
        setResults(res.results.map(mapProduct));
        setCount(res.count);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          <div className="mx-auto mb-8 max-w-3xl">
            <div className="border-ek-line bg-ek-bg-card flex items-center gap-3 rounded-full border px-5 py-3">
              <Search size={20} className="text-ek-ink-3" />
              <input
                autoFocus
                placeholder="Ne arıyorsun?"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  router.replace(`/arama?q=${encodeURIComponent(e.target.value)}`);
                }}
                className="placeholder:text-ek-ink-4 flex-1 bg-transparent text-base outline-none"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-ek-ink-3 hover:text-ek-ink">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {!q && (
            <>
              <div className="eyebrow mb-3">POPÜLER ARAMALAR</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQ(p)}
                    className="border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3 rounded-full border px-3 py-1.5 text-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}

          {q && loading && <div className="text-ek-ink-3 py-10 text-center">Aranıyor...</div>}

          {q && !loading && results.length === 0 && (
            <EmptyState title="Sonuç bulunamadı" description={`"${q}" için eşleşen ürün yok.`} />
          )}

          {results.length > 0 && (
            <>
              <div className="text-ek-ink-3 mb-6 text-sm">
                &quot;{q}&quot; için {count} sonuç
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
