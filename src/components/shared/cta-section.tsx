import Link from "next/link";
import { ArrowRight, HeartPulse, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaSectionProps {
  title?: string;
  description?: string;
  className?: string;
}

/** Closing call-to-action band reused by the public pages that have no dedicated form. */
export function CtaSection({
  title = "Ready to save a life today?",
  description = "Register as a donor and let nearby patients reach you, or post an emergency blood request and let compatible verified donors come to you.",
  className,
}: CtaSectionProps) {
  return (
    <section className={cn("container mx-auto px-4 py-14 sm:px-6 lg:px-8", className)}>
      <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-red-600 via-red-600 to-rose-700 px-6 py-12 text-center shadow-lg shadow-red-600/20 sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-rose-900/30 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            <Siren className="size-3.5" />
            Every drop counts
          </span>
          <h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-balance text-sm text-white/85 sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              className="w-full gap-2 bg-white text-red-700 shadow-md hover:bg-white/90 sm:w-auto"
              render={<Link href="/register?role=PATIENT" />}
            >
              Request Blood
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white sm:w-auto"
              render={<Link href="/register?role=DONOR" />}
            >
              <HeartPulse className="size-4" />
              Become a Donor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}