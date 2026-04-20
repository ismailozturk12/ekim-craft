import { cn } from "@/lib/utils";
import type { ProductTag } from "@/types/catalog";

const TAG_STYLES: Record<ProductTag | "default", string> = {
  Yeni: "bg-ek-forest text-ek-cream",
  "Çok satan": "bg-ek-terra text-ek-cream",
  Sınırlı: "bg-ek-warn text-white",
  İndirim: "bg-ek-terra-2 text-white",
  "Elde yapıldı": "bg-ek-sage text-ek-ink",
  default: "bg-ek-ink text-ek-cream",
};

export function Tag({
  label,
  variant = "default",
  className,
}: {
  label: ProductTag | string;
  variant?: ProductTag | "default";
  className?: string;
}) {
  const style = TAG_STYLES[variant] ?? TAG_STYLES.default;
  return (
    <span
      className={cn(
        "font-mono inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
