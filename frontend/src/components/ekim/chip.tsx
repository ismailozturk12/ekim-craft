import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}

/**
 * Chip — kategori filtresi, etiket, seçim chip'i.
 * Ekim Craft tasarım handoff'tan.
 */
export function Chip({
  active,
  removable,
  onRemove,
  size = "md",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border transition-colors",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active
          ? "border-ek-ink bg-ek-ink text-ek-cream"
          : "border-ek-line bg-ek-bg-elevated text-ek-ink-2 hover:border-ek-ink-3",
        className
      )}
    >
      {children}
      {removable && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="-mr-1 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
        >
          ×
        </span>
      )}
    </button>
  );
}
