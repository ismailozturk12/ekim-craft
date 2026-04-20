import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
  showNumber?: boolean;
}

export function Stars({ rating, size = 14, className, showNumber = false }: StarsProps) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5" aria-label={`${rating} yıldız`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={cn(filled ? "fill-ek-terra text-ek-terra" : "text-ek-line")}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-ek-ink-2 text-sm font-medium tabular-nums">
          {rating.toFixed(1).replace(".", ",")}
        </span>
      )}
    </div>
  );
}
