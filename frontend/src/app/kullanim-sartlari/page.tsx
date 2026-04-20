import { StaticPage } from "@/components/ekim/static-page";

export const metadata = { title: "Kullanım Şartları" };

export default function TermsPage() {
  return (
    <StaticPage title="Kullanım şartları" eyebrow="YASAL" updated="01 Nisan 2026">
      <p>
        Bu siteyi kullanarak aşağıdaki şartları kabul etmiş sayılırsın. Devamlı güncellenebilir;
        önemli değişikliklerde bildirim yapılır.
      </p>
      <h2 className="h-3">Hesap</h2>
      <p>
        Hesabının güvenliğinden sen sorumlusun. Şifreni kimseyle paylaşma, şüpheli aktiviteyi
        destek ekibine bildir.
      </p>
      <h2 className="h-3">Fikri mülkiyet</h2>
      <p>
        Sitedeki tüm görsel, yazı ve logo Ekim Craft&apos;a aittir. İzinsiz kopyalanamaz.
      </p>
      <h2 className="h-3">Sorumluluk reddi</h2>
      <p>
        Kişiye özel ürünlerde alıcının yüklediği içeriğin doğruluğu alıcıya aittir. Telif hakkı
        ihlali içeren içerikler üretilmez.
      </p>
    </StaticPage>
  );
}
