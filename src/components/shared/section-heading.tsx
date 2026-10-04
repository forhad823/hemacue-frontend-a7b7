import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}

/** Reusable heading block for the content sections of the public pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-2",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="text-balance text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
