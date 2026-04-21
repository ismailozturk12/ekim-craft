import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ekim/container";
import { ProductCard } from "@/components/ekim/product-card";
import { ProductGallery } from "@/components/ekim/product-gallery";
import { ProductPurchasePanel } from "@/components/ekim/product-purchase-panel";
import { ProductTabs } from "@/components/ekim/product-tabs";
import { SectionHeader } from "@/components/ekim/section-header";
import { Tag } from "@/components/ekim/tag";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { API_URL, catalog } from "@/lib/api/client";
import { discountPercent, formatTL } from "@/lib/format";
import { SITE_URL, absoluteUrl, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import type { Product } from "@/types/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProduct(slug).catch(() => null);
  if (!product) {
    return { title: "Ürün bulunamadı" };
  }
  const price = parseFloat(product.price);
  const coverUrl =
    product.images?.find((i) => i.is_cover)?.image ||
    product.images?.[0]?.image ||
    undefined;
  const description = product.seo_description
    || product.description?.slice(0, 155)
    || `${product.name} — el yapımı, ${product.artisan_city}'dan. ${price} ₺`;

  return {
    title: product.seo_title || product.name,
    description,
    alternates: { canonical: `${SITE_URL}/urun/${slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `${SITE_URL}/urun/${slug}`,
      siteName: "Ekim Craft",
      locale: "tr_TR",
      images: coverUrl
        ? [{ url: coverUrl, alt: product.name, width: 1200, height: 1200 }]
        : undefined,
    },
    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

async function fetchReviews(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/products/${slug}/reviews/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return list as Array<{
      id: number;
      author_name: string;
      rating: number;
      title: string;
      body: string;
      created_at: string;
      is_verified_purchase: boolean;
    }>;
  } catch {
    return [];
  }
}

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, reviews] = await Promise.all([
    catalog.getProduct(slug).catch(() => null),
    fetchReviews(slug),
  ]);

  if (!product) notFound();

  const price = parseFloat(product.price);
  const oldPrice = product.old_price ? parseFloat(product.old_price) : undefined;
  const discount = discountPercent(price, oldPrice);
  const variants = product.variants ?? [];
  const rating = parseFloat(product.rating);

  // Related — aynı kategoriden, bu ürün hariç, 4 adet
  const related = await catalog
    .listProducts({ category: product.category_slug, page_size: 5 })
    .then((r) => r.results.filter((p) => p.slug !== slug).slice(0, 4).map(mapProduct))
    .catch(() => []);

  const images = (product.images ?? []).map((i) => i.image).filter(Boolean) as string[];

  const schemas = [
    productJsonLd({
      name: product.name,
      slug: product.slug,
      description: product.description || product.name,
      price,
      oldPrice,
      currency: product.currency,
      sku: product.sku,
      rating,
      reviewCount: product.review_count,
      inStock: product.in_stock ?? (product.total_stock ?? 0) > 0,
      images: images.map((u) => absoluteUrl(u)),
      categoryName: product.category_slug,
    }),
    breadcrumbJsonLd([
      { name: "Ana sayfa", path: "/" },
      { name: "Mağaza", path: "/kategori/all" },
      { name: product.category_slug, path: `/kategori/${product.category_slug}` },
      { name: product.name, path: `/urun/${product.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Header />
      <main className="flex-1">
        <Container className="py-6 pb-20">
          {/* Breadcrumb */}
          <div className="mono mb-5 flex items-center gap-2">
            <a href="/" className="hover:text-ek-ink">
              Ana sayfa
            </a>
            <span className="opacity-40">/</span>
            <a
              href={`/kategori/${product.category_slug}`}
              className="hover:text-ek-ink capitalize"
            >
              {product.category_slug}
            </a>
            <span className="opacity-40">/</span>
            <span className="text-ek-ink">{product.name}</span>
          </div>

          {/* Galeri | Info */}
          <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
            <ProductGallery
              productId={String(product.id)}
              name={product.name}
              tags={product.tags ?? []}
              price={price}
              oldPrice={oldPrice}
              images={product.images ?? []}
            />

            <aside className="lg:sticky lg:top-[120px] lg:self-start">
              <div className="mono mb-2">
                {product.artisan} · {product.artisan_city}
              </div>
              <h1
                className="font-serif mb-5"
                style={{
                  fontSize: "clamp(28px, 3vw, 38px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {product.name}
              </h1>

              <div className="mb-6 flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={i <= Math.round(rating) ? "var(--ek-terra)" : "none"}
                      stroke="var(--ek-terra)"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="mono">
                  {rating.toFixed(1).replace(".", ",")} · {product.review_count} değerlendirme
                </span>
              </div>

              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-serif text-4xl">{formatTL(price)}</span>
                {oldPrice && (
                  <span className="text-ek-ink-4 text-base line-through">{formatTL(oldPrice)}</span>
                )}
                {discount !== null && <Tag label={`%${discount} İNDİRİM`} variant="İndirim" />}
              </div>
              <div className="mono mb-7">KDV dahil · 3 taksit imkânı</div>

              <ProductPurchasePanel
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={price}
                oldPrice={oldPrice}
                variants={variants}
                productStock={product.stock ?? 0}
                customizable={product.customizable}
                sizeType={product.size_type}
                leadTime={product.lead_time}
              />
            </aside>
          </div>

          {/* Tabs: Detay / Malzeme / Bakım / Kargo / Yorumlar */}
          <ProductTabs
            description={product.description}
            materials={product.materials ?? []}
            care={product.care}
            reviewCount={product.review_count}
            averageRating={rating}
            leadTime={product.lead_time}
            productSlug={product.slug}
            productName={product.name}
            reviews={reviews}
          />

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-20">
              <SectionHeader title="Bunları da beğenebilirsin" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
