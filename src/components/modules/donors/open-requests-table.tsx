"use client";

import { Droplets, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { useBloodRequests, useGetMe } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { compatiblePatientGroups } from "@/lib/blood-compatibility";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  REQUEST_STATUS_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type {
  BloodGroup,
  BloodRequest,
  RequestStatus,
  UrgencyLevel,
} from "@/types";

const PAGE_SIZE = 8;

/**
 * The "needed from" cut-off is rounded down to 5 minutes. It has to be stable
 * between renders: it is part of the query key, so a raw `Date.now()` would
 * trigger a new request on every render.
 */
const NEEDED_FROM_STEP_MS = 5 * 60 * 1000;

/** Requests that can still take a donor — mirrors the backend accept rules. */
const ACCEPTABLE_STATUSES = ["VERIFIED", "DONOR_ASSIGNED", "IN_PROGRESS"];

const DISTRICT_OPTIONS = DISTRICTS.map((district) => ({
  value: district,
  label: district,
}));

const DEFAULTS = {
  page: "1",
  searchTerm: "",
  district: "",
  bloodGroup: "",
  urgency: "",
  status: "",
};

/**
 * Open requests a donor can serve.
 *
 * Default view: every request whose blood group this donor is compatible with
 * (an O- donor sees all eight groups, an AB+ donor sees AB+ only), needed from
 * now onward, soonest first, across every district.
 *
 * The Filters panel narrows that default down by district, a specific
 * compatible blood group, urgency and status. Everything is filtered and
 * paginated on the server, so a compatible request can never be pushed out of
 * view by an arbitrary "first 50 rows" cut-off.
 */
export default function OpenRequestsTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);
  const { data: me } = useGetMe();

  const donorGroup = me?.data.bloodGroup ?? null;
  const userDistrict = me?.data.district ?? "";

  const compatibleGroups = useMemo(
    () => (donorGroup ? compatiblePatientGroups(donorGroup) : []),
    [donorGroup],
  );
  const bloodGroupOptions = useMemo(
    () =>
      BLOOD_GROUP_OPTIONS.filter((option) =>
        compatibleGroups.includes(option.value),
      ),
    [compatibleGroups],
  );

  // A hand-edited URL must not widen the compatible set.
  const selectedGroup = compatibleGroups.includes(
    values.bloodGroup as BloodGroup,
  )
    ? (values.bloodGroup as BloodGroup)
    : "";

  const activeFilterCount = [
    values.district,
    selectedGroup,
    values.urgency,
    values.status,
  ].filter(Boolean).length;
  const hasSearch = values.searchTerm.trim() !== "";

  const [filtersOpen, setFiltersOpen] = useState(activeFilterCount > 0);

  const page = Number(values.page) || 1;
  const neededFrom = new Date(
    Math.floor(Date.now() / NEEDED_FROM_STEP_MS) * NEEDED_FROM_STEP_MS,
  ).toISOString();

  const { data, isPending } = useBloodRequests(
    {
      page,
      limit: PAGE_SIZE,
      sortBy: "neededBy",
      sortOrder: "asc",
      neededFrom,
      bloodGroups: compatibleGroups,
      bloodGroup: selectedGroup || undefined,
      district: values.district || undefined,
      urgency: (values.urgency as UrgencyLevel) || undefined,
      status: (values.status as RequestStatus) || undefined,
      searchTerm: values.searchTerm.trim() || undefined,
    },
    { enabled: Boolean(donorGroup), keepPrevious: true },
  );

  const requests = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    data?.meta?.totalPages ?? data?.meta?.totalPage ?? 1,
  );

  // Filters can shrink the result set underneath the current page.
  useEffect(() => {
    if (data && page > totalPages) setValues({ page: String(totalPages) });
  }, [data, page, totalPages, setValues]);

  const resetFilters = () =>
    setValues({
      district: "",
      bloodGroup: "",
      urgency: "",
      status: "",
      page: "1",
    });

  const columns: Column<BloodRequest>[] = [
    {
      id: "patient",
      header: "Patient",
      cell: (request) => (
        <div className="flex items-center gap-3">
          <BloodGroupBadge group={request.bloodGroup} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {request.patientName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {request.patientAge} yrs · {request.unitsRequired} unit
              {request.unitsRequired === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      ),
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
          {formatDateTime(request.neededBy)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (request) => (
        <div className="space-y-1">
          <RequestStatusBadge status={request.status} />
          <p className="text-xs text-muted-foreground">
            {request._count?.assignments ?? 0} donor
            {(request._count?.assignments ?? 0) === 1 ? "" : "s"} assigned
          </p>
        </div>
      ),
    },
    {
      id: "action",
      header: "Action",
      className: "text-right",
      cell: (request) =>
        ACCEPTABLE_STATUSES.includes(request.status) ? (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            render={
              <Link
                href={`/patient/requests/${request.id}`}
                title="Open the request to accept an assignment"
              />
            }
          >
            View
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {request.status === "PENDING" ? "Awaiting verification" : "Closed"}
          </span>
        ),
    },
  ];

  if (me && !donorGroup) {
    return (
      <EmptyState
        icon={Droplets}
        title="Add your blood group first"
        description="We only show requests your blood group can help with."
        className="border-none py-10"
        action={
          <Button size="sm" render={<Link href="/donor/profile" />}>
            Update my profile
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={values.searchTerm}
          onChange={(searchTerm) => setValues({ searchTerm, page: "1" })}
          placeholder="Search hospital, patient or city..."
          className="lg:max-w-xs"
        />
        <Button
          variant={filtersOpen || activeFilterCount > 0 ? "default" : "outline"}
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
          aria-expanded={filtersOpen}
          aria-controls="open-requests-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-semibold text-primary">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {filtersOpen && (
        <div
          id="open-requests-filters"
          className="space-y-3 rounded-xl border border-border bg-card p-4 animate-in fade-in-50"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                District
              </p>
              <FilterSelect
                label="District"
                placeholder="All districts"
                allLabel="All districts"
                value={values.district}
                options={DISTRICT_OPTIONS}
                onChange={(district) => setValues({ district, page: "1" })}
                className="sm:w-full"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Blood group
              </p>
              <FilterSelect
                label="Compatible blood groups"
                placeholder="All compatible"
                allLabel="All compatible"
                value={selectedGroup}
                options={bloodGroupOptions}
                onChange={(bloodGroup) => setValues({ bloodGroup, page: "1" })}
                className="sm:w-full"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Urgency
              </p>
              <FilterSelect
                label="Urgency"
                placeholder="Any urgency"
                allLabel="Any urgency"
                value={values.urgency}
                options={URGENCY_OPTIONS}
                onChange={(urgency) => setValues({ urgency, page: "1" })}
                className="sm:w-full"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <FilterSelect
                label="Status"
                placeholder="Any status"
                allLabel="Any status"
                value={values.status}
                options={REQUEST_STATUS_OPTIONS}
                onChange={(status) => setValues({ status, page: "1" })}
                className="sm:w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userDistrict && values.district !== userDistrict && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setValues({ district: userDistrict, page: "1" })}
              >
                Only my district ({userDistrict})
              </Button>
            )}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={resetFilters}
              >
                <X className="size-3.5" />
                Reset filters
              </Button>
            )}
          </div>
        </div>
      )}

      <DataTableShell
        columns={columns}
        data={requests}
        keyExtractor={(request) => request.id}
        isLoading={isPending}
        skeletonRows={6}
        emptyState={
          <EmptyState
            icon={Search}
            title="No matching requests"
            description={
              activeFilterCount > 0 || hasSearch
                ? "Nothing upcoming matches your current filters. Reset them to see every compatible request."
                : "There are no upcoming requests your blood group can donate to right now. Please check back soon."
            }
            className="border-none py-6"
            action={
              activeFilterCount > 0 ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : undefined
            }
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {total} upcoming request{total === 1 ? "" : "s"} you can donate to ·
          soonest first
        </p>
        <PaginationBar
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onPageChange={(next) => setValues({ page: String(next) })}
        />
      </div>
    </div>
  );
}
