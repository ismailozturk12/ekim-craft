"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface Variant {
  id: number;
  size_label: string;
  color_name: string;
  color_hex: string;
  sku: string;
  stock: number;
  price_delta: string;
  is_active: boolean;
}

export function ProductVariantEditor({ slug }: { slug: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    size_label: "",
    color_name: "",
    color_hex: "#d4b886",
    stock: "0",
  });

  const load = useCallback(async () => {
    try {
      const res = await authedFetch(`/catalog/admin/variants/?product=${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      setVariants(Array.isArray(data) ? data : (data.results ?? []));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) load();
  }, [slug, load]);

  const addVariant = async () => {
    if (!draft.size_label && !draft.color_name) {
      toast.error("Beden veya renk girmelisin");
      return;
    }
    const res = await authedFetch("/catalog/admin/variants/", {
      method: "POST",
      body: JSON.stringify({
        product_slug: slug,
        size_label: draft.size_label,
        color_name: draft.color_name,
        color_hex: draft.color_hex,
        stock: parseInt(draft.stock) || 0,
        is_active: true,
      }),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Varyant eklendi");
    setDraft({ size_label: "", color_name: "", color_hex: "#d4b886", stock: "0" });
    load();
  };

  const updateVariant = async (id: number, patch: Partial<Variant>) => {
    const res = await authedFetch(`/catalog/admin/variants/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    const updated = await res.json();
    setVariants((xs) => xs.map((v) => (v.id === id ? updated : v)));
  };

  const removeVariant = async (id: number) => {
    if (!confirm("Bu varyantı silmek istediğine emin misin?")) return;
    const res = await authedFetch(`/catalog/admin/variants/${id}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Varyant silindi");
    setVariants((xs) => xs.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <div className="border-ek-line-2 overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-ek-bg-elevated text-ek-ink-3 text-left text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">Beden</th>
                <th className="px-3 py-2">Renk</th>
                <th className="px-3 py-2 text-right">Stok</th>
                <th className="px-3 py-2 text-right">Aktif</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ek-line-2)]">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-ek-bg-elevated">
                  <td className="px-3 py-2">
                    <input
                      defaultValue={v.size_label}
                      onBlur={(e) => {
                        if (e.target.value !== v.size_label)
                          updateVariant(v.id, { size_label: e.target.value });
                      }}
                      className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full rounded border px-2 py-1 text-xs outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        defaultValue={v.color_hex || "#d4b886"}
                        onBlur={(e) =>
                          e.target.value !== v.color_hex && updateVariant(v.id, { color_hex: e.target.value })
                        }
                        className="h-6 w-6 shrink-0 cursor-pointer rounded"
                      />
                      <input
                        defaultValue={v.color_name}
                        onBlur={(e) => {
                          if (e.target.value !== v.color_name)
                            updateVariant(v.id, { color_name: e.target.value });
                        }}
                        className="border-ek-line bg-ek-bg-card focus:border-ek-forest flex-1 rounded border px-2 py-1 text-xs outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      onBlur={(e) => {
                        const n = parseInt(e.target.value);
                        if (!isNaN(n) && n !== v.stock) updateVariant(v.id, { stock: n });
                      }}
                      className="border-ek-line bg-ek-bg-card w-16 rounded border px-2 py-1 text-right text-xs outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="checkbox"
                      checked={v.is_active}
                      onChange={(e) => updateVariant(v.id, { is_active: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeVariant(v.id)}
                      className="text-ek-ink-3 hover:text-ek-warn p-1"
                      aria-label="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni ekle satırı */}
      <div className="border-ek-line-2 bg-ek-bg-card grid grid-cols-[1fr_1fr_auto_auto] gap-2 rounded-md border p-3">
        <input
          value={draft.size_label}
          onChange={(e) => setDraft((p) => ({ ...p, size_label: e.target.value }))}
          placeholder="Beden (S, 30 cm, A5...)"
          className="border-ek-line bg-ek-bg-elevated rounded border px-2.5 py-1.5 text-xs outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={draft.color_hex}
            onChange={(e) => setDraft((p) => ({ ...p, color_hex: e.target.value }))}
            className="h-7 w-7 shrink-0 cursor-pointer rounded"
          />
          <input
            value={draft.color_name}
            onChange={(e) => setDraft((p) => ({ ...p, color_name: e.target.value }))}
            placeholder="Renk (Doğal kavak...)"
            className="border-ek-line bg-ek-bg-elevated flex-1 rounded border px-2.5 py-1.5 text-xs outline-none"
          />
        </div>
        <input
          type="number"
          min={0}
          value={draft.stock}
          onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))}
          placeholder="Stok"
          className="border-ek-line bg-ek-bg-elevated w-16 rounded border px-2 py-1.5 text-right text-xs outline-none"
        />
        <button
          onClick={addVariant}
          className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
        >
          <Plus size={12} /> Ekle
        </button>
      </div>

      {loading && <div className="text-ek-ink-3 text-xs">Yükleniyor...</div>}
      {!loading && variants.length === 0 && (
        <div className="text-ek-ink-3 text-xs">
          💡 Varyant yok. Beden/renk/stok kombinasyonu ekleyerek başla.
        </div>
      )}
    </div>
  );
}
