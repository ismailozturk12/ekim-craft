import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function KVKKPage() {
  return (
    <StaticPage title="KVKK Aydınlatma Metni" eyebrow="YASAL" updated="01 Nisan 2026">
      <h2 className="h-3">1. Veri sorumlusu</h2>
      <p>
        Ekim Craft Atölye (&quot;Şirket&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla hareket etmektedir.
      </p>
      <h2 className="h-3">2. İşlenen kişisel veriler</h2>
      <p>Ad, soyad, e-posta, telefon, fatura ve teslimat adresi, ödeme bilgileri, sipariş geçmişi.</p>
      <h2 className="h-3">3. İşleme amaçları</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Sipariş ve sözleşme süreçlerinin yürütülmesi</li>
        <li>Kargo ve teslimat takibi</li>
        <li>E-arşiv/e-fatura düzenlenmesi</li>
        <li>Müşteri iletişim ve destek hizmetlerinin sağlanması</li>
        <li>Onay alınması halinde pazarlama iletişimi</li>
      </ul>
      <h2 className="h-3">4. Aktarım</h2>
      <p>
        Kargo firmaları (Aras, MNG, Yurtiçi), ödeme aracısı (iyzico), e-fatura entegratörü (Logo
        İşbaşı), yasal mercilerle açık rıza veya kanuni zorunluluk kapsamında paylaşılır.
      </p>
      <h2 className="h-3">5. Haklarınız</h2>
      <p>
        KVKK 11. madde kapsamında; verinize erişim, düzeltme, silme, işlemeye itiraz ve veri
        taşınabilirliği haklarına sahipsiniz. Talepleriniz için{" "}
        <a href="mailto:kvkk@ekimcraft.com" className="text-ek-terra-2 hover:underline">
          kvkk@ekimcraft.com
        </a>{" "}
        adresine başvurabilirsiniz.
      </p>
    </StaticPage>
  );
}
