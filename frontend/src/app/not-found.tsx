import Link from "next/link";
import { Container } from "@/components/ekim/container";

export default function NotFound() {
  return (
    <Container as="main" className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="font-serif text-[clamp(96px,18vw,200px)] leading-none">404</div>
      <h1 className="h-2 mt-6 mb-4">Aradığın sayfayı bulamadık.</h1>
      <p className="text-ek-ink-3 mb-8 max-w-md">
        Link kırılmış ya da ürün kaldırılmış olabilir. Kategorilere göz atmak istersen:
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="bg-ek-forest text-ek-cream rounded-full px-6 py-3 text-sm font-medium hover:bg-ek-forest-2 transition-colors"
        >
          Ana sayfa
        </Link>
        <Link
          href="/kategori/all"
          className="border-ek-line hover:border-ek-ink rounded-full border px-6 py-3 text-sm font-medium transition-colors"
        >
          Mağazayı gez
        </Link>
      </div>
    </Container>
  );
}
