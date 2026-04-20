import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "İade Koşulları" };

export default function IadePage() {
  return (
    <StaticPage title="İade & iptal koşulları" eyebrow="YASAL" updated="01 Nisan 2026">
      <h2 className="h-3">14 gün koşulsuz iade</h2>
      <p>
        Kişiye özel olmayan ürünlerde, ürünü teslim aldıktan sonra 14 gün içinde herhangi bir
        gerekçe sunmadan cayma hakkın vardır.
      </p>
      <h2 className="h-3">İstisnalar</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Kişiye özel üretilmiş ürünler (isim, fotoğraf, özel tasarım)</li>
        <li>Hijyenik paketi açılmış ürünler</li>
        <li>Kullanılmış/hasar görmüş ürünler</li>
      </ul>
      <h2 className="h-3">İade süreci</h2>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Hesabından siparişini aç, &quot;İade talep et&quot;&apos;e tıkla.</li>
        <li>Nedeni ve isteğini yaz (iade / değişim).</li>
        <li>Sana e-posta ile kargo etiketi gönderilir.</li>
        <li>Ürünü orijinal ambalajıyla kargoya ver.</li>
        <li>Ürün atölyemize ulaştıktan sonra 3 iş günü içinde iade işlenir.</li>
      </ol>
      <p className="mono">İade kargosu 30 TL tutarındadır; hatalı üretimde ücret alınmaz.</p>
    </StaticPage>
  );
}
