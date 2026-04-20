"use client";

import { Box, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { KPICard } from "@/components/ekim/kpi-card";
import { Sparkline } from "@/components/ekim/sparkline";
import { StatusPill, orderStatusVariant } from "@/components/ekim/status-pill";
import { formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface DashboardStats {
  today: { revenue: number; orders: number; delta_vs_yesterday: number };
  pending_custom: number;
  last_30d: { revenue: number; delta_vs_prev_30d: number; daily: number[] };
  category_breakdown: Array<{ name: string; slug: string; revenue: number; orders: number }>;
  stock_alerts: Array<{ product_name: string; slug: string; variant: string; stock: number }>;
  recent_orders: Array<{ number: string; customer: string; total: number; status: string; created_at: string }>;
}

const TIMEFRAMES = [
  { id: "today", label: "Bugün" },
  { id: "7d", label: "7g" },
  { id: "30d", label: "30g" },
  { id: "90d", label: "90g" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Beklemede",
  paid: "Ödendi",
  confirmed: "Onaylandı",
  in_production: "Üretimde",
  shipped: "Kargoda",
  delivered: "Teslim",
  cancelled: "İptal",
};

const CAT_COLORS = [
  "var(--ek-terra)",
  "var(--ek-forest)",
  "var(--ek-sage)",
  "var(--ek-ink)",
  "var(--ek-terra-2)",
  "var(--ek-ink-3)",
];

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["id"]>("30d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("/core/admin/dashboard/");
        if (!res.ok) {
          console.error(await apiErrorMessage(res));
          return;
        }
        setStats(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="h-2">Pano</h1>
          <p className="text-ek-ink-3 text-sm">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={
                "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                (timeframe === t.id
                  ? "bg-ek-ink text-ek-cream border-ek-ink"
                  : "border-ek-line hover:border-ek-ink-3")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-ek-ink-3 py-20 text-center text-sm">Yükleniyor...</div>
      ) : !stats ? (
        <div className="text-ek-ink-3 py-20 text-center text-sm">Veri yüklenemedi.</div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <KPICard
              label="BUGÜNKÜ CİRO"
              value={formatTL(stats.today.revenue)}
              delta={stats.today.delta_vs_yesterday}
              hint="vs. dün"
            />
            <KPICard label="BUGÜNKÜ SİPARİŞ" value={stats.today.orders} tone="terra" />
            <KPICard
              label="BEKLEYEN KİŞİYE ÖZEL"
              value={stats.pending_custom}
              tone="warn"
              hint="müşteri bekliyor"
            />
            <KPICard
              label="30G GELİR"
              value={formatTL(stats.last_30d.revenue)}
              delta={stats.last_30d.delta_vs_prev_30d}
              tone="forest"
            />
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="eyebrow mb-1">30 GÜNLÜK GELİR</div>
                  <div className="font-serif text-2xl">{formatTL(stats.last_30d.revenue)}</div>
                </div>
                <StatusPill variant={stats.last_30d.delta_vs_prev_30d >= 0 ? "success" : "danger"}>
                  {stats.last_30d.delta_vs_prev_30d >= 0 ? "+" : ""}
                  {stats.last_30d.delta_vs_prev_30d.toFixed(1)}% vs. önceki 30g
                </StatusPill>
              </div>
              <Sparkline
                data={stats.last_30d.daily.length ? stats.last_30d.daily : [0]}
                height={120}
              />
            </div>

            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
              <div className="eyebrow mb-4">KATEGORİ KIRILIMI (30g)</div>
              {stats.category_breakdown.length === 0 ? (
                <div className="text-ek-ink-3 py-4 text-sm">Veri yok</div>
              ) : (
                <div className="space-y-3">
                  {stats.category_breakdown.map((c, i) => {
                    const max = Math.max(...stats.category_breakdown.map((x) => x.revenue));
                    return (
                      <div key={c.slug}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>{c.name}</span>
                          <span className="font-mono text-xs">{formatTL(c.revenue)}</span>
                        </div>
                        <div className="bg-ek-bg-elevated h-1.5 overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(c.revenue / max) * 100}%`,
                              background: CAT_COLORS[i % CAT_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="h-3">Son siparişler</h2>
                <Link href="/yonetim/siparisler" className="mono hover:text-ek-ink">
                  HEPSİNİ GÖR →
                </Link>
              </div>
              {stats.recent_orders.length === 0 ? (
                <div className="text-ek-ink-3 py-4 text-sm">Sipariş yok</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="pb-3">Sipariş</th>
                      <th className="pb-3">Müşteri</th>
                      <th className="pb-3 text-right">Tutar</th>
                      <th className="pb-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ek-line-2)]">
                    {stats.recent_orders.map((o) => (
                      <tr key={o.number}>
                        <td className="py-3 font-mono text-xs">{o.number}</td>
                        <td className="py-3">{o.customer}</td>
                        <td className="py-3 text-right font-serif">{formatTL(o.total)}</td>
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

            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
              <div className="mb-4 flex items-center gap-2">
                <Box size={16} className="text-ek-warn" />
                <h2 className="h-3">Kritik stok</h2>
              </div>
              {stats.stock_alerts.length === 0 ? (
                <div className="text-ek-ink-3 py-4 text-sm">Kritik stok yok</div>
              ) : (
                <div className="space-y-4">
                  {stats.stock_alerts.map((s, i) => (
                    <div key={i} className="border-ek-line-2 flex items-start justify-between border-b pb-3 last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{s.product_name}</div>
                        <div className="mono mt-0.5">{s.variant}</div>
                      </div>
                      <StatusPill variant={s.stock <= 2 ? "danger" : "warn"}>{s.stock} adet</StatusPill>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/yonetim/stok"
                className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-medium"
              >
                <Package size={13} /> Stok yönetimi
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
