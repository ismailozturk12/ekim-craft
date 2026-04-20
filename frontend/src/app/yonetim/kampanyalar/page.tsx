"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KPICard } from "@/components/ekim/kpi-card";
import { StatusPill } from "@/components/ekim/status-pill";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDateShort, formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface Coupon {
  id: number;
  code: string;
  name: string;
  type: "percent" | "fixed" | "free_ship";
  value: string;
  min_order: string;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  usage_percent: number | null;
  created_at: string;
}

const TYPE_LABEL: Record<Coupon["type"], string> = {
  percent: "Yüzde",
  fixed: "Sabit",
  free_ship: "Ücretsiz kargo",
};

export default function CampaignsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/core/admin/coupons/");
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const data = await res.json();
      setCoupons(data.results ?? data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing({
      id: 0,
      code: "",
      name: "",
      type: "percent",
      value: "10",
      min_order: "0",
      usage_limit: null,
      used_count: 0,
      starts_at: null,
      expires_at: null,
      is_active: true,
      usage_percent: null,
      created_at: "",
    });
    setOpen(true);
  };

  const edit = (c: Coupon) => {
    setEditing({ ...c });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const payload = {
      code: editing.code,
      name: editing.name,
      type: editing.type,
      value: editing.value,
      min_order: editing.min_order,
      usage_limit: editing.usage_limit,
      starts_at: editing.starts_at,
      expires_at: editing.expires_at,
      is_active: editing.is_active,
    };
    const isNew = editing.id === 0;
    const res = await authedFetch(
      isNew ? "/core/admin/coupons/" : `/core/admin/coupons/${editing.code}/`,
      {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success(isNew ? "Kupon oluşturuldu" : "Kupon güncellendi");
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (code: string) => {
    if (!confirm(`${code} kuponunu sil?`)) return;
    const res = await authedFetch(`/core/admin/coupons/${code}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Silindi");
    load();
  };

  const totalUses = coupons.reduce((s, c) => s + c.used_count, 0);
  const activeCount = coupons.filter((c) => c.is_active).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="h-2">Kampanyalar</h1>
          <p className="text-ek-ink-3 text-sm">{coupons.length} kupon · {activeCount} aktif</p>
        </div>
        <button
          onClick={startNew}
          className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          <Plus size={14} /> Yeni kampanya
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KPICard label="AKTİF KUPON" value={activeCount} />
        <KPICard label="TOPLAM KULLANIM" value={totalUses} tone="terra" />
        <KPICard label="YÜZDE İNDİRİM" value={coupons.filter((c) => c.type === "percent").length} />
        <KPICard
          label="KARGO HEDİYE"
          value={coupons.filter((c) => c.type === "free_ship").length}
          tone="forest"
        />
      </div>

      <div className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
        {loading ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
        ) : coupons.length === 0 ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Kupon yok. Yeni kampanya oluştur.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3 text-right">Min sepet</th>
                <th className="px-4 py-3">Kullanım</th>
                <th className="px-4 py-3">Bitiş</th>
                <th className="px-4 py-3 text-right">Durum</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ek-line-2)]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-ek-bg-elevated">
                  <td
                    onClick={() => edit(c)}
                    className="cursor-pointer px-4 py-3 font-mono text-sm"
                  >
                    {c.code}
                  </td>
                  <td className="px-4 py-3">
                    {TYPE_LABEL[c.type]}{" "}
                    {c.type === "percent"
                      ? `%${c.value}`
                      : c.type === "fixed"
                        ? formatTL(parseFloat(c.value))
                        : ""}
                  </td>
                  <td className="px-4 py-3 text-right">{formatTL(parseFloat(c.min_order))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-ek-bg-elevated h-1.5 w-24 overflow-hidden rounded-full">
                        <div
                          className="bg-ek-terra h-full"
                          style={{ width: `${c.usage_percent ?? (c.used_count > 0 ? 100 : 0)}%` }}
                        />
                      </div>
                      <span className="mono">
                        {c.used_count}
                        {c.usage_limit ? `/${c.usage_limit}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 mono">
                    {c.expires_at ? formatDateShort(c.expires_at) : "süresiz"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill variant={c.is_active ? "success" : "neutral"}>
                      {c.is_active ? "Aktif" : "Pasif"}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(c.code)}
                      className="text-ek-ink-3 hover:text-ek-warn p-1.5"
                      aria-label="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-ek-bg-elevated max-w-md p-0">
          {editing && (
            <>
              <header className="border-ek-line-2 flex items-center justify-between border-b px-5 py-4">
                <h3 className="h-3">{editing.id === 0 ? "Yeni kampanya" : `Düzenle · ${editing.code}`}</h3>
                <button onClick={() => setOpen(false)} className="text-ek-ink-3">
                  <X size={18} />
                </button>
              </header>
              <div className="space-y-3 p-5">
                <Field
                  label="KOD"
                  value={editing.code}
                  onChange={(v) => setEditing((p) => (p ? { ...p, code: v.toUpperCase() } : p))}
                  placeholder="BAHAR25"
                />
                <Field
                  label="AD (opsiyonel)"
                  value={editing.name}
                  onChange={(v) => setEditing((p) => (p ? { ...p, name: v } : p))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mono mb-1 block">TİP</label>
                    <select
                      value={editing.type}
                      onChange={(e) =>
                        setEditing((p) => (p ? { ...p, type: e.target.value as Coupon["type"] } : p))
                      }
                      className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="percent">Yüzde (%)</option>
                      <option value="fixed">Sabit tutar (TL)</option>
                      <option value="free_ship">Ücretsiz kargo</option>
                    </select>
                  </div>
                  <Field
                    label="DEĞER"
                    value={editing.value}
                    onChange={(v) => setEditing((p) => (p ? { ...p, value: v } : p))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="MİN SEPET"
                    value={editing.min_order}
                    onChange={(v) => setEditing((p) => (p ? { ...p, min_order: v } : p))}
                  />
                  <Field
                    label="KULLANIM LİMİTİ"
                    value={editing.usage_limit?.toString() ?? ""}
                    placeholder="sınırsız"
                    onChange={(v) =>
                      setEditing((p) => (p ? { ...p, usage_limit: v ? parseInt(v) : null } : p))
                    }
                  />
                </div>
                <Field
                  label="BİTİŞ (YYYY-MM-DD)"
                  value={editing.expires_at ? editing.expires_at.slice(0, 10) : ""}
                  placeholder="2026-12-31"
                  onChange={(v) =>
                    setEditing((p) => (p ? { ...p, expires_at: v ? `${v}T23:59:59Z` : null } : p))
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) =>
                      setEditing((p) => (p ? { ...p, is_active: e.target.checked } : p))
                    }
                  />
                  Aktif
                </label>
              </div>
              <footer className="border-ek-line-2 flex gap-2 border-t p-4">
                <button
                  onClick={() => setOpen(false)}
                  className="border-ek-line flex-1 rounded-full border py-2 text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={save}
                  className="bg-ek-forest text-ek-cream flex-1 rounded-full py-2 text-sm"
                >
                  Kaydet
                </button>
              </footer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mono mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}
