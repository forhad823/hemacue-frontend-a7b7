import { HemacueLogo } from "@/components/shared/hemacue-logo";

/** Top-level loading state. Route groups with their own `loading.tsx` (dashboards, payment) override it. */
export default function Loading() {
  return (
    <main className="relative isolate flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-4">
      <output aria-live="polite" aria-busy="true">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_45%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
        />

        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 animate-ping rounded-xl bg-primary/15 motion-reduce:animate-none"
          />
          <HemacueLogo className="animate-pulse motion-reduce:animate-none" />
        </div>

        <div aria-hidden className="flex items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s] motion-reduce:animate-none" />
          <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s] motion-reduce:animate-none" />
          <span className="size-2 animate-bounce rounded-full bg-primary motion-reduce:animate-none" />
        </div>

        <span className="sr-only">Loading Hemacue…</span>
      </output>
    </main>
  );
}
