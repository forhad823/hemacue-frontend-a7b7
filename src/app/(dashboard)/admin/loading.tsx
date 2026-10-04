import { StatsSkeleton, TableSkeleton } from "@/components/dashboard/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <StatsSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
