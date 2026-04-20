import type { Metadata } from "next";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE_URL, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Sipariş, kişiye özel üretim, kargo ve ödeme konularında en sık sorulan sorular ve cevapları.",
  alternates: { canonical: `${SITE_URL}/sss` },
};

const SECTIONS = [
  {
    title: "Sipariş",
    items: [
      { q: "Sipariş nasıl verilir?", a: "Beğendiğin ürünü seç, varyantını ve özelleştirmelerini gir, sepete ekle ve ödemeye geç." },
      { q: "Siparişimi iptal edebilir miyim?", a: "Üretim başlamadıysa hesabından iptal edebilirsin. Kişiye özel üretim başladıktan sonra iptal alınamaz." },
      { q: "Hediye paketi var mı?", a: "Evet, sepet sayfasından +40 TL karşılığında eklenebilir." },
    ],
  },
  {
    title: "Kişiye özel",
    items: [
      { q: "İsim yazdırabilir miyim?", a: "Özelleştirilebilir etiketli tüm ürünlerde isim, tarih veya kısa yazı kazınır/basılır." },
      { q: "Fotoğraf baskısı nasıl?", a: "300 DPI minimum çözünürlükte JPG/PNG yükle. Kesim alanını uygulamada görebilirsin." },
      { q: "Özel ölçü ister misiniz?", a: "Özel ölçü seçeneği aktif ürünlerde +120 TL ve +3 gün üretim süresi alır." },
    ],
  },
  {
    title: "Kargo",
    items: [
      { q: "Kaç günde gelir?", a: "Stokta olanlar 1-3 iş günü, kişiye özel 2-5 iş günü ek üretim + 1-3 gün kargo." },
      { q: "Ücretsiz kargo var mı?", a: "500 TL üstü siparişlerde standart kargo ücretsizdir." },
      { q: "Yurt dışına gönderim?", a: "Şu an yalnızca Türkiye. 2026 Q3'te AB gönderisi planlanıyor." },
    ],
  },
  {
    title: "Ödeme",
    items: [
      { q: "Hangi ödeme yöntemleri?", a: "Kredi kartı (iyzico 3D Secure), havale/EFT, kapıda ödeme, Ekim cüzdan." },
      { q: "Taksit yapılır mı?", a: "2-12 taksit arası; kart bankasına göre faiz uygulanır." },
      { q: "Fatura nasıl?", a: "Tüm siparişlere e-arşiv fatura otomatik gönderilir." },
    ],
  },
];

export default function FAQPage() {
  const allQuestions = SECTIONS.flatMap((s) => s.items);
  const schemas = [
    faqJsonLd({ questions: allQuestions }),
    breadcrumbJsonLd([
      { name: "Ana sayfa", path: "/" },
      { name: "SSS", path: "/sss" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Header />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <h1 className="h-1 mb-3">Sık sorulan sorular</h1>
          <p className="text-ek-ink-3 mb-10 max-w-2xl">
            Aradığın cevabı bulamazsan{" "}
            <a href="/iletisim" className="text-ek-terra-2 hover:underline">
              bize ulaş
            </a>
            .
          </p>

          <div className="grid gap-10 md:grid-cols-[200px_1fr]">
            <nav className="hidden h-fit md:block">
              {SECTIONS.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title}`}
                  className="text-ek-ink-2 hover:text-ek-ink block py-1.5 text-sm"
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="space-y-10">
              {SECTIONS.map((s) => (
                <section id={s.title} key={s.title}>
                  <h2 className="h-3 mb-4">{s.title}</h2>
                  <Accordion defaultValue={[]}>
                    {s.items.map((it, i) => (
                      <AccordionItem key={i} value={`${s.title}-${i}`}>
                        <AccordionTrigger>{it.q}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-ek-ink-2">{it.a}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
