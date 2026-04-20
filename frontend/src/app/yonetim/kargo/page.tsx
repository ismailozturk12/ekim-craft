"use client";

import { KPICard } from "@/components/ekim/kpi-card";
import { StatusPill } from "@/components/ekim/status-pill";

const SHIPMENTS = [
  { id: "1Z2847193", order: "EK-28501", customer: "Ayşe Demir", carrier: "Aras", city: "İstanbul", status: "Dağıtımda", estim: "20 Nis" },
  { id: "1Z2847125", order: "EK-28500", customer: "Murat Can", carrier: "Yurtiçi", city: "Ankara", status: "Yolda", estim: "21 Nis" },
  { id: "1Z2847087", order: "EK-28499", customer: "Zeynep Yıldız", carrier: "MNG", city: "İzmir", status: "Toplandı", estim: "22 Nis" },
];

const RETURNS = [
  { id: "IAD-1023", order: "EK-28410", customer: "Kaan T.", reason: "Beden uymadı", status: "Onaylandı" },
  { id: "IAD-1019", order: "EK-28398", customer: "Burcu A.", reason: "Hasarlı geldi", status: "Talep edildi" },
];

export default function ShippingAdminPage() {
  return (
    <div className="p-8">
      <h1 className="h-2 mb-6">Kargo & iade</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard label="HAZIRLANIYOR" value={8} tone="warn" />
        <KPICard label="YOLDA" value={14} tone="default" hint="ortalama 1.8g" />
        <KPICard label="İADE TALEBİ" value={2} tone="terra" />
      </div>

      <h2 className="h-3 mb-3">Aktif gönderiler</h2>
      <div className="border-ek-line-2 bg-ek-bg-card mb-6 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Takip no</th>
              <th className="px-4 py-3">Sipariş</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Taşıyıcı</th>
              <th className="px-4 py-3">Şehir</th>
              <th className="px-4 py-3 text-right">Tahmini</th>
              <th className="px-4 py-3 text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ek-line-2)]">
            {SHIPMENTS.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.order}</td>
                <td className="px-4 py-3">{s.customer}</td>
                <td className="px-4 py-3">{s.carrier}</td>
                <td className="px-4 py-3">{s.city}</td>
                <td className="px-4 py-3 text-right">{s.estim}</td>
                <td className="px-4 py-3 text-right">
                  <StatusPill variant="info">{s.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="h-3 mb-3">İade talepleri</h2>
      <div className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Talep</th>
              <th className="px-4 py-3">Sipariş</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Sebep</th>
              <th className="px-4 py-3 text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ek-line-2)]">
            {RETURNS.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.order}</td>
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3">{r.reason}</td>
                <td className="px-4 py-3 text-right">
                  <StatusPill variant={r.status === "Onaylandı" ? "success" : "warn"}>
                    {r.status}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
