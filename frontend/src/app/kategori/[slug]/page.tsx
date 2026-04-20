import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/ekim/category-view";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { catalog } from "@/lib/api/client";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import type { Product } from "@/types/catalog";

const CATEGORY_DESC: Record<string, string> = {
  all: "Tüm el yapımı koleksiyon — oyuncak, hediyelik, tablo, saat, aksesuar, ev dekor.",
  oyuncak: "3+ yaşa uygun, su bazlı boyalarla bitirilmiş ahşap oyuncaklar.",
  hediyelik: "İsim, tarih ve fotoğrafla kişiselleştirilebilir hediyelikler.",
  tablo: "Kanvas, poster ve ahşap baskı tablolar — asmaya hazır.",
  saat: "Sessiz mekanizmalı duvar ve masa saatleri.",
  aksesuar: "Bileklik, cüzdan, güneş gözlüğü — doğal malzemeler.",
  dekor: "Soy isim, tabela, boy ölçer — kişiye özel dekor parçaları.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug === "all" ? "Tüm Ürünler" : slug.charAt(0).toUpperCase() + slug.slice(1);
  const description = CATEGORY_DESC[slug] ?? CATEGORY_DESC.all;
  return {
    title: `${name} koleksiyonu`,
    description,
    alternates: { canonical: `${SITE_URL}/kategori/${slug}` },
    openGraph: {
      title: `${name} — Ekim Craft`,
      description,
      url: `${SITE_URL}/kategori/${slug}`,
      type: "website",
      locale: "tr_TR",
    },
  };
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categoriesRaw = await catalog.listCategories().catch(() => []);
  const categories = categoriesRaw.filter((c) => c.slug !== "all");
  const current =
    slug === "all"
      ? { slug: "all", name: "Tüm Ürünler" }
      : categories.find((c) => c.slug === slug);

  if (!current) notFound();

  const res = await catalog
    .listProducts({
      page_size: 48,
      ...(slug !== "all" ? { category: slug } : {}),
    })
    .catch(() => null);

  const products = (res?.results ?? []).map(mapProduct);

  const breadcrumb = breadcrumbJsonLd(
    slug === "all"
      ? [
          { name: "Ana sayfa", path: "/" },
          { name: "Mağaza", path: "/kategori/all" },
        ]
      : [
          { name: "Ana sayfa", path: "/" },
          { name: "Mağaza", path: "/kategori/all" },
          { name: current.name, path: `/kategori/${slug}` },
        ]
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Header />
      <main className="flex-1">
        <Container className="py-8 pb-20">
          <CategoryView
            slug={slug}
            categoryName={current.name}
            categories={categories}
            products={products}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
