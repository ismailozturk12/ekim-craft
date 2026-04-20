"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage, authedFetch, useAuth, useAuthHydrated } from "@/store/auth";

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  marketing_opt_in: boolean;
}

export default function SettingsPage() {
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    marketing_opt_in: false,
  });
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? "",
        email: user.email,
        marketing_opt_in: false,
      });
    }
  }, [user]);

  if (!hydrated || !user) return null;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authedFetch("/accounts/me/update/", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          marketing_opt_in: form.marketing_opt_in,
        }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const updated = await res.json();
      setUser(updated);
      toast.success("Bilgilerin kaydedildi");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwd.next !== pwd.confirm) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    if (pwd.next.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await authedFetch("/accounts/me/password/", {
        method: "POST",
        body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("Şifren güncellendi");
      setPwd({ current: "", next: "", confirm: "" });
    } finally {
      setChangingPwd(false);
    }
  };

  const deleteAccount = () => {
    if (!confirm("Hesabını kalıcı olarak silmek istediğine emin misin?")) return;
    toast.info("Hesap silme endpoint'i yakında — destek ile iletişime geç");
  };

  return (
    <div>
      <h1 className="h-1 mb-6">Ayarlar</h1>

      <section className="border-ek-line-2 bg-ek-bg-card mb-6 rounded-xl border p-6">
        <h2 className="h-3 mb-4">Kişisel bilgiler</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="AD"
            value={form.first_name}
            onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
          />
          <Field
            label="SOYAD"
            value={form.last_name}
            onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
          />
          <Field label="E-POSTA (değiştirilemez)" value={form.email} disabled />
          <Field
            label="TELEFON"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          />
        </div>
        <label className="text-ek-ink-2 mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.marketing_opt_in}
            onChange={(e) => setForm((f) => ({ ...f, marketing_opt_in: e.target.checked }))}
          />
          Kampanya ve yeni ürün e-postaları gönderilsin
        </label>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 mt-5 rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </section>

      <section className="border-ek-line-2 bg-ek-bg-card mb-6 rounded-xl border p-6">
        <h2 className="h-3 mb-4">Şifre değiştir</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="MEVCUT ŞİFRE"
            type="password"
            value={pwd.current}
            onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
          />
          <div />
          <Field
            label="YENİ ŞİFRE (en az 8 karakter)"
            type="password"
            value={pwd.next}
            onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
          />
          <Field
            label="YENİ ŞİFRE (TEKRAR)"
            type="password"
            value={pwd.confirm}
            onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))}
          />
        </div>
        <button
          onClick={changePassword}
          disabled={changingPwd || !pwd.current || !pwd.next || !pwd.confirm}
          className="border-ek-line hover:border-ek-ink mt-5 rounded-full border px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {changingPwd ? "Güncelleniyor..." : "Şifreyi değiştir"}
        </button>
      </section>

      <section className="border-ek-warn/30 bg-ek-warn/5 rounded-xl border p-6">
        <h2 className="h-3 text-ek-warn mb-2">Tehlikeli alan</h2>
        <p className="text-ek-ink-3 mb-4 text-sm">
          Hesabını kalıcı olarak sileceksen geri dönüşü yok. Tüm sipariş geçmişin de silinir.
        </p>
        <button
          onClick={deleteAccount}
          className="border-ek-warn text-ek-warn hover:bg-ek-warn hover:text-white rounded-full border px-5 py-2 text-sm transition-colors"
        >
          Hesabı sil
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none disabled:opacity-60"
      />
    </div>
  );
}
