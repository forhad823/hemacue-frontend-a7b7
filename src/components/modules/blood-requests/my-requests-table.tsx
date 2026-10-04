"use client";

import { Droplets, FilePlus2, Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Button } from "@/components/ui/button";
import { useMyBloodRequests } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { REQUEST_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { BloodRequest, RequestStatus } from "@/types";

const PAGE_SIZE = 8;

const DEFAULTS = {
  page: "1",
  searchTerm: "",
  status: "",
};

export default function MyRequestsTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);

  const params = useMemo(
    () => ({
      page: Number(values.page) || 1,
      limit: PAGE_SIZE,
      searchTerm: values.searchTerm || undefined,
      status: (values.status || undefined) as RequestStatus | undefined,
    }),
    [values.page, values.searchTerm, values.status],
  );

  const { data, isPending, isFetching } = useMyBloodRequests(params);
  const requests = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const goToPage = (page: number) =>
    setValues({ page: String(Math.min(Math.max(page, 1), totalPages)) });

  const columns: Column<BloodRequest>[] = [
    {
      id: "patient",
      header: "Patient",
      cell: (request) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {request.patientName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {request.patientAge} yrs · {request.unitsRequired} unit
            {request.unitsRequired === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },
    {
      id: "bloodGroup",
      header: "Group",
      cell: (request) => <BloodGroupBadge group={request.bloodGroup} />,
    },
    {
      id: "hospital",
      header: "Hospital",
      cell: (request) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{request.hospitalName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {request.city}, {request.district}
          </p>
        </div>
      ),
    },
    {
      id: "urgency",
      header: "Urgency",
      cell: (request) => <UrgencyBadge urgency={request.urgency} />,
    },
    {
      id: "neededBy",
      header: "Needed by",
      cell: (request) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(request.neededBy)}
        </span>
      ),
    },
    {
      id: "donors",
      header: "Donors",
      cell: (request) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {request._count?.assignments ?? 0}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (request) => <RequestStatusBadge status={request.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (request) => (
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          render={<Link href={`/patient/requests/${request.id}`} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={values.searchTerm}
          onChange={(searchTerm) => setValues({ searchTerm, page: "1" })}
          placeholder="Search patient or hospital..."
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <FilterSelect
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={values.status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(status) => setValues({ status, page: "1" })}
          />
          <Button
            size="sm"
            className="gap-1.5"
            render={<Link href="/patient/new" />}
          >
            <FilePlus2 className="size-4" />
            New request
          </Button>
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
        data={requests}
        keyExtractor={(request) => request.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={values.status || values.searchTerm ? Inbox : Droplets}
            title={
              values.status || values.searchTerm
                ? "No requests match these filters"
                : "You have not posted a request yet"
            }
            description={
              values.status || values.searchTerm
                ? "Clear the filters to see every request you have posted."
                : "Post a request and verified donors in your district will be notified."
            }
            action={
              values.status || values.searchTerm ? undefined : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  render={<Link href="/patient/new" />}
                >
                  <FilePlus2 className="size-4" />
                  Create your first request
                </Button>
              )
            }
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {meta ? `Showing ${requests.length} of ${meta.total} requests` : " "}
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
