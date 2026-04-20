"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
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

export default function OrdersPage() {
  const hydrated = useAuthHydrated();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h1 className="h-1 mb-6">Siparişlerim</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/siparis-basarili/${o.number}`}
            className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex items-center justify-between rounded-xl border p-5 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="eyebrow mb-1">#{o.number}</div>
              <div className="text-sm font-medium">
                {formatDateShort(o.created_at)} · {o.items_count} ürün
              </div>
              {o.tracking_number && (
                <div className="mono mt-1">
                  Takip: {o.tracking_number} · {o.carrier}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="font-serif text-xl">{formatTL(parseFloat(o.total))}</div>
              <StatusPill variant={orderStatusVariant(STATUS_LABEL[o.status] ?? o.status)}>
                {STATUS_LABEL[o.status] ?? o.status}
              </StatusPill>
              {CANCELLABLE.includes(o.status) && (
                <button
                  onClick={(e) => cancel(e, o.number)}
                  className="text-ek-warn hover:text-ek-warn mt-1 inline-flex items-center gap-1 text-xs"
                >
                  <XCircle size={12} />
                  İptal et
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
