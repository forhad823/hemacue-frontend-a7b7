"use client";

import { Droplets, Search } from "lucide-react";
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
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Button } from "@/components/ui/button";
import { useBloodRequests, useGetMe } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { canDonorServePatient } from "@/lib/blood-compatibility";
import { URGENCY_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { BloodRequest } from "@/types";

const FEED_SIZE = 50;
const PAGE_SIZE = 8;

/** Requests that can still take a donor — mirrors the backend accept rules. */
const ACCEPTABLE_STATUSES = ["VERIFIED", "DONOR_ASSIGNED", "IN_PROGRESS"];

const DEFAULTS = {
  page: "1",
  searchTerm: "",
  urgency: "",
  status: "",
};

/**
 * Open requests a donor can actually serve. The public feed is fetched once and
 * filtered locally with the donor-side compatibility map, because the API only
 * exposes "requests of group X" rather than "requests this donor can serve".
 */
export default function OpenRequestsTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);
  const { data: me } = useGetMe();
  const [onlyMyDistrict, setOnlyMyDistrict] = useState(true);

  const donorGroup = me?.data.bloodGroup ?? null;
  const userDistrict = me?.data.district ?? "";

  const { data, isPending } = useBloodRequests({ limit: FEED_SIZE });

  const matches = useMemo(() => {
    if (!donorGroup) return [];
    const term = values.searchTerm.trim().toLowerCase();

    return (data?.data ?? [])
      .filter((request) => canDonorServePatient(donorGroup, request.bloodGroup))
      .filter((request) =>
        onlyMyDistrict && userDistrict
          ? request.district === userDistrict
          : true,
      )
      .filter((request) =>
        values.urgency ? request.urgency === values.urgency : true,
      )
      .filter((request) =>
        values.status ? request.status === values.status : true,
      )
      .filter((request) =>
        term
          ? [
              request.hospitalName,
              request.city,
              request.district,
              request.patientName,
            ]
              .join(" ")
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort(
        (a, b) =>
          new Date(a.neededBy).getTime() - new Date(b.neededBy).getTime(),
      );
  }, [
    data,
    donorGroup,
    onlyMyDistrict,
    userDistrict,
    values.searchTerm,
    values.status,
    values.urgency,
  ]);

  const page = Number(values.page) || 1;
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = matches.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const goToPage = (next: number) => setValues({ page: String(next) });

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
          {formatDate(request.neededBy)}
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={values.searchTerm}
          onChange={(searchTerm) => setValues({ searchTerm, page: "1" })}
          placeholder="Search hospital or area..."
          className="lg:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Urgency"
            placeholder="Any urgency"
            allLabel="Any urgency"
            value={values.urgency}
            options={URGENCY_OPTIONS}
            onChange={(urgency) => setValues({ urgency, page: "1" })}
          />
          {userDistrict && (
            <Button
              variant={onlyMyDistrict ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setOnlyMyDistrict((current) => !current);
                setValues({ page: "1" });
              }}
            >
              {onlyMyDistrict ? `Only ${userDistrict}` : "All districts"}
            </Button>
          )}
        </div>
      </div>

      <DataTableShell
        columns={columns}
        data={visible}
        keyExtractor={(request) => request.id}
        isLoading={isPending}
        skeletonRows={6}
        emptyState={
          <EmptyState
            icon={Search}
            title="No matching requests"
            description={
              onlyMyDistrict
                ? `Nothing in ${userDistrict} right now. Try "All districts" to widen the search.`
                : "No open requests match your filters. Please check back soon."
            }
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {matches.length} request{matches.length === 1 ? "" : "s"} you can
          donate to
        </p>
        <PaginationBar
          page={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}
