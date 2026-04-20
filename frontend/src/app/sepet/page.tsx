"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ekim/container";
import { EmptyState } from "@/components/ekim/empty-state";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatTL } from "@/lib/format";
import { cartTotals, useCart } from "@/store/cart";

export default function CartPage() {
  const { items, removeItem, updateQty } = useCart();
  const { subtotal, shipping, total, freeShippingDelta } = cartTotals(items);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          <div className="mono mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-ek-ink">
              Ana sayfa
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-ek-ink">Sepetim</span>
          </div>
          <h1 className="h-1 mb-8">
            Sepetim <span className="text-ek-ink-3 font-serif text-2xl">({items.length})</span>
          </h1>

          {items.length === 0 ? (
            <EmptyState
              title="Sepetin boş"
              description="Beğendiğin ürünleri eklediğinde burada görürsün."
              action={{ label: "Mağazaya git", href: "/kategori/all" }}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              <div className="border-ek-line-2 bg-ek-bg-card divide-y divide-[var(--ek-line-2)] rounded-xl border">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 p-5">
                    <div className="w-24 shrink-0 overflow-hidden rounded-md md:w-32">
                      <Placeholder tone={toneForProduct(String(item.productId))} ratio="1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/urun/${item.slug}`} className="hover:text-ek-terra font-medium">
                            {item.name}
                          </Link>
                          <div className="mono mt-1 flex flex-wrap gap-2">
                            {item.size && <span>Beden: {item.size}</span>}
                            {item.color && <span>· Renk: {item.color}</span>}
                            {item.personalization?.text && (
                              <span>· Yazı: {item.personalization.text}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-ek-ink-4 hover:text-ek-warn p-1"
                          aria-label="Kaldır"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="border-ek-line flex items-center gap-2 rounded-full border">
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            className="hover:bg-ek-bg-elevated flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-6 text-center text-sm">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            className="hover:bg-ek-bg-elevated flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="font-serif text-xl">{formatTL(item.price * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6 lg:sticky lg:top-[120px] lg:self-start">
                <h2 className="h-3 mb-4">Sipariş özeti</h2>

                {freeShippingDelta > 0 && (
                  <div className="bg-ek-cream mb-4 rounded-md px-3 py-2 text-xs">
                    Ücretsiz kargo için <strong>{formatTL(freeShippingDelta)}</strong> daha ekle.
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ek-ink-3">Ara toplam</span>
                    <span>{formatTL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ek-ink-3">Kargo</span>
                    <span>{shipping === 0 ? "Ücretsiz" : formatTL(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ek-ink-3">KDV (dahil)</span>
                    <span>—</span>
                  </div>
                  <div className="border-ek-line-2 mt-3 flex justify-between border-t pt-3 text-base font-medium">
                    <span>Toplam</span>
                    <span className="font-serif text-2xl">{formatTL(total)}</span>
                  </div>
                </div>

                <div className="border-ek-line-2 mt-5 border-t pt-5">
                  <div className="eyebrow mb-2">İNDİRİM KODU</div>
                  <div className="flex gap-2">
                    <input
                      placeholder="Kodu gir"
                      className="border-ek-line bg-ek-bg-elevated flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <button className="border-ek-line hover:border-ek-ink rounded-md border px-4 text-sm">
                      Uygula
                    </button>
                  </div>
                </div>

                <Link
                  href="/odeme"
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream mt-5 flex w-full items-center justify-center rounded-full py-3 text-sm font-medium"
                >
                  Güvenli ödemeye geç →
                </Link>
                <div className="mono mt-3 flex justify-center gap-4">VISA · MC · HAVALE · KAPIDA</div>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
