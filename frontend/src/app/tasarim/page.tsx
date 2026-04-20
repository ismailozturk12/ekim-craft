"use client";

import { Download, Image as ImageIcon, Save, Trash2, Type } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Placeholder } from "@/components/ekim/placeholder";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { formatTL } from "@/lib/format";
import { useCart } from "@/store/cart";

const FONTS = [
  { id: "serif", name: "Fraunces (serif)", family: "var(--font-serif)" },
  { id: "sans", name: "Inter (sans)", family: "var(--font-sans)" },
  { id: "mono", name: "JetBrains (mono)", family: "var(--font-mono)" },
  { id: "script", name: "El yazısı", family: "'Brush Script MT', cursive" },
];

const COLORS = ["#1a1f1c", "#c17b5a", "#2d4a3e", "#8a9a7b", "#b8462e", "#d4b886", "#fafaf7", "#5d3a1f"];

const PRODUCT_BASES = [
  { id: "tote", name: "Tote çanta", color: "#d4b886", price: 240 },
  { id: "cup", name: "Seramik kupa", color: "#fafaf7", price: 220 },
  { id: "poster", name: "Poster", color: "#ede4cf", price: 180 },
  { id: "tshirt", name: "Tişört", color: "#2d4a3e", price: 320 },
];

interface Layer {
  id: string;
  kind: "text" | "image";
  text?: string;
  font?: string;
  color?: string;
  imageUrl?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function StudioPage() {
  const [baseIdx, setBaseIdx] = useState(0);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "1",
      kind: "text",
      text: "Senin adın",
      font: FONTS[0].family,
      color: COLORS[0],
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    },
  ]);
  const [selected, setSelected] = useState<string>("1");
  const fileRef = useRef<HTMLInputElement>(null);
  const addItem = useCart((s) => s.addItem);
  const base = PRODUCT_BASES[baseIdx];

  const selectedLayer = useMemo(() => layers.find((l) => l.id === selected), [layers, selected]);

  const updateLayer = (id: string, patch: Partial<Layer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const removeLayer = (id: string) =>
    setLayers((ls) => {
      const next = ls.filter((l) => l.id !== id);
      setSelected(next[0]?.id ?? "");
      return next;
    });

  const addText = () => {
    const id = String(Date.now());
    setLayers((ls) => [
      ...ls,
      {
        id,
        kind: "text",
        text: "Yeni metin",
        font: FONTS[0].family,
        color: COLORS[0],
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelected(id);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const id = String(Date.now());
      setLayers((ls) => [
        ...ls,
        {
          id,
          kind: "image",
          imageUrl: reader.result as string,
          x: 50,
          y: 50,
          scale: 0.6,
          rotation: 0,
        },
      ]);
      setSelected(id);
    };
    reader.readAsDataURL(f);
  };

  const addToCart = () => {
    const textLayer = layers.find((l) => l.kind === "text");
    const imageLayer = layers.find((l) => l.kind === "image");
    addItem({
      key: `studio-${base.id}-${Date.now()}`,
      productId: -1,
      slug: `studio-${base.id}`,
      name: `Kişiye özel ${base.name}`,
      price: base.price,
      qty: 1,
      customizable: true,
      personalization: {
        text: textLayer?.text,
        imageUrl: imageLayer?.imageUrl,
      },
    });
    toast.success("Sepete eklendi — tasarımın kaydedildi.");
  };

  return (
    <>
      <Header />
      <main className="bg-ek-bg-elevated flex-1">
        {/* Studio toolbar */}
        <div className="bg-ek-ink text-ek-cream">
          <div className="flex items-center gap-4 px-6 py-3">
            <Link href="/" className="text-ek-cream/70 hover:text-ek-cream text-sm">
              ← Çıkış
            </Link>
            <div className="mono text-ek-cream/60">
              TASARIM STÜDYOSU · {base.name.toUpperCase()}
            </div>
            <div className="ml-auto flex gap-2">
              <button className="border-ek-cream/20 hover:bg-ek-cream/10 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs">
                <Save size={13} />
                Taslak kaydet
              </button>
              <button className="border-ek-cream/20 hover:bg-ek-cream/10 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs">
                <Download size={13} />
                PNG indir
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[280px_1fr_320px]">
          {/* Sol: Katmanlar */}
          <aside className="bg-ek-bg-card border-ek-line-2 h-fit rounded-xl border p-5">
            <div className="eyebrow mb-3">KATMANLAR</div>
            <div className="mb-4 space-y-1">
              {layers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className={
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors " +
                    (selected === l.id
                      ? "bg-ek-cream"
                      : "hover:bg-ek-bg-elevated")
                  }
                >
                  {l.kind === "text" ? <Type size={14} /> : <ImageIcon size={14} />}
                  <span className="flex-1 truncate">{l.kind === "text" ? l.text : "Görsel"}</span>
                  <Trash2
                    size={13}
                    className="text-ek-ink-4 hover:text-ek-warn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(l.id);
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="border-ek-line-2 space-y-2 border-t pt-4">
              <div className="eyebrow mb-2">EKLE</div>
              <button
                onClick={addText}
                className="border-ek-line hover:border-ek-ink-3 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <Type size={14} /> Metin ekle
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="border-ek-line hover:border-ek-ink-3 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <ImageIcon size={14} /> Görsel yükle
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />
            </div>

            <div className="border-ek-line-2 mt-4 border-t pt-4">
              <div className="eyebrow mb-2">ÜRÜN TABANI</div>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCT_BASES.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setBaseIdx(i)}
                    className={
                      "rounded-md border p-2 text-xs transition-colors " +
                      (baseIdx === i
                        ? "border-ek-forest bg-ek-cream"
                        : "border-ek-line hover:border-ek-ink-3")
                    }
                  >
                    <div
                      className="mx-auto mb-1.5 h-8 w-8 rounded-full"
                      style={{ background: p.color }}
                    />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Orta: Canvas */}
          <div className="flex min-h-[600px] items-center justify-center p-4">
            <div
              className="border-ek-line relative aspect-square w-full max-w-[540px] overflow-hidden rounded-lg border shadow-lg"
              style={{ background: base.color }}
            >
              {/* Grid */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, var(--ek-ink) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--ek-ink) 0 1px, transparent 1px 26px)",
                }}
              />
              {/* Safe area */}
              <div className="border-ek-ink/20 absolute inset-[15%] border border-dashed" />

              {/* Layers */}
              {layers.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className={
                    "absolute cursor-pointer select-none " +
                    (selected === l.id ? "outline-ek-terra outline outline-2 outline-offset-2" : "")
                  }
                  style={{
                    left: `${l.x}%`,
                    top: `${l.y}%`,
                    transform: `translate(-50%, -50%) scale(${l.scale}) rotate(${l.rotation}deg)`,
                  }}
                >
                  {l.kind === "text" ? (
                    <span
                      style={{
                        fontFamily: l.font,
                        color: l.color,
                        fontSize: "clamp(24px, 4vw, 54px)",
                        lineHeight: 1.1,
                      }}
                    >
                      {l.text}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrl} alt="layer" className="h-auto max-h-[280px] w-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: Özellikler */}
          <aside className="bg-ek-bg-card border-ek-line-2 h-fit rounded-xl border p-5">
            <div className="eyebrow mb-3">SEÇİLİ KATMAN</div>
            {!selectedLayer ? (
              <div className="text-ek-ink-3 text-sm">Bir katman seç veya ekle.</div>
            ) : selectedLayer.kind === "text" ? (
              <div className="space-y-4">
                <div>
                  <label className="eyebrow mb-1.5 block">METİN</label>
                  <input
                    value={selectedLayer.text ?? ""}
                    onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                    className="border-ek-line bg-ek-bg-elevated w-full rounded-md border px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block">FONT</label>
                  <div className="space-y-1">
                    {FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateLayer(selectedLayer.id, { font: f.family })}
                        className={
                          "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors " +
                          (selectedLayer.font === f.family
                            ? "border-ek-forest bg-ek-cream"
                            : "border-ek-line hover:border-ek-ink-3")
                        }
                        style={{ fontFamily: f.family }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block">RENK</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateLayer(selectedLayer.id, { color: c })}
                        className={
                          "aspect-square rounded-full border-2 transition-transform " +
                          (selectedLayer.color === c
                            ? "border-ek-ink scale-110"
                            : "border-transparent")
                        }
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="eyebrow mb-1.5 block">
                    ÖLÇEK — {Math.round(selectedLayer.scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.2}
                    max={2}
                    step={0.05}
                    value={selectedLayer.scale}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block">AÇI — {selectedLayer.rotation}°</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={selectedLayer.rotation}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="border-ek-line-2 mt-5 border-t pt-5">
              <div className="eyebrow mb-2">TOPLAM</div>
              <div className="font-serif text-3xl">{formatTL(base.price)}</div>
              <div className="mono mt-1">Üretim: 3-5 gün</div>
              <button
                onClick={addToCart}
                className="bg-ek-forest text-ek-cream hover:bg-ek-forest-2 mt-4 w-full rounded-full py-3 text-sm font-medium"
              >
                Sepete ekle
              </button>
            </div>

            <Placeholder tone="terra" label="önizleme" ratio="16 / 9" className="mt-4 rounded-lg" />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
