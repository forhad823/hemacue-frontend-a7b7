import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  /** Stable unique key. Required if two columns share a header or have none. */
  id?: string;
  /** Plain text, or a node (e.g. a sortable button) when the header is interactive. */
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableShellProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
  skeletonRows?: number;
}

function getColumnKey<T>(col: Column<T>): string {
  if (col.id) return col.id;
  if (col.accessorKey) return String(col.accessorKey);
  // header may be a ReactNode (sortable tables), so only use it when it is text
  return typeof col.header === "string" ? col.header : "column";
}

export function DataTableShell<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  className,
  skeletonRows = 5,
}: DataTableShellProps<T>) {
  // Skeleton rows are static placeholders, so generate their ids up front
  // instead of using the index directly as a JSX key.
  const skeletonRowKeys = Array.from(
    { length: skeletonRows },
    (_, n) => `skeleton-row-${n}`,
  );

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border shadow-xs",
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={getColumnKey(col)}
                    className={cn(
                      "font-semibold text-xs text-muted-foreground uppercase tracking-wider",
                      col.className,
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                skeletonRowKeys.map((rowKey) => (
                  <TableRow key={rowKey}>
                    {columns.map((col) => (
                      <TableCell key={`${rowKey}-${getColumnKey(col)}`}>
                        <Skeleton className="h-5 w-full max-w-30" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    {emptyState ?? <EmptyState className="border-none py-6" />}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const rowKey = keyExtractor(item);
                  return (
                    <TableRow
                      key={rowKey}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={`${rowKey}-${getColumnKey(col)}`}
                          className={col.className}
                        >
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                              ? String(item[col.accessorKey] ?? "")
                              : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
