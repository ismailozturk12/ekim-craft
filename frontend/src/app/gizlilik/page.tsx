import { StaticPage } from "@/components/ekim/static-page";
import { company } from "@/lib/company";

export const metadata = { title: "Gizlilik Politikası" };

export default function GizlilikPage() {
  return (
    <StaticPage title="Gizlilik politikası" eyebrow="YASAL" updated={company.legalUpdated}>
      <p>
        {company.legalName} olarak gizliliğinize önem veriyoruz. Kişisel verileriniz yalnızca
        siparişinizi işleme, hesabınızı yönetme ve size daha iyi hizmet sunma amacıyla işlenir.
      </p>
      <h2 className="h-3">Topladığımız veriler</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Hesap bilgileri: ad-soyad, e-posta, telefon</li>
        <li>Sipariş bilgileri: teslimat adresi, fatura bilgisi, sipariş geçmişi</li>
        <li>Ödeme bilgileri: kart metadata (son 4 hane, marka) — hassas veri saklanmaz</li>
        <li>Teknik veri: IP adresi, tarayıcı tipi, cihaz bilgisi (log amaçlı)</li>
      </ul>
      <h2 className="h-3">Çerezler</h2>
      <p>
        Sitemiz yalnızca oturum ve sepet durumunu saklamak için gerekli çerezleri kullanır. Üçüncü
        taraf analiz veya reklam çerezi kullanılmaz.
      </p>
      <h2 className="h-3">Üçüncü taraf hizmetler</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Ödeme aracısı (PCI-DSS uyumlu sanal POS sağlayıcısı)</li>
        <li>Kargo firmaları (siparişin teslimatı için)</li>
        <li>E-fatura entegratörü (yasal belge düzenleme için)</li>
      </ul>
      <p className="text-ek-ink-3 text-sm">
        Hangi servis sağlayıcılarla çalıştığımız hakkında güncel bilgi için{" "}
        <a href={`mailto:${company.email}`} className="text-ek-terra-2 hover:underline">
          {company.email}
        </a>{" "}
        adresinden bize ulaşabilirsiniz.
      </p>
      <h2 className="h-3">Veri güvenliği</h2>
      <p>
        Site trafiği TLS 1.3 ile şifrelenir. Şifreler modern hash algoritmalarıyla saklanır.
        Veritabanı sunucularımız Avrupa Birliği sınırları içinde barındırılır ve düzenli yedeklenir.
      </p>
      <h2 className="h-3">Haklarınız</h2>
      <p>
        KVKK 11. madde kapsamında verilerinize erişim, düzeltme, silme ve işlemeye itiraz
        haklarınızı kullanmak için{" "}
        <a href={`mailto:${company.kvkkEmail}`} className="text-ek-terra-2 hover:underline">
          {company.kvkkEmail}
        </a>{" "}
        adresine başvurabilirsiniz.
      </p>
    </StaticPage>
  );
}
