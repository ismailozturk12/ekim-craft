"use client";

import { CheckCircle2, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { EmptyState } from "@/components/ekim/empty-state";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { API_URL } from "@/lib/api/client";
import { formatTL } from "@/lib/format";
import { cartTotals, useCart } from "@/store/cart";

export default function CartPage() {
  const { items, removeItem, updateQty, coupon, applyCoupon, removeCoupon } = useCart();
  const { subtotal, shipping, discount, total, freeShippingDelta } = cartTotals(items, coupon);
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setApplying(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/coupons/validate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.detail ?? "Geçersiz kod");
        return;
      }
      applyCoupon({
        code: data.code,
        name: data.name,
        type: data.type,
        discount: parseFloat(data.discount),
        free_shipping: data.free_shipping,
      });
      setCouponInput("");
      toast.success(`${data.code} kodu uygulandı`);
    } catch {
      toast.error("Kupon doğrulanamadı");
    } finally {
      setApplying(false);
    }
  };

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
                  {coupon && discount > 0 && (
                    <div className="text-ek-ok flex justify-between">
                      <span>İndirim ({coupon.code})</span>
                      <span>−{formatTL(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-ek-ink-3">Kargo</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-ek-ok">Ücretsiz{coupon?.free_shipping && " (kupon)"}</span>
                      ) : (
                        formatTL(shipping)
                      )}
                    </span>
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
                  {coupon ? (
                    <div className="bg-ek-ok/10 border-ek-ok/30 flex items-center justify-between rounded-md border px-3 py-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-ek-ok" />
                        <span className="font-medium">{coupon.code}</span>
                        <span className="text-ek-ink-3 text-xs">{coupon.name}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-ek-ink-3 hover:text-ek-warn"
                        aria-label="Kuponu kaldır"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyCoupon();
                        }}
                        placeholder="Kodu gir"
                        autoCapitalize="characters"
                        className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest flex-1 rounded-md border px-3 py-2 text-sm uppercase outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponInput.trim()}
                        className="border-ek-line hover:border-ek-ink flex items-center gap-1.5 rounded-md border px-4 text-sm disabled:opacity-40"
                      >
                        {applying && <Loader2 size={12} className="animate-spin" />}
                        Uygula
                      </button>
                    </div>
                  )}
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
