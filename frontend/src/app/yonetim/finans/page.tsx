"use client";

import { KPICard } from "@/components/ekim/kpi-card";
import { Sparkline } from "@/components/ekim/sparkline";
import { formatTL } from "@/lib/format";

const REVENUE = [
  12, 14, 18, 11, 22, 28, 24, 16, 19, 23, 30, 26, 22, 18, 25, 34, 28, 24, 32, 38, 29, 22, 26, 31, 41, 36,
  28, 24, 32, 44,
];

const EXPENSES = [
  { cat: "Malzeme", amount: 24800, pct: 48 },
  { cat: "Kargo", amount: 12400, pct: 24 },
  { cat: "Personel", amount: 8600, pct: 17 },
  { cat: "Kira", amount: 3200, pct: 6 },
  { cat: "Diğer", amount: 2600, pct: 5 },
];

const PAYMENT_METHODS = [
  { method: "Kredi kartı", pct: 72, amount: 45300 },
  { method: "Havale / EFT", pct: 18, amount: 11300 },
  { method: "Cüzdan", pct: 8, amount: 5000 },
  { method: "Kapıda", pct: 2, amount: 1260 },
];

export default function FinancePage() {
  const total = REVENUE.reduce((s, v) => s + v, 0) * 100;
  const expense = 51600;
  const net = total - expense;

  return (
    <div className="p-8">
      <h1 className="h-2 mb-6">Finans</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <KPICard label="30G GELİR" value={formatTL(total)} delta={8.4} tone="forest" />
        <KPICard label="30G GİDER" value={formatTL(expense)} delta={-2.1} tone="warn" />
        <KPICard label="NET KAR" value={formatTL(net)} delta={14.2} tone="forest" hint="%33.5 marj" />
        <KPICard label="BEKLEYEN" value={formatTL(4800)} hint="iyzico havuzu" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
          <div className="mb-4">
            <div className="eyebrow mb-1">30 GÜNLÜK GELİR</div>
            <div className="font-serif text-3xl">{formatTL(total)}</div>
          </div>
          <Sparkline data={REVENUE} height={140} color="var(--ek-forest)" fill="var(--ek-forest)" />
        </div>

        <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
          <h2 className="h-3 mb-4">Gider kırılımı</h2>
          <div className="space-y-3">
            {EXPENSES.map((e) => (
              <div key={e.cat}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{e.cat}</span>
                  <span className="font-mono text-xs">{formatTL(e.amount)}</span>
                </div>
                <div className="bg-ek-bg-elevated h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-ek-warn h-full rounded-full"
                    style={{ width: `${e.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-6">
        <h2 className="h-3 mb-4">Ödeme yöntemi dağılımı</h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((p) => (
            <div key={p.method} className="flex items-center gap-4">
              <div className="w-32 text-sm">{p.method}</div>
              <div className="bg-ek-bg-elevated h-6 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-ek-terra flex h-full items-center justify-end pr-2 text-[10px] font-medium text-white"
                  style={{ width: `${p.pct}%` }}
                >
                  {p.pct}%
                </div>
              </div>
              <div className="w-24 text-right font-mono text-xs">{formatTL(p.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
