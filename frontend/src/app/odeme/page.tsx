"use client";

import { Check, ChevronLeft, CreditCard, Landmark, Package, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ekim/container";
import { EmptyState } from "@/components/ekim/empty-state";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { API_URL } from "@/lib/api/client";
import { formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch, useAuth, useAuthHydrated } from "@/store/auth";
import { cartTotals, useCart } from "@/store/cart";

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  phone: string;
  email: string;
  line: string;
  city: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear, coupon } = useCart();
  const { subtotal, shipping, discount, total } = cartTotals(items, coupon);
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);

  const [step, setStep] = useState<Step>(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "cod" | "wallet">("card");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    name: "",
    phone: "",
    email: "",
    line: "",
    city: "",
  });

  // Giriş yapmışsa adres alanlarını otomatik doldur (misafir checkout serbest)
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        name: prev.name || `${user.first_name} ${user.last_name}`.trim(),
        email: prev.email || user.email,
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <>
        <Header />
        <Container className="py-16">
          <EmptyState
            title="Ödeme için sepet boş"
            description="Önce sepete ürün ekle."
            action={{ label: "Mağazaya git", href: "/kategori/all" }}
          />
        </Container>
        <Footer />
      </>
    );
  }

  const validateAddress = (): string | null => {
    if (!address.name.trim()) return "Ad soyad gerekli";
    if (!address.phone.trim()) return "Telefon gerekli";
    if (!user && !address.email.trim()) return "E-posta gerekli (sipariş takibi için)";
    if (!address.line.trim()) return "Adres gerekli";
    if (!address.city.trim()) return "Şehir gerekli";
    return null;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const body = JSON.stringify({
        items: items.map((it) => ({
          product_slug: it.slug,
          qty: it.qty,
          size: it.size ?? "",
          color: it.color ?? "",
          personalization: it.personalization ?? {},
        })),
        shipping_address: {
          name: address.name,
          phone: address.phone,
          email: address.email || user?.email || "",
          line: address.line,
          city: address.city,
        },
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: coupon?.code ?? "",
      });
      // Misafir checkout: authedFetch refresh akışı, anonim için ham fetch
      const res = user
        ? await authedFetch("/orders/", { method: "POST", body })
        : await fetch(`${API_URL}/api/v1/orders/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
      if (!res.ok) {
        const msg = await apiErrorMessage(res);
        throw new Error(msg);
      }
      const order = (await res.json()) as { number: string };
      clear();
      toast.success(`Sipariş alındı · ${order.number}`);
      router.push(`/siparis-basarili/${order.number}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          <div className="mono mb-4 flex items-center gap-2">
            <Link href="/sepet" className="hover:text-ek-ink flex items-center gap-1">
              <ChevronLeft size={14} />
              Sepete dön
            </Link>
          </div>

          {/* Step indicator */}
          <div className="mb-10 flex items-center gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium " +
                    (step >= (n as Step)
                      ? "bg-ek-forest text-ek-cream"
                      : "bg-ek-bg-elevated text-ek-ink-3 border-ek-line border")
                  }
                >
                  {step > (n as Step) ? <Check size={14} /> : n}
                </div>
                <span className="text-xs font-medium">
                  {n === 1 ? "Adres & Kargo" : n === 2 ? "Ödeme" : "Onay"}
                </span>
                {n < 3 && <span className="bg-ek-line mx-2 h-px w-8" />}
              </div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              {/* Step 1 — Adres + Kargo */}
              {step === 1 && (
                <>
                  <section className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
                    <h2 className="h-3 mb-4">Teslimat adresi</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        label="Ad soyad"
                        autoComplete="name"
                        value={address.name}
                        onChange={(v) => setAddress((p) => ({ ...p, name: v }))}
                      />
                      <FormField
                        label="Telefon"
                        type="tel"
                        value={address.phone}
                        onChange={(v) => setAddress((p) => ({ ...p, phone: v }))}
                      />
                      <FormField
                        label="E-posta"
                        type="email"
                        className="sm:col-span-2"
                        value={address.email}
                        onChange={(v) => setAddress((p) => ({ ...p, email: v }))}
                      />
                      <FormField
                        label="Şehir / İlçe"
                        className="sm:col-span-2"
                        autoComplete="address-level2"
                        value={address.city}
                        onChange={(v) => setAddress((p) => ({ ...p, city: v }))}
                      />
                      <FormField
                        label="Adres"
                        className="sm:col-span-2"
                        textarea
                        autoComplete="street-address"
                        value={address.line}
                        onChange={(v) => setAddress((p) => ({ ...p, line: v }))}
                      />
                    </div>
                  </section>

                  <section className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
                    <h2 className="h-3 mb-4">Kargo yöntemi</h2>
                    <div className="space-y-2">
                      <ShipOption
                        id="standard"
                        icon={<Truck size={18} />}
                        title="Standart (1-3 gün)"
                        desc={subtotal >= 500 ? "Ücretsiz" : "₺49,90"}
                        selected={shippingMethod === "standard"}
                        onSelect={() => setShippingMethod("standard")}
                      />
                      <ShipOption
                        id="express"
                        icon={<Truck size={18} />}
                        title="Hızlı (ertesi gün)"
                        desc="₺89,00"
                        selected={shippingMethod === "express"}
                        onSelect={() => setShippingMethod("express")}
                      />
                      <ShipOption
                        id="pickup"
                        icon={<Package size={18} />}
                        title="Atölyeden teslim (3-5 gün)"
                        desc="Ücretsiz"
                        selected={shippingMethod === "pickup"}
                        onSelect={() => setShippingMethod("pickup")}
                      />
                    </div>
                  </section>

                  <button
                    onClick={() => {
                      const err = validateAddress();
                      if (err) {
                        toast.error(err);
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream w-full rounded-full py-3 text-sm font-medium"
                  >
                    Devam et →
                  </button>
                </>
              )}

              {/* Step 2 — Ödeme */}
              {step === 2 && (
                <>
                  <section className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
                    <h2 className="h-3 mb-4">Ödeme yöntemi</h2>
                    <div className="mb-5 grid gap-2 sm:grid-cols-2">
                      {[
                        { id: "card", icon: CreditCard, label: "Kredi kartı" },
                        { id: "transfer", icon: Landmark, label: "Havale / EFT" },
                        { id: "cod", icon: Package, label: "Kapıda ödeme" },
                        { id: "wallet", icon: Wallet, label: "Cüzdan" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPaymentMethod(p.id as "card" | "transfer" | "cod" | "wallet")}
                          className={
                            "flex items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors " +
                            (paymentMethod === p.id
                              ? "border-ek-forest bg-ek-cream"
                              : "border-ek-line hover:border-ek-ink-3")
                          }
                        >
                          <p.icon size={16} />
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "card" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          label="Kart numarası"
                          className="sm:col-span-2"
                          autoComplete="cc-number"
                          inputMode="numeric"
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                        />
                        <FormField
                          label="Son kullanma (AA/YY)"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="12/28"
                        />
                        <FormField
                          label="CVV"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="123"
                        />
                        <FormField
                          label="Kart üzerindeki isim"
                          className="sm:col-span-2"
                          autoComplete="cc-name"
                        />
                      </div>
                    )}
                    {paymentMethod === "transfer" && (
                      <div className="bg-ek-bg-elevated rounded-md p-4 text-sm">
                        Ziraat Bankası · <strong>TR00 0000 0000 0000 0000 0000 00</strong> · Ekim Craft
                        Atölye. Açıklamaya sipariş numaranızı yazın.
                      </div>
                    )}
                    {paymentMethod === "cod" && (
                      <div className="bg-ek-bg-elevated rounded-md p-4 text-sm">
                        Kapıda ödeme için ek <strong>₺19,90</strong> hizmet bedeli alınır.
                      </div>
                    )}
                  </section>

                  <label className="text-ek-ink-2 flex items-start gap-2 text-xs">
                    <input type="checkbox" defaultChecked className="mt-0.5" />
                    <span>
                      Mesafeli satış sözleşmesini ve ön bilgilendirme formunu okudum ve kabul ediyorum.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="border-ek-line hover:border-ek-ink rounded-full border px-5 py-3 text-sm"
                    >
                      Geri
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={placing}
                      className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream flex-1 rounded-full py-3 text-sm font-medium disabled:opacity-60"
                    >
                      {placing ? "Sipariş oluşturuluyor..." : `Siparişi tamamla — ${formatTL(total)}`}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar — order summary */}
            <aside className="border-ek-line-2 bg-ek-bg-card h-fit rounded-xl border p-6 lg:sticky lg:top-[120px]">
              <h3 className="h-3 mb-4">Sipariş özeti</h3>
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 text-sm">
                    <div className="text-ek-ink-3 shrink-0">{item.qty}×</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{item.name}</div>
                      <div className="mono">{[item.size, item.color].filter(Boolean).join(" · ")}</div>
                    </div>
                    <div className="shrink-0 font-serif">{formatTL(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="border-ek-line-2 space-y-1.5 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-ek-ink-3">Ara toplam</span>
                  <span>{formatTL(subtotal)}</span>
                </div>
                {coupon && discount > 0 && (
                  <div className="text-ek-ok flex justify-between">
                    <span>İndirim ({coupon.code})</span>
                    <span>−{formatTL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ek-ink-3">Kargo</span>
                  <span>{shipping === 0 ? "Ücretsiz" : formatTL(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--ek-line-2)] pt-2 text-base font-medium">
                  <span>Toplam</span>
                  <span className="font-serif text-xl">{formatTL(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function FormField({
  label,
  type = "text",
  className,
  textarea,
  value,
  onChange,
  autoComplete,
  inputMode,
  placeholder,
  maxLength,
}: {
  label: string;
  type?: string;
  className?: string;
  textarea?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search" | "url" | "none";
  placeholder?: string;
  maxLength?: number;
}) {
  const guessedAutoComplete = autoComplete
    ?? (type === "email" ? "email" : type === "tel" ? "tel" : undefined);
  const guessedInputMode = inputMode
    ?? (type === "email" ? "email" : type === "tel" ? "tel" : undefined);
  return (
    <div className={className}>
      <label className="eyebrow mb-2 block">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          autoComplete={guessedAutoComplete}
          inputMode={guessedInputMode}
          placeholder={placeholder}
          maxLength={maxLength}
          className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
      )}
    </div>
  );
}

function ShipOption({
  icon,
  title,
  desc,
  selected,
  onSelect,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={
        "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors " +
        (selected ? "border-ek-forest bg-ek-cream" : "border-ek-line hover:border-ek-ink-3")
      }
    >
      <div className="text-ek-ink-3">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="text-ek-ink-2 text-sm font-medium">{desc}</div>
    </button>
  );
}
