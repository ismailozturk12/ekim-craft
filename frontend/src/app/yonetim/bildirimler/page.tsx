"use client";

import { AlertCircle, Bell, Box, CheckCheck, Heart, Package, Star, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { timeAgo } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface Notif {
  id: number;
  kind: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

const ICONS: Record<string, { Icon: typeof Bell; color: string }> = {
  order: { Icon: Package, color: "bg-ek-terra/15 text-ek-terra-2" },
  stock: { Icon: Box, color: "bg-ek-warn/15 text-ek-warn" },
  review: { Icon: Star, color: "bg-ek-ok/15 text-ek-ok" },
  return: { Icon: AlertCircle, color: "bg-ek-warn/15 text-ek-warn" },
  delivery: { Icon: Truck, color: "bg-ek-blue/15 text-ek-blue" },
  customer: { Icon: Heart, color: "bg-ek-forest/15 text-ek-forest" },
  payment: { Icon: XCircle, color: "bg-ek-warn/15 text-ek-warn" },
  system: { Icon: Bell, color: "bg-ek-ink/15 text-ek-ink-2" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/core/notifications/");
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const data = await res.json();
      setItems(data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    const res = await authedFetch("/core/notifications/mark-all-read/", { method: "POST" });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    const data = await res.json();
    toast.success(`${data.updated} bildirim okundu olarak işaretlendi`);
    setItems((xs) => xs.map((n) => ({ ...n, read: true })));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="h-2 flex items-center gap-3">
            Bildirimler
            {unread > 0 && (
              <span className="bg-ek-terra flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-ek-ink-3 text-sm">Canlı aktivite akışı</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="border-ek-line hover:border-ek-ink inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
          >
            <CheckCheck size={14} />
            Tümünü okundu say
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="Bildirim yok"
          description="Sipariş, stok, yorum bildirimleri burada görünür."
        />
      ) : (
        <div className="border-ek-line-2 bg-ek-bg-card divide-y divide-[var(--ek-line-2)] rounded-xl border">
          {items.map((n) => {
            const meta = ICONS[n.kind] ?? ICONS.system;
            const Icon = meta.Icon;
            return (
              <div
                key={n.id}
                className={
                  "flex items-start gap-3 p-4 hover:bg-ek-bg-elevated " +
                  (!n.read ? "bg-ek-bg-elevated/40" : "")
                }
              >
                <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full " + meta.color}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium">{n.title}</div>
                    <span className="mono shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <div className="text-ek-ink-3 truncate text-sm">{n.body}</div>}
                </div>
                {!n.read && <div className="bg-ek-terra mt-2.5 h-2 w-2 shrink-0 rounded-full" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
