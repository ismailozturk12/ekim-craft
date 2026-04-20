"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusPill, orderStatusVariant } from "@/components/ekim/status-pill";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatDateShort, formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface OrderRow {
  id: number;
  number: string;
  status: string;
  payment_method: string;
  shipping_method: string;
  total: string;
  currency: string;
  tracking_number: string;
  carrier: string;
  created_at: string;
  items_count: number;
}

interface OrderDetail extends OrderRow {
  payment_status: string;
  shipping_address: { name?: string; phone?: string; email?: string; line?: string; city?: string };
  subtotal: string;
  shipping_cost: string;
  discount: string;
  tax: string;
  estimated_delivery: string | null;
  note: string;
  items: Array<{
    id: number;
    name_snapshot: string;
    size_snapshot: string;
    color_snapshot: string;
    qty: number;
    unit_price: string;
    personalization: Record<string, unknown>;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    status: string;
    note: string;
    created_at: string;
  }>;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Beklemede" },
  { value: "paid", label: "Ödendi" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "in_production", label: "Üretimde" },
  { value: "shipped", label: "Kargoya verildi" },
  { value: "delivered", label: "Teslim edildi" },
  { value: "cancelled", label: "İptal" },
  { value: "refunded", label: "İade" },
];
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]));

const CARRIER_OPTIONS = ["Aras", "MNG", "Yurtiçi", "PTT", "UPS"];

const FILTERS = [
  { id: "all", label: "Hepsi" },
  { id: "pending", label: "Bekleyenler" },
  { id: "in_production", label: "Üretimde" },
  { id: "shipped", label: "Kargoda" },
  { id: "delivered", label: "Teslim" },
  { id: "cancelled", label: "İptal" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/orders/?page_size=100");
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const data = await res.json();
      setOrders(data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openDetail = async (number: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await authedFetch(`/orders/${number}/`);
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      setDetail(await res.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const updateOrder = async (patch: Partial<OrderDetail>) => {
    if (!detail) return;
    const res = await authedFetch(`/orders/${detail.number}/`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    const updated = await res.json();
    setDetail(updated);
    setOrders((list) => list.map((o) => (o.number === updated.number ? { ...o, ...updated } : o)));
    toast.success("Sipariş güncellendi");
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !`${o.number} ${o.total}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8">
      <h1 className="h-2 mb-2">Siparişler</h1>
      <p className="text-ek-ink-3 mb-6 text-sm">
        {orders.length} toplam · {filtered.length} gösteriliyor
      </p>

      <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const count =
                f.id === "all" ? orders.length : orders.filter((o) => o.status === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                    (filter === f.id
                      ? "bg-ek-ink text-ek-cream border-ek-ink"
                      : "border-ek-line hover:border-ek-ink-3")
                  }
                >
                  {f.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="border-ek-line bg-ek-bg-elevated flex items-center gap-2 rounded-full border px-3 py-1.5">
              <Search size={14} className="text-ek-ink-3" />
              <input
                placeholder="Sipariş no..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-48 bg-transparent text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Sipariş yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 pr-4">Sipariş</th>
                <th className="py-3 pr-4">Tarih</th>
                <th className="py-3 pr-4">Ürün</th>
                <th className="py-3 pr-4">Kargo</th>
                <th className="py-3 pr-4 text-right">Tutar</th>
                <th className="py-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ek-line-2)]">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => openDetail(o.number)}
                  className="hover:bg-ek-bg-elevated cursor-pointer"
                >
                  <td className="py-3 pr-4 font-mono text-xs">{o.number}</td>
                  <td className="py-3 pr-4">{formatDateShort(o.created_at)}</td>
                  <td className="py-3 pr-4">{o.items_count}</td>
                  <td className="py-3 pr-4">
                    {o.tracking_number ? (
                      <span className="mono">{o.tracking_number}</span>
                    ) : (
                      <span className="text-ek-ink-4">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-serif">
                    {formatTL(parseFloat(o.total))}
                  </td>
                  <td className="py-3 text-right">
                    <StatusPill variant={orderStatusVariant(STATUS_LABEL[o.status] ?? o.status)}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={!!detail || detailLoading} onOpenChange={(o) => (o ? null : setDetail(null))}>
        <SheetContent
          side="right"
          className="!bg-[var(--ek-bg-elevated)] flex w-full flex-col !gap-0 !p-0 sm:max-w-[560px] shadow-2xl"
        >
          {detailLoading && (
            <div className="text-ek-ink-3 flex flex-1 items-center justify-center">Yükleniyor...</div>
          )}
          {detail && (
            <>
              <header className="border-ek-line-2 flex items-start justify-between gap-3 border-b px-6 py-5">
                <div>
                  <div className="font-mono text-xs">{detail.number}</div>
                  <h2 className="h-3 mt-1">
                    {detail.shipping_address?.name} · {formatTL(parseFloat(detail.total))}
                  </h2>
                  <div className="mono mt-1">{formatDateShort(detail.created_at)}</div>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="text-ek-ink-3 hover:text-ek-ink p-1"
                  aria-label="Kapat"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <section className="border-ek-line-2 bg-ek-bg-card rounded-lg border p-4">
                  <div className="eyebrow mb-3">DURUM YÖNETİMİ</div>
                  <div className="mb-3">
                    <label className="mono mb-1 block">Durum</label>
                    <select
                      value={detail.status}
                      onChange={(e) => updateOrder({ status: e.target.value })}
                      className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mono mb-1 block">Kargo firması</label>
                      <select
                        value={detail.carrier || ""}
                        onChange={(e) => updateOrder({ carrier: e.target.value })}
                        className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
                      >
                        <option value="">—</option>
                        {CARRIER_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mono mb-1 block">Takip no</label>
                      <input
                        defaultValue={detail.tracking_number}
                        onBlur={(e) => {
                          if (e.target.value !== detail.tracking_number) {
                            updateOrder({ tracking_number: e.target.value });
                          }
                        }}
                        placeholder="1Z284..."
                        className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="border-ek-line-2 bg-ek-bg-card rounded-lg border p-4">
                  <div className="eyebrow mb-3">ÜRÜNLER ({detail.items.length})</div>
                  <div className="space-y-2">
                    {detail.items.map((it) => (
                      <div key={it.id} className="flex items-start gap-3 text-sm">
                        <div className="text-ek-ink-3 w-8 shrink-0">{it.qty}×</div>
                        <div className="flex-1">
                          <div className="font-medium">{it.name_snapshot}</div>
                          <div className="mono">
                            {[it.size_snapshot, it.color_snapshot].filter(Boolean).join(" · ")}
                          </div>
                          {Object.keys(it.personalization || {}).length > 0 && (
                            <div className="text-ek-terra-2 mt-1 text-xs">
                              ✦ Kişiye özel{" "}
                              {Object.entries(it.personalization)
                                .filter(([, v]) => !!v)
                                .map(([k]) => k)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="font-serif">
                          {formatTL(parseFloat(it.unit_price) * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-ek-line-2 mt-4 space-y-1 border-t pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ek-ink-3">Ara toplam</span>
                      <span>{formatTL(parseFloat(detail.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ek-ink-3">Kargo</span>
                      <span>
                        {parseFloat(detail.shipping_cost) === 0
                          ? "Ücretsiz"
                          : formatTL(parseFloat(detail.shipping_cost))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--ek-line-2)] pt-2 font-medium">
                      <span>Toplam</span>
                      <span className="font-serif text-base">
                        {formatTL(parseFloat(detail.total))}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="border-ek-line-2 bg-ek-bg-card rounded-lg border p-4">
                  <div className="eyebrow mb-3">MÜŞTERİ</div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{detail.shipping_address?.name}</div>
                    <div className="mono">{detail.shipping_address?.phone}</div>
                    {detail.shipping_address?.email && (
                      <div className="mono">{detail.shipping_address.email}</div>
                    )}
                    <div className="text-ek-ink-3 pt-1">
                      {detail.shipping_address?.line}, {detail.shipping_address?.city}
                    </div>
                  </div>
                </section>

                <section className="border-ek-line-2 bg-ek-bg-card rounded-lg border p-4">
                  <div className="eyebrow mb-3">GEÇMİŞ ({detail.events.length})</div>
                  <div className="space-y-3">
                    {detail.events.map((e) => (
                      <div key={e.id} className="flex gap-3 text-sm">
                        <div className="mono w-24 shrink-0 pt-0.5">
                          {new Date(e.created_at).toLocaleString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="bg-ek-terra mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                        <div className="flex-1">
                          <div className="font-medium">{e.event_type}</div>
                          <div className="text-ek-ink-3 text-xs">{e.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
