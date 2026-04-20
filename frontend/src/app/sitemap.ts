import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ekimcraft.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiItem {
  slug: string;
  updated_at?: string;
  cover_image?: string | null;
}

async function fetchItems(path: string): Promise<ApiItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : (data?.results ?? [])) as ApiItem[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    fetchItems("/catalog/products/?page_size=500"),
    fetchItems("/catalog/categories/"),
  ]);

  const now = new Date();
  const staticPages: Array<{ path: string; priority: number; freq: "daily" | "weekly" | "monthly" }> = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/kategori/all", priority: 0.9, freq: "daily" },
    { path: "/hakkimizda", priority: 0.5, freq: "monthly" },
    { path: "/sss", priority: 0.6, freq: "monthly" },
    { path: "/iletisim", priority: 0.5, freq: "monthly" },
    { path: "/kargo", priority: 0.4, freq: "monthly" },
    { path: "/iade", priority: 0.4, freq: "monthly" },
    { path: "/kvkk", priority: 0.3, freq: "monthly" },
    { path: "/gizlilik", priority: 0.3, freq: "monthly" },
    { path: "/mesafeli-satis", priority: 0.3, freq: "monthly" },
    { path: "/kullanim-sartlari", priority: 0.3, freq: "monthly" },
    { path: "/tasarim", priority: 0.7, freq: "weekly" },
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/kategori/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/urun/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.cover_image ? [p.cover_image.startsWith("http") ? p.cover_image : `${API_URL}${p.cover_image}`] : undefined,
    })),
  ];
}
