"use client";

import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ekim/empty-state";

export default function AddressesPage() {
  const addresses: Array<{ id: number; label: string; line: string; city: string; phone: string; is_default: boolean }> = [];

  if (addresses.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="h-1">Adreslerim</h1>
          <button className="bg-ek-ink text-ek-cream inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
            <Plus size={14} /> Yeni adres
          </button>
        </div>
        <EmptyState
          title="Adres eklenmemiş"
          description="Çekinilecek bir şey yok, ilk sipariş esnasında da ekleyebilirsin."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="h-1 mb-6">Adreslerim</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{a.label}</div>
              {a.is_default && (
                <span className="bg-ek-cream rounded-full px-2 py-0.5 text-[10px]">Varsayılan</span>
              )}
            </div>
            <div className="text-ek-ink-2 text-sm">{a.line}</div>
            <div className="mono mt-1">
              {a.city} · {a.phone}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
