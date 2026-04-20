"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { Placeholder } from "@/components/ekim/placeholder";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { apiLogin, apiRegister, useAuth } from "@/store/auth";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="flex flex-1 items-center justify-center py-10">
            <div className="text-ek-ink-3 text-sm">Yükleniyor...</div>
          </main>
          <Footer />
        </>
      }
    >
      <AuthInner />
    </Suspense>
  );
}

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuth((s) => s.setAuth);
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    marketing: false,
  });

  const redirect = searchParams.get("next") ?? "/hesap";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await apiRegister({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          marketing_opt_in: form.marketing,
        });
        toast.success("Kayıt oluşturuldu, giriş yapılıyor...");
      }
      const result = await apiLogin(form.email, form.password);
      setAuth(result);
      toast.success(`Hoş geldin, ${result.user.first_name || result.user.email}`);
      router.push(redirect);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center py-10">
        <Container className="flex justify-center">
          <div className="border-ek-line-2 bg-ek-bg-card grid w-full max-w-4xl overflow-hidden rounded-2xl border md:grid-cols-2">
            {/* Sol görsel */}
            <div className="bg-ek-forest text-ek-cream relative hidden flex-col justify-between p-10 md:flex">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl">Ekim</span>
                  <span className="bg-ek-terra h-2 w-2 rounded-full" />
                  <span className="font-serif text-2xl">Craft</span>
                </div>
                <h2 className="h-2 text-ek-cream mt-8">
                  El yapımı,
                  <br />
                  <em className="text-ek-terra not-italic">hikayenle.</em>
                </h2>
                <p className="text-ek-cream/70 mt-4 text-sm leading-relaxed">
                  Kayıtlı kullanıcılar siparişlerini takip eder, favorileri biriktirir, kişiye özel
                  tasarımlar için taslak kaydeder.
                </p>
              </div>
              <div className="-mx-10 -mb-10 overflow-hidden">
                <Placeholder tone="terra" label="el yapımı" ratio="3/2" />
              </div>
            </div>

            {/* Sağ form */}
            <div className="p-8 md:p-10">
              <div className="border-ek-line-2 mb-6 flex rounded-full border p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={
                    "flex-1 rounded-full py-2 transition-colors " +
                    (mode === "login" ? "bg-ek-ink text-ek-cream" : "")
                  }
                >
                  Giriş yap
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={
                    "flex-1 rounded-full py-2 transition-colors " +
                    (mode === "signup" ? "bg-ek-ink text-ek-cream" : "")
                  }
                >
                  Kayıt ol
                </button>
              </div>

              <h1 className="h-2 mb-2">
                {mode === "login" ? "Tekrar hoş geldin" : "Aramıza katıl"}
              </h1>
              <p className="text-ek-ink-3 mb-6 text-sm">
                {mode === "login"
                  ? "E-posta ve şifrenle devam et."
                  : "Birkaç bilgi yeter, 30 saniye sürer."}
              </p>

              <form onSubmit={onSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="AD"
                      value={form.first_name}
                      onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
                      required
                    />
                    <Field
                      label="SOYAD"
                      value={form.last_name}
                      onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
                      required
                    />
                  </div>
                )}
                <Field
                  label="E-POSTA"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  required
                />
                <Field
                  label="ŞİFRE"
                  type="password"
                  value={form.password}
                  onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  required
                />
                {mode === "signup" && (
                  <>
                    <Field
                      label="TELEFON (opsiyonel)"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                    />
                    <label className="text-ek-ink-3 flex items-start gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.marketing}
                        onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.checked }))}
                        className="mt-0.5"
                      />
                      Yeni ürün ve kampanyalardan haberdar olmak istiyorum.
                    </label>
                  </>
                )}
                {mode === "login" && (
                  <div className="flex justify-end">
                    <Link href="/sifremi-unuttum" className="text-ek-ink-3 hover:text-ek-terra text-xs">
                      Şifremi unuttum
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
                >
                  {loading
                    ? "Yükleniyor..."
                    : mode === "login"
                      ? "Giriş yap"
                      : "Kaydol ve devam et"}
                </button>
              </form>

              <div className="text-ek-ink-3 my-5 flex items-center gap-3 text-xs">
                <span className="bg-ek-line h-px flex-1" />
                VEYA
                <span className="bg-ek-line h-px flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="border-ek-line hover:border-ek-ink rounded-full border py-2.5 text-xs font-medium">
                  Google ile devam et
                </button>
                <button className="border-ek-line hover:border-ek-ink rounded-full border py-2.5 text-xs font-medium">
                  Apple ile devam et
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow mb-1.5 block">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none"
      />
    </div>
  );
}
