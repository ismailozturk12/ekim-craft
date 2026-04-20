import Link from "next/link";
import { health } from "@/lib/api/client";

export default async function Home() {
  let backendStatus: string;
  try {
    const h = await health();
    backendStatus = `✓ ${h.service} v${h.version}`;
  } catch {
    backendStatus = "⚠ backend :8000 ulaşılamıyor";
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="container mx-auto max-w-5xl px-10 py-24">
        <div className="eyebrow mb-6">FAZ 0 · KURULUM TAMAM</div>
        <h1 className="h-display mb-8">
          Ekim Craft,
          <br />
          <em>kuruldu.</em>
        </h1>
        <p className="text-ek-ink-2 mb-12 max-w-xl text-lg leading-relaxed">
          Next.js 16 + Tailwind v4 + shadcn/ui + Django 5.2 + DRF.
          <br />
          Faz 1 (design system) ve Faz 2 (DB şeması) sırada.
        </p>

        <div className="border-ek-line bg-ek-bg-elevated mb-8 rounded-lg border p-6">
          <div className="eyebrow mb-2">BACKEND BAĞLANTI</div>
          <div className="font-mono text-sm">{backendStatus}</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="http://localhost:8000/api/docs/"
            className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
          >
            API Docs →
          </Link>
          <Link
            href="http://localhost:8000/admin/"
            className="border-ek-line hover:border-ek-ink-3 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          >
            Django Admin
          </Link>
        </div>
      </section>
    </main>
  );
}
