import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2 className="h-2">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="mono text-ek-ink-3 hover:text-ek-ink transition-colors">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
