import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

/** Centred hero band reused by every inner public page (About, Services, Contact, FAQ). */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border/40 bg-linear-to-b from-primary/8 via-background to-background",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="container relative mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge
            variant="outline"
            className="gap-2 border-primary/25 bg-background/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            {eyebrow}
          </Badge>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
          {children ? (
            <div className="mt-8 flex w-full flex-col items-center gap-3">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
