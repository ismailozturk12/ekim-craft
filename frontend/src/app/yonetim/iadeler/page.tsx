"use client";

import { ChevronDown, ChevronUp, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/ekim/status-pill";
import type { ApiReturnDetail, ApiReturnListItem } from "@/lib/api/client";
import { formatDateShort, formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch } from "@/store/auth";

const TABS: Array<{ id: string; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "pending", label: "Bekleyen" },
  { id: "approved", label: "Onaylanan" },
  { id: "received", label: "Teslim alınan" },
  { id: "refunded", label: "İade edilen" },
  { id: "rejected", label: "Reddedilen" },
  { id: "cancelled", label: "İptal" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  received: "Teslim alındı",
  refunded: "İade edildi",
  cancelled: "İptal",
};
const STATUS_VARIANT: Record<string, "warn" | "success" | "danger" | "info" | "neutral"> = {
  pending: "warn",
  approved: "info",
  rejected: "danger",
  received: "info",
  refunded: "success",
  cancelled: "neutral",
};

const RESOLUTION_LABEL: Record<string, string> = {
  refund: "Para iadesi",
  exchange: "Değişim",
  store_credit: "Mağaza kredisi",
};
const REASON_LABEL: Record<string, string> = {
  wrong_item: "Yanlış ürün",
  damaged: "Hasarlı/kusurlu",
  not_as_described: "Açıklamayla uyuşmuyor",
  size: "Beden/ölçü",
  changed_mind: "Vazgeçtim",
  other: "Diğer",
};

export default function AdminReturnsPage() {
  const [tab, setTab] = useState<string>("pending");
  const [items, setItems] = useState<ApiReturnListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ApiReturnDetail>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const qs = tab === "all" ? "" : `?status=${tab}`;
      const res = await authedFetch(`/orders/returns/${qs}`);
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.results ?? data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setExpanded(null);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (number: string) => {
    if (expanded === number) {
      setExpanded(null);
      return;
    }
    setExpanded(number);
    if (!details[number]) {
      const res = await authedFetch(`/orders/returns/${number}/`);
      if (res.ok) {
        const data = (await res.json()) as ApiReturnDetail;
        setDetails((p) => ({ ...p, [number]: data }));
      }
    }
  };

  const patchRequest = async (
    number: string,
    data: Partial<{
      status: string;
      admin_note: string;
      refund_amount: number;
      tracking_number: string;
      return_shipping_label: string;
    }>,
    message?: string,
  ) => {
    setSavingId(number);
    try {
      const res = await authedFetch(`/orders/returns/${number}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const updated = (await res.json()) as ApiReturnDetail;
      setDetails((p) => ({ ...p, [number]: updated }));
      setItems((prev) =>
        prev.map((r) =>
          r.number === number
            ? {
                ...r,
                status: updated.status,
                refund_amount: updated.refund_amount,
              }
            : r,
        ),
      );
      if (message) toast.success(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-ek-bg min-h-full">
      <div className="border-ek-line-2 bg-ek-bg-elevated border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <RotateCcw size={22} className="text-ek-terra-2" />
          <div>
            <h1 className="h-3">İade talepleri</h1>
            <p className="text-ek-ink-3 text-xs">Onayla, reddet veya not ekle.</p>
          </div>
        </div>

        <div className="mono mt-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                tab === t.id
                  ? "bg-ek-ink text-ek-cream border-ek-ink"
                  : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-6">
        {loading ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">
            <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
            Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Talep bulunamadı</div>
        ) : (
          items.map((r) => {
            const isOpen = expanded === r.number;
            const detail = details[r.number];
            return (
              <div
                key={r.id}
                className="border-ek-line-2 bg-ek-bg-elevated overflow-hidden rounded-xl border"
              >
                <button
                  type="button"
                  onClick={() => toggle(r.number)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:opacity-90"
                >
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow mb-1">{r.number}</div>
                    <div className="text-sm font-medium">
                      Sipariş #{r.order_number} · {formatDateShort(r.created_at)}
                    </div>
                    <div className="mono mt-1">
                      {r.items_count} kalem · {RESOLUTION_LABEL[r.resolution]} ·{" "}
                      {REASON_LABEL[r.reason]}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-serif text-lg">{formatTL(parseFloat(r.refund_amount))}</div>
                    <StatusPill variant={STATUS_VARIANT[r.status] ?? "neutral"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </StatusPill>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-ek-ink-3" />
                  ) : (
                    <ChevronDown size={16} className="text-ek-ink-3" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-ek-line-2 border-t p-5">
                    {!detail ? (
                      <div className="text-ek-ink-3 text-sm">Yükleniyor...</div>
                    ) : (
                      <AdminReturnPanel
                        detail={detail}
                        saving={savingId === r.number}
                        onPatch={(data, msg) => patchRequest(r.number, data, msg)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function AdminReturnPanel({
  detail,
  saving,
  onPatch,
}: {
  detail: ApiReturnDetail;
  saving: boolean;
  onPatch: (
    data: Partial<{
      status: string;
      admin_note: string;
      refund_amount: number;
      tracking_number: string;
      return_shipping_label: string;
    }>,
    message?: string,
  ) => void | Promise<void>;
}) {
  const [adminNote, setAdminNote] = useState(detail.admin_note ?? "");
  const [refundAmount, setRefundAmount] = useState(detail.refund_amount);
  const [tracking, setTracking] = useState(detail.tracking_number ?? "");
  const [labelUrl, setLabelUrl] = useState(detail.return_shipping_label ?? "");

  useEffect(() => {
    setAdminNote(detail.admin_note ?? "");
    setRefundAmount(detail.refund_amount);
    setTracking(detail.tracking_number ?? "");
    setLabelUrl(detail.return_shipping_label ?? "");
  }, [detail.id, detail.admin_note, detail.refund_amount, detail.tracking_number, detail.return_shipping_label]);

  const handleStatus = (status: string, label: string) =>
    onPatch({ status, admin_note: adminNote }, `${label} olarak kaydedildi`);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <div>
          <div className="label mb-2">
            Müşteri: {detail.user_email ?? "Misafir"}{" "}
            <Link
              href={`/siparis-basarili/${detail.order_number}`}
              className="text-ek-terra-2 hover:underline ml-2 normal-case"
            >
              Siparişi gör →
            </Link>
          </div>
          {detail.customer_note && (
            <div className="bg-ek-bg border-ek-line rounded-md border p-3 text-sm">
              {detail.customer_note}
            </div>
          )}
        </div>

        <div>
          <div className="label mb-2">Kalemler</div>
          <ul className="space-y-2">
            {detail.items.map((it) => (
              <li
                key={it.id}
                className="border-ek-line bg-ek-bg flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/urun/${it.product_slug}`}
                    className="truncate font-medium hover:underline"
                  >
                    {it.name_snapshot}
                  </Link>
                  <div className="mono mt-0.5 text-ek-ink-3">
                    {[it.size_snapshot, it.color_snapshot].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">× {it.qty}</div>
                  <div className="mono">{formatTL(parseFloat(it.unit_price))}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="space-y-3">
        <div>
          <label className="label mb-1.5 block">Yönetim notu</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            placeholder="Müşteriye iletilecek not..."
            className="border-ek-line bg-ek-bg focus:border-ek-forest w-full resize-none rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label mb-1.5 block">İade tutarı</label>
            <input
              type="number"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="border-ek-line bg-ek-bg focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Takip no</label>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="border-ek-line bg-ek-bg focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="label mb-1.5 block">Kargo etiketi URL</label>
          <input
            type="url"
            value={labelUrl}
            onChange={(e) => setLabelUrl(e.target.value)}
            placeholder="https://..."
            className="border-ek-line bg-ek-bg focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            onPatch(
              {
                admin_note: adminNote,
                refund_amount: parseFloat(refundAmount) || 0,
                tracking_number: tracking,
                return_shipping_label: labelUrl,
              },
              "Değişiklikler kaydedildi",
            )
          }
          className="border-ek-line hover:border-ek-ink disabled:opacity-40 flex w-full items-center justify-center gap-2 rounded-md border py-2 text-sm"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Alanları kaydet
        </button>

        <div className="border-ek-line-2 border-t pt-3">
          <div className="label mb-2">Durum değiştir</div>
          <div className="grid grid-cols-2 gap-2">
            {detail.status === "pending" && (
              <>
                <button
                  disabled={saving}
                  onClick={() => handleStatus("approved", "Onaylandı")}
                  className="bg-ek-ok text-white hover:opacity-90 rounded-md py-2 text-xs font-medium disabled:opacity-40"
                >
                  Onayla
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleStatus("rejected", "Reddedildi")}
                  className="bg-ek-warn text-white hover:opacity-90 rounded-md py-2 text-xs font-medium disabled:opacity-40"
                >
                  Reddet
                </button>
              </>
            )}
            {detail.status === "approved" && (
              <button
                disabled={saving}
                onClick={() => handleStatus("received", "Teslim alındı")}
                className="bg-ek-forest text-white hover:opacity-90 col-span-2 rounded-md py-2 text-xs font-medium disabled:opacity-40"
              >
                Ürün atölyeye ulaştı
              </button>
            )}
            {detail.status === "received" && (
              <button
                disabled={saving}
                onClick={() => handleStatus("refunded", "İade tamamlandı")}
                className="bg-ek-ok text-white hover:opacity-90 col-span-2 rounded-md py-2 text-xs font-medium disabled:opacity-40"
              >
                İadeyi tamamla
              </button>
            )}
            {(detail.status === "rejected" || detail.status === "cancelled") && (
              <div className="text-ek-ink-3 col-span-2 py-2 text-center text-xs">
                Bu talep kapatıldı.
              </div>
            )}
            {detail.status === "refunded" && (
              <div className="text-ek-ok col-span-2 py-2 text-center text-xs">
                ✓ İade tamamlandı
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
