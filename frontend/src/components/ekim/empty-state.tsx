import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-ek-line-2 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center",
        className
      )}
    >
      {icon && <div className="text-ek-ink-3 mb-4">{icon}</div>}
      <h3 className="h-3 mb-2">{title}</h3>
      {description && <p className="text-ek-ink-3 mb-6 max-w-md text-sm">{description}</p>}
      {action &&
        (action.href ? (
          <a
            href={action.href}
            className="bg-ek-forest hover:bg-ek-forest-2 text-ek-cream inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        ))}
    </div>
  );
}
