"use client";

import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { apiErrorMessage } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Geçerli e-posta gir");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/accounts/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, site_url: SITE_URL }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center py-10">
        <Container className="flex justify-center">
          <div className="border-ek-line-2 bg-ek-bg-card w-full max-w-md rounded-2xl border p-8">
            {sent ? (
              <div className="text-center">
                <div className="bg-ek-ok/15 text-ek-ok mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                  <Check size={28} />
                </div>
                <h1 className="h-2 mb-3">E-posta gönderildi</h1>
                <p className="text-ek-ink-3 mb-6 text-sm">
                  <strong>{email}</strong> adresine sıfırlama bağlantısı gönderildi. Bağlantı 1 saat içinde
                  kullanılmazsa geçersiz olur.
                </p>
                <Link
                  href="/giris"
                  className="bg-ek-forest text-ek-cream inline-block rounded-full px-6 py-2.5 text-sm"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="bg-ek-cream text-ek-forest mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                  <Mail size={28} />
                </div>
                <h1 className="h-2 mb-2 text-center">Şifreni unuttum</h1>
                <p className="text-ek-ink-3 mb-6 text-center text-sm">
                  E-posta adresini gir, sıfırlama bağlantısı gönderelim.
                </p>
                <label className="eyebrow mb-2 block">E-POSTA</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest mb-5 w-full rounded-md border px-3 py-2.5 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
                >
                  {sending ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
                </button>
                <div className="mt-5 text-center">
                  <Link href="/giris" className="mono hover:text-ek-ink">
                    ← Giriş sayfasına dön
                  </Link>
                </div>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
