import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TableSort } from "@/hooks/use-table-state";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  label: string;
  field: string;
  sort: TableSort;
  onSort: (field: string) => void;
}

/**
 * Column header button that renders the current sort direction icon and calls
 * `onSort(field)` when clicked.
 *
 * GUARD RAIL: this component does NOT hold sort state — it only receives
 * `sort` and `onSort` from the parent (via `useTableState`). Keeps it pure
 * and composable inside `DataTableShell`'s `column.header` prop.
 */
export function SortableHeader({
  label,
  field,
  sort,
  onSort,
}: SortableHeaderProps) {
  const isActive = sort.field === field;
  const Icon = !isActive
    ? ArrowUpDown
    : sort.order === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      aria-label={`Sort by ${label}${isActive ? `, currently ${sort.order}ending` : ""}`}
    >
      {label}
      <Icon
        className={cn("size-3 shrink-0", isActive && "text-primary")}
        aria-hidden
      />
    </button>
  );
}
