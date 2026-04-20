"use client";

import { AlertCircle, Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch } from "@/store/auth";

const REASONS: Array<{ value: string; label: string; helper?: string }> = [
  { value: "damaged", label: "Hasarlı / kusurlu geldi" },
  { value: "wrong_item", label: "Yanlış ürün gönderildi" },
  { value: "not_as_described", label: "Açıklamayla uyuşmuyor" },
  { value: "size", label: "Beden / ölçü uygun değil" },
  { value: "changed_mind", label: "Vazgeçtim / fikrim değişti" },
  { value: "other", label: "Diğer" },
];

const RESOLUTIONS: Array<{ value: string; label: string; helper: string }> = [
  { value: "refund", label: "Para iadesi", helper: "Ödeme yönteminize iade" },
  { value: "exchange", label: "Değişim", helper: "Aynı ürün, farklı beden/renk" },
  { value: "store_credit", label: "Mağaza kredisi", helper: "Gelecek siparişte kullan" },
];

interface OrderItem {
  id: number;
  name_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  qty: number;
  unit_price: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderNumber: string;
  onSuccess?: () => void;
}

export function ReturnRequestDialog({ open, onOpenChange, orderNumber, onSuccess }: Props) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<number, number>>({});
  const [reason, setReason] = useState<string>("");
  const [resolution, setResolution] = useState<string>("refund");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setReason("");
    setResolution("refund");
    setNote("");
    setError(null);
    (async () => {
      setLoading(true);
      try {
        const res = await authedFetch(`/orders/${orderNumber}/`);
        if (!res.ok) {
          setError(await apiErrorMessage(res));
          setItems([]);
          return;
        }
        const data = await res.json();
        setItems(data.items ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, orderNumber]);

  const setQty = (id: number, qty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const totalAmount = Object.entries(selected).reduce((sum, [id, qty]) => {
    const it = items.find((x) => x.id === Number(id));
    if (!it) return sum;
    return sum + parseFloat(it.unit_price) * qty;
  }, 0);

  const selectedCount = Object.values(selected).reduce((s, q) => s + q, 0);
  const canSubmit = selectedCount > 0 && reason !== "";

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await authedFetch("/orders/returns/", {
        method: "POST",
        body: JSON.stringify({
          order_number: orderNumber,
          reason,
          resolution,
          customer_note: note,
          items: Object.entries(selected).map(([order_item_id, qty]) => ({
            order_item_id: Number(order_item_id),
            qty,
          })),
        }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("İade talebiniz alındı. E-posta ile bilgi verilecek.");
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!bg-[var(--ek-bg-elevated)] flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden border-0 p-0 !gap-0 shadow-2xl sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">İade talebi oluştur</DialogTitle>

        <header className="border-ek-line-2 px-5 py-4 sm:px-6">
          <div className="eyebrow">İADE TALEBİ</div>
          <h2 className="h-3 mt-1">#{orderNumber}</h2>
          <p className="text-ek-ink-3 mt-1 text-xs">
            İade etmek istediğin kalemleri ve nedeni seç. Talebin yönetime iletilecek.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto border-t border-ek-line-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-ek-ink-3">
              <Loader2 size={16} className="animate-spin" />
              Sipariş yükleniyor...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <AlertCircle size={24} className="text-ek-warn" />
              <div className="text-sm">{error}</div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-ek-ink-3">
              Bu siparişte iade edilebilir kalem yok
            </div>
          ) : (
            <div className="space-y-5 p-5 sm:p-6">
              {/* Items picker */}
              <section>
                <div className="label mb-3">Ürünler</div>
                <ul className="space-y-2">
                  {items.map((it) => {
                    const qty = selected[it.id] ?? 0;
                    const active = qty > 0;
                    return (
                      <li
                        key={it.id}
                        className={cn(
                          "border-ek-line rounded-lg border p-3 transition-colors",
                          active && "border-ek-ink bg-ek-bg",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{it.name_snapshot}</div>
                            <div className="mono mt-0.5 text-ek-ink-3">
                              {[it.size_snapshot, it.color_snapshot].filter(Boolean).join(" · ")}
                              {it.size_snapshot || it.color_snapshot ? " · " : ""}
                              {formatTL(parseFloat(it.unit_price))} / adet · satın alınan {it.qty}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setQty(it.id, Math.max(0, qty - 1))}
                              disabled={qty === 0}
                              className="border-ek-line bg-ek-bg hover:border-ek-ink disabled:opacity-40 flex h-7 w-7 items-center justify-center rounded-full border"
                              aria-label="Azalt"
                            >
                              <Minus size={12} />
                            </button>
                            <div className="w-6 text-center text-sm font-medium">{qty}</div>
                            <button
                              type="button"
                              onClick={() => setQty(it.id, Math.min(it.qty, qty + 1))}
                              disabled={qty >= it.qty}
                              className="border-ek-line bg-ek-bg hover:border-ek-ink disabled:opacity-40 flex h-7 w-7 items-center justify-center rounded-full border"
                              aria-label="Artır"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Reason */}
              <section>
                <div className="label mb-3">İade nedeni</div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={cn(
                        "border-ek-line hover:border-ek-ink-3 flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        reason === r.value && "border-ek-ink bg-ek-bg",
                      )}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="mt-0.5"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Resolution */}
              <section>
                <div className="label mb-3">Çözüm tercihin</div>
                <div className="grid gap-1.5 sm:grid-cols-3">
                  {RESOLUTIONS.map((r) => (
                    <label
                      key={r.value}
                      className={cn(
                        "border-ek-line hover:border-ek-ink-3 flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        resolution === r.value && "border-ek-ink bg-ek-bg",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="resolution"
                          value={r.value}
                          checked={resolution === r.value}
                          onChange={() => setResolution(r.value)}
                        />
                        <span className="font-medium">{r.label}</span>
                      </div>
                      <span className="text-ek-ink-3 pl-5 text-[11px]">{r.helper}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Note */}
              <section>
                <label className="label mb-3 block">Açıklama (opsiyonel)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Yaşadığın sorunu birkaç cümleyle anlat..."
                  className="border-ek-line bg-ek-bg focus:border-ek-forest w-full resize-none rounded-md border px-3 py-2 text-sm outline-none"
                  maxLength={500}
                />
                <div className="text-ek-ink-3 mt-1 text-right text-[10px]">
                  {note.length}/500
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-ek-line-2 bg-ek-bg-elevated flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm">
            <div className="text-ek-ink-3 text-[11px] uppercase tracking-wider">Tahmini iade</div>
            <div className="font-serif text-xl">{formatTL(totalAmount)}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="border-ek-line hover:border-ek-ink-3 rounded-full border px-4 py-2.5 text-sm"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || submitting}
              className="bg-ek-ink text-ek-cream hover:bg-ek-forest flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Talebi gönder
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
