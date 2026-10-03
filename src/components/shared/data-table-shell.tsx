import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
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

export function DataTableShell<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  className,
  skeletonRows = 5,
}: DataTableShellProps<T>) {
  return (
    <Card className={cn("overflow-hidden border border-border shadow-xs", className)}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead
                    key={col.header || i}
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
                Array.from({ length: skeletonRows }).map((_, idx) => (
                  <TableRow key={`skeleton-row-${idx}`}>
                    {columns.map((col, colIdx) => (
                      <TableCell key={`skeleton-cell-${idx}-${colIdx}`}>
                        <Skeleton className="h-5 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    {emptyState ?? <EmptyState className="border-none py-6" />}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={keyExtractor(item)} className="hover:bg-muted/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <TableCell key={`cell-${keyExtractor(item)}-${colIdx}`} className={col.className}>
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey] ?? "")
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
