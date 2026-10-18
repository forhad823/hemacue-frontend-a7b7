import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Grid of stat-card placeholders used by every dashboard overview loading state. */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  const slots = Array.from({ length: count }, (_, index) => `stat-${index}`);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {slots.map((slot) => (
        <Card key={slot}>
          <CardContent className="flex items-center gap-4 p-5">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Chart-sized placeholder so the layout does not jump once the data lands. */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="space-y-4 p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  );
}

/** Table-shaped placeholder that mirrors the shared DataTableShell layout. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const slots = Array.from(
    { length: rows },
    (_, index) => `table-row-${index}`,
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-4 w-48" />
        {slots.map((slot) => (
          <Skeleton key={slot} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

/** Placeholder for a detail page: header block plus two content cards. */
export function DetailSkeleton() {
  const rows = Array.from({ length: 6 }, (_, index) => `detail-row-${index}`);
  const side = Array.from({ length: 3 }, (_, index) => `side-row-${index}`);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-5">
            {rows.map((slot) => (
              <Skeleton key={slot} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              {side.map((slot) => (
                <Skeleton key={slot} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive card-grid placeholder used by FeaturedRequests (home page),
 * the public Explore page, and any future ListingCard grid.
 * Matches the `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` layout of ListingGrid.
 */
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  const slots = Array.from({ length: count }, (_, index) => `listing-${index}`);

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Section heading placeholder */}
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-8 w-36 shrink-0" />
      </div>

      {/* Card grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot} className="overflow-hidden">
            {/* Image area */}
            <Skeleton className="h-44 w-full rounded-none" />
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
