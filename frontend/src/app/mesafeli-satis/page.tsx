import { StaticPage } from "@/components/ekim/static-page";
import { SITE_URL } from "@/lib/seo";
import { company, fullAddress, hasAddress } from "@/lib/company";

export const metadata = { title: "Mesafeli Satış Sözleşmesi" };

export default function MesafeliSatisPage() {
  const siteHost = SITE_URL.replace(/^https?:\/\//, "");
  return (
    <StaticPage
      title="Mesafeli Satış Sözleşmesi"
      eyebrow="YASAL"
      updated={company.legalUpdated}
    >
      <p>
        İşbu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği&apos;ne uygun olarak hazırlanmıştır.
      </p>

      <h2 className="h-3">1. Taraflar</h2>
      <p>
        <strong>Satıcı:</strong> {company.legalName}
        {hasAddress() && ` — ${fullAddress()}`}.
      </p>
      <p>
        <strong>Alıcı:</strong> Sipariş esnasında bilgileri kaydedilen tüketici.
      </p>

      <h2 className="h-3">2. Konu</h2>
      <p>
        İşbu sözleşme, Alıcı&apos;nın Satıcı&apos;nın{" "}
        <a href={SITE_URL} className="text-ek-terra-2 hover:underline">
          {siteHost}
        </a>{" "}
        internet sitesi üzerinden elektronik ortamda sipariş verdiği ürünlerin satışı ve teslimine
        ilişkin tarafların hak ve yükümlülüklerini kapsar.
      </p>

      <h2 className="h-3">3. Ürün ve ödeme</h2>
      <p>
        Ürünün özellikleri, tüm vergiler dahil toplam satış bedeli, varsa kargo ücreti ve ödeme
        şekli sipariş adımında Alıcı&apos;ya açıkça sunulur. Ödeme, PCI-DSS uyumlu ödeme aracısı
        üzerinden Alıcı tarafından seçilen yöntemle (kredi kartı, havale/EFT, kapıda ödeme)
        gerçekleştirilir.
      </p>

      <h2 className="h-3">4. Teslimat</h2>
      <p>
        Stoktaki ürünler genellikle 1-3 iş günü, kişiye özel üretilen ürünler ise 3-7 iş günü
        içinde kargoya verilir. Kargo süresi firmaya ve teslimat adresine göre değişebilir.
        Teslimat şirketinin sorumluluk alanındaki gecikmeler Satıcı&apos;nın sorumluluğunda değildir.
      </p>

      <h2 className="h-3">5. Cayma hakkı</h2>
      <p>
        Alıcı, kişiye özel olmayan ürünlerde teslim tarihinden itibaren 14 gün içinde herhangi bir
        gerekçe belirtmeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir. Cayma hakkının
        kullanılması halinde ürünün orijinal ambalajı, faturası ve sağlam şekilde iade edilmesi
        gerekir.
      </p>

      <h2 className="h-3">6. Cayma hakkı istisnaları</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Kişiye özel üretilmiş ürünler (isim, fotoğraf, özel tasarımla hazırlanan)</li>
        <li>Hijyenik paketi açılmış ürünler</li>
        <li>Kullanım veya hasar görmüş ürünler</li>
      </ul>

      <h2 className="h-3">7. Uyuşmazlık çözümü</h2>
      <p>
        Taraflar arasındaki uyuşmazlıklarda Tüketici Bakanlığı&apos;nca ilan edilen parasal
        sınırlar dahilinde Tüketici Hakem Heyetleri, bu sınırları aşan uyuşmazlıklarda Tüketici
        Mahkemeleri yetkilidir.
      </p>
    </StaticPage>
  );
}
