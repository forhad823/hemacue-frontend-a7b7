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
import { PaginationBar } from "@/components/shared/pagination-bar";
import {
  AssignmentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useMyDonations, useRespondToRequest } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { formatDate } from "@/lib/format";
import type { MyDonation } from "@/types";

const PAGE_SIZE = 6;

const OPEN_STATUSES = ["VERIFIED", "DONOR_ASSIGNED", "IN_PROGRESS"];

/** Donor assignment history with accept / decline, paginated from the URL. */
export default function MyDonationsTable() {
  const { values, setValues } = useSearchParamsState({ page: "1" });
  const { data, isPending } = useMyDonations();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const respond = useRespondToRequest();

  const donations = useMemo(() => {
    const list = [...(data?.data ?? [])].sort(
      (a, b) =>
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime(),
    );
    const page = Number(values.page) || 1;
    return list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [data, values.page]);

  const allDonations = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allDonations.length / PAGE_SIZE));

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
              response === "ACCEPTED"
                ? "Donation accepted"
                : "Donation declined",
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
      header: "Needed by",
      cell: (donation) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(donation.request.neededBy)}
        </span>
      ),
    },
    {
      id: "assignment",
      header: "My response",
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
    <div className="space-y-2">
      <DataTableShell
        columns={columns}
        data={donations}
        keyExtractor={(donation) => donation.id}
        isLoading={isPending}
        skeletonRows={6}
        emptyState={
          <EmptyState
            icon={HeartHandshake}
            title="No donations yet"
            description="When a patient request matches your blood group it appears here with accept and decline buttons."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {allDonations.length} assignment{allDonations.length === 1 ? "" : "s"}{" "}
          in total
        </p>
        <PaginationBar
          page={Number(values.page) || 1}
          totalPages={totalPages}
          onPageChange={(page) => setValues({ page: String(page) })}
        />
      </div>
    </div>
  );
}
