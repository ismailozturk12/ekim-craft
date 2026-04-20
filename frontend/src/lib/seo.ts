/**
 * SEO yardımcıları — absolute URL, JSON-LD, organization bilgileri.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Ekim Craft";

export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Ekim Craft Atölye",
  description: "El yapımı, kişiye özel ve tek üretim ürünler",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  telephone: "+90 850 200 00 00",
  email: "destek@ekimcraft.com",
  address: {
    streetAddress: "Caferağa Mah. Moda Cd. 142",
    addressLocality: "Kadıköy",
    addressRegion: "İstanbul",
    postalCode: "34710",
    addressCountry: "TR",
  },
  sameAs: [
    "https://www.instagram.com/ekimcraft",
    "https://www.youtube.com/@ekimcraft",
  ],
};

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    description: ORGANIZATION.description,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    telephone: ORGANIZATION.telephone,
    email: ORGANIZATION.email,
    address: {
      "@type": "PostalAddress",
      ...ORGANIZATION.address,
    },
    sameAs: ORGANIZATION.sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface ProductSchemaInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  images: string[];
  brand?: string;
  categoryName?: string;
}

export function productJsonLd(p: ProductSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.sku || p.slug,
    image: p.images.filter(Boolean).map((u) => absoluteUrl(u)),
    url: absoluteUrl(`/urun/${p.slug}`),
    brand: { "@type": "Brand", name: p.brand ?? SITE_NAME },
    ...(p.categoryName ? { category: p.categoryName } : {}),
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: p.currency ?? "TRY",
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/urun/${p.slug}`),
      ...(p.oldPrice && p.oldPrice > p.price
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              price: p.price.toFixed(2),
              priceCurrency: p.currency ?? "TRY",
            },
          }
        : {}),
    },
    ...(p.rating && p.reviewCount && p.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviewCount,
          },
        }
      : {}),
  };
}

interface FaqJsonLdInput {
  questions: Array<{ q: string; a: string }>;
}

export function faqJsonLd({ questions }: FaqJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.a,
      },
    })),
  };
}
