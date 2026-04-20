"use client";

import { Check, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiErrorMessage, useAuth } from "@/store/auth";

interface ImageItem {
  id: number;
  image: string | null;
  alt: string;
  sort_order: number;
  is_cover: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function ProductImageUploader({ slug }: { slug: string }) {
  const access = useAuth((s) => s.access);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const auth: HeadersInit = access ? { Authorization: `Bearer ${access}` } : {};

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/catalog/admin/products/${slug}/`, {
        headers: { ...auth },
      });
      if (!res.ok) return;
      const data = await res.json();
      setImages(data.images ?? []);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, access]);

  useEffect(() => {
    if (slug) load();
  }, [slug, load]);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("image", f));
      const res = await fetch(`${API_URL}/api/v1/catalog/admin/products/${slug}/images/`, {
        method: "POST",
        headers: { ...auth },
        body: fd,
      });
      if (!res.ok) {
        toast.error(await apiErrorMessage(res));
        return;
      }
      toast.success(`${list.length} fotoğraf yüklendi`);
      load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Bu fotoğrafı sil?")) return;
    const res = await fetch(`${API_URL}/api/v1/catalog/admin/images/${id}/`, {
      method: "DELETE",
      headers: { ...auth },
    });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Fotoğraf silindi");
    setImages((xs) => xs.filter((x) => x.id !== id));
  };

  const setCover = async (id: number) => {
    const res = await fetch(`${API_URL}/api/v1/catalog/admin/images/${id}/set-cover/`, {
      method: "POST",
      headers: { ...auth },
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Kapak güncellendi");
    setImages((xs) => xs.map((x) => ({ ...x, is_cover: x.id === id })));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group border-ek-line-2 relative aspect-square overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {img.image ? (
                <img
                  src={img.image}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="bg-ek-cream flex h-full w-full items-center justify-center">
                  <ImagePlus size={24} className="text-ek-ink-3" />
                </div>
              )}

              {img.is_cover && (
                <div className="bg-ek-terra absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                  <Check size={10} /> KAPAK
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_cover && (
                  <button
                    onClick={() => setCover(img.id)}
                    className="rounded-full bg-white/90 px-2.5 py-1 text-xs hover:bg-white"
                    title="Kapak yap"
                  >
                    <Star size={12} className="inline" /> Kapak
                  </button>
                )}
                <button
                  onClick={() => remove(img.id)}
                  className="bg-ek-warn/95 hover:bg-ek-warn rounded-full p-1.5 text-white"
                  aria-label="Sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-ek-terra bg-ek-terra/10"
            : "border-ek-line bg-ek-bg-card hover:border-ek-ink-3"
        )}
      >
        <Upload size={22} className={dragOver ? "text-ek-terra" : "text-ek-ink-3"} />
        <div className="text-sm font-medium">
          {uploading ? "Yükleniyor..." : "Görselleri sürükle veya seç"}
        </div>
        <div className="mono">PNG · JPG · WebP · birden fazla seçebilirsin</div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />

      {loading && (
        <div className="text-ek-ink-3 text-xs">Mevcut görseller yükleniyor...</div>
      )}
      {!loading && images.length === 0 && (
        <div className="text-ek-ink-3 text-xs">
          💡 Henüz görsel yok. İlk yüklediğin otomatik <strong>kapak</strong> olur.
        </div>
      )}
    </div>
  );
}
