"use client";

import { AlertCircle, ChevronDown, ChevronUp, Package, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { StatusPill } from "@/components/ekim/status-pill";
import type { ApiReturnDetail, ApiReturnListItem } from "@/lib/api/client";
import { formatDateShort, formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch, useAuthHydrated } from "@/store/auth";

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

export default function ReturnsPage() {
  const hydrated = useAuthHydrated();
  const [items, setItems] = useState<ApiReturnListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ApiReturnDetail>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/orders/returns/");
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
    if (hydrated) load();
  }, [hydrated]);

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

  const cancel = async (number: string) => {
    if (!confirm(`${number} numaralı iade talebini iptal etmek istediğine emin misin?`)) return;
    const res = await authedFetch(`/orders/returns/${number}/cancel/`, { method: "POST" });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("İade talebi iptal edildi");
    setDetails({});
    load();
  };

  if (loading) {
    return (
      <div>
        <h1 className="h-1 mb-6">İadelerim</h1>
        <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="h-1 mb-6">İadelerim</h1>
        <EmptyState
          title="Henüz iade talebin yok"
          description="Siparişlerinden iade açabilirsin."
          action={{ label: "Siparişlerim", href: "/hesap/siparisler" }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="h-1 mb-6">İadelerim</h1>
      <div className="space-y-3">
        {items.map((r) => {
          const isOpen = expanded === r.number;
          const detail = details[r.number];
          const canCancel = r.status === "pending" || r.status === "approved";
          return (
            <div key={r.id} className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
              <button
                type="button"
                onClick={() => toggle(r.number)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:opacity-90"
              >
                <div className="min-w-0 flex-1">
                  <div className="eyebrow mb-1">{r.number}</div>
                  <div className="text-sm font-medium">
                    Sipariş{" "}
                    <Link
                      href={`/siparis-basarili/${r.order_number}`}
                      className="text-ek-terra-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      #{r.order_number}
                    </Link>{" "}
                    · {formatDateShort(r.created_at)}
                  </div>
                  <div className="mono mt-1">
                    {r.items_count} kalem · {RESOLUTION_LABEL[r.resolution]} · {REASON_LABEL[r.reason]}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-serif text-xl">{formatTL(parseFloat(r.refund_amount))}</div>
                  <StatusPill variant={STATUS_VARIANT[r.status] ?? "neutral"}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </StatusPill>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-ek-ink-3 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-ek-ink-3 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="border-ek-line-2 bg-ek-bg space-y-4 border-t p-5">
                  {!detail ? (
                    <div className="text-ek-ink-3 text-sm">Yükleniyor...</div>
                  ) : (
                    <>
                      <div>
                        <div className="label mb-2">İade edilen kalemler</div>
                        <ul className="space-y-2">
                          {detail.items.map((it) => (
                            <li
                              key={it.id}
                              className="border-ek-line bg-ek-bg-card flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
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

                      {detail.customer_note && (
                        <div>
                          <div className="label mb-1">Açıklaman</div>
                          <p className="text-sm">{detail.customer_note}</p>
                        </div>
                      )}

                      {detail.admin_note && (
                        <div className="border-ek-terra-2 bg-ek-terra/5 rounded-md border-l-2 p-3">
                          <div className="label mb-1 text-ek-terra-2">YÖNETİM NOTU</div>
                          <p className="text-sm">{detail.admin_note}</p>
                        </div>
                      )}

                      {detail.return_shipping_label && (
                        <a
                          href={detail.return_shipping_label}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                        >
                          <Package size={14} />
                          Kargo etiketini indir
                        </a>
                      )}

                      {detail.tracking_number && (
                        <div className="text-sm">
                          <span className="text-ek-ink-3">Takip no:</span>{" "}
                          <span className="font-mono">{detail.tracking_number}</span>
                        </div>
                      )}

                      {detail.status === "pending" && (
                        <div className="flex items-start gap-2 rounded-md bg-ek-warn/10 p-3 text-sm">
                          <AlertCircle size={14} className="mt-0.5 text-ek-warn shrink-0" />
                          <span>
                            Talebin inceleniyor. Onaylandığında kargo etiketi e-posta ile gönderilecek.
                          </span>
                        </div>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancel(r.number)}
                          className="text-ek-warn hover:underline inline-flex items-center gap-1.5 text-xs"
                        >
                          <XCircle size={12} />
                          İade talebini iptal et
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
