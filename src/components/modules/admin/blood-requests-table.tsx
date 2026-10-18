"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { SortableHeader } from "@/components/shared/sortable-header";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useBloodRequests, useUpdateRequestStatus } from "@/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableState } from "@/hooks/use-table-state";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  REQUEST_STATUS_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import {
  ALLOWED_STATUS_TRANSITIONS,
  formatDate,
  humanizeToken,
} from "@/lib/format";
import type { BloodRequest, RequestStatus } from "@/types";
import { RequestStatus as RequestStatusEnum } from "@/types";

const PAGE_SIZE = 10;

/** Statuses an admin can push a request into from the table itself. */
const QUICK_STATUSES: RequestStatus[] = ["VERIFIED", "CANCELLED"];

export default function AdminBloodRequestsTable() {
  const {
    page,
    sort,
    filters,
    searchTerm,
    setPage,
    setSort,
    setSearch,
    setFilter,
  } = useTableState({
    sortFields: [
      "patientName",
      "neededBy",
      "bloodGroup",
      "urgency",
      "status",
      "createdAt",
    ],
    defaultSort: { field: "createdAt", order: "desc" },
    filterKeys: ["status", "bloodGroup", "district", "urgency"],
    pageSize: PAGE_SIZE,
  });

  const debouncedSearch = useDebounce(searchTerm, 400);

  const [pendingStatus, setPendingStatus] = useState<{
    request: BloodRequest;
    status: RequestStatus;
  } | null>(null);
  const updateStatus = useUpdateRequestStatus(pendingStatus?.request.id ?? "");

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      sortBy: sort.field as
        | "createdAt"
        | "neededBy"
        | "patientName"
        | "bloodGroup"
        | "urgency",
      sortOrder: sort.order,
      status: (filters.status || undefined) as RequestStatus | undefined,
      bloodGroup: (filters.bloodGroup ||
        undefined) as BloodRequest["bloodGroup"],
      district: filters.district || undefined,
      urgency: (filters.urgency || undefined) as BloodRequest["urgency"],
    }),
    [
      page,
      sort.field,
      sort.order,
      debouncedSearch,
      filters.status,
      filters.bloodGroup,
      filters.district,
      filters.urgency,
    ],
  );

  const { data, isPending, isFetching } = useBloodRequests(params);
  const requests = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const goToPage = (p: number) => setPage(Math.min(Math.max(p, 1), totalPages));

  const confirmStatusChange = () => {
    if (!pendingStatus) return;
    const { request, status } = pendingStatus;
    updateStatus.mutate(status, {
      onSuccess: () =>
        toast.add({
          title: "Status updated",
          description: `${request.patientName}'s request is now ${humanizeToken(
            status,
          ).toLowerCase()}.`,
          type: "success",
        }),
      onError: (error) =>
        toast.add({
          title: "Could not update status",
          description: error.message ?? "The status change was rejected.",
          type: "error",
        }),
      onSettled: () => setPendingStatus(null),
    });
  };

  const columns: Column<BloodRequest>[] = [
    {
      id: "patient",
      header: (
        <SortableHeader
          label="Patient"
          field="patientName"
          sort={sort}
          onSort={setSort}
        />
      ),
      cell: (request) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {request.patientName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {request.patientAge} yrs ·{" "}
            {request.requester?.email ?? "Requester unavailable"}
          </p>
        </div>
      ),
    },
    {
      id: "bloodGroup",
      header: (
        <SortableHeader
          label="Group"
          field="bloodGroup"
          sort={sort}
          onSort={setSort}
        />
      ),
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
      header: (
        <SortableHeader
          label="Urgency"
          field="urgency"
          sort={sort}
          onSort={setSort}
        />
      ),
      cell: (request) => <UrgencyBadge urgency={request.urgency} />,
    },
    {
      id: "neededBy",
      header: (
        <SortableHeader
          label="Needed by"
          field="neededBy"
          sort={sort}
          onSort={setSort}
        />
      ),
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
      header: (
        <SortableHeader
          label="Status"
          field="status"
          sort={sort}
          onSort={setSort}
        />
      ),
      cell: (request) => <RequestStatusBadge status={request.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (request) => {
        const allowed = ALLOWED_STATUS_TRANSITIONS[request.status].filter(
          (status) => QUICK_STATUSES.includes(status),
        );

        return (
          <div className="flex justify-end gap-2">
            {allowed.map((status) => (
              <span key={status} className="flex gap-2">
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setPendingStatus({ request, status })}
                >
                  {status === "VERIFIED" ? "Verify" : "Cancel"}
                </Button>

                <Button
                  key={`${status}-details`}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  aria-label={`Open request for ${request.patientName}`}
                  render={<Link href={`/patient/requests/${request.id}`} />}
                >
                  Details
                </Button>
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={searchTerm}
          onChange={(v) => setSearch(v)}
          placeholder="Search patient, hospital or city..."
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterSelect
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={filters.status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(v) => setFilter("status", v)}
          />
          <FilterSelect
            label="Urgency"
            placeholder="All urgencies"
            allLabel="All urgencies"
            value={filters.urgency}
            options={URGENCY_OPTIONS}
            onChange={(v) => setFilter("urgency", v)}
          />
          <FilterSelect
            label="Blood group"
            placeholder="All groups"
            allLabel="All groups"
            value={filters.bloodGroup}
            options={BLOOD_GROUP_OPTIONS}
            onChange={(v) => setFilter("bloodGroup", v)}
          />
          <FilterSelect
            label="District"
            placeholder="All districts"
            allLabel="All districts"
            value={filters.district}
            options={DISTRICTS.map((district) => ({
              value: district,
              label: district,
            }))}
            onChange={(v) => setFilter("district", v)}
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
        data={requests}
        keyExtractor={(request) => request.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={Search}
            title="No requests match these filters"
            description="Adjust the search box or filters to see more of the public feed."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {meta
            ? `Showing ${requests.length} of ${meta.total} requests`
            : "Showing the public request feed"}
        </p>
        <PaginationBar
          page={params.page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

      <ConfirmStatusDialog
        state={pendingStatus}
        pending={updateStatus.isPending}
        onCancel={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}

function ConfirmStatusDialog({
  state,
  pending,
  onCancel,
  onConfirm,
}: {
  state: { request: BloodRequest; status: RequestStatus } | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!state) return null;

  const { request, status } = state;
  const isVerify = status === RequestStatusEnum.VERIFIED;

  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isVerify ? "Verify this request?" : "Cancel this request?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isVerify
              ? `${request.patientName} (${request.bloodGroup.replace("_", "")}) at ${request.hospitalName} will become assignable to compatible donors.`
              : `${request.patientName}'s request will be cancelled and every pending donor notification will be voided. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep as is</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {isVerify ? "Verify request" : "Cancel request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
