import { StaticPage } from "@/components/ekim/static-page";
import { company, fullAddress, hasAddress } from "@/lib/company";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function KVKKPage() {
  return (
    <StaticPage title="KVKK Aydınlatma Metni" eyebrow="YASAL" updated={company.legalUpdated}>
      <h2 className="h-3">1. Veri sorumlusu</h2>
      <p>
        {company.legalName} (&quot;Şirket&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla hareket etmektedir.
        {hasAddress() && ` Adres: ${fullAddress()}.`}
      </p>

      <h2 className="h-3">2. İşlenen kişisel veriler</h2>
      <p>
        Ad, soyad, e-posta adresi, telefon, fatura ve teslimat adresi, sipariş geçmişi, ödeme
        işlemine ilişkin kart metadata (son 4 hane, marka — hassas veri saklanmaz) ve IP/cihaz
        gibi teknik veriler.
      </p>

      <h2 className="h-3">3. İşleme amaçları</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Sipariş ve sözleşme süreçlerinin yürütülmesi</li>
        <li>Kargo ve teslimat takibi</li>
        <li>E-arşiv/e-fatura düzenlenmesi ve yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Müşteri iletişimi ve destek hizmetlerinin sağlanması</li>
        <li>Açık rıza alınması halinde pazarlama iletişimi</li>
      </ul>

      <h2 className="h-3">4. Veri aktarımı</h2>
      <p>
        Kişisel verileriniz yalnızca sözleşmenin ifası için gerekli olduğu ölçüde kargo firmaları,
        ödeme aracısı, e-fatura entegratörü ve yasal mercilerle paylaşılır. Verileriniz yurt dışına
        aktarılmaz ya da reklam amacıyla üçüncü taraflara verilmez.
      </p>

      <h2 className="h-3">5. Saklama süresi</h2>
      <p>
        Hesap ve sipariş bilgileriniz yasal zorunluluklar ve olası uyuşmazlıklar için maksimum 10
        yıl saklanır. Hesabınızı silmemiz halinde silme talebiniz kabul edilene kadar ve yasal
        süreler tamamlanana dek anonimleştirilerek saklanır.
      </p>

      <h2 className="h-3">6. Haklarınız</h2>
      <p>
        KVKK 11. madde kapsamında; verinize erişim, düzeltme, silme, işlemeye itiraz ve veri
        taşınabilirliği haklarına sahipsiniz. Talepleriniz için{" "}
        <a href={`mailto:${company.kvkkEmail}`} className="text-ek-terra-2 hover:underline">
          {company.kvkkEmail}
        </a>{" "}
        adresine başvurabilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanır.
      </p>
    </StaticPage>
  );
}
