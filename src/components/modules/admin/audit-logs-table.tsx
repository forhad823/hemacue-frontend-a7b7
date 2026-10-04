"use client";

import { ScrollText, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { AUDIT_ACTION_OPTIONS } from "@/lib/constants";
import { formatDateTime, humanizeToken } from "@/lib/format";
import type { AuditLog } from "@/types";

const PAGE_SIZE = 15;

const DEFAULTS = {
  page: "1",
  actorEmail: "",
  action: "",
  entity: "",
};

const ENTITY_OPTIONS = [
  { value: "User", label: "User" },
  { value: "BloodRequest", label: "Blood request" },
  { value: "Payment", label: "Payment" },
  { value: "DonorAssignment", label: "Donor assignment" },
];

/** Action tone keeps the log scannable without needing a legend. */
const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  USER_ROLE_UPDATED: "default",
  USER_BLOCKED: "destructive",
  PAYMENT_REFUNDED: "destructive",
  DONOR_ACCEPTED: "secondary",
  PAYMENT_COMPLETED: "secondary",
  STATUS_CHANGE: "outline",
};

function describeDetails(details: Record<string, unknown> | null): string {
  if (!details) return "—";

  const entries = Object.entries(details)
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 4)
    .map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return `${key}: ${Object.entries(value as Record<string, unknown>)
          .map(
            ([nestedKey, nestedValue]) => `${nestedKey}=${String(nestedValue)}`,
          )
          .join(", ")}`;
      }
      return `${key}=${String(value)}`;
    });

  return entries.length > 0 ? entries.join(" · ") : "—";
}

export default function AuditLogsTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);

  const params = useMemo(
    () => ({
      page: Number(values.page) || 1,
      limit: PAGE_SIZE,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
      actorEmail: values.actorEmail || undefined,
      action: values.action || undefined,
      entity: values.entity || undefined,
    }),
    [values.action, values.actorEmail, values.entity, values.page],
  );

  const { data, isPending, isFetching } = useAuditLogs(params);
  const logs = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const goToPage = (page: number) =>
    setValues({ page: String(Math.min(Math.max(page, 1), totalPages)) });

  const columns: Column<AuditLog>[] = [
    {
      id: "when",
      header: "When",
      cell: (log) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(log.createdAt)}
        </span>
      ),
    },
    {
      id: "actor",
      header: "Actor",
      cell: (log) =>
        log.user ? (
          <div className="flex items-center gap-3">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                {log.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{log.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {log.user.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            System ({log.userId ?? "no actor"})
          </span>
        ),
    },
    {
      id: "action",
      header: "Action",
      cell: (log) => (
        <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>
          {humanizeToken(log.action)}
        </Badge>
      ),
    },
    {
      id: "entity",
      header: "Entity",
      cell: (log) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{log.entity}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {log.entityId}
          </p>
        </div>
      ),
    },
    {
      id: "details",
      header: "Details",
      className: "max-w-xs",
      cell: (log) => (
        <p className="truncate text-xs text-muted-foreground">
          {describeDetails(log.details)}
        </p>
      ),
    },
    {
      id: "ip",
      header: "IP",
      cell: (log) => (
        <span className="font-mono text-xs text-muted-foreground">
          {log.ipAddress ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={values.actorEmail}
          onChange={(actorEmail) => setValues({ actorEmail, page: "1" })}
          placeholder="Search actor email..."
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect
            label="Action"
            placeholder="All actions"
            allLabel="All actions"
            value={values.action}
            options={AUDIT_ACTION_OPTIONS.map((action) => ({
              value: action,
              label: humanizeToken(action),
            }))}
            onChange={(action) => setValues({ action, page: "1" })}
          />
          <FilterSelect
            label="Entity"
            placeholder="All entities"
            allLabel="All entities"
            value={values.entity}
            options={ENTITY_OPTIONS}
            onChange={(entity) => setValues({ entity, page: "1" })}
          />
        </div>
      </div>

      {isFetching && !isPending && (
        <div
          className="h-1 w-full animate-pulse rounded-full bg-muted"
          aria-hidden
        />
      )}

      <DataTableShell
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={ScrollText}
            title="No audit entries"
            description="Role changes, status transitions, donations and payments are all recorded here."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          {meta
            ? `Showing ${logs.length} of ${meta.total} entries`
            : "Audit trail is append-only"}
        </p>
        <PaginationBar
          page={params.page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}
