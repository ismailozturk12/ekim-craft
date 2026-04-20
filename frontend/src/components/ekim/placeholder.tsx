import { cn } from "@/lib/utils";

/**
 * Tasarım placeholder'ı — gerçek ürün görselleri gelene kadar.
 * Gradient + grid deseni + soft ışık; tasarım handoff/shared.jsx'ten.
 */
export type PlaceholderTone =
  | "cream"
  | "sage"
  | "terra"
  | "forest"
  | "blue"
  | "ink"
  | "rose"
  | "warn";

const TONE_GRADIENTS: Record<PlaceholderTone, { from: string; to: string; grid: string }> = {
  cream: { from: "#ede4cf", to: "#f5ead4", grid: "rgba(45,74,62,0.06)" },
  sage: { from: "#b5c4a8", to: "#8a9a7b", grid: "rgba(45,74,62,0.15)" },
  terra: { from: "#e0a085", to: "#c17b5a", grid: "rgba(160,95,64,0.2)" },
  forest: { from: "#4a6b3e", to: "#2d4a3e", grid: "rgba(31,55,45,0.25)" },
  blue: { from: "#a3b8cc", to: "#8aa3b8", grid: "rgba(26,31,28,0.15)" },
  ink: { from: "#3d4540", to: "#1a1f1c", grid: "rgba(240,235,224,0.1)" },
  rose: { from: "#f0c8d5", to: "#d89bb5", grid: "rgba(184,70,46,0.15)" },
  warn: { from: "#d9a87a", to: "#b8462e", grid: "rgba(31,55,45,0.2)" },
};

interface PlaceholderProps {
  tone?: PlaceholderTone;
  label?: string;
  ratio?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Placeholder({
  tone = "cream",
  label,
  ratio = "1",
  className,
  children,
}: PlaceholderProps) {
  const t = TONE_GRADIENTS[tone];
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        aspectRatio: ratio,
        background: `linear-gradient(180deg, ${t.from}, ${t.to})`,
      }}
    >
      {/* Grid deseni */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${t.grid} 0 1px, transparent 1px 14px)`,
        }}
      />
      {/* Soft ışık */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      {children ??
        (label ? (
          <span
            className="relative z-10 rounded border px-3 py-1 uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--ek-ink-3)",
              background: "var(--ek-bg-elevated)",
              borderColor: "var(--ek-line)",
            }}
          >
            {label}
          </span>
        ) : null)}
    </div>
  );
}

/** Ürün ID'sine göre deterministik tone seçimi */
export function toneForProduct(id: string): PlaceholderTone {
  const tones: PlaceholderTone[] = ["cream", "sage", "terra", "forest", "blue", "ink", "rose"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return tones[Math.abs(hash) % tones.length];
}
