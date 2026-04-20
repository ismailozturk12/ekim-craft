import type { Metadata } from "next";
import { Heart, Pencil, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ekim/container";
import { Placeholder } from "@/components/ekim/placeholder";
import { ProductCard } from "@/components/ekim/product-card";
import { SectionHeader } from "@/components/ekim/section-header";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { catalog } from "@/lib/api/client";
import { SITE_URL } from "@/lib/seo";
import type { Product } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Ekim Craft — El yapımı, kişiye özel ürünler",
  description:
    "Oyuncak, hediyelik, tablo, saat, aksesuar, dekor — İstanbul atölyemizden özenle üretilen, kişiye özel ve tek üretim el yapımı ürünler. Kapına 1-3 günde gelir.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Ekim Craft — El yapımı, kişiye özel",
    description:
      "Oyuncak, hediyelik, tablo, saat, aksesuar, dekor — kişiye özel el yapımı ürünler.",
    url: SITE_URL,
    type: "website",
    locale: "tr_TR",
  },
};

function mapProduct(p: unknown): Product {
  const x = p as Record<string, unknown>;
  return {
    id: String(x.id),
    slug: x.slug as string,
    name: x.name as string,
    category: (x.category_slug ?? "all") as Product["category"],
    artisan: (x.artisan as string) ?? "Ekim Craft",
    artisanCity: (x.artisan_city as string) ?? "İstanbul",
    price: parseFloat(x.price as string),
    oldPrice: x.old_price ? parseFloat(x.old_price as string) : undefined,
    currency: (x.currency as string) ?? "TRY",
    stock: 10,
    rating: parseFloat((x.rating as string) ?? "0"),
    reviews: (x.review_count as number) ?? 0,
    tags: (x.tags as Product["tags"]) ?? [],
    customizable: (x.customizable as boolean) ?? false,
    sizeType: (x.size_type as Product["sizeType"]) ?? "one-size",
    sizes: [],
    colors: [],
    desc: "",
    materials: [],
    care: "",
    leadTime: "",
    coverImage: (x as { cover_image?: string | null }).cover_image ?? null,
  };
}

export default async function Home() {
  const [productsRes, categoriesRes] = await Promise.all([
    catalog.listProducts({ page_size: 8 }).catch(() => null),
    catalog.listCategories().catch(() => null),
  ]);

  const products = (productsRes?.results ?? []).map(mapProduct);
  const categories = (categoriesRes ?? []).filter((c: { slug?: string }) => c.slug !== "all");
  const featured = products.filter((p) => p.tags.includes("Çok satan")).slice(0, 4);
  const newest = products.filter((p) => p.tags.includes("Yeni")).slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <Container as="section" className="py-16">
          <div className="grid items-end gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mono mb-6">BAHAR 2026 KOLEKSİYONU</div>
              <h1 className="h-display mb-8">
                El yapımı,
                <br />
                <em>kalbinden.</em>
              </h1>
              <p className="text-ek-ink-2 mb-8 max-w-md text-base leading-relaxed md:text-lg">
                Oyuncak, hediyelik, tablo, saat, aksesuar, dekor — özenle üretilen, kişiye özel ve tek üretim
                ürünler. Kapına 1-3 günde gelir.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/kategori/all"
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
                >
                  Alışverişe başla →
                </Link>
                <Link
                  href="/kategori/oyuncak"
                  className="border-ek-line hover:border-ek-ink-3 inline-flex items-center rounded-full border px-6 py-3 text-sm font-medium transition-colors"
                >
                  Oyuncakları gör
                </Link>
              </div>
              <div className="border-ek-line mt-10 flex flex-wrap gap-8 border-t pt-6">
                {[
                  { n: `${products.length}+`, l: "Ürün" },
                  { n: String(categories.length), l: "Kategori" },
                  { n: "4.9", l: "Puan" },
                  { n: "1-3g", l: "Kargo" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-serif text-3xl">{s.n}</div>
                    <div className="mono mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[420px] md:h-[540px]">
              <div className="absolute right-0 top-0 w-[78%] overflow-hidden rounded-lg shadow-lg">
                <Placeholder tone="terra" label="ahşap tren seti" ratio="3 / 4" />
              </div>
              <div className="border-ek-bg bg-ek-bg absolute bottom-0 left-0 w-[52%] overflow-hidden rounded-lg border-4 shadow-xl">
                <Placeholder tone="sage" label="ahşap oyuncak" ratio="1" />
              </div>
            </div>
          </div>
        </Container>

        {/* KATEGORİLER */}
        <section className="bg-ek-bg-elevated py-16">
          <Container>
            <SectionHeader title="Kategoriler" action={{ label: "Tümünü gör", href: "/kategori/all" }} />
            <div className="grid gap-4 md:grid-cols-3">
              {categories.map((c: { slug?: string; name?: string; count?: number }) => {
                const tones = {
                  oyuncak: "terra",
                  hediyelik: "rose",
                  tablo: "sage",
                  saat: "ink",
                  aksesuar: "forest",
                  dekor: "cream",
                } as const;
                return (
                  <Link
                    key={c.slug}
                    href={`/kategori/${c.slug}`}
                    className="group relative overflow-hidden rounded-lg transition-transform hover:-translate-y-1"
                  >
                    <Placeholder
                      tone={(tones[c.slug as keyof typeof tones] as "terra") ?? "cream"}
                      label={c.name}
                      ratio="4 / 5"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <div className="absolute inset-x-5 bottom-5 text-white">
                      <div className="font-serif text-xl">{c.name}</div>
                      <div className="mono text-white/80">{c.count} ürün →</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ÇOK SATANLAR */}
        {featured.length > 0 && (
          <Container as="section" className="py-20">
            <SectionHeader
              eyebrow="HAFTANIN SEÇKİSİ"
              title="Çok satanlar"
              action={{ label: "Hepsini gör", href: "/kategori/all?tag=Çok+satan" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        )}

        {/* YENİ GELENLER */}
        {newest.length > 0 && (
          <Container as="section" className="pb-20">
            <SectionHeader
              eyebrow="BAHAR 2026"
              title="Yeni gelenler"
              action={{ label: "Hepsini gör", href: "/kategori/all?tag=Yeni" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newest.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        )}

        {/* FEATURE STRIP */}
        <Container as="section" className="pb-20">
          <div className="bg-ek-bg-elevated border-ek-line-2 grid gap-6 rounded-xl border p-8 md:grid-cols-4">
            {[
              { i: Truck, t: "500₺ üstü ücretsiz kargo", s: "Tüm Türkiye, 1-3 gün" },
              { i: Sparkles, t: "14 gün iade hakkı", s: "Koşulsuz, ücretsiz" },
              { i: Heart, t: "El yapımı kalite", s: "Her ürün özenle seçilir" },
              { i: Pencil, t: "Kişiselleştirme", s: "İsim, görsel, özel ölçü" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-ek-cream text-ek-forest flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <f.i size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.t}</div>
                  <div className="mono mt-1">{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
