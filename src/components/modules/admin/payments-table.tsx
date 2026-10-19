"use client";

import { CreditCard } from "lucide-react";
import { useMemo } from "react";
import { AiSearchInput } from "@/components/shared/ai-search-input";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import {
  type Column,
  DataTableShell,
} from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SortableHeader } from "@/components/shared/sortable-header";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminPayments } from "@/hooks";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableState } from "@/hooks/use-table-state";
import { buildSuggestionIndex } from "@/lib/ai/suggestion-index";
import { PAYMENT_STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS } from "@/lib/constants";
import { formatCurrency, formatDateTime, humanizeToken } from "@/lib/format";
import type { AdminPayment, PaymentStatus, PaymentType } from "@/types";

const PAGE_SIZE = 10;

export default function AdminPaymentsTable() {
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
    sortFields: ["createdAt", "amount"],
    defaultSort: { field: "createdAt", order: "desc" },
    filterKeys: ["status", "paymentType"],
    pageSize: PAGE_SIZE,
  });

  const debouncedSearch = useDebounce(searchTerm, 400);
  const { copiedValue, copy } = useCopyToClipboard();

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      sortBy: sort.field as "createdAt" | "amount",
      sortOrder: sort.order,
      status: (filters.status || undefined) as PaymentStatus | undefined,
      paymentType: (filters.paymentType || undefined) as
        | PaymentType
        | undefined,
    }),
    [
      page,
      sort.field,
      sort.order,
      debouncedSearch,
      filters.status,
      filters.paymentType,
    ],
  );

  const { data, isPending, isFetching } = useAdminPayments(params);
  const payments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? 1;

  // AI suggestions: trx/payment IDs, payer emails and patient names on screen.
  const suggestionIndex = useMemo(
    () => buildSuggestionIndex({ payments }),
    [payments],
  );

  const goToPage = (nextPage: number) =>
    setPage(Math.min(Math.max(nextPage, 1), totalPages));

  const columns: Column<AdminPayment>[] = [
    {
      id: "user",
      header: "User",
      cell: (payment) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-7 shrink-0">
            <AvatarImage
              src={payment.user.avatarUrl || undefined}
              alt={payment.user.name}
            />
            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
              {payment.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{payment.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {payment.user.email}
            </p>
          </div>
        </div>
      ),
    },
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
      header: (
        <SortableHeader
          label="Amount"
          field="amount"
          sort={sort}
          onSort={setSort}
        />
      ),
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
      id: "trx",
      header: "Transaction",
      cell: (payment) => {
        const copiedId = payment.trxID ?? payment.paymentID;
        return (
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs">{copiedId}</p>
              <p className="truncate text-xs text-muted-foreground">
                {payment.trxID ? payment.paymentID : "Awaiting settlement"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 cursor-pointer"
              onClick={() =>
                copy(
                  copiedId,
                  payment.trxID
                    ? `Transaction ID ${copiedId} copied to your clipboard.`
                    : `bKash payment ID ${copiedId} copied to your clipboard.`,
                )
              }
            >
              {copiedValue === copiedId ? "Copied" : "Copy"}
            </Button>
          </div>
        );
      },
    },
    {
      id: "date",
      header: (
        <SortableHeader
          label="Date"
          field="createdAt"
          sort={sort}
          onSort={setSort}
        />
      ),
      cell: (payment) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(payment.paidAt ?? payment.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <AiSearchInput
          value={searchTerm}
          onChange={setSearch}
          index={suggestionIndex}
          placeholder="Search by payment ID, trx ID or payer email..."
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect
            label="Status"
            placeholder="All statuses"
            allLabel="All statuses"
            value={filters.status}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(status) => setFilter("status", status)}
          />
          <FilterSelect
            label="Service"
            placeholder="All services"
            allLabel="All services"
            value={filters.paymentType}
            options={PAYMENT_TYPE_OPTIONS}
            onChange={(paymentType) => setFilter("paymentType", paymentType)}
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
        data={payments}
        keyExtractor={(payment) => payment.id}
        isLoading={isPending}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="bKash transactions from patients for premium notifications and emergency logistics appear here."
            className="border-none py-6"
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CreditCard className="size-3.5" />
          {meta
            ? `Showing ${payments.length} of ${meta.total} payments`
            : "Loading payment ledger"}
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
