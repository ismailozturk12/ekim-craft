"use client";

import { RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { ReturnRequestDialog } from "@/components/ekim/return-request-dialog";
import { StatusPill, orderStatusVariant } from "@/components/ekim/status-pill";
import { formatDateShort, formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch, useAuthHydrated } from "@/store/auth";

interface OrderRow {
  id: number;
  number: string;
  status: string;
  payment_method: string;
  total: string;
  currency: string;
  tracking_number: string;
  carrier: string;
  created_at: string;
  items_count: number;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Beklemede",
  paid: "Ödendi",
  confirmed: "Onaylandı",
  in_production: "Üretimde",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal",
  refunded: "İade",
};

const CANCELLABLE = ["pending", "paid", "confirmed"];
const RETURNABLE = ["paid", "confirmed", "shipped", "delivered"];

export default function OrdersPage() {
  const hydrated = useAuthHydrated();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnOpen, setReturnOpen] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await authedFetch("/orders/");
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated) load();
  }, [hydrated]);

  const cancel = async (e: React.MouseEvent, number: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`${number} numaralı siparişi iptal etmek istediğine emin misin?`)) return;
    const res = await authedFetch(`/orders/${number}/cancel/`, { method: "POST" });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Sipariş iptal edildi");
    load();
  };

  if (loading) {
    return (
      <div>
        <h1 className="h-1 mb-6">Siparişlerim</h1>
        <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="h-1 mb-6">Siparişlerim</h1>
        <EmptyState
          title="Henüz sipariş yok"
          description="İlk siparişin için mağazaya göz at."
          action={{ label: "Mağazaya git", href: "/kategori/all" }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-1">Siparişlerim</h1>
        <Link
          href="/hesap/iadeler"
          className="border-ek-line hover:border-ek-ink-3 hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:inline-flex"
        >
          <RotateCcw size={12} />
          İadelerim
        </Link>
      </div>
      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/siparis-basarili/${o.number}`}
                className="min-w-0 flex-1 transition-colors hover:opacity-80"
              >
                <div className="eyebrow mb-1">#{o.number}</div>
                <div className="text-sm font-medium">
                  {formatDateShort(o.created_at)} · {o.items_count} ürün
                </div>
                {o.tracking_number && (
                  <div className="mono mt-1">
                    Takip: {o.tracking_number} · {o.carrier}
                  </div>
                )}
              </Link>
              <div className="flex flex-col items-end gap-2">
                <div className="font-serif text-xl">{formatTL(parseFloat(o.total))}</div>
                <StatusPill variant={orderStatusVariant(STATUS_LABEL[o.status] ?? o.status)}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </StatusPill>
              </div>
            </div>
            {(CANCELLABLE.includes(o.status) || RETURNABLE.includes(o.status)) && (
              <div className="border-ek-line-2 mt-4 flex flex-wrap gap-3 border-t pt-3 text-xs">
                {CANCELLABLE.includes(o.status) && (
                  <button
                    onClick={(e) => cancel(e, o.number)}
                    className="text-ek-warn inline-flex items-center gap-1.5 hover:underline"
                  >
                    <XCircle size={12} />
                    İptal et
                  </button>
                )}
                {RETURNABLE.includes(o.status) && (
                  <button
                    onClick={() => setReturnOpen(o.number)}
                    className="text-ek-ink-2 hover:text-ek-ink inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    İade talep et
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {returnOpen && (
        <ReturnRequestDialog
          open={!!returnOpen}
          onOpenChange={(v) => !v && setReturnOpen(null)}
          orderNumber={returnOpen}
          onSuccess={load}
        />
      )}
    </div>
  );
}
