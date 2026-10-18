"use client";

import { CheckCircle2, HeartHandshake, MapPin, XCircle } from "lucide-react";
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
import {
  AssignmentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useMyDonations, useRespondToRequest } from "@/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableState } from "@/hooks/use-table-state";
import { BLOOD_GROUP_OPTIONS, URGENCY_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type {
  AssignmentStatus,
  BloodGroup,
  MyDonation,
  UrgencyLevel,
} from "@/types";

const PAGE_SIZE = 6;

const OPEN_STATUSES = ["VERIFIED", "DONOR_ASSIGNED", "IN_PROGRESS"];

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "NOTIFIED", label: "Notified" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

/** Donor assignment history with search, filters, sort and server-side pagination. */
export default function MyDonationsTable() {
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
    sortFields: ["assignedAt", "neededBy"],
    defaultSort: { field: "assignedAt", order: "desc" },
    filterKeys: ["status", "urgency", "bloodGroup"],
    pageSize: PAGE_SIZE,
  });

  const debouncedSearch = useDebounce(searchTerm, 400);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const respond = useRespondToRequest();

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      sortBy: sort.field as "assignedAt" | "neededBy",
      sortOrder: sort.order,
      status: (filters.status || undefined) as AssignmentStatus | undefined,
      urgency: (filters.urgency || undefined) as UrgencyLevel | undefined,
      bloodGroup: (filters.bloodGroup || undefined) as BloodGroup | undefined,
    }),
    [
      page,
      sort.field,
      sort.order,
      debouncedSearch,
      filters.status,
      filters.urgency,
      filters.bloodGroup,
    ],
  );

  const { data, isPending, isFetching } = useMyDonations(params);
  const donations = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const handleRespond = (
    donation: MyDonation,
    response: "ACCEPTED" | "DECLINED",
  ) => {
    setRespondingId(donation.id);
    respond.mutate(
      { id: donation.requestId, response },
      {
        onSuccess: () =>
          toast.add({
            title:
              response === "ACCEPTED" ? "Donation accepted" : "Donation declined",
            description:
              response === "ACCEPTED"
                ? `${donation.request.patientName} has been notified. Please report to ${donation.request.hospitalName}.`
                : "This request will be offered to the next compatible donor.",
            type: response === "ACCEPTED" ? "success" : "info",
          }),
        onError: (error) =>
          toast.add({
            title: "Could not send your response",
            description: error.message ?? "Please try again.",
            type: "error",
          }),
        onSettled: () => setRespondingId(null),
      },
    );
  };

  const columns: Column<MyDonation>[] = [
    {
      id: "patient",
      header: "Patient",
      cell: (donation) => (
        <div className="flex items-center gap-3">
          <BloodGroupBadge group={donation.request.bloodGroup} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {donation.request.patientName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {donation.request.patientAge} yrs ·{" "}
              {donation.request.unitsRequired ?? 1} unit
              {(donation.request.unitsRequired ?? 1) === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "hospital",
      header: "Hospital",
      cell: (donation) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {donation.request.hospitalName}
          </p>
          <p className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {donation.request.city}, {donation.request.district}
          </p>
        </div>
      ),
    },
    {
      id: "urgency",
      header: "Urgency",
      cell: (donation) => <UrgencyBadge urgency={donation.request.urgency} />,
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
      cell: (donation) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(donation.request.neededBy)}
        </span>
      ),
    },
    {
      id: "assignment",
      header: (
        <SortableHeader
          label="Assigned on"
          field="assignedAt"
          sort={sort}
          onSort={setSort}
        />
      ),
      cell: (donation) => (
        <div>
          <AssignmentStatusBadge status={donation.status} />
          <p className="mt-1 text-xs text-muted-foreground">
            {donation.respondedAt
              ? `Responded ${formatDate(donation.respondedAt)}`
              : `Notified ${formatDate(donation.assignedAt)}`}
          </p>
        </div>
      ),
    },
    {
      id: "requestStatus",
      header: "Request",
      cell: (donation) => (
        <RequestStatusBadge status={donation.request.status} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (donation) => (
        <div className="flex flex-wrap justify-end gap-2">
          {donation.status === "NOTIFIED" ? (
            <>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={respondingId === donation.id}
                onClick={() => handleRespond(donation, "ACCEPTED")}
              >
                {respondingId === donation.id ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={respondingId === donation.id}
                onClick={() => handleRespond(donation, "DECLINED")}
              >
                <XCircle className="size-4" />
                Decline
              </Button>
            </>
          ) : OPEN_STATUSES.includes(donation.request.status) ? (
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              render={<Link href="/donor/requests" />}
            >
              Find more
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Closed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearch}
          placeholder="Search patient or hospital..."
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={filters.status}
            options={ASSIGNMENT_STATUS_OPTIONS}
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
        data={donations}
        keyExtractor={(donation) => donation.id}
        isLoading={isPending}
        skeletonRows={6}
        emptyState={
          <EmptyState
            icon={HeartHandshake}
            title="No donations found"
            description="When a patient request matches your blood group it appears here with accept and decline buttons."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {meta
            ? `${meta.total} assignment${meta.total === 1 ? "" : "s"} in total`
            : ""}
        </p>
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
