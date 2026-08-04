"use client";

import { ExternalLink, GalleryHorizontal, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiErrorMessage, authedFetch, useAuth } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Banner {
  id: number;
  image: string | null;
  image_mobile: string | null;
  title: string;
  link: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export default function BannersPage() {
  const access = useAuth((s) => s.access);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Yeni banner formu
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileMobile, setFileMobile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileMobileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/core/admin/banners/");
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      const data = await res.json();
      setBanners(data.results ?? data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setTitle("");
    setLink("");
    setSortOrder(banners.length);
    setFile(null);
    setFileMobile(null);
    if (fileRef.current) fileRef.current.value = "";
    if (fileMobileRef.current) fileMobileRef.current.value = "";
  };

  const create = async () => {
    if (!file) {
      toast.error("Masaüstü görseli zorunlu.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (fileMobile) fd.append("image_mobile", fileMobile);
      fd.append("title", title);
      fd.append("link", link);
      fd.append("sort_order", String(sortOrder));
      const res = await fetch(`${API_URL}/api/v1/core/admin/banners/`, {
        method: "POST",
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        body: fd,
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success("Banner eklendi — vitrinde en geç 1 dk içinde döner");
      setOpen(false);
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id: number, body: Partial<Pick<Banner, "active" | "sort_order" | "link" | "title">>) => {
    const res = await authedFetch(`/core/admin/banners/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return false;
    }
    return true;
  };

  const toggle = async (b: Banner) => {
    if (await patch(b.id, { active: !b.active })) {
      setBanners((xs) => xs.map((x) => (x.id === b.id ? { ...x, active: !b.active } : x)));
      toast.success(!b.active ? "Banner yayında" : "Banner yayından alındı");
    }
  };

  const changeSort = async (b: Banner, v: number) => {
    setBanners((xs) => xs.map((x) => (x.id === b.id ? { ...x, sort_order: v } : x)));
    await patch(b.id, { sort_order: v });
  };

  const remove = async (b: Banner) => {
    if (!confirm("Bu banner silinsin mi?")) return;
    const res = await authedFetch(`/core/admin/banners/${b.id}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    setBanners((xs) => xs.filter((x) => x.id !== b.id));
    toast.success("Banner silindi");
  };

  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-2">Bannerlar</h1>
          <p className="text-ek-ink-3 mt-1 text-sm">
            Ana sayfanın üstündeki kampanya şeridi. Banner yoksa markalı hazır slaytlar döner.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="bg-ek-terra hover:bg-ek-terra-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#1c1204]"
        >
          <Plus size={16} /> Banner ekle
        </button>
      </div>

      <div className="border-ek-line-2 bg-ek-bg-card text-ek-ink-2 rounded-lg border border-dashed p-4 text-xs leading-relaxed">
        Önerilen boyutlar: masaüstü <strong>1600×500</strong> (16:5 şerit), mobil{" "}
        <strong>1200×600</strong> (2:1). Mobil görsel yüklemezsen masaüstü görseli kırpılır —
        kenardaki yazılar kesilebilir. Görsele fiyat yazma; kampanya metni panelden değişince
        eski fiyatlı görsel yayında kalır.
      </div>

      {loading ? (
        <div className="text-ek-ink-3 text-sm">Yükleniyor…</div>
      ) : sorted.length === 0 ? (
        <div className="border-ek-line bg-ek-bg-elevated flex flex-col items-center gap-3 rounded-lg border p-10 text-center">
          <GalleryHorizontal size={28} className="text-ek-ink-3" />
          <div className="text-sm font-medium">Henüz banner yok</div>
          <div className="text-ek-ink-3 max-w-sm text-xs">
            Vitrinde şu an markalı hazır slaytlar dönüyor. İlk kampanya görselini yüklediğinde
            onlar otomatik devreden çıkar.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => (
            <div
              key={b.id}
              className="border-ek-line-2 bg-ek-bg-card flex flex-wrap items-center gap-4 rounded-lg border p-3"
            >
              <div className="border-ek-line w-40 shrink-0 overflow-hidden rounded-md border">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.title} className="aspect-[16/5] w-full object-cover" />
                ) : (
                  <div className="bg-ek-cream flex aspect-[16/5] items-center justify-center">
                    <ImagePlus size={18} className="text-ek-ink-3" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{b.title || `Banner #${b.id}`}</div>
                <div className="text-ek-ink-3 mt-0.5 flex items-center gap-1 truncate text-xs">
                  <ExternalLink size={11} /> {b.link || "—"}
                </div>
                {b.image_mobile && <div className="mono mt-1 !text-[10px]">+ mobil görsel</div>}
              </div>

              <label className="text-ek-ink-3 flex items-center gap-2 text-xs">
                Sıra
                <input
                  type="number"
                  value={b.sort_order}
                  onChange={(e) => changeSort(b, parseInt(e.target.value || "0", 10))}
                  className="border-ek-line bg-ek-bg-elevated w-16 rounded-md border px-2 py-1.5 text-sm"
                />
              </label>

              <button
                onClick={() => toggle(b)}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-medium " +
                  (b.active
                    ? "bg-ek-ok/15 text-ek-ok"
                    : "bg-ek-ink/10 text-ek-ink-3")
                }
              >
                {b.active ? "Yayında" : "Pasif"}
              </button>

              <button
                onClick={() => remove(b)}
                className="bg-ek-warn/90 hover:bg-ek-warn rounded-full p-2 text-white"
                aria-label="Sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!bg-[var(--ek-bg-elevated)] max-w-lg !gap-0 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Yeni banner</div>
            <button onClick={() => setOpen(false)} aria-label="Kapat">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Masaüstü görseli * <span className="text-ek-ink-3">(~1600×500)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="border-ek-line bg-ek-bg-card w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Mobil görseli <span className="text-ek-ink-3">(opsiyonel, ~1200×600)</span>
              </label>
              <input
                ref={fileMobileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFileMobile(e.target.files?.[0] ?? null)}
                className="border-ek-line bg-ek-bg-card w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Başlık (alt metni)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ör. Bahar kampanyası"
                className="border-ek-line bg-ek-bg-card w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-[1fr_90px] gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Link</label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/kategori/oyuncak"
                  className="border-ek-line bg-ek-bg-card w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Sıra</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))}
                  className="border-ek-line bg-ek-bg-card w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              onClick={create}
              disabled={saving}
              className="bg-ek-terra hover:bg-ek-terra-2 w-full rounded-full py-3 text-sm font-semibold text-[#1c1204] disabled:opacity-60"
            >
              {saving ? "Yükleniyor…" : "Banner'ı yayınla"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
