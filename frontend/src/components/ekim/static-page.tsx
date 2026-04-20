import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function StaticPage({
  title,
  eyebrow,
  updated,
  children,
}: {
  title: string;
  eyebrow?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            {eyebrow && <div className="eyebrow mb-4">{eyebrow}</div>}
            <h1 className="h-1 mb-4">{title}</h1>
            {updated && <p className="mono mb-10">Son güncelleme: {updated}</p>}
            <div className="prose-like text-ek-ink-2 space-y-5 leading-relaxed">{children}</div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
