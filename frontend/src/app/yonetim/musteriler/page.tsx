"use client";

import { Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDateShort, formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: number;
  is_vip: boolean;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("/core/admin/customers/");
        if (!res.ok) {
          toast.error(await apiErrorMessage(res));
          return;
        }
        const data = await res.json();
        setCustomers(data.results ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="h-2 mb-2">Müşteriler</h1>
      <p className="text-ek-ink-3 mb-6 text-sm">
        {customers.length} müşteri · {customers.filter((c) => c.is_vip).length} VIP
      </p>

      <div className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
        <div className="border-b border-[var(--ek-line-2)] p-4">
          <div className="border-ek-line bg-ek-bg-elevated flex max-w-sm items-center gap-2 rounded-full border px-3 py-1.5">
            <Search size={14} className="text-ek-ink-3" />
            <input
              placeholder="İsim, e-posta, telefon..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="text-ek-ink-3 py-10 text-center text-sm">Müşteri yok.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
            <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3 text-right">Sipariş</th>
                <th className="px-4 py-3 text-right">Harcama (180g)</th>
                <th className="px-4 py-3 text-right">Üyelik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ek-line-2)]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-ek-bg-elevated">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-ek-cream font-serif flex h-9 w-9 items-center justify-center rounded-full text-sm">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-medium">
                          {c.name}
                          {c.is_vip && <Star size={13} className="fill-ek-terra text-ek-terra" />}
                        </div>
                        <div className="mono">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{c.orders_count}</td>
                  <td className="px-4 py-3 text-right font-serif">{formatTL(c.total_spent)}</td>
                  <td className="px-4 py-3 text-right text-xs">{formatDateShort(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
