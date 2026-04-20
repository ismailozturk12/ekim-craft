import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
  color?: string;
  fill?: string;
  showLastDot?: boolean;
}

/**
 * SVG sparkline — polyline + alan doldurma. Son nokta vurgulanır.
 * Tasarım handoff'tan birebir.
 */
export function Sparkline({
  data,
  height = 80,
  className,
  color = "var(--ek-terra)",
  fill = "var(--ek-terra)",
  showLastDot = true,
}: SparklineProps) {
  if (data.length === 0) return null;
  const w = 300;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h * 0.85 - 4;
    return [x, y] as const;
  });

  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
  const fillPath = `M 0 ${h} L ${points.map(([x, y]) => `${x} ${y}`).join(" L ")} L ${w} ${h} Z`;
  const [lx, ly] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkfill)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {showLastDot && <circle cx={lx} cy={ly} r={4} fill={color} />}
    </svg>
  );
}
