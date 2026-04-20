import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "Kargo & Teslimat" };

export default function KargoPage() {
  return (
    <StaticPage title="Kargo & teslimat" eyebrow="BİLGİ" updated="01 Nisan 2026">
      <h2 className="h-3">Süre</h2>
      <p>
        Stokta olan ürünler 1-3 iş gününde kapına ulaşır. Kişiye özel ürünler için 3-7 iş günü
        üretim süresi vardır.
      </p>
      <h2 className="h-3">Ücret</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Standart kargo: 49,90 TL · 500 TL ve üzeri ücretsiz</li>
        <li>Hızlı kargo: 89 TL · ertesi iş günü</li>
        <li>Atölyeden teslim: ücretsiz · 3-5 iş günü hazırlama</li>
      </ul>
      <h2 className="h-3">Takip</h2>
      <p>
        Kargo numaran e-posta ve SMS ile paylaşılır. Hesabından siparişini açarak canlı takip
        edebilirsin.
      </p>
      <h2 className="h-3">Çalıştığımız kargo firmaları</h2>
      <p>Aras Kargo, MNG Kargo, Yurtiçi Kargo.</p>
    </StaticPage>
  );
}
