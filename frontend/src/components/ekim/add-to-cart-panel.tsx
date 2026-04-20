"use client";

import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTL } from "@/lib/format";
import { useCart } from "@/store/cart";

interface Variant {
  id: number;
  size_label: string;
  color_name: string;
  color_hex: string;
  stock: number;
}

interface AddToCartPanelProps {
  productId: number;
  slug: string;
  name: string;
  price: number;
  variants: Variant[];
  customizable: boolean;
}

export function AddToCartPanel({
  productId,
  slug,
  name,
  price,
  variants,
  customizable,
}: AddToCartPanelProps) {
  const addItem = useCart((s) => s.addItem);
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size_label).filter(Boolean))), [
    variants,
  ]);
  const colors = useMemo(
    () => Array.from(new Map(variants.map((v) => [v.color_name, v.color_hex])).entries()),
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]?.[0]);
  const [wished, setWished] = useState(false);

  const onAdd = () => {
    const key = `${slug}|${selectedSize ?? ""}|${selectedColor ?? ""}`;
    addItem({
      key,
      productId,
      slug,
      name,
      price,
      qty: 1,
      size: selectedSize,
      color: selectedColor,
      customizable,
    });
  };

  return (
    <>
      {colors.length > 0 && (
        <div className="mb-6">
          <div className="eyebrow mb-3">RENK {selectedColor ? `— ${selectedColor}` : ""}</div>
          <div className="flex flex-wrap gap-2">
            {colors.map(([cname, chex]) => {
              const active = selectedColor === cname;
              return (
                <button
                  key={cname}
                  onClick={() => setSelectedColor(cname)}
                  className={
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors " +
                    (active ? "border-ek-ink bg-ek-ink text-ek-cream" : "border-ek-line hover:border-ek-ink-3")
                  }
                >
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ background: chex, borderColor: "rgba(0,0,0,0.12)" }}
                  />
                  {cname}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mb-6">
          <div className="eyebrow mb-3">BEDEN {selectedSize ? `— ${selectedSize}` : ""}</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {sizes.map((s) => {
              const active = selectedSize === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={
                    "rounded-md border py-2.5 text-sm transition-colors " +
                    (active
                      ? "border-ek-forest bg-ek-cream"
                      : "border-ek-line hover:border-ek-ink-3")
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onAdd}
          className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream flex-1 rounded-full py-6 text-sm font-medium"
        >
          Sepete ekle — {formatTL(price)}
        </Button>
        <Button
          onClick={() => setWished((w) => !w)}
          variant="outline"
          className={
            "rounded-full px-5 " +
            (wished
              ? "bg-ek-terra border-ek-terra text-white"
              : "border-ek-line hover:border-ek-ink")
          }
          aria-label="Favorilere ekle"
        >
          <Heart size={18} className={wished ? "fill-current" : ""} />
        </Button>
      </div>
    </>
  );
}
