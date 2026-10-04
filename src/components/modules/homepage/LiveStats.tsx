import { Activity, Droplets, HeartPulse, MapPinned } from "lucide-react";
import { publicApi } from "@/api/public.api";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

const cardAccents = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  slate: "bg-secondary text-secondary-foreground",
} as const;

const skeletonCards = [
  "blood-requests",
  "emergencies",
  "completed",
  "districts",
];

/** Placeholder grid with the exact footprint of the live stats, streamed in first. */

export function LiveStatsSkeleton() {
  return (
    <section aria-busy className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-40" /> <Skeleton className="h-6 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skeletonCards.map((card) => (
          <div
            key={card}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5"
          >
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** * Server component that streams the public request counters in after the static * landing content. The underlying fetch is cached and revalidated every 60s. */

export default async function LiveStats() {
  const stats = await publicApi.getLiveStats();
  return (
    <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Live network data"
        title="Real numbers from the Hemacue network"
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blood requests"
          value={stats ? stats.totalRequests : "—"}
          icon={Droplets}
          accent={cardAccents.primary}
          trend={
            stats
              ? "Logged by patients & verified by admins"
              : "Temporarily unavailable"
          }
        />
        <StatCard
          label="Open emergencies"
          value={stats ? stats.emergencyRequests : "—"}
          icon={Activity}
          accent={cardAccents.destructive}
          trend="Requests flagged as emergency urgency"
        />
        <StatCard
          label="Completed requests"
          value={stats ? stats.completedRequests : "—"}
          icon={HeartPulse}
          accent={cardAccents.emerald}
          trend="Donations delivered to the hospital"
        />
        <StatCard
          label="Districts covered"
          value={stats ? stats.districtsCovered : "—"}
          icon={MapPinned}
          accent={cardAccents.slate}
          trend="Where donors and patients are active"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Counters are read from the public blood-request feed and refreshed every
        minute.
      </p>
    </section>
  );
}
