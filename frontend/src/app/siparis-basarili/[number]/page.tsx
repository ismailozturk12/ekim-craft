"use client";

import { Check, Mail, Package } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatDateShort, formatTL } from "@/lib/format";
import { authedFetch, useAuthHydrated } from "@/store/auth";

interface OrderDetail {
  number: string;
  status: string;
  payment_method: string;
  shipping_method: string;
  shipping_address: { name?: string; city?: string; line?: string };
  subtotal: string;
  shipping_cost: string;
  total: string;
  currency: string;
  estimated_delivery: string | null;
  tracking_number: string;
  carrier: string;
  created_at: string;
  items: Array<{
    name_snapshot: string;
    size_snapshot: string;
    color_snapshot: string;
    qty: number;
    unit_price: string;
  }>;
}

const PAYMENT_LABEL: Record<string, string> = {
  card: "Kredi kartı",
  transfer: "Havale / EFT",
  cod: "Kapıda ödeme",
  wallet: "Cüzdan",
};

const SHIPPING_LABEL: Record<string, string> = {
  standard: "Standart",
  express: "Hızlı",
  pickup: "Atölyeden teslim",
};

export default function OrderSuccessPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const hydrated = useAuthHydrated();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const res = await authedFetch(`/orders/${number}/`);
        if (res.ok) {
          setOrder(await res.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, number]);

  const estimated = new Date(Date.now() + 5 * 86400000).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });

  const steps = [
    { id: 1, label: "Sipariş alındı", done: true, time: "şimdi" },
    { id: 2, label: "Ödeme onaylandı", done: order?.status !== "pending", time: order?.status !== "pending" ? "şimdi" : "" },
    { id: 3, label: "Hazırlanıyor", done: false, active: true, time: "3-5 gün" },
    { id: 4, label: "Kargoya verildi", done: false, time: "" },
    { id: 5, label: "Teslim edildi", done: false, time: "" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <div className="mb-12 text-center">
            <div className="bg-ek-ok/15 text-ek-ok mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full">
              <Check size={36} strokeWidth={2} />
            </div>
            <div className="mono mb-2">SİPARİŞİN ALINDI</div>
            <h1 className="h-1 mb-3">Teşekkürler!</h1>
            <p className="text-ek-ink-3 text-lg">
              Sipariş numaran: <strong className="text-ek-ink font-serif">#{number}</strong>
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6 md:p-8">
              <h2 className="h-3 mb-6">Siparişin yolculuğu</h2>
              <div className="space-y-5">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-start gap-4">
                    <div
                      className={
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium " +
                        (s.done
                          ? "bg-ek-forest text-ek-cream"
                          : s.active
                            ? "bg-ek-terra text-white shadow-md shadow-[var(--ek-terra)]/30"
                            : "bg-ek-cream text-ek-ink-3")
                      }
                    >
                      {s.done ? <Check size={16} /> : s.id}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{s.label}</div>
                        {s.time && <div className="mono">{s.time}</div>}
                      </div>
                      {s.active && (
                        <div className="text-ek-terra-2 mt-1 text-sm">
                          Atölyemizde özenle hazırlanıyor.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order && order.items.length > 0 && (
                <div className="border-ek-line-2 mt-8 border-t pt-6">
                  <div className="eyebrow mb-3">SİPARİŞ İÇERİĞİ</div>
                  <div className="space-y-3">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="text-ek-ink-3 w-8 shrink-0">{it.qty}×</div>
                        <div className="flex-1">
                          <div>{it.name_snapshot}</div>
                          <div className="mono">
                            {[it.size_snapshot, it.color_snapshot].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <div className="font-serif">
                          {formatTL(parseFloat(it.unit_price) * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-ek-cream mt-6 flex items-start gap-3 rounded-lg p-4 text-sm">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <div>Her adımda e-posta ve SMS ile haber vereceğiz.</div>
              </div>
            </div>

            <aside className="border-ek-line-2 bg-ek-bg-card h-fit rounded-xl border p-6">
              <h3 className="h-3 mb-4">Özet</h3>
              {loading ? (
                <div className="text-ek-ink-3 py-4 text-sm">Yükleniyor...</div>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ek-ink-3">Sipariş no</dt>
                    <dd className="font-serif">#{number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ek-ink-3">Tarih</dt>
                    <dd>{order ? formatDateShort(order.created_at) : ""}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ek-ink-3">Tahmini teslim</dt>
                    <dd>{estimated}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ek-ink-3">Kargo</dt>
                    <dd>{order ? SHIPPING_LABEL[order.shipping_method] ?? order.shipping_method : ""}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ek-ink-3">Ödeme</dt>
                    <dd>{order ? PAYMENT_LABEL[order.payment_method] ?? order.payment_method : ""}</dd>
                  </div>
                  {order && (
                    <>
                      <div className="border-ek-line-2 border-t pt-3" />
                      <div className="flex justify-between">
                        <dt className="text-ek-ink-3">Ara toplam</dt>
                        <dd>{formatTL(parseFloat(order.subtotal))}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ek-ink-3">Kargo</dt>
                        <dd>
                          {parseFloat(order.shipping_cost) === 0
                            ? "Ücretsiz"
                            : formatTL(parseFloat(order.shipping_cost))}
                        </dd>
                      </div>
                      <div className="border-ek-line-2 flex justify-between border-t pt-3 text-base font-medium">
                        <dt>Toplam</dt>
                        <dd className="font-serif text-xl">{formatTL(parseFloat(order.total))}</dd>
                      </div>
                    </>
                  )}
                </dl>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/hesap/siparisler"
                  className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm"
                >
                  <Package size={16} />
                  Siparişlerim
                </Link>
                <Link
                  href="/kategori/all"
                  className="border-ek-line hover:border-ek-ink flex items-center justify-center rounded-full border py-3 text-sm"
                >
                  Alışverişe devam et
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
