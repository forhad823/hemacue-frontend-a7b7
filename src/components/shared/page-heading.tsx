import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeading({
  title,
  description,
  children,
  className,
}: PageHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40 mb-6",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
