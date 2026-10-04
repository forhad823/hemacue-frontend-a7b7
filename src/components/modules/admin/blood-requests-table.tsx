"use client";

import { ExternalLink, Search } from "lucide-react";
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
import { useSearchParamsState } from "@/hooks/use-search-params-state";
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

const DEFAULTS = {
  page: "1",
  searchTerm: "",
  status: "",
  bloodGroup: "",
  district: "",
  urgency: "",
};

/** Statuses an admin can push a request into from the table itself. */
const QUICK_STATUSES: RequestStatus[] = ["VERIFIED", "CANCELLED"];

export default function AdminBloodRequestsTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);
  const [pendingStatus, setPendingStatus] = useState<{
    request: BloodRequest;
    status: RequestStatus;
  } | null>(null);
  const updateStatus = useUpdateRequestStatus(pendingStatus?.request.id ?? "");

  const params = useMemo(
    () => ({
      page: Number(values.page) || 1,
      limit: PAGE_SIZE,
      searchTerm: values.searchTerm || undefined,
      status: (values.status || undefined) as RequestStatus | undefined,
      bloodGroup: (values.bloodGroup ||
        undefined) as BloodRequest["bloodGroup"],
      district: values.district || undefined,
      urgency: (values.urgency || undefined) as BloodRequest["urgency"],
    }),
    [
      values.bloodGroup,
      values.district,
      values.page,
      values.searchTerm,
      values.status,
      values.urgency,
    ],
  );

  const { data, isPending, isFetching } = useBloodRequests(params);
  const requests = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const goToPage = (page: number) =>
    setValues({ page: String(Math.min(Math.max(page, 1), totalPages)) });

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
      header: "Patient",
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
      cell: (request) => {
        const allowed = ALLOWED_STATUS_TRANSITIONS[request.status].filter(
          (status) => QUICK_STATUSES.includes(status),
        );

        return (
          <div className="flex justify-end gap-2">
            {allowed.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setPendingStatus({ request, status })}
              >
                {status === "VERIFIED" ? "Verify" : "Cancel"}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Open request for ${request.patientName}`}
              render={<Link href={`/patient/requests/${request.id}`} />}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={values.searchTerm}
          onChange={(searchTerm) => setValues({ searchTerm, page: "1" })}
          placeholder="Search patient, hospital or city..."
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterSelect
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={values.status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(status) => setValues({ status, page: "1" })}
          />
          <FilterSelect
            label="Urgency"
            placeholder="All urgencies"
            allLabel="All urgencies"
            value={values.urgency}
            options={URGENCY_OPTIONS}
            onChange={(urgency) => setValues({ urgency, page: "1" })}
          />
          <FilterSelect
            label="Blood group"
            placeholder="All groups"
            allLabel="All groups"
            value={values.bloodGroup}
            options={BLOOD_GROUP_OPTIONS}
            onChange={(bloodGroup) => setValues({ bloodGroup, page: "1" })}
          />
          <FilterSelect
            label="District"
            placeholder="All districts"
            allLabel="All districts"
            value={values.district}
            options={DISTRICTS.map((district) => ({
              value: district,
              label: district,
            }))}
            onChange={(district) => setValues({ district, page: "1" })}
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
