import { TableSkeleton } from "@/components/dashboard/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <TableSkeleton rows={6} />
    </div>
  );
}
