"use client";

import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { apiErrorMessage } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    if (pwd.next.length < 8) {
      toast.error("En az 8 karakter");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/accounts/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pwd.next }),
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/giris"), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center py-10">
        <Container className="flex justify-center">
          <div className="border-ek-line-2 bg-ek-bg-card w-full max-w-md rounded-2xl border p-8">
            {done ? (
              <div className="text-center">
                <div className="bg-ek-ok/15 text-ek-ok mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                  <Check size={28} />
                </div>
                <h1 className="h-2 mb-3">Şifren güncellendi</h1>
                <p className="text-ek-ink-3 mb-4 text-sm">Giriş sayfasına yönlendiriliyorsun...</p>
                <Link
                  href="/giris"
                  className="bg-ek-forest text-ek-cream inline-block rounded-full px-6 py-2.5 text-sm"
                >
                  Hemen giriş yap
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="bg-ek-cream text-ek-forest mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                  <Lock size={28} />
                </div>
                <h1 className="h-2 mb-2 text-center">Yeni şifre belirle</h1>
                <p className="text-ek-ink-3 mb-6 text-center text-sm">Yeni şifreni iki kez gir.</p>
                <label className="eyebrow mb-2 block">YENİ ŞİFRE</label>
                <input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                  required
                  minLength={8}
                  className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest mb-3 w-full rounded-md border px-3 py-2.5 text-sm outline-none"
                />
                <label className="eyebrow mb-2 block">YENİ ŞİFRE (TEKRAR)</label>
                <input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                  required
                  minLength={8}
                  className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest mb-5 w-full rounded-md border px-3 py-2.5 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
                >
                  {submitting ? "Güncelleniyor..." : "Şifreyi sıfırla"}
                </button>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
