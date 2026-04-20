import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ekimcraft.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/yonetim/", "/api/", "/hesap/", "/sepet", "/odeme", "/giris"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
