"use client";

import { CreditCard, Receipt } from "lucide-react";
import { useState } from "react";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatCard } from "@/components/shared/stat-card";
import {
  PaymentStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useMyPayments } from "@/hooks";
import { useSearchParamsState } from "@/hooks/use-search-params-state";
import { formatCurrency, formatDateTime, humanizeToken } from "@/lib/format";
import type { PaymentWithRequest } from "@/types";

const PAGE_SIZE = 10;

const DEFAULTS = { page: "1" };

export default function PaymentHistoryTable() {
  const { values, setValues } = useSearchParamsState(DEFAULTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const page = Number(values.page) || 1;
  const { data, isPending } = useMyPayments({ page, limit: PAGE_SIZE });
  const payments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  const completed = payments.filter(
    (payment) => payment.status === "COMPLETED",
  );
  const lifetimeSpend = completed.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
  const refunded = payments.filter((payment) => payment.status === "CANCELLED");

  const goToPage = (nextPage: number) =>
    setValues({ page: String(Math.min(Math.max(nextPage, 1), totalPages)) });

  const copyId = async (paymentID: string) => {
    try {
      await navigator.clipboard.writeText(paymentID);
      setCopiedId(paymentID);
      toast.add({
        title: "Copied",
        description: `bKash payment ID ${paymentID} copied to your clipboard.`,
        type: "info",
      });
    } catch {
      toast.add({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        type: "error",
      });
    }
  };

  const columns: Column<PaymentWithRequest>[] = [
    {
      id: "service",
      header: "Service",
      cell: (payment) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {humanizeToken(payment.paymentType)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {payment.request.hospitalName}
          </p>
        </div>
      ),
    },
    {
      id: "request",
      header: "Request",
      cell: (payment) => (
        <div className="flex items-center gap-2">
          <BloodGroupBadge group={payment.request.bloodGroup} />
          <span className="truncate text-xs text-muted-foreground">
            {payment.request.patientName}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (payment) => (
        <span className="whitespace-nowrap font-medium tabular-nums">
          {formatCurrency(Number(payment.amount), payment.currency)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (payment) => <PaymentStatusBadge status={payment.status} />,
    },
    {
      id: "requestStatus",
      header: "Request status",
      cell: (payment) => <RequestStatusBadge status={payment.request.status} />,
    },
    {
      id: "trx",
      header: "Transaction",
      cell: (payment) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs">
            {payment.trxID ?? payment.paymentID}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {payment.trxID ? payment.paymentID : "Awaiting settlement"}
          </p>
        </div>
      ),
    },
    {
      id: "paidAt",
      header: "Date",
      cell: (payment) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(payment.paidAt ?? payment.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (payment) => (
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => copyId(payment.paymentID)}
        >
          {copiedId === payment.paymentID ? "Copied" : "Copy ID"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Payments"
          value={meta?.total ?? payments.length}
          icon={Receipt}
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          trend={`${completed.length} completed on this page`}
        />
        <StatCard
          label="Paid on this page"
          value={formatCurrency(lifetimeSpend)}
          icon={CreditCard}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Refunded"
          value={refunded.length}
          icon={Receipt}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          trend="Refunded emergency logistics"
        />
      </div>

      <DataTableShell
        columns={columns}
        data={payments}
        keyExtractor={(payment) => payment.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Premium notification and emergency logistics payments will appear here with their bKash transaction ID."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Invoices are emailed as PDF once bKash confirms a payment.
        </p>
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}
