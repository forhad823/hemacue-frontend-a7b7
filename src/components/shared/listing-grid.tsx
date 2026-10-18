import { Droplet } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";

interface ListingGridProps {
  /** Pre-rendered card nodes — caller maps data → <ListingCard /> externally. */
  children: ReactNode;
  /** Total item count; when 0 the EmptyState is shown instead of the grid. */
  count: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * Responsive 1→2→3 column card grid used by FeaturedRequests (Step 1) and
 * the public Explore page (Step 2).
 *
 * Renders an `EmptyState` when `count === 0` so callers do not need to guard.
 * The grid markup is intentionally minimal — all visual variety lives in
 * `ListingCard`, not here.
 */
export function ListingGrid({
  children,
  count,
  emptyTitle = "No requests found",
  emptyDescription = "Try adjusting your filters or check back later.",
}: ListingGridProps) {
  if (count === 0) {
    return (
      <EmptyState
        icon={Droplet}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </ul>
  );
}
