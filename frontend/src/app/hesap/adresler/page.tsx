"use client";

import { CheckCircle2, Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ekim/empty-state";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authedFetch, useAuthHydrated } from "@/store/auth";

interface Address {
  id: number;
  label: string;
  name: string;
  phone: string;
  line: string;
  district: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface FormState {
  label: string;
  name: string;
  phone: string;
  line: string;
  district: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

const EMPTY_FORM: FormState = {
  label: "",
  name: "",
  phone: "",
  line: "",
  district: "",
  city: "",
  postal_code: "",
  is_default: false,
};

export default function AddressesPage() {
  const hydrated = useAuthHydrated();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/accounts/addresses/");
      if (!res.ok) {
        setAddresses([]);
        return;
      }
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : (data.results ?? []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hydrated) load();
  }, [hydrated]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({
      label: a.label,
      name: a.name,
      phone: a.phone,
      line: a.line,
      district: a.district,
      city: a.city,
      postal_code: a.postal_code,
      is_default: a.is_default,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.name.trim() || !form.line.trim() || !form.city.trim()) {
      toast.error("Etiket, ad-soyad, adres ve şehir zorunlu");
      return;
    }
    setSaving(true);
    try {
      const path = editing ? `/accounts/addresses/${editing.id}/` : "/accounts/addresses/";
      const res = await authedFetch(path, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success(editing ? "Adres güncellendi" : "Adres eklendi");
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Bu adresi silmek istediğine emin misin?")) return;
    setDeletingId(id);
    try {
      const res = await authedFetch(`/accounts/addresses/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("Adres silindi");
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const setDefault = async (id: number) => {
    const res = await authedFetch(`/accounts/addresses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_default: true }),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Varsayılan adres güncellendi");
    load();
  };

  if (loading) {
    return (
      <div>
        <h1 className="h-1 mb-6">Adreslerim</h1>
        <div className="text-ek-ink-3 py-10 text-center text-sm">
          <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-1">Adreslerim</h1>
        <button
          onClick={openNew}
          className="bg-ek-ink text-ek-cream hover:bg-ek-forest inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <Plus size={14} /> Yeni adres
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          title="Adres eklenmemiş"
          description="Yeni adres ekle ya da sipariş ödeme adımında ekle."
          action={{ label: "Yeni adres ekle", onClick: openNew }}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "border-ek-line-2 bg-ek-bg-card relative rounded-xl border p-5",
                a.is_default && "border-ek-forest",
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-ek-ink-3" />
                  <div className="font-medium">{a.label}</div>
                </div>
                {a.is_default && (
                  <span className="bg-ek-forest text-ek-cream rounded-full px-2 py-0.5 text-[10px]">
                    Varsayılan
                  </span>
                )}
              </div>
              <div className="text-ek-ink-2 text-sm">{a.name}</div>
              <div className="text-ek-ink-2 mt-1 text-sm">{a.line}</div>
              <div className="mono mt-1">
                {[a.district, a.city, a.postal_code].filter(Boolean).join(" · ")}
              </div>
              <div className="mono mt-1">{a.phone}</div>
              <div className="border-ek-line-2 mt-4 flex items-center gap-3 border-t pt-3 text-xs">
                {!a.is_default && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="text-ek-ink-3 hover:text-ek-ink inline-flex items-center gap-1"
                  >
                    <Star size={11} /> Varsayılan yap
                  </button>
                )}
                <button
                  onClick={() => openEdit(a)}
                  className="text-ek-ink-3 hover:text-ek-ink inline-flex items-center gap-1"
                >
                  <Pencil size={11} /> Düzenle
                </button>
                <button
                  onClick={() => remove(a.id)}
                  disabled={deletingId === a.id}
                  className="text-ek-warn ml-auto inline-flex items-center gap-1 disabled:opacity-40"
                >
                  {deletingId === a.id ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Trash2 size={11} />
                  )}
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="!bg-[var(--ek-bg-elevated)] flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden border-0 p-0 !gap-0 shadow-2xl sm:max-w-lg"
        >
          <DialogTitle className="sr-only">
            {editing ? "Adresi düzenle" : "Yeni adres"}
          </DialogTitle>
          <header className="border-ek-line-2 border-b px-5 py-4">
            <div className="eyebrow">{editing ? "DÜZENLE" : "YENİ ADRES"}</div>
            <h2 className="h-3 mt-1">{editing ? editing.label : "Adres ekle"}</h2>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            <Field
              label="Etiket *"
              value={form.label}
              onChange={(v) => setForm((p) => ({ ...p, label: v }))}
              placeholder="Ev / İş / Tatil"
            />
            <Field
              label="Ad soyad *"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              autoComplete="name"
            />
            <Field
              label="Telefon"
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
              type="tel"
              autoComplete="tel"
            />
            <Field
              label="Adres *"
              value={form.line}
              onChange={(v) => setForm((p) => ({ ...p, line: v }))}
              autoComplete="street-address"
              textarea
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="İlçe"
                value={form.district}
                onChange={(v) => setForm((p) => ({ ...p, district: v }))}
                autoComplete="address-level2"
              />
              <Field
                label="Şehir *"
                value={form.city}
                onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                autoComplete="address-level1"
              />
            </div>
            <Field
              label="Posta kodu"
              value={form.postal_code}
              onChange={(v) => setForm((p) => ({ ...p, postal_code: v }))}
              autoComplete="postal-code"
            />
            <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
                className="accent-[var(--ek-forest)]"
              />
              Varsayılan adres olarak ayarla
            </label>
          </div>

          <footer className="border-ek-line-2 bg-ek-bg-elevated flex gap-2 border-t px-5 py-4">
            <button
              onClick={() => setOpen(false)}
              className="border-ek-line hover:border-ek-ink-3 flex-1 rounded-full border py-2.5 text-sm"
            >
              Vazgeç
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="bg-ek-ink text-ek-cream hover:bg-ek-forest flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              <CheckCircle2 size={14} />
              {editing ? "Güncelle" : "Kaydet"}
            </button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="eyebrow mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="border-ek-line bg-ek-bg focus:border-ek-forest w-full resize-none rounded-md border px-3 py-2 text-sm outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="border-ek-line bg-ek-bg focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
      )}
    </div>
  );
}
