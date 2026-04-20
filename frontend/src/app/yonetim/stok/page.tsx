"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KPICard } from "@/components/ekim/kpi-card";
import { StatusPill } from "@/components/ekim/status-pill";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface StockRow {
  id: number;
  product_id: number;
  product_name: string;
  category: string;
  size_label: string;
  color_name: string;
  sku: string;
  stock: number;
  sold_30d: number;
  days_left: number | null;
  status: "danger" | "warn" | "success";
}

const STATUS_LABEL: Record<StockRow["status"], string> = {
  danger: "Kritik",
  warn: "Düşük",
  success: "İyi",
};

export default function StockPage() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | StockRow["status"]>("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/core/admin/stock/");
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const data = await res.json();
      setRows(data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStock = async (variantId: number, newStock: number) => {
    const res = await authedFetch(`/core/admin/stock/${variantId}/`, {
      method: "PATCH",
      body: JSON.stringify({ stock: newStock }),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    setRows((xs) => xs.map((r) => (r.id === variantId ? { ...r, stock: newStock } : r)));
    toast.success("Stok güncellendi");
  };

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !`${r.product_name} ${r.category} ${r.size_label} ${r.color_name}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  const counts = {
    danger: rows.filter((r) => r.status === "danger").length,
    warn: rows.filter((r) => r.status === "warn").length,
    success: rows.filter((r) => r.status === "success").length,
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="h-2">Stok</h1>
          <p className="text-ek-ink-3 text-sm">{rows.length} varyant · satış hızına göre tahmin</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard label="KRİTİK (≤5)" value={counts.danger} tone="warn" />
        <KPICard label="DÜŞÜK (6-20)" value={counts.warn} tone="default" />
        <KPICard label="İYİ (>20)" value={counts.success} tone="forest" />
      </div>

      <div className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--ek-line-2)] p-4">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "danger", "warn", "success"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                  (filter === f
                    ? "bg-ek-ink text-ek-cream border-ek-ink"
                    : "border-ek-line hover:border-ek-ink-3")
                }
              >
                {f === "all" ? "Hepsi" : STATUS_LABEL[f]}
                <span className="ml-1 opacity-60">{f === "all" ? rows.length : counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <div className="border-ek-line bg-ek-bg-elevated flex items-center gap-2 rounded-full border px-3 py-1.5">
              <Search size={14} className="text-ek-ink-3" />
              <input
                placeholder="Ürün / varyant..."
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
          <div className="text-ek-ink-3 py-10 text-center text-sm">Varyant yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Ürün / Varyant</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Stok</th>
                <th className="px-4 py-3 text-right">30g satış</th>
                <th className="px-4 py-3 text-right">Kalan gün</th>
                <th className="px-4 py-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ek-line-2)]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-ek-bg-elevated">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.product_name}</div>
                    <div className="mono">
                      {[r.size_label, r.color_name].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ek-ink-3 mono">{r.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      defaultValue={r.stock}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v !== r.stock) updateStock(r.id, v);
                      }}
                      className="border-ek-line bg-ek-bg-elevated w-16 rounded border px-2 py-1 text-right font-serif"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">{r.sold_30d}</td>
                  <td className="px-4 py-3 text-right">
                    {r.days_left == null ? "—" : `${r.days_left}g`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill variant={r.status}>{STATUS_LABEL[r.status]}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
