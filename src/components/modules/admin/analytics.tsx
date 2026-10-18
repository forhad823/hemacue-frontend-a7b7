"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ChartSkeleton } from "@/components/dashboard/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdminPayments, useDashboardStats } from "@/hooks";
import {
  bucketKeyOfMonth,
  bucketKeyOfWeek,
  monthBuckets,
  reduceIntoBuckets,
  weekBuckets,
} from "@/lib/chart-buckets";
import { buildStatusBars, buildUserSlices } from "@/lib/dashboard-chart-data";
import type { AdminPayment } from "@/types";

/** Recharts is ~100 kB gzipped — every chart below is dynamically imported. */
const UsersChart = dynamic(() => import("./users-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const RequestsChart = dynamic(() => import("./requests-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const RevenueChart = dynamic(() => import("./revenue-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const DonationsChart = dynamic(() => import("./donations-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

/** Newest N payments feed both time-series charts (the endpoint caps at 100). */
const PAYMENTS_SAMPLE_LIMIT = 100;
const REVENUE_MONTHS = 6;
const WEEKLY_WINDOW = 8;

interface MonthlyRevenuePoint {
  name: string;
  premium: number;
  logistics: number;
}

interface WeeklyCountPoint {
  name: string;
  value: number;
}

/** Stacked BDT revenue per month (completed payments only), split by service. */
function buildMonthlyRevenue(payments: AdminPayment[]): MonthlyRevenuePoint[] {
  return reduceIntoBuckets<AdminPayment, MonthlyRevenuePoint>(
    payments,
    monthBuckets(REVENUE_MONTHS),
    (payment) =>
      payment.status === "COMPLETED"
        ? bucketKeyOfMonth(new Date(payment.paidAt ?? payment.createdAt))
        : null,
    (bucket) => ({ name: bucket.label, premium: 0, logistics: 0 }),
    (point, payment) =>
      payment.paymentType === "EMERGENCY_LOGISTICS"
        ? { ...point, logistics: point.logistics + Number(payment.amount) }
        : { ...point, premium: point.premium + Number(payment.amount) },
  );
}

/** Settled payment count per week (completed payments only). */
function buildWeeklyCounts(payments: AdminPayment[]): WeeklyCountPoint[] {
  return reduceIntoBuckets<AdminPayment, WeeklyCountPoint>(
    payments,
    weekBuckets(WEEKLY_WINDOW),
    (payment) =>
      payment.status === "COMPLETED"
        ? bucketKeyOfWeek(new Date(payment.paidAt ?? payment.createdAt))
        : null,
    (bucket) => ({ name: bucket.label, value: 0 }),
    (point) => ({ ...point, value: point.value + 1 }),
  );
}

export default function AdminAnalytics() {
  const statsQuery = useDashboardStats();
  const paymentsQuery = useAdminPayments({ limit: PAYMENTS_SAMPLE_LIMIT });

  const isPending = statsQuery.isPending || paymentsQuery.isPending;
  const isError = statsQuery.isError || paymentsQuery.isError;
  const stats = statsQuery.data?.data;
  const payments = paymentsQuery.data?.data ?? [];

  const revenuePoints = useMemo(
    () => buildMonthlyRevenue(payments),
    [payments],
  );
  const weeklyPoints = useMemo(() => buildWeeklyCounts(payments), [payments]);

  if (isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Analytics unavailable</AlertTitle>
        <AlertDescription>
          The statistics or payments endpoint did not respond. Reload the page
          or try again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <UsersChart data={buildUserSlices(stats)} />
        <RequestsChart data={buildStatusBars(stats)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenuePoints} />
        <DonationsChart data={weeklyPoints} />
      </div>
    </div>
  );
}
