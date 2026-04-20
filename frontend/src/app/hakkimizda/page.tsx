import { Container } from "@/components/ekim/container";
import { Placeholder } from "@/components/ekim/placeholder";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const metadata = { title: "Hakkımızda" };

const STATS = [
  { n: "8 yıl", l: "atölye tecrübesi" },
  { n: "12k+", l: "sipariş" },
  { n: "8.2k", l: "mutlu müşteri" },
  { n: "4.9", l: "ortalama puan" },
];

const VALUES = [
  { t: "El yapımı", d: "Her ürün atölyemizde, elle dokunarak üretilir." },
  { t: "Kişiye özel", d: "İsim, fotoğraf, tasarım — senin gibi biricik." },
  { t: "Sürdürülebilir", d: "FSC sertifikalı ahşap, bitkisel boyalar." },
];

const TEAM = ["Deniz — Atölye sahibi", "Mert — Üretim", "Ayça — Tasarım", "Barış — Kargo"];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mono mb-6">2019'DAN BERİ · İSTANBUL ATÖLYEMİZ</div>
              <h1 className="h-display mb-6">
                Her parça <em>bir hikaye.</em>
              </h1>
              <p className="text-ek-ink-2 leading-relaxed">
                Ekim Craft, küçük bir ev atölyesinde başladı. Bugün üç zanaatkar, dört farklı atölye
                tekniği ve bir tek hedefle çalışıyoruz: kütleden çok özene inanan, tek tek üretilmiş,
                kişiye özel ürünler.
              </p>
            </div>
            <div className="relative h-[420px]">
              <div className="absolute right-0 top-0 w-[70%] overflow-hidden rounded-lg">
                <Placeholder tone="terra" label="atölye" ratio="3 / 4" />
              </div>
              <div className="border-ek-bg absolute bottom-0 left-0 w-[55%] overflow-hidden rounded-lg border-4">
                <Placeholder tone="sage" label="süreç" ratio="1" />
              </div>
            </div>
          </div>
        </Container>

        <section className="bg-ek-bg-elevated py-16">
          <Container>
            <div className="grid gap-8 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-serif text-5xl">{s.n}</div>
                  <div className="mono mt-2">{s.l}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <Container className="py-16">
          <h2 className="h-2 mb-8">Neye inanıyoruz</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.t}
                className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6"
              >
                <div className="bg-ek-cream text-ek-forest mb-4 flex h-10 w-10 items-center justify-center rounded-full font-serif">
                  {v.t[0]}
                </div>
                <h3 className="h-3 mb-2">{v.t}</h3>
                <p className="text-ek-ink-3 text-sm">{v.d}</p>
              </div>
            ))}
          </div>
        </Container>

        <Container className="pb-20">
          <h2 className="h-2 mb-8">Ekibimiz</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {TEAM.map((t, i) => (
              <div key={t} className="text-center">
                <Placeholder
                  tone={(["terra", "sage", "forest", "rose"] as const)[i % 4]}
                  label=""
                  ratio="1"
                  className="mb-3 overflow-hidden rounded-full"
                />
                <div className="mono">{t}</div>
              </div>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
