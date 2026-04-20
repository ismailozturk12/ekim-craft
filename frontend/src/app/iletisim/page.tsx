"use client";

import { MapPin, Mail, Phone, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { apiErrorMessage } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "Sipariş bilgisi", body: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || form.body.trim().length < 10) {
      toast.error("Ad, e-posta ve en az 10 karakter mesaj gerekli");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/core/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      setSent(true);
      toast.success("Mesajın ulaştı, en kısa sürede döneceğiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <h1 className="h-1 mb-2">İletişim</h1>
          <p className="text-ek-ink-3 mb-10 max-w-xl">
            Atölyemize yol tarifi, siparişin hakkında bilgi ya da özel bir istek için buradayız.
          </p>

          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            {/* Sol — iletişim bilgileri */}
            <div className="space-y-4">
              <InfoCard icon={<Phone size={18} />} title="Telefon" value="0850 200 00 00" sub="09:00-18:00" />
              <InfoCard icon={<Mail size={18} />} title="E-posta" value="destek@ekimcraft.com" />
              <InfoCard
                icon={<MapPin size={18} />}
                title="Atölyemiz"
                value="Caferağa Mah. Moda Cd. 142, Kadıköy İstanbul"
                sub="Randevu ile ziyaret"
              />
              <div className="border-ek-line-2 overflow-hidden rounded-xl border">
                <iframe
                  title="Harita"
                  className="h-60 w-full"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=29.025%2C40.987%2C29.035%2C40.993&layer=mapnik"
                />
              </div>
            </div>

            {/* Sağ — form veya success */}
            <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6 md:p-8">
              {sent ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="bg-ek-ok/15 text-ek-ok mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <Check size={24} />
                  </div>
                  <h2 className="h-3 mb-2">Mesaj gönderildi</h2>
                  <p className="text-ek-ink-3">En geç 24 saat içinde dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <h2 className="h-3 mb-2">Bize yaz</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="AD SOYAD"
                      required
                      value={form.name}
                      onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    />
                    <Field
                      label="E-POSTA"
                      type="email"
                      required
                      value={form.email}
                      onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                    />
                  </div>
                  <Field
                    label="KONU"
                    as="select"
                    options={["Sipariş bilgisi", "İade", "Özel üretim", "Diğer"]}
                    value={form.subject}
                    onChange={(v) => setForm((p) => ({ ...p, subject: v }))}
                  />
                  <Field
                    label="MESAJIN"
                    textarea
                    rows={5}
                    required
                    value={form.body}
                    onChange={(v) => setForm((p) => ({ ...p, body: v }))}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? "Gönderiliyor..." : "Mesajı gönder"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-ek-cream text-ek-forest flex h-10 w-10 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="eyebrow">{title}</div>
      </div>
      <div className="text-base font-medium">{value}</div>
      {sub && <div className="mono mt-1">{sub}</div>}
    </div>
  );
}

function Field({
  label,
  type = "text",
  required,
  textarea,
  rows,
  as,
  options,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  as?: "select";
  options?: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  const cls =
    "border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none";
  return (
    <div>
      <label className="eyebrow mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea
          rows={rows ?? 3}
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={cls}
        />
      ) : as === "select" ? (
        <select
          className={cls}
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}
