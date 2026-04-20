import { cn } from "@/lib/utils";

/** Tasarım container'ı — max 1440px, 40px gutter */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-10", className)}>{children}</Tag>
  );
}
