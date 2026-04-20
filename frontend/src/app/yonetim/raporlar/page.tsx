"use client";

import { BarChart3, Download, FileSpreadsheet, FileText, Package, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";

const REPORTS = [
  { id: "satis", icon: BarChart3, name: "Aylık satış raporu", desc: "Ay bazında gelir, sipariş sayısı ve kategori kırılımı." },
  { id: "musteri", icon: Users, name: "Müşteri analizi", desc: "Yeni/mevcut müşteri, LTV, sepet ortalaması." },
  { id: "kampanya", icon: FileSpreadsheet, name: "Kampanya raporu", desc: "Kupon kullanımı, ROI, dönüşüm oranı." },
  { id: "stok", icon: Package, name: "Stok raporu", desc: "Varyant bazlı stok hareketi, kritik stok tahmini." },
  { id: "kargo", icon: Truck, name: "Kargo raporu", desc: "Taşıyıcı bazında gönderim süresi ve iade oranı." },
  { id: "kdv", icon: FileText, name: "KDV raporu", desc: "Dönemsel KDV hesaplaması, GİB uyumlu." },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ReportsPage() {
  const access = useAuth((s) => s.access);

  const download = async (reportId: string, fmt: "pdf" | "csv") => {
    const url = `${API_URL}/api/v1/core/admin/reports/${reportId}/?ext=${fmt}`;
    try {
      const res = await fetch(url, {
        headers: access ? { Authorization: `Bearer ${access}` } : {},
      });
      if (!res.ok) {
        toast.error("Rapor indirilemedi");
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ekim-${reportId}-${new Date().toISOString().slice(0, 10)}.${fmt}`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`${reportId}.${fmt} indirildi`);
    } catch {
      toast.error("İndirme hatası");
    }
  };

  return (
    <div className="p-8">
      <h1 className="h-2 mb-2">Raporlar</h1>
      <p className="text-ek-ink-3 mb-6 text-sm">
        6 rapor tipi · CSV veya PDF olarak indir
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="border-ek-line-2 bg-ek-bg-card rounded-xl border p-5">
            <div className="bg-ek-cream text-ek-forest mb-4 flex h-10 w-10 items-center justify-center rounded-full">
              <r.icon size={18} />
            </div>
            <h3 className="h-3 mb-2">{r.name}</h3>
            <p className="text-ek-ink-3 mb-4 text-sm">{r.desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => download(r.id, "pdf")}
                className="border-ek-line hover:border-ek-ink-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
              >
                <Download size={12} /> PDF
              </button>
              <button
                onClick={() => download(r.id, "csv")}
                className="border-ek-line hover:border-ek-ink-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
              >
                <Download size={12} /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-ek-bg-elevated text-ek-ink-3 mt-8 rounded-lg p-4 text-xs">
        💡 Not: Şu an rapor formatları örnek içerik. Gerçek veri export'u (Celery + PDF render) Faz 11'de aktive edilecek.
      </div>
    </div>
  );
}
