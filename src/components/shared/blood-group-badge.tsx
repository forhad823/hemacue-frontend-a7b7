import { Droplet } from "lucide-react";
import { formatBloodGroup } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodGroup } from "@/types";

export function BloodGroupBadge({
  group,
  className,
}: {
  group: BloodGroup;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
        className,
      )}
    >
      <Droplet className="size-3 fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" />
      <span>{formatBloodGroup(group)}</span>
    </span>
  );
}
