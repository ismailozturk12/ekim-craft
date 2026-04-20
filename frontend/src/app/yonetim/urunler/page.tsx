"use client";

import { Camera, Edit, Eye, EyeOff, Info, Package, Plus, Ruler, Sparkles, Tag as TagIcon, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Chip } from "@/components/ekim/chip";
import { Placeholder, toneForProduct } from "@/components/ekim/placeholder";
import { ProductImageUploader } from "@/components/ekim/product-image-uploader";
import { ProductVariantEditor } from "@/components/ekim/product-variant-editor";
import { Stars } from "@/components/ekim/stars";
import { StatusPill } from "@/components/ekim/status-pill";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatTL } from "@/lib/format";
import { apiErrorMessage, authedFetch } from "@/store/auth";

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  category: number;
  category_slug: string;
  price: string;
  old_price: string | null;
  rating: string;
  review_count: number;
  tags: string[];
  customizable: boolean;
  size_type: string;
  is_visible: boolean;
  cover_image: string | null;
  artisan?: string;
  artisan_city?: string;
  currency?: string;
}

interface ProductForm {
  id?: number;
  slug: string;
  name: string;
  category: number;
  price: string;
  old_price: string;
  description: string;
  customizable: boolean;
  size_type: string;
  tags: string;
  is_visible: boolean;
}

const CATEGORY_CHIPS = [
  { label: "Tümü", slug: "" },
  { label: "Oyuncak", slug: "oyuncak" },
  { label: "Hediyelik", slug: "hediyelik" },
  { label: "Tablo", slug: "tablo" },
  { label: "Saat", slug: "saat" },
  { label: "Aksesuar", slug: "aksesuar" },
  { label: "Dekor", slug: "dekor" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; slug: string; name: string }>>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        authedFetch("/catalog/admin/products/?page_size=100"),
        authedFetch("/catalog/categories/"),
      ]);
      if (pRes.ok) setProducts((await pRes.json()).results ?? []);
      if (cRes.ok) setCategories(await cRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter ? products.filter((p) => p.category_slug === filter) : products;

  const startNew = () => {
    setForm({
      slug: "",
      name: "",
      category: categories[0]?.id ?? 1,
      price: "",
      old_price: "",
      description: "",
      customizable: false,
      size_type: "one-size",
      tags: "",
      is_visible: true,
    });
    setOpen(true);
  };

  const startEdit = async (slug: string) => {
    const res = await authedFetch(`/catalog/admin/products/${slug}/`);
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    const p = await res.json();
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      old_price: p.old_price ?? "",
      description: p.description ?? "",
      customizable: p.customizable,
      size_type: p.size_type,
      tags: (p.tags ?? []).join(", "),
      is_visible: p.is_visible,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form) return;
    const payload = {
      name: form.name,
      category: form.category,
      price: form.price,
      old_price: form.old_price || null,
      description: form.description,
      customizable: form.customizable,
      size_type: form.size_type,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_visible: form.is_visible,
    };
    const isNew = !form.id;
    const res = await authedFetch(
      isNew ? "/catalog/admin/products/" : `/catalog/admin/products/${form.slug}/`,
      {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success(isNew ? "Ürün oluşturuldu" : "Ürün güncellendi");
    setOpen(false);
    setForm(null);
    load();
  };

  const remove = async (slug: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğine emin misin?`)) return;
    const res = await authedFetch(`/catalog/admin/products/${slug}/`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      toast.error(await apiErrorMessage(res));
      return;
    }
    toast.success("Ürün silindi");
    load();
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="h-2">Ürünler</h1>
          <p className="text-ek-ink-3 text-sm">
            {products.length} ürün · {filtered.length} gösteriliyor
          </p>
        </div>
        <button
          onClick={startNew}
          className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          <Plus size={14} /> Yeni ürün
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {CATEGORY_CHIPS.map((c) => (
          <Chip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="border-ek-line-2 bg-ek-bg-card overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="text-ek-ink-3 border-b border-[var(--ek-line-2)] text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Fiyat</th>
              <th className="px-4 py-3 text-center">Özel</th>
              <th className="px-4 py-3 text-right">Puan</th>
              <th className="px-4 py-3 text-right">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ek-line-2)]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <div className="text-ek-ink-3">Yükleniyor...</div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ek-bg-elevated">
                  <td onClick={() => startEdit(p.slug)} className="cursor-pointer px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded">
                        <Placeholder tone={toneForProduct(String(p.id))} ratio="1" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="mono">#{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Chip size="sm">{p.category_slug}</Chip>
                  </td>
                  <td className="px-4 py-3 text-right font-serif">{formatTL(parseFloat(p.price))}</td>
                  <td className="px-4 py-3 text-center">
                    {p.customizable ? <span className="text-ek-terra">✦</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Stars rating={parseFloat(p.rating)} size={12} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.is_visible ? (
                      <StatusPill variant="success">Aktif</StatusPill>
                    ) : (
                      <StatusPill variant="neutral">Gizli</StatusPill>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(p.slug)}
                        className="text-ek-ink-3 hover:text-ek-ink p-1.5"
                        aria-label="Düzenle"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => remove(p.slug, p.name)}
                        className="text-ek-ink-3 hover:text-ek-warn p-1.5"
                        aria-label="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="!bg-[var(--ek-bg-elevated)] flex max-h-[90vh] !max-w-2xl flex-col overflow-hidden !p-0 shadow-2xl sm:!max-w-2xl"
        >
          {form && (
            <>
              {/* Header */}
              <header className="border-ek-line-2 flex items-center justify-between border-b bg-[var(--ek-bg-card)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-ek-cream text-ek-forest flex h-10 w-10 items-center justify-center rounded-full">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="h-3">{form.id ? "Ürünü düzenle" : "Yeni ürün oluştur"}</h3>
                    {form.id ? (
                      <div className="mono mt-0.5">{form.slug}</div>
                    ) : (
                      <div className="mono mt-0.5">Kaydedince mağazada görünür</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-ek-ink-3 hover:bg-ek-bg-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </header>

              {/* Body — scroll */}
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                {/* Temel bilgiler */}
                <section>
                  <FormSectionHeader icon={<Info size={14} />} title="Temel bilgiler" />
                  <Field
                    label="ÜRÜN ADI"
                    value={form.name}
                    placeholder="Örn. Ahşap İsimli Tren Seti"
                    onChange={(v) => setForm((p) => (p ? { ...p, name: v } : p))}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mono mb-1.5 block">KATEGORİ</label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => (p ? { ...p, category: parseInt(e.target.value) } : p))
                        }
                        className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full cursor-pointer rounded-md border px-3 py-2.5 text-sm outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mono mb-1.5 flex items-center gap-1">
                        <Ruler size={11} />
                        BEDEN TİPİ
                      </label>
                      <select
                        value={form.size_type}
                        onChange={(e) =>
                          setForm((p) => (p ? { ...p, size_type: e.target.value } : p))
                        }
                        className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full cursor-pointer rounded-md border px-3 py-2.5 text-sm outline-none"
                      >
                        <option value="one-size">Tek beden</option>
                        <option value="apparel">Tekstil (S/M/L)</option>
                        <option value="numeric-cm">Santim ölçü</option>
                        <option value="paper">Kağıt ebadı</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mono mb-1.5 block">AÇIKLAMA</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => (p ? { ...p, description: e.target.value } : p))
                      }
                      placeholder="Ürün hikayesi, malzeme detayı, kullanım bilgisi..."
                      className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                </section>

                {/* Fiyatlandırma */}
                <section>
                  <FormSectionHeader icon={<span className="font-serif">₺</span>} title="Fiyatlandırma" />
                  <div className="grid grid-cols-2 gap-3">
                    <MoneyField
                      label="FİYAT"
                      value={form.price}
                      required
                      onChange={(v) => setForm((p) => (p ? { ...p, price: v } : p))}
                    />
                    <MoneyField
                      label="ESKİ FİYAT (indirim için)"
                      value={form.old_price}
                      onChange={(v) => setForm((p) => (p ? { ...p, old_price: v } : p))}
                    />
                  </div>
                  {form.old_price && parseFloat(form.old_price) > parseFloat(form.price || "0") && (
                    <div className="bg-ek-terra/10 text-ek-terra-2 mt-2 rounded-md px-3 py-2 text-xs">
                      %
                      {Math.round(
                        ((parseFloat(form.old_price) - parseFloat(form.price || "0")) /
                          parseFloat(form.old_price)) *
                          100
                      )}{" "}
                      indirim olarak gösterilecek
                    </div>
                  )}
                </section>

                {/* Etiketler */}
                <section>
                  <FormSectionHeader icon={<TagIcon size={14} />} title="Etiketler" />
                  <Field
                    label="VİRGÜL İLE AYIRARAK"
                    value={form.tags}
                    placeholder="Yeni, Çok satan, Sınırlı"
                    onChange={(v) => setForm((p) => (p ? { ...p, tags: v } : p))}
                  />
                  {form.tags.trim() && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((t) => (
                          <span
                            key={t}
                            className="bg-ek-cream text-ek-ink-2 rounded-full px-2.5 py-0.5 text-xs"
                          >
                            {t}
                          </span>
                        ))}
                    </div>
                  )}
                </section>

                {/* Fotoğraflar — sadece mevcut ürünler için */}
                <section>
                  <FormSectionHeader icon={<Camera size={14} />} title="Fotoğraflar" />
                  {form.id ? (
                    <ProductImageUploader slug={form.slug} />
                  ) : (
                    <div className="bg-ek-cream text-ek-ink-3 rounded-md px-3 py-3 text-xs">
                      💡 Önce ürünü oluştur — kaydedince fotoğraf ekleyebilirsin.
                    </div>
                  )}
                </section>

                {/* Varyantlar — sadece mevcut ürünler için */}
                <section>
                  <FormSectionHeader icon={<Ruler size={14} />} title="Varyantlar (beden / renk / stok)" />
                  {form.id ? (
                    <ProductVariantEditor slug={form.slug} />
                  ) : (
                    <div className="bg-ek-cream text-ek-ink-3 rounded-md px-3 py-3 text-xs">
                      💡 Önce ürünü oluştur — kaydedince varyant ekleyebilirsin.
                    </div>
                  )}
                </section>

                {/* Seçenekler */}
                <section>
                  <FormSectionHeader icon={<Sparkles size={14} />} title="Seçenekler" />
                  <div className="space-y-2">
                    <ToggleRow
                      label="Kişiselleştirilebilir"
                      desc="Müşteri isim / fotoğraf / not ekleyebilsin"
                      checked={form.customizable}
                      onChange={(v) => setForm((p) => (p ? { ...p, customizable: v } : p))}
                    />
                    <ToggleRow
                      label="Mağazada görünür"
                      desc="Kapalıysa müşteri sayfada görmez"
                      icon={
                        form.is_visible ? (
                          <Eye size={14} className="text-ek-ok" />
                        ) : (
                          <EyeOff size={14} className="text-ek-ink-4" />
                        )
                      }
                      checked={form.is_visible}
                      onChange={(v) => setForm((p) => (p ? { ...p, is_visible: v } : p))}
                    />
                  </div>
                </section>
              </div>

              {/* Footer — sticky */}
              <footer className="border-ek-line-2 flex items-center gap-3 border-t bg-[var(--ek-bg-card)] px-6 py-4">
                <div className="text-ek-ink-3 mono flex-1">
                  {form.id ? "Son düzenleme anında kaydedilir" : "Yayınla sonrası düzenleyebilirsin"}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="border-ek-line hover:border-ek-ink-3 rounded-full border px-5 py-2 text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={save}
                  disabled={!form.name || !form.price}
                  className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {form.id ? "Değişiklikleri kaydet" : "Ürünü oluştur"}
                </button>
              </footer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mono mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors"
      />
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mono mb-1.5 block">
        {label}
        {required && <span className="text-ek-terra ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="text-ek-ink-3 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-serif text-base">
          ₺
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="border-ek-line bg-ek-bg-card focus:border-ek-forest w-full rounded-md border py-2.5 pl-8 pr-3 text-sm tabular-nums outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function FormSectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="bg-ek-cream text-ek-forest flex h-6 w-6 items-center justify-center rounded-full text-xs">
        {icon}
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  icon,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="border-ek-line-2 bg-ek-bg-card hover:border-ek-ink-3 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </div>
        {desc && <div className="mono mt-0.5">{desc}</div>}
      </div>
      <div
        className={
          "relative h-6 w-11 rounded-full transition-colors " +
          (checked ? "bg-ek-forest" : "bg-ek-line")
        }
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-5" : "translate-x-0.5")
          }
        />
      </div>
    </label>
  );
}
