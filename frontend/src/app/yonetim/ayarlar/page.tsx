"use client";

import {
  Banknote,
  Bell,
  FolderTree,
  Globe,
  Key,
  Receipt,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { KPICard } from "@/components/ekim/kpi-card";
import { StatusPill } from "@/components/ekim/status-pill";
import { cn } from "@/lib/utils";

const PANELS = [
  { id: "store", label: "Mağaza", icon: Store, desc: "Ad, iletişim, para birimi" },
  { id: "categories", label: "Kategoriler", icon: FolderTree, desc: "Hiyerarşi, görünürlük" },
  { id: "shipping", label: "Kargo", icon: Truck, desc: "Taşıyıcılar, kurallar" },
  { id: "payments", label: "Ödeme", icon: Banknote, desc: "Sağlayıcılar, taksit" },
  { id: "invoicing", label: "E-fatura", icon: Receipt, desc: "Entegratör, GİB" },
  { id: "notifications", label: "Bildirim", icon: Bell, desc: "Şablon editörü" },
  { id: "users", label: "Kullanıcı & rol", icon: Users, desc: "Personel, izinler" },
  { id: "api", label: "API & Webhook", icon: Key, desc: "Pazaryeri, entegrasyon" },
];

export default function AdminSettingsPage() {
  const [active, setActive] = useState<string | null>(null);

  if (!active) {
    return (
      <div className="p-8">
        <h1 className="h-2 mb-2">Ayarlar</h1>
        <p className="text-ek-ink-3 mb-8 text-sm">8 panel · mağaza ve entegrasyon yönetimi</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PANELS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex flex-col items-start rounded-xl border p-6 text-left transition-colors"
            >
              <div className="bg-ek-cream text-ek-forest mb-4 flex h-10 w-10 items-center justify-center rounded-full">
                <p.icon size={18} />
              </div>
              <div className="font-medium">{p.label}</div>
              <div className="mono mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const panel = PANELS.find((p) => p.id === active)!;

  return (
    <div className="p-8">
      <button
        onClick={() => setActive(null)}
        className="text-ek-ink-3 mono hover:text-ek-ink mb-4"
      >
        ← Tüm ayarlar
      </button>
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-ek-cream text-ek-forest flex h-11 w-11 items-center justify-center rounded-full">
          <panel.icon size={18} />
        </div>
        <div>
          <h1 className="h-2">{panel.label}</h1>
          <p className="text-ek-ink-3 text-sm">{panel.desc}</p>
        </div>
      </div>

      <div className="max-w-4xl">
        {active === "store" && <StorePanel />}
        {active === "categories" && <CategoriesPanel />}
        {active === "shipping" && <ShippingPanel />}
        {active === "payments" && <PaymentsPanel />}
        {active === "invoicing" && <InvoicingPanel />}
        {active === "notifications" && <NotificationsPanel />}
        {active === "users" && <UsersPanel />}
        {active === "api" && <ApiPanel />}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-ek-line-2 bg-ek-bg-card mb-5 rounded-xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="h-3">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  type = "text",
  className,
}: {
  label: string;
  value?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="eyebrow mb-1.5 block">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none"
      />
    </div>
  );
}

function ToggleRow({ title, desc, defaultChecked = false }: { title: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <label className="border-ek-line-2 flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div>
        <div className="text-sm font-medium">{title}</div>
        {desc && <div className="mono mt-0.5">{desc}</div>}
      </div>
      <input type="checkbox" defaultChecked={defaultChecked} />
    </label>
  );
}

function StorePanel() {
  return (
    <>
      <Section title="Marka">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="TİCARİ UNVAN" value="Ekim Craft Atölye" />
          <Field label="URL" value="ekimcraft.com" />
          <Field label="KURULUŞ" value="2019" />
          <Field label="KATEGORİ" value="Hediyelik / El sanatları" />
        </div>
      </Section>
      <Section title="Vergi ve adres">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="VERGİ NO" value="1234567890" />
          <Field label="MERSİS" value="0123456789012345" />
          <Field label="ADRES" className="md:col-span-2" value="Caferağa Mah. Moda Cd. 142, Kadıköy İstanbul" />
        </div>
      </Section>
      <Section title="Para / dil / zaman dilimi">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="PARA BİRİMİ" value="TRY (₺)" />
          <Field label="DİL" value="Türkçe" />
          <Field label="TZ" value="Europe/Istanbul" />
        </div>
      </Section>
    </>
  );
}

function CategoriesPanel() {
  const cats = ["Oyuncak", "Hediyelik", "Tablo", "Saat", "Aksesuar", "Ev Dekor"];
  return (
    <Section title="Kategoriler" action={<button className="border-ek-line rounded-full border px-3 py-1.5 text-xs">+ Yeni</button>}>
      <div className="space-y-2">
        {cats.map((c) => (
          <div key={c} className="border-ek-line-2 flex items-center gap-3 rounded-md border p-3">
            <div className="bg-ek-bg-elevated h-8 w-8 rounded" />
            <span className="flex-1 font-medium">{c}</span>
            <StatusPill variant="success">Görünür</StatusPill>
            <button className="text-ek-ink-3 hover:text-ek-ink text-xs">Düzenle</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ShippingPanel() {
  const providers = [
    { name: "Aras Kargo", connected: true, volume: 312 },
    { name: "MNG Kargo", connected: true, volume: 184 },
    { name: "Yurtiçi Kargo", connected: false, volume: 0 },
    { name: "PTT Kargo", connected: false, volume: 0 },
    { name: "UPS", connected: false, volume: 0 },
  ];
  return (
    <>
      <Section title="Taşıyıcılar">
        <div className="grid gap-3 md:grid-cols-2">
          {providers.map((p) => (
            <div key={p.name} className="border-ek-line-2 rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                {p.connected ? (
                  <StatusPill variant="success">Bağlı</StatusPill>
                ) : (
                  <StatusPill variant="neutral">Bağlı değil</StatusPill>
                )}
              </div>
              <div className="mono">30g: {p.volume} gönderi</div>
              <button className="border-ek-line mt-3 w-full rounded-full border py-1.5 text-xs">
                {p.connected ? "Yönet" : "Bağla"}
              </button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Kurallar">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="ÜCRETSİZ KARGO ÜSTÜ" value="500 TL" />
          <Field label="STANDART KARGO" value="49.90 TL" />
          <Field label="HIZLI KARGO" value="89.00 TL" />
        </div>
        <div className="mt-4">
          <ToggleRow title="Otomatik kargo etiketi" desc="Sipariş onaylandığında PDF üretilir" defaultChecked />
          <ToggleRow title="SMS ile bildirim" desc="Kargoya verildi, dağıtımda, teslim" defaultChecked />
          <ToggleRow title="Teslimat fotoğrafı" desc="Kurye ile konumdaki fotoğrafı paylaş" />
        </div>
      </Section>
    </>
  );
}

function PaymentsPanel() {
  const providers = [
    { name: "iyzico", enabled: true, commission: "2.29% + 0.25₺", recommended: true },
    { name: "PayTR", enabled: false, commission: "2.39%" },
    { name: "Paynet", enabled: false, commission: "2.49%" },
    { name: "Garanti BBVA", enabled: false, commission: "Banka oranı" },
    { name: "İş Bankası", enabled: false, commission: "Banka oranı" },
    { name: "Stripe", enabled: false, commission: "Uluslararası" },
  ];
  return (
    <>
      <Section title="Ödeme sağlayıcıları">
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.name} className="border-ek-line-2 flex items-center gap-3 rounded-md border p-3">
              <input type="checkbox" defaultChecked={p.enabled} />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium">
                  {p.name}
                  {p.recommended && (
                    <StatusPill variant="success">Önerilen</StatusPill>
                  )}
                </div>
                <div className="mono">{p.commission}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Taksit seçenekleri">
        <div className="flex flex-wrap gap-2">
          {[2, 3, 6, 9, 12].map((n) => (
            <button
              key={n}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                n <= 6 ? "bg-ek-cream border-ek-forest" : "border-ek-line"
              )}
            >
              {n} taksit
            </button>
          ))}
        </div>
      </Section>
      <Section title="3D Secure">
        <ToggleRow title="Zorunlu 3D Secure" desc="Tüm kart ödemeleri için" defaultChecked />
        <ToggleRow title="Yüksek tutar uyarısı" desc="1000₺ üstünde ek doğrulama" defaultChecked />
      </Section>
    </>
  );
}

function InvoicingPanel() {
  return (
    <>
      <Section title="Entegratör">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="SAĞLAYICI" value="Logo İşbaşı" />
          <Field label="VERGİ DAİRESİ" value="Kadıköy" />
        </div>
      </Section>
      <Section title="Otomatik gönderim">
        <ToggleRow title="E-arşiv fatura — B2C" desc="Kişisel alışveriş" defaultChecked />
        <ToggleRow title="E-fatura — B2B" desc="Vergi mükellefi alışveriş" defaultChecked />
        <ToggleRow title="İrsaliye" desc="Gönderi ile birlikte" />
        <ToggleRow title="İade faturası" desc="İade onayında otomatik" defaultChecked />
      </Section>
      <Section title="Kullanım (30g)">
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard label="FATURA KESİLDİ" value={1248} />
          <KPICard label="BAŞARI ORANI" value="99.8%" tone="forest" />
          <KPICard label="BEKLEYEN" value={3} tone="warn" />
        </div>
      </Section>
    </>
  );
}

function NotificationsPanel() {
  const events = [
    "Sipariş alındı",
    "Ödeme onaylandı",
    "Hazırlanıyor",
    "Kargoya verildi",
    "Teslim edildi",
    "İptal edildi",
    "İade talep edildi",
    "Yorum isteği",
  ];
  return (
    <Section title="Şablon editörü">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {events.map((e, i) => (
            <button
              key={e}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-sm",
                i === 0 ? "bg-ek-cream" : "hover:bg-ek-bg-elevated"
              )}
            >
              {e}
            </button>
          ))}
        </nav>
        <div>
          <div className="mb-4 flex gap-1 border-b border-[var(--ek-line-2)]">
            {["E-posta", "SMS", "WhatsApp"].map((t, i) => (
              <button
                key={t}
                className={cn(
                  "px-4 py-2 text-sm",
                  i === 0 ? "border-ek-forest text-ek-forest border-b-2" : "text-ek-ink-3"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Field label="KONU" value="Siparişini aldık, {{customer.name}}" />
          <div className="mt-3">
            <label className="eyebrow mb-1.5 block">İÇERİK</label>
            <textarea
              rows={8}
              className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
              defaultValue={`Merhaba {{customer.name}},\n\n#{{order.number}} numaralı siparişin bize ulaştı. Atölyemizde özenle hazırlanmaya başlandı.\n\nHer adımda seni haberdar edeceğiz.\n\nEkim Craft`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="mono text-ek-ink-3 mr-2">DEĞİŞKENLER:</div>
            {["{{customer.name}}", "{{order.number}}", "{{order.total}}", "{{tracking_url}}"].map((v) => (
              <span
                key={v}
                className="border-ek-line bg-ek-bg-elevated rounded border px-2 py-0.5 font-mono text-[10px]"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function UsersPanel() {
  const users = [
    { name: "Deniz Kaya", email: "deniz@ekimcraft.com", role: "Sahibi", status: "Aktif" },
    { name: "Mert Su", email: "mert@ekimcraft.com", role: "Atölye", status: "Aktif" },
    { name: "Ayça Türk", email: "ayca@ekimcraft.com", role: "Üretim", status: "Aktif" },
    { name: "Barış Er", email: "baris@ekimcraft.com", role: "Müşteri İlişkileri", status: "Aktif" },
    { name: "Sibel Uz", email: "sibel@ekimcraft.com", role: "Muhasebe", status: "Askıda" },
  ];
  const roles = [
    { name: "Sahibi", count: 1, perms: "Tam yetki" },
    { name: "Atölye", count: 1, perms: "Sipariş + stok" },
    { name: "Üretim", count: 1, perms: "Sipariş görüntüle" },
    { name: "Müşteri İlişkileri", count: 1, perms: "Sipariş + iade + yorum" },
    { name: "Muhasebe", count: 1, perms: "Finans + fatura" },
  ];
  return (
    <>
      <Section title="Personel" action={<button className="border-ek-line rounded-full border px-3 py-1.5 text-xs">+ Davet</button>}>
        <table className="w-full text-sm">
          <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
            <tr><th className="py-2">İsim</th><th>E-posta</th><th>Rol</th><th>Durum</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--ek-line-2)]">
            {users.map((u) => (
              <tr key={u.email}>
                <td className="py-2 font-medium">{u.name}</td>
                <td className="py-2 mono">{u.email}</td>
                <td className="py-2">{u.role}</td>
                <td className="py-2">
                  <StatusPill variant={u.status === "Aktif" ? "success" : "warn"}>{u.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Roller">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.name} className="border-ek-line-2 rounded-lg border p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium">{r.name}</div>
                <span className="mono">{r.count} kişi</span>
              </div>
              <div className="mono">{r.perms}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Güvenlik">
        <ToggleRow title="2FA zorunlu" desc="Tüm personel için" defaultChecked />
        <ToggleRow title="IP kısıtlama" desc="Sadece atölye IP'si" />
      </Section>
    </>
  );
}

function ApiPanel() {
  const keys = [
    { name: "Storefront public", key: "ek_live_pk_••••a8f2", created: "01 Oca", scope: "read:products" },
    { name: "Admin (worker)", key: "ek_live_sk_••••3b19", created: "14 Mar", scope: "full" },
    { name: "Webhook signer", key: "ek_whk_••••72cd", created: "02 Nis", scope: "webhook" },
  ];
  const webhooks = [
    { url: "https://ekim.acc/webhook/orders", events: "order.created, order.paid", lastCode: 200 },
    { url: "https://erp.ekim.io/hooks", events: "order.shipped", lastCode: 200 },
    { url: "https://analytics.ekim/in", events: "*", lastCode: 503 },
  ];
  const marketplaces = ["Trendyol", "Hepsiburada", "Etsy", "n11", "ÇiçekSepeti", "Amazon"];
  return (
    <>
      <Section title="API anahtarları" action={<button className="border-ek-line rounded-full border px-3 py-1.5 text-xs">+ Yeni</button>}>
        <table className="w-full text-sm">
          <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
            <tr><th className="py-2">İsim</th><th>Anahtar</th><th>Oluşturuldu</th><th>Kapsam</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--ek-line-2)]">
            {keys.map((k) => (
              <tr key={k.key}>
                <td className="py-2">{k.name}</td>
                <td className="py-2 mono">{k.key}</td>
                <td className="py-2">{k.created}</td>
                <td className="py-2">{k.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Webhook endpoint'leri">
        <div className="space-y-2">
          {webhooks.map((w) => (
            <div key={w.url} className="border-ek-line-2 flex items-center gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-xs">{w.url}</div>
                <div className="mono">{w.events}</div>
              </div>
              <StatusPill variant={w.lastCode === 200 ? "success" : "danger"}>{w.lastCode}</StatusPill>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Pazaryeri entegrasyonları">
        <div className="grid gap-3 md:grid-cols-3">
          {marketplaces.map((m, i) => (
            <div key={m} className="border-ek-line-2 flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{m}</div>
                <div className="mono">{i < 2 ? "Bağlı" : "Bağlı değil"}</div>
              </div>
              <button className="border-ek-line rounded-full border px-3 py-1 text-xs">
                {i < 2 ? "Yönet" : "Bağla"}
              </button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
