import { Card, CardContent } from "@/components/ui/card";
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
