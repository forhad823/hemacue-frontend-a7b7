"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const delta = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div
      className={cn("flex items-center justify-between gap-4 py-3", className)}
    >
      <p className="text-xs text-muted-foreground hidden sm:block">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <PaginationPrevious
                text="Prev"
                onClick={(e) => e.preventDefault()}
              />
            </Button>
          </PaginationItem>

          {pages.map((p, idx) => (
            <PaginationItem key={p === "ellipsis" ? `ellipsis-${idx}` : p}>
              {p === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <Button
                  variant={p === page ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className="size-8 p-0 cursor-pointer"
                >
                  {p}
                </Button>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <PaginationNext text="Next" onClick={(e) => e.preventDefault()} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
