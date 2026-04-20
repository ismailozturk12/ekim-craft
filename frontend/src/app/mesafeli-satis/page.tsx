import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "Mesafeli Satış Sözleşmesi" };

export default function MesafeliSatisPage() {
  return (
    <StaticPage title="Mesafeli Satış Sözleşmesi" eyebrow="YASAL" updated="01 Nisan 2026">
      <p>
        İşbu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği&apos;ne uygun olarak hazırlanmıştır.
      </p>
      <h2 className="h-3">1. Taraflar</h2>
      <p>
        <strong>Satıcı:</strong> Ekim Craft Atölye — Caferağa Mah. Moda Cd. 142, Kadıköy İstanbul.
      </p>
      <p>
        <strong>Alıcı:</strong> Sipariş esnasında bilgileri kaydedilen tüketici.
      </p>
      <h2 className="h-3">2. Konu</h2>
      <p>
        İşbu sözleşme, alıcının satıcının{" "}
        <a href="https://ekimcraft.com">ekimcraft.com</a> üzerinden sipariş ettiği ürünlerin
        satışı ve teslimine ilişkin tarafların hak ve yükümlülüklerini kapsar.
      </p>
      <h2 className="h-3">3. Cayma hakkı</h2>
      <p>
        Alıcı, kişiye özel olmayan ürünlerde teslim tarihinden itibaren 14 gün içinde cayma hakkını
        kullanabilir. Kişiye özel üretilmiş ürünler cayma hakkı dışındadır.
      </p>
      <h2 className="h-3">4. Teslimat</h2>
      <p>
        Stoktaki ürünler 1-3 iş gününde, kişiye özel ürünler 3-7 iş gününde kargoya verilir.
      </p>
      <h2 className="h-3">5. Uyuşmazlık</h2>
      <p>
        Taraflar arasındaki uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
        yetkilidir.
      </p>
    </StaticPage>
  );
}
