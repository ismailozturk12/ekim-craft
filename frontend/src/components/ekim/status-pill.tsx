import { cn } from "@/lib/utils";

const VARIANTS = {
  neutral: "bg-ek-line-2 text-ek-ink-2",
  info: "bg-ek-blue/15 text-ek-blue border border-ek-blue/30",
  success: "bg-ek-ok/15 text-ek-ok border border-ek-ok/30",
  warn: "bg-ek-terra/15 text-ek-terra-2 border border-ek-terra/30",
  danger: "bg-ek-warn/15 text-ek-warn border border-ek-warn/30",
  sage: "bg-ek-sage/20 text-ek-forest border border-ek-sage/40",
} as const;

export type StatusVariant = keyof typeof VARIANTS;

export function StatusPill({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Sipariş durumuna göre uygun rengi verir */
export function orderStatusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (s.includes("teslim")) return "success";
  if (s.includes("kargo")) return "info";
  if (s.includes("uretim") || s.includes("hazır")) return "sage";
  if (s.includes("yeni") || s.includes("alındı")) return "warn";
  if (s.includes("iptal") || s.includes("iade")) return "danger";
  return "neutral";
}
