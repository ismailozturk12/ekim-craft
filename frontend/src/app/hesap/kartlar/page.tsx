"use client";

import { CreditCard, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiErrorMessage, authedFetch, useAuthHydrated } from "@/store/auth";

interface Card {
  id: number;
  card_alias: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const BRANDS = ["VISA", "MASTER", "AMEX", "TROY"];

export default function CardsPage() {
  const hydrated = useAuthHydrated();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolder: "",
    exp_month: "",
    exp_year: "",
    is_default: false,
  });

  const load = async () => {
    try {
      const res = await authedFetch("/accounts/cards/");
      if (!res.ok) return;
      const data = await res.json();
      setCards(Array.isArray(data) ? data : (data.results ?? []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated) load();
  }, [hydrated]);

  const detectBrand = (num: string): string => {
    const clean = num.replace(/\s/g, "");
    if (/^4/.test(clean)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "MASTER";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^9792/.test(clean)) return "TROY";
    return "KART";
  };

  const save = async () => {
    const clean = form.cardNumber.replace(/\s/g, "");
    if (clean.length < 12) {
      toast.error("Geçersiz kart numarası");
      return;
    }
    if (!form.exp_month || !form.exp_year) {
      toast.error("Son kullanma tarihi zorunlu");
      return;
    }
    const res = await authedFetch("/accounts/cards/", {
      method: "POST",
      body: JSON.stringify({
        card_alias: form.cardHolder,
        last4: clean.slice(-4),
        brand: detectBrand(clean),
        exp_month: parseInt(form.exp_month),
        exp_year: parseInt(form.exp_year),
        is_default: form.is_default,
      }),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Kart kaydedildi");
    setOpen(false);
    setForm({ cardNumber: "", cardHolder: "", exp_month: "", exp_year: "", is_default: false });
    load();
  };

  const remove = async (id: number, last4: string) => {
    if (!confirm(`•••• ${last4} kartını silmek istediğine emin misin?`)) return;
    const res = await authedFetch(`/accounts/cards/${id}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Kart silindi");
    load();
  };

  if (loading) {
    return (
      <div>
        <h1 className="h-1 mb-6">Kartlarım</h1>
        <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-1">Kartlarım</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-ek-ink text-ek-cream hover:bg-ek-forest inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <Plus size={14} /> Kart ekle
        </button>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={32} />}
          title="Kayıtlı kart yok"
          description="Hızlı ödeme için kartını kaydet. Veriler iyzico'da tokenlanarak saklanır."
          action={{ label: "Kart ekle", onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((c) => (
            <div key={c.id} className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium">{c.brand}</div>
                <div className="flex items-center gap-1">
                  {c.is_default && (
                    <span className="bg-ek-cream rounded-full px-2 py-0.5 text-[10px]">Varsayılan</span>
                  )}
                  <button
                    onClick={() => remove(c.id, c.last4)}
                    className="text-ek-ink-3 hover:text-ek-warn p-1.5"
                    aria-label="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="font-mono text-lg tracking-wider">•••• •••• •••• {c.last4}</div>
              <div className="mono mt-1">
                Son {String(c.exp_month).padStart(2, "0")}/{String(c.exp_year).slice(-2)}
                {c.card_alias && ` · ${c.card_alias}`}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-ek-bg-elevated max-w-md p-0">
          <header className="border-ek-line-2 flex items-center justify-between border-b px-5 py-4">
            <h3 className="h-3">Kart ekle</h3>
            <button onClick={() => setOpen(false)} className="text-ek-ink-3">
              <X size={18} />
            </button>
          </header>
          <div className="space-y-3 p-5">
            <div>
              <label className="mono mb-1 block">KART NUMARASI</label>
              <input
                value={form.cardNumber}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    cardNumber: e.target.value
                      .replace(/\s/g, "")
                      .replace(/(\d{4})(?=\d)/g, "$1 "),
                  }))
                }
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2.5 font-mono text-sm outline-none"
              />
            </div>
            <div>
              <label className="mono mb-1 block">KART ÜZERİNDEKİ İSİM</label>
              <input
                value={form.cardHolder}
                onChange={(e) => setForm((p) => ({ ...p, cardHolder: e.target.value.toUpperCase() }))}
                className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono mb-1 block">AY</label>
                <input
                  value={form.exp_month}
                  onChange={(e) => setForm((p) => ({ ...p, exp_month: e.target.value }))}
                  placeholder="12"
                  maxLength={2}
                  className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mono mb-1 block">YIL</label>
                <input
                  value={form.exp_year}
                  onChange={(e) => setForm((p) => ({ ...p, exp_year: e.target.value }))}
                  placeholder="2030"
                  maxLength={4}
                  className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
              />
              Varsayılan ödeme yöntemi yap
            </label>
            <div className="bg-ek-cream text-ek-ink-3 rounded-md p-3 text-xs">
              🔒 CVV kaydedilmez. Kart bilgileri iyzico'da PCI-DSS uyumlu şekilde tokenlanır (Faz 11
              aktive edilecek).
            </div>
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
              Kartı kaydet
            </button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
}
