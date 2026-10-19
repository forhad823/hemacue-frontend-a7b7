"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { Droplets, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AiSearchInput } from "@/components/shared/ai-search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListingCard } from "@/components/shared/listing-card";
import { ListingGrid } from "@/components/shared/listing-grid";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBloodRequests } from "@/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableState } from "@/hooks/use-table-state";
import { buildSuggestionIndex } from "@/lib/ai/suggestion-index";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  REQUEST_STATUS_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type {
  ApiResponse,
  BloodGroup,
  BloodRequest,
  BloodRequestQueryParams,
  RequestStatus,
  UrgencyLevel,
} from "@/types";

const PAGE_SIZE = 9;

interface ExploreClientProps {
  initialData: ApiResponse<BloodRequest[]> | null;
}

export function ExploreClient({ initialData }: ExploreClientProps) {
  const {
    page,
    sort,
    filters,
    searchTerm,
    setPage,
    setSort,
    setSearch,
    setFilter,
    activeFilterCount,
    reset,
  } = useTableState({
    sortFields: ["createdAt", "neededBy", "patientName", "urgency"],
    defaultSort: { field: "createdAt", order: "desc" },
    filterKeys: ["status", "bloodGroup", "urgency", "district"],
    pageSize: PAGE_SIZE,
  });

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Explicit annotation keeps the query's generic inference free of any
  // dependency on this object (prevents circular-inference ts(7022)).
  const params: BloodRequestQueryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      sortBy: sort.field as
        | "createdAt"
        | "neededBy"
        | "patientName"
        | "urgency",
      sortOrder: sort.order,
      status: (filters.status || undefined) as RequestStatus | undefined,
      bloodGroup: (filters.bloodGroup || undefined) as BloodGroup | undefined,
      urgency: (filters.urgency || undefined) as UrgencyLevel | undefined,
      district: filters.district || undefined,
    }),
    [
      page,
      sort.field,
      sort.order,
      debouncedSearch,
      filters.status,
      filters.bloodGroup,
      filters.urgency,
      filters.district,
    ],
  );

  const {
    data,
    isPending,
    isFetching,
  }: UseQueryResult<ApiResponse<BloodRequest[]>> = useBloodRequests(params);
  const requests = data?.data ?? initialData?.data ?? [];
  const meta = data?.meta ?? initialData?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const suggestionIndex = useMemo(
    () => buildSuggestionIndex({ requests }),
    [requests],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* ── Left: filter sidebar ── */}
      <aside className="lg:col-span-3">
        <div className="sticky top-20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" />
              Filters
            </span>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="h-7 text-xs"
              >
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>

          <AiSearchInput
            value={searchTerm}
            onChange={setSearch}
            index={suggestionIndex}
            placeholder="Search patient or hospital..."
          />

          <FilterSelect
            label="Blood Group"
            placeholder="All groups"
            allLabel="All groups"
            value={filters.bloodGroup}
            options={BLOOD_GROUP_OPTIONS}
            onChange={(v) => setFilter("bloodGroup", v)}
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
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={filters.status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(v) => setFilter("status", v)}
          />

          <FilterSelect
            label="District"
            placeholder="All districts"
            allLabel="All districts"
            value={filters.district}
            options={DISTRICTS.map((d) => ({ value: d, label: d }))}
            onChange={(v) => setFilter("district", v)}
          />

          {/* Sort dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Sort by
            </span>
            <div className="flex gap-2">
              <FilterSelect
                label="Sort field"
                placeholder="Newest first"
                allLabel="Newest first"
                value={sort.field}
                options={[
                  { value: "createdAt", label: "Date posted" },
                  { value: "neededBy", label: "Needed by date" },
                  { value: "patientName", label: "Patient name" },
                  { value: "urgency", label: "Urgency" },
                ]}
                onChange={(v) => setSort(v || "createdAt")}
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setSort(sort.field)}
                title={`Currently: ${sort.order === "asc" ? "Ascending" : "Descending"}`}
              >
                {sort.order === "asc" ? "↑ Asc" : "↓ Desc"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right: card grid ── */}
      <div className="flex flex-col gap-6 lg:col-span-9">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {meta
              ? `${meta.total} request${meta.total === 1 ? "" : "s"} found`
              : "Loading..."}
          </p>
          {isFetching && !isPending && (
            <span className="animate-pulse text-xs text-muted-foreground">
              Updating…
            </span>
          )}
        </div>

        {isPending ? (
          <ListingGrid count={PAGE_SIZE}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <li key={i}>
                <Skeleton className="h-64 w-full rounded-xl" />
              </li>
            ))}
          </ListingGrid>
        ) : (
          <ListingGrid
            count={requests.length}
            emptyTitle="No requests match these filters"
            emptyDescription="Try adjusting the filters or check back later for new requests."
          >
            {requests.map((req) => (
              <li key={req.id}>
                <ListingCard
                  icon={Droplets}
                  badge={
                    <div className="flex flex-wrap gap-1">
                      <UrgencyBadge urgency={req.urgency} />
                      <RequestStatusBadge status={req.status} />
                    </div>
                  }
                  title={req.patientName}
                  description={`${req.hospitalName}, ${req.city}`}
                  meta={[
                    {
                      label: "Blood",
                      value: req.bloodGroup.replace("_", " "),
                    },
                    { label: "Units", value: req.unitsRequired ?? 1 },
                    { label: "District", value: req.district },
                    { label: "Needed by", value: formatDate(req.neededBy) },
                  ]}
                  actions={
                    <Button
                      size="sm"
                      render={<Link href={`/blood-requests/${req.id}`} />}
                    >
                      View Details
                    </Button>
                  }
                  footer={formatDate(req.createdAt)}
                />
              </li>
            ))}
          </ListingGrid>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {meta ? `Page ${page} of ${totalPages}` : ""}
          </p>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
