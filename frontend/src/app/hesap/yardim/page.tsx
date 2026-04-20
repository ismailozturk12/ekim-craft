"use client";

import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Siparişim kaç günde ulaşır?",
    a: "Stokta olan ürünler 1-3 iş gününde kapına gelir. Kişiye özel ürünlerde üretim süresi 2-5 iş günü daha eklenir.",
  },
  {
    q: "İade yapabilir miyim?",
    a: "Kişiye özel olmayan ürünlerde 14 gün koşulsuz iade hakkın var. Kişiye özel ürünler, hatalı üretim dışında iade edilemez.",
  },
  {
    q: "Hediye paketi seçeneği var mı?",
    a: "Evet, sepet sayfasında hediye paketi ekleyebilir ve kişiye özel not bırakabilirsin.",
  },
  {
    q: "Fatura nasıl gönderilir?",
    a: "Sipariş onaylandıktan sonra e-arşiv fatura e-posta adresine otomatik gönderilir. PDF olarak hesap > siparişlerim altından da indirebilirsin.",
  },
  {
    q: "Şifremi unuttum ne yapmalıyım?",
    a: "Giriş sayfasındaki 'Şifremi unuttum' bağlantısı ile e-posta üzerinden sıfırlayabilirsin.",
  },
];

export default function HelpPage() {
  return (
    <div>
      <h1 className="h-1 mb-6">Yardım</h1>

      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <Link
          href="tel:08502000000"
          className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex items-center gap-3 rounded-xl border p-5 transition-colors"
        >
          <div className="bg-ek-cream text-ek-forest flex h-11 w-11 items-center justify-center rounded-full">
            <Phone size={18} />
          </div>
          <div>
            <div className="text-sm font-medium">Telefon</div>
            <div className="mono">0850 200 00 00</div>
          </div>
        </Link>
        <Link
          href="mailto:destek@ekimcraft.com"
          className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex items-center gap-3 rounded-xl border p-5 transition-colors"
        >
          <div className="bg-ek-cream text-ek-forest flex h-11 w-11 items-center justify-center rounded-full">
            <Mail size={18} />
          </div>
          <div>
            <div className="text-sm font-medium">E-posta</div>
            <div className="mono">destek@ekimcraft.com</div>
          </div>
        </Link>
      </div>

      <section>
        <h2 className="h-3 mb-4">Sıkça sorulanlar</h2>
        <Accordion defaultValue={[]}>
          {FAQ.map((q, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger>{q.q}</AccordionTrigger>
              <AccordionContent>
                <p className="text-ek-ink-2">{q.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
