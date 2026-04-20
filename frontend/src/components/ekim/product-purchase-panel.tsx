"use client";

import {
  Check,
  Gift,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
  Shield,
  Sparkles,
  Trash2,
  Truck,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Placeholder } from "@/components/ekim/placeholder";
import { formatTL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

interface Variant {
  id: number;
  size_label: string;
  color_name: string;
  color_hex: string;
  stock: number;
}

interface ProductPurchasePanelProps {
  productId: number;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  variants: Variant[];
  customizable: boolean;
  sizeType: string;
  leadTime: string;
}

const SIZE_LABEL: Record<string, string> = {
  apparel: "Beden",
  "numeric-cm": "Boyut",
  "one-size": "Boyut",
  paper: "Ebat",
};

const CUSTOM_FONTS = [
  { id: "serif", label: "Klasik", family: "var(--font-serif)", italic: false, preview: "Ada" },
  { id: "script", label: "El yazısı", family: "'Brush Script MT', cursive", italic: true, preview: "Ada" },
  { id: "mono", label: "Modern", family: "var(--font-mono)", italic: false, preview: "ADA" },
];

const PERSONALIZATION_PRICE = 180;
const CUSTOM_SIZE_PRICE = 120;
const GIFT_WRAP_PRICE = 40;

type PersonalizationMode = "image" | "text" | "note" | null;

export function ProductPurchasePanel({
  productId,
  slug,
  name,
  price,
  variants,
  customizable,
  sizeType,
  leadTime,
}: ProductPurchasePanelProps) {
  const addItem = useCart((s) => s.addItem);

  const sizes = useMemo(() => {
    const seen = new Map<string, number>();
    for (const v of variants) {
      if (!v.size_label) continue;
      seen.set(v.size_label, (seen.get(v.size_label) ?? 0) + v.stock);
    }
    return Array.from(seen.entries()).map(([label, stock]) => ({ label, stock }));
  }, [variants]);

  const colors = useMemo(
    () => Array.from(new Map(variants.map((v) => [v.color_name, v.color_hex])).entries()).filter(([n]) => !!n),
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes.find((s) => s.stock > 0)?.label ?? sizes[0]?.label
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]?.[0]);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  // Özel ölçü
  const [customSizeOn, setCustomSizeOn] = useState(false);
  const [customDims, setCustomDims] = useState({ w: "", h: "", d: "" });

  // Kişiye özel
  const [customMode, setCustomMode] = useState<PersonalizationMode>(null);
  const [uploaded, setUploaded] = useState<{ name: string; dataUrl: string; size: number } | null>(null);
  const [customText, setCustomText] = useState("");
  const [customFont, setCustomFont] = useState("serif");
  const [orderNote, setOrderNote] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stockForSize = sizes.find((s) => s.label === selectedSize)?.stock ?? 0;
  const hasPersonalization = !!uploaded || !!customText || !!orderNote;
  const personalizationFee = hasPersonalization ? PERSONALIZATION_PRICE : 0;
  const customSizeFee = customSizeOn ? CUSTOM_SIZE_PRICE : 0;
  const giftWrapFee = giftWrap ? GIFT_WRAP_PRICE : 0;
  const totalPrice = price * qty + personalizationFee + customSizeFee + giftWrapFee;

  const onAdd = () => {
    const key = `${slug}|${selectedSize ?? ""}|${selectedColor ?? ""}|${Date.now()}`;
    addItem({
      key,
      productId,
      slug,
      name,
      price: totalPrice / qty,
      qty,
      size: selectedSize,
      color: selectedColor,
      customizable,
      personalization: hasPersonalization
        ? {
            imageUrl: uploaded?.dataUrl,
            text: customText || undefined,
            note: orderNote || undefined,
          }
        : undefined,
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setUploaded({ name: f.name, dataUrl: reader.result as string, size: f.size });
    reader.readAsDataURL(f);
  };

  const canCustomSize = sizeType === "numeric-cm" || customizable;

  return (
    <>
      {/* RENK */}
      {colors.length > 0 && (
        <div className="mb-6">
          <div className="label mb-2.5">
            Renk: <span className="text-ek-ink-3 font-normal">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map(([cname, chex]) => {
              const active = selectedColor === cname;
              return (
                <button
                  key={cname}
                  onClick={() => setSelectedColor(cname)}
                  title={cname}
                  className={cn(
                    "relative h-9 w-9 rounded-full transition-all",
                    active
                      ? "ring-ek-ink ring-offset-ek-bg ring-2 ring-offset-2"
                      : "border-ek-line hover:scale-105 border"
                  )}
                  style={{ background: chex }}
                  aria-label={cname}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* BEDEN */}
      {sizes.length > 0 && (
        <div className="mb-6">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="label">
              {SIZE_LABEL[sizeType] ?? "Boyut"}:{" "}
              <span className="text-ek-ink-3 font-normal">{selectedSize}</span>
            </div>
            <button className="mono hover:text-ek-ink flex items-center gap-1 transition-colors">
              <Ruler size={11} />
              BEDEN REHBERİ
            </button>
          </div>
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${sizes.length <= 4 ? sizes.length : 3}, minmax(0, 1fr))`,
            }}
          >
            {sizes.map((s) => {
              const active = selectedSize === s.label;
              const out = s.stock === 0;
              return (
                <button
                  key={s.label}
                  onClick={() => !out && setSelectedSize(s.label)}
                  disabled={out}
                  className={cn(
                    "rounded-md border px-2 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-ek-ink bg-ek-ink text-ek-cream"
                      : out
                        ? "border-ek-line-2 text-ek-ink-4 line-through cursor-not-allowed"
                        : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Özel ölçü */}
          {canCustomSize && (
            <label className="mt-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={customSizeOn}
                onChange={(e) => setCustomSizeOn(e.target.checked)}
              />
              <span className="text-sm">
                Özel ölçü iste{" "}
                <span className="text-ek-ink-3">(+{formatTL(CUSTOM_SIZE_PRICE)} / ek 3 iş günü)</span>
              </span>
            </label>
          )}
          {customSizeOn && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["w", "h", "d"] as const).map((k, i) => (
                <div key={k}>
                  <label className="mono mb-1 block">
                    {i === 0 ? "EN (cm)" : i === 1 ? "BOY (cm)" : "YÜK (cm)"}
                  </label>
                  <input
                    value={customDims[k]}
                    onChange={(e) => setCustomDims((d) => ({ ...d, [k]: e.target.value }))}
                    placeholder={i === 0 ? "40" : i === 1 ? "28" : "opsiyonel"}
                    className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-2 py-2 text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KİŞİYE ÖZEL */}
      {customizable && (
        <div className="bg-ek-cream border-ek-terra mb-6 rounded-lg border p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-ek-terra-2 mb-1 flex items-center gap-1.5">
                <Sparkles size={13} />
                <div className="label text-ek-terra-2">KİŞİYE ÖZEL</div>
              </div>
              <div className="font-serif text-lg leading-tight">
                İsim, çizim ya da fotoğraf işlet
              </div>
            </div>
            <span className="bg-ek-bg-elevated mono rounded px-2 py-1 whitespace-nowrap">
              +{formatTL(PERSONALIZATION_PRICE)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "image", label: "Görsel", icon: Upload },
              { id: "text", label: "Metin", icon: Sparkles },
              { id: "note", label: "Not", icon: Gift },
            ].map((o) => {
              const Icon = o.icon;
              const active = customMode === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setCustomMode(active ? null : (o.id as PersonalizationMode))}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-ek-terra border-ek-terra text-white"
                      : "border-ek-line bg-ek-bg-elevated text-ek-ink-2 hover:border-ek-ink-3"
                  )}
                >
                  <Icon size={13} />
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Image tab */}
          {customMode === "image" && (
            <div className="mt-4">
              {!uploaded ? (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-ek-terra bg-ek-bg-elevated hover:bg-ek-bg-card flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors"
                  >
                    <Upload size={28} className="text-ek-terra" />
                    <div className="text-sm font-medium">Görsel sürükle veya seç</div>
                    <div className="mono">PNG, JPG, SVG · max 10MB · min 1000×1000px</div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                    className="hidden"
                  />
                  <div className="mono text-ek-ink-3 mt-2.5">
                    💡 İpucu: Beyaz arka plan, yüksek kontrast en iyi sonucu verir.
                  </div>
                </>
              ) : (
                <div className="bg-ek-bg-elevated rounded-md p-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploaded.dataUrl}
                      alt=""
                      className="border-ek-line h-16 w-16 rounded border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{uploaded.name}</div>
                      <div className="mono">{(uploaded.size / 1024).toFixed(0)} KB</div>
                      <div className="text-ek-ok mt-1 flex items-center gap-1 text-xs">
                        <Check size={11} />
                        Üretime uygun
                      </div>
                    </div>
                    <button
                      onClick={() => setUploaded(null)}
                      className="text-ek-ink-3 hover:text-ek-warn p-1"
                      aria-label="Kaldır"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text tab */}
          {customMode === "text" && (
            <div className="mt-4">
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value.slice(0, 32))}
                placeholder="Örn: Deniz & Mert · 2026"
                maxLength={32}
                className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
              />
              <div className="mono mt-1 text-right">{customText.length}/32</div>

              <div className="mono mt-3 mb-2">YAZI TİPİ</div>
              <div className="grid grid-cols-3 gap-1.5">
                {CUSTOM_FONTS.map((f) => {
                  const active = customFont === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCustomFont(f.id)}
                      className={cn(
                        "rounded-md border py-2 text-lg transition-colors",
                        active
                          ? "border-ek-ink bg-ek-ink text-ek-cream"
                          : "border-ek-line bg-ek-bg-elevated hover:border-ek-ink-3"
                      )}
                      style={{
                        fontFamily: f.family,
                        fontStyle: f.italic ? "italic" : "normal",
                      }}
                    >
                      {f.preview}
                    </button>
                  );
                })}
              </div>
              {customText && (
                <div className="border-ek-line bg-ek-bg-elevated mt-3 rounded-md border p-4 text-center">
                  <div className="mono mb-2">ÖNİZLEME</div>
                  <div
                    className="text-ek-terra-2 text-3xl"
                    style={{
                      fontFamily: CUSTOM_FONTS.find((f) => f.id === customFont)?.family,
                      fontStyle: customFont === "script" ? "italic" : "normal",
                    }}
                  >
                    {customText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note tab */}
          {customMode === "note" && (
            <div className="mt-4">
              <textarea
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value.slice(0, 200))}
                placeholder="Hediye paketi olarak gönderilsin, içine 'Doğum günün kutlu olsun anneciğim' notu eklensin."
                maxLength={200}
                className="border-ek-line bg-ek-bg-elevated focus:border-ek-forest w-full rounded-md border px-3 py-2 text-sm outline-none"
              />
              <div className="mono mt-1 text-right">{orderNote.length}/200</div>
              <label className="mt-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                />
                <span className="text-sm">
                  Hediye paketi olarak gönder <span className="text-ek-ink-3">(+{formatTL(GIFT_WRAP_PRICE)})</span>
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* QTY + ATC + WISH */}
      <div className="mb-4 flex items-stretch gap-3">
        <div className="border-ek-line flex items-center gap-1 overflow-hidden rounded-full border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="hover:bg-ek-bg-elevated px-4 py-3.5"
            aria-label="Azalt"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="hover:bg-ek-bg-elevated px-4 py-3.5"
            aria-label="Arttır"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={onAdd}
          disabled={stockForSize === 0}
          className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingBag size={15} strokeWidth={1.75} />
          Sepete ekle · {formatTL(totalPrice)}
        </button>
        <button
          onClick={() => setWished((w) => !w)}
          className={cn(
            "flex aspect-square items-center justify-center rounded-full border transition-colors",
            wished
              ? "bg-ek-terra border-ek-terra text-white"
              : "border-ek-line hover:border-ek-ink"
          )}
          aria-label="Favorilere ekle"
        >
          <Heart size={18} className={wished ? "fill-current" : ""} />
        </button>
      </div>

      {/* Stok durumu */}
      <div className="border-ek-line-2 bg-ek-bg-elevated rounded-md border p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              stockForSize > 5
                ? "bg-ek-ok"
                : stockForSize > 0
                  ? "bg-ek-warn animate-pulse"
                  : "bg-ek-ink-4"
            )}
          />
          <span className="text-sm font-medium">
            {stockForSize > 5
              ? `Stokta var (${stockForSize} adet)`
              : stockForSize > 0
                ? `Az kaldı! Sadece ${stockForSize} adet`
                : "Bu beden tükendi"}
          </span>
        </div>
        <div className="text-ek-ink-2 mb-1.5 flex items-center gap-2 text-sm">
          <Truck size={13} className="text-ek-ink-3" />
          Tahmini teslim: <strong>{leadTime || "3-5 gün"}</strong>
        </div>
        <div className="text-ek-ink-2 flex items-center gap-2 text-sm">
          <Shield size={13} className="text-ek-ink-3" />
          14 gün koşulsuz iade
        </div>
      </div>
    </>
  );
}
