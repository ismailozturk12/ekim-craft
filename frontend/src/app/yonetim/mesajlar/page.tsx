"use client";

import { Check, CheckCircle2, Loader2, Mail, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_handled: boolean;
  created_at: string;
}

export default function AdminContactInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "handled">("unread");

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/core/admin/contact-messages/?page_size=100");
      if (!res.ok) {
        setMessages([]);
        return;
      }
      const data = await res.json();
      setMessages(data.results ?? data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHandled = async (m: ContactMessage) => {
    const res = await authedFetch(`/core/admin/contact-messages/${m.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_handled: !m.is_handled }),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success(m.is_handled ? "Okunmadı işaretlendi" : "Çözüldü olarak işaretlendi");
    setActive((curr) => (curr && curr.id === m.id ? { ...curr, is_handled: !m.is_handled } : curr));
    load();
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(`${m.name} isimli mesajı silmek istediğine emin misin?`)) return;
    const res = await authedFetch(`/core/admin/contact-messages/${m.id}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Mesaj silindi");
    setActive(null);
    load();
  };

  const filtered = messages.filter((m) => {
    if (filter === "all") return true;
    if (filter === "handled") return m.is_handled;
    return !m.is_handled;
  });

  const unreadCount = messages.filter((m) => !m.is_handled).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="h-2">Gelen mesajlar</h1>
          <p className="text-ek-ink-3 text-sm">
            {messages.length} mesaj · {unreadCount} okunmadı
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(
          [
            { id: "unread", label: `Okunmadı (${unreadCount})` },
            { id: "handled", label: "Çözüldü" },
            { id: "all", label: "Tümü" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              filter === f.id
                ? "bg-ek-ink text-ek-cream border-ek-ink"
                : "border-ek-line bg-ek-bg-card hover:border-ek-ink-3",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-ek-ink-3 py-10 text-center text-sm">
          <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-ek-ink-3 border-ek-line-2 bg-ek-bg-card rounded-xl border border-dashed py-16 text-center">
          <Mail size={24} className="mx-auto mb-3 opacity-40" />
          <div className="text-sm">Mesaj yok</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-2">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m)}
                className={cn(
                  "border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 w-full rounded-lg border p-4 text-left transition-colors",
                  active?.id === m.id && "border-ek-ink",
                  !m.is_handled && "border-l-4 border-l-ek-terra",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="mono shrink-0">{formatDateShort(m.created_at)}</div>
                </div>
                <div className="text-ek-ink-3 mb-1 truncate text-xs">{m.email}</div>
                {m.subject && (
                  <div className="mb-1 truncate text-xs font-medium">{m.subject}</div>
                )}
                <div className="text-ek-ink-3 line-clamp-2 text-xs">{m.body}</div>
                {m.is_handled && (
                  <div className="text-ek-ok mt-1.5 inline-flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={10} /> Çözüldü
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="border-ek-line-2 bg-ek-bg-card h-fit rounded-xl border p-6 lg:sticky lg:top-4">
            {active ? (
              <>
                <div className="border-ek-line-2 mb-4 flex items-start justify-between gap-4 border-b pb-4">
                  <div className="min-w-0">
                    <h2 className="h-3 mb-1 truncate">{active.subject || "(Konu yok)"}</h2>
                    <div className="text-sm font-medium">{active.name}</div>
                    <div className="mono">
                      <a
                        href={`mailto:${active.email}`}
                        className="text-ek-terra-2 hover:underline"
                      >
                        {active.email}
                      </a>
                      {" · "}
                      {formatDateShort(active.created_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => toggleHandled(active)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium",
                        active.is_handled
                          ? "border-ek-line text-ek-ink-3 border"
                          : "bg-ek-ok text-white hover:opacity-90",
                      )}
                    >
                      <Check size={12} className="mr-1 inline" />
                      {active.is_handled ? "Okunmadı işaretle" : "Çözüldü"}
                    </button>
                    <button
                      onClick={() => remove(active)}
                      className="text-ek-ink-3 hover:text-ek-warn rounded-full p-2"
                      aria-label="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{active.body}</div>
                <div className="border-ek-line-2 mt-6 border-t pt-4">
                  <a
                    href={`mailto:${active.email}?subject=Re: ${active.subject}`}
                    className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                  >
                    <Mail size={14} />
                    E-posta ile yanıtla
                  </a>
                </div>
              </>
            ) : (
              <div className="text-ek-ink-3 py-16 text-center text-sm">
                Soldan bir mesaj seçin
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
