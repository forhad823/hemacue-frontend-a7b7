import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { TESTIMONIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<"Patient" | "Donor" | "Admin", string> = {
  Patient:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
  Donor:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  Admin:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/50",
};

/** Three quote cards — one per user role — sourced from TESTIMONIALS in constants.ts. */
export default function Testimonials() {
  return (
    <section className="bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From our community"
          title="Real stories from patients, donors and admins"
          description="Hemacue is built around the people who use it every day. Here is what they say."
          align="center"
          className="max-w-2xl"
        />

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.id}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 pt-6">
                  {/* Opening quote icon */}
                  <Quote className="size-6 shrink-0 text-primary/40" aria-hidden />

                  {/* Quote body */}
                  <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Attribution */}
                  <footer className="flex items-center gap-3 border-t border-border/40 pt-4">
                    {/* Initials avatar */}
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.location}
                      </p>
                    </div>

                    {/* Role badge */}
                    <span
                      className={cn(
                        "ml-auto shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        ROLE_STYLES[t.role],
                      )}
                    >
                      {t.role}
                    </span>
                  </footer>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Lightweight skeleton shown while Testimonials streams in. */
export function TestimonialsSkeleton() {
  return (
    <div className="bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-10 mx-auto max-w-2xl text-center">
          <div className="h-3 w-28 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-6 w-80 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse mx-auto" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-xl border border-border/60 bg-card p-6 space-y-4"
            >
              <div className="size-6 rounded bg-muted animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((l) => (
                  <div key={l} className="h-3 w-full rounded bg-muted animate-pulse" />
                ))}
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                <div className="size-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
