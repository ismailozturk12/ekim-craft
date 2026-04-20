import Link from "next/link";
import { Container } from "@/components/ekim/container";
import { NewsletterForm } from "@/components/ekim/newsletter-form";

const COLUMNS = [
  {
    title: "Mağaza",
    links: [
      { label: "Tüm ürünler", href: "/kategori/all" },
      { label: "Yeni gelenler", href: "/kategori/all?tag=Yeni" },
      { label: "Çok satanlar", href: "/kategori/all?tag=Çok satan" },
      { label: "İndirimli", href: "/kategori/all?on_sale=true" },
    ],
  },
  {
    title: "Yardım",
    links: [
      { label: "SSS", href: "/sss" },
      { label: "İletişim", href: "/iletisim" },
      { label: "Kargo & teslimat", href: "/kargo" },
      { label: "İade koşulları", href: "/iade" },
      { label: "Sipariş takibi", href: "/hesap/siparisler" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Kullanım şartları", href: "/kullanim-sartlari" },
      { label: "Gizlilik", href: "/gizlilik" },
      { label: "KVKK", href: "/kvkk" },
      { label: "Mesafeli satış", href: "/mesafeli-satis" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ek-ink text-ek-cream mt-16">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl">Ekim</span>
              <span className="bg-ek-terra h-2 w-2 rounded-full" />
              <span className="font-serif text-2xl">Craft</span>
            </Link>
            <p className="text-ek-cream/70 mt-4 max-w-sm text-sm leading-relaxed">
              El yapımı, kişiye özel ve tek üretim ürünler. 2019'dan beri İstanbul atölyemizden.
            </p>
            <NewsletterForm />

          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mono text-ek-cream/60 mb-4 uppercase">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-ek-terra text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-ek-cream/10 text-ek-cream/50 mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-8 text-xs">
          <div>© {new Date().getFullYear()} Ekim Craft. Tüm hakları saklıdır.</div>
          <div className="flex gap-6">
            <span>🇹🇷 Türkçe</span>
            <span>₺ TL</span>
            <span>MERSİS 0123456789</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
