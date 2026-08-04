import type { Metadata } from "next";
import { Heart, Pencil, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ekim/container";
import { HeroBannerSlider, type HeroBanner } from "@/components/ekim/hero-banner-slider";
import { Placeholder } from "@/components/ekim/placeholder";
import { ProductCard } from "@/components/ekim/product-card";
import { SectionHeader } from "@/components/ekim/section-header";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { API_URL, catalog } from "@/lib/api/client";
import { SITE_URL } from "@/lib/seo";
import type { Product } from "@/types/catalog";

function resolveImage(u?: string | null): string | null {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  return `${API_URL}${u}`;
}

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
  const [productsRes, categoriesRes, bannersRes] = await Promise.all([
    catalog.listProducts({ page_size: 60 }).catch(() => null),
    catalog.listCategories().catch(() => null),
    fetch(`${API_URL}/api/v1/core/banners/`, { next: { revalidate: 60 } })
      .then((r) => (r.ok ? r.json() : { banners: [] }))
      .catch(() => ({ banners: [] })) as Promise<{ banners: HeroBanner[] }>,
  ]);

  const rawProducts = productsRes?.results ?? [];
  const banners = bannersRes?.banners ?? [];
  const products = rawProducts.map(mapProduct);
  // Boş kategori vitrine ÇIKMAZ (EkimTablo kuralı): "Tablo — 0 ürün" kartı
  // güven zedeliyor. Ürün eklenince kart kendiliğinden geri gelir.
  const categories = (categoriesRes ?? []).filter(
    (c: { slug?: string; count?: number }) => c.slug !== "all" && (c.count ?? 0) > 0,
  );
  // Etiketli ürün azsa bölümü 4'e tamamla — tek kartlık "vitrin" boş görünüyor.
  const doldur = (oncelik: Product[], havuz: Product[], hedef: number) => {
    const secim = [...oncelik.slice(0, hedef)];
    for (const p of havuz) {
      if (secim.length >= hedef) break;
      if (!secim.some((x) => x.id === p.id)) secim.push(p);
    }
    return secim;
  };
  const cokSatan = products.filter((p) => p.tags.includes("Çok satan"));
  const yeniler = products.filter((p) => p.tags.includes("Yeni"));
  const featured = doldur(cokSatan, products, 4);
  const newest = doldur(
    yeniler,
    products.filter((p) => !featured.some((x) => x.id === p.id)),
    4,
  );

  // Hero: en güçlü 2 ürünün kapağı (Çok satan + Yeni öncelik)
  const hero = [...products]
    .filter((p) => p.coverImage)
    .sort((a, b) => {
      const as = (a.tags.includes("Çok satan") ? 2 : 0) + (a.tags.includes("Yeni") ? 1 : 0);
      const bs = (b.tags.includes("Çok satan") ? 2 : 0) + (b.tags.includes("Yeni") ? 1 : 0);
      return bs - as;
    })
    .slice(0, 2);

  // Kategori başına 1 temsili cover
  const categoryCovers = new Map<string, string>();
  for (const p of rawProducts) {
    const slug = p.category_slug;
    if (slug && p.cover_image && !categoryCovers.has(slug)) {
      categoryCovers.set(slug, p.cover_image);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* BANNER ŞERİDİ — panelden yönetilir; boşsa markalı hazır slaytlar döner */}
        <Container className="pb-2 pt-3">
          <HeroBannerSlider banners={banners} />
        </Container>

        {/* HERO — atölye tezgâhı: koyu ceviz zemin, bal vurgu, kesim çizgisi çerçeve */}
        <section className="walnut relative overflow-hidden">
          <Container className="py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
              <div>
                <div className="font-serif text-ek-terra mb-5 text-lg italic md:text-xl">
                  İstanbul&apos;daki atölyemizden, elle —
                </div>
                <h1 className="h-display mb-7 text-[#F6EDD9]">
                  Ahşaptan,
                  <br />
                  <em>adına özel.</em>
                </h1>
                <p className="mb-9 max-w-md text-base leading-relaxed text-[#D9C7A4] md:text-lg">
                  Kavak kontrplak lazerle kesilir, elde zımparalanır, adınla paketlenir.
                  Oyuncaktan ev dekoruna her parça, siparişinin üzerine üretilir.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/kategori/all"
                    className="bg-ek-terra hover:bg-ek-terra-2 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-[#1c1204] transition-colors"
                  >
                    Atölyeden seç →
                  </Link>
                  <Link
                    href="/kategori/all?customizable=true"
                    className="hover:border-ek-terra hover:text-ek-terra inline-flex items-center rounded-full border border-[#5d4a2e] px-7 py-3.5 text-sm font-medium text-[#ecdcbc] transition-colors"
                  >
                    Kişiye özel yaptır
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {["Siparişle üretim · 48 saat", "Kapına 2-4 günde", "14 gün koşulsuz iade"].map((t) => (
                    <span key={t} className="kraft-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:pl-6">
                {hero[0] ? (
                  <Link
                    href={`/urun/${hero[0].slug}`}
                    className="cut-frame group relative mx-auto block w-full max-w-[440px]"
                  >
                    <div className="overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImage(hero[0].coverImage) ?? ""}
                        alt={hero[0].name}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="eager"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="mono text-white/75">ATÖLYEDEN</div>
                      <div className="truncate text-sm font-medium text-white">{hero[0].name}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="cut-frame relative mx-auto w-full max-w-[440px]">
                    <div className="overflow-hidden rounded-lg">
                      <Placeholder tone="terra" label="el yapımı" ratio="3 / 4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* KATEGORİLER */}
        <section className="bg-ek-bg-elevated py-16">
          <Container>
            <SectionHeader title="Kategoriler" action={{ label: "Tümünü gör", href: "/kategori/all" }} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((c: { slug?: string; name?: string; count?: number }) => {
                const tones = {
                  oyuncak: "terra",
                  hediyelik: "rose",
                  tablo: "sage",
                  saat: "ink",
                  aksesuar: "forest",
                  dekor: "terra",
                } as const;
                const cover = c.slug ? resolveImage(categoryCovers.get(c.slug)) : null;
                return (
                  <Link
                    key={c.slug}
                    href={`/kategori/${c.slug}`}
                    className="group relative overflow-hidden rounded-lg transition-transform hover:-translate-y-1"
                  >
                    {cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cover}
                        alt={c.name ?? ""}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <Placeholder
                        tone={(tones[c.slug as keyof typeof tones] as "terra") ?? "cream"}
                        label={c.name}
                        ratio="4 / 5"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 text-white">
                      <div className="font-serif text-xl">{c.name}</div>
                      <div className="mono text-[#e8b96a]">{c.count} ürün →</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ATÖLYE SÜRECİ — sipariş gerçek bir sıra izlediği için numaralı */}
        <Container as="section" className="py-20">
          <SectionHeader eyebrow="NASIL ÇALIŞIR" title="Tezgâhtan kapına" />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Seç — istersen adını yaz",
                d: "Ürünü seç; isim, tarih ya da fotoğrafla kişiselleştir. Tek üretim parçalarda acele et, bir tane var.",
              },
              {
                n: "2",
                t: "Atölyede üretilir",
                d: "Kavak kontrplak lazerle kesilir, elde zımparalanır, su bazlı boyayla bitirilir — 48 saat içinde.",
              },
              {
                n: "3",
                t: "2-4 günde kapında",
                d: "Pamuklu kesesinde, koruyucu paketle kargoya verilir. 14 gün koşulsuz iade hakkın saklı.",
              },
            ].map((a) => (
              <div key={a.n} className="border-ek-line bg-ek-bg-card rounded-lg border p-6">
                <span className="kraft-tag mb-4">ADIM {a.n} / 3</span>
                <div className="text-ek-ink mb-2 text-lg font-semibold">{a.t}</div>
                <p className="text-ek-ink-2 text-sm leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>
        </Container>

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
          <div className="border-ek-terra/40 bg-ek-bg-card grid gap-6 rounded-xl border border-dashed p-8 md:grid-cols-4">
            {[
              { i: Truck, t: "500₺ üstü ücretsiz kargo", s: "Tüm Türkiye, 2-4 gün" },
              { i: Sparkles, t: "14 gün iade hakkı", s: "Koşulsuz, ücretsiz" },
              { i: Heart, t: "El yapımı kalite", s: "Her parça elden geçer" },
              { i: Pencil, t: "Kişiselleştirme", s: "İsim, görsel, özel ölçü" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-ek-cream text-ek-terra-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
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
