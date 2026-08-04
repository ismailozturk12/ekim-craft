import { cn } from "@/lib/utils";
import type { ProductTag } from "@/types/catalog";

/* Kraft etiket görünümü: zemin hep kese rengi, tür farkı delik/nokta renginde.
   Renkli blok rozetler tasarım yenilemesinde (5 Ağu 2026) emekli edildi. */
const TAG_DOTS: Record<ProductTag | "default", string> = {
  Yeni: "bg-ek-forest",
  "Çok satan": "bg-ek-terra",
  Sınırlı: "bg-ek-warn",
  İndirim: "bg-ek-terra-2",
  "Elde yapıldı": "bg-ek-sage",
  default: "bg-ek-ink",
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
  const dot = TAG_DOTS[variant] ?? TAG_DOTS.default;
  return (
    <span
      className={cn(
        "font-mono bg-ek-cream/95 text-ek-ink-2 border-ek-ink/15 inline-flex items-center gap-1.5 rounded-[3px_999px_999px_3px] border py-0.5 pl-1.5 pr-2.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
