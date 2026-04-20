import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "Gizlilik Politikası" };

export default function GizlilikPage() {
  return (
    <StaticPage title="Gizlilik politikası" eyebrow="YASAL" updated="01 Nisan 2026">
      <p>
        Ekim Craft olarak gizliliğine önem veriyoruz. Topladığımız veriler yalnızca siparişini
        işleme ve sana daha iyi hizmet sunma amaçlıdır.
      </p>
      <h2 className="h-3">Çerezler</h2>
      <p>
        Sitemiz zorunlu ve isteğe bağlı çerezler kullanır. Onayını çerez banner&apos;ı üzerinden
        istiyoruz.
      </p>
      <h2 className="h-3">Üçüncü taraf hizmetler</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Ödeme: iyzico (PCI-DSS uyumlu)</li>
        <li>Kargo: Aras, MNG, Yurtiçi</li>
        <li>E-posta: Resend</li>
        <li>Analitik: Plausible (çerezsiz)</li>
      </ul>
      <h2 className="h-3">Veri güvenliği</h2>
      <p>
        Tüm trafik TLS 1.3 ile şifrelenir, şifreler Argon2id ile saklanır, veritabanı Neon&apos;da
        şifrelenmiş at-rest backup alınır.
      </p>
    </StaticPage>
  );
}
