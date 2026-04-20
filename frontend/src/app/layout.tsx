import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SEARCH_CONSOLE = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: {
    default: "Ekim Craft — El yapımı, kişiye özel",
    template: "%s · Ekim Craft",
  },
  description:
    "Oyuncak, hediyelik, tablo, saat, aksesuar, dekor — özenle üretilen, kişiye özel ve tek üretim el yapımı ürünler. Kapına 1-3 günde gelir.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  keywords: [
    "el yapımı",
    "kişiye özel",
    "ahşap oyuncak",
    "hediyelik",
    "atölye",
    "Ekim Craft",
  ],
  authors: [{ name: "Ekim Craft" }],
  creator: "Ekim Craft",
  publisher: "Ekim Craft",
  applicationName: "Ekim Craft",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ekim Craft",
    url: SITE_URL,
    images: [{ url: "/favicon.ico", width: 256, height: 256, alt: "Ekim Craft" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ekimcraft",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(SEARCH_CONSOLE ? { verification: { google: SEARCH_CONSOLE } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
