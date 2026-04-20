import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  delta,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  tone?: "default" | "terra" | "forest" | "warn";
  className?: string;
}) {
  const toneBg: Record<string, string> = {
    default: "bg-ek-cream",
    terra: "bg-ek-terra/15",
    forest: "bg-ek-forest/10",
    warn: "bg-ek-warn/10",
  };

  return (
    <div
      className={cn(
        "border-ek-line-2 relative overflow-hidden rounded-lg border p-5",
        toneBg[tone],
        className
      )}
    >
      <div className="eyebrow mb-3">{label}</div>
      <div className="font-serif text-3xl leading-none">{value}</div>
      <div className="mt-2 flex items-center justify-between">
        {delta !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              delta >= 0 ? "text-ek-ok" : "text-ek-warn"
            )}
          >
            {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        ) : (
          <span />
        )}
        {hint && <div className="mono">{hint}</div>}
      </div>
    </div>
  );
}
