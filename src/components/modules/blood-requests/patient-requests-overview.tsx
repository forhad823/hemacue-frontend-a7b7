"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ChartSkeleton } from "@/components/dashboard/skeletons";
import { ChartCard } from "@/components/shared/chart-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBloodRequests } from "@/hooks";
import {
  bucketKeyOfMonth,
  monthBuckets,
  reduceIntoBuckets,
} from "@/lib/chart-buckets";
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_ORDER,
} from "@/lib/dashboard-chart-data";
import { humanizeToken } from "@/lib/format";
import type { BloodRequest } from "@/types";

/** Recharts must stay out of the patient's initial bundle. */
const DonutChart = dynamic(
  () => import("@/components/shared/donut-chart").then((mod) => mod.DonutChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const BarMetricChart = dynamic(
  () =>
    import("@/components/shared/bar-metric-chart").then(
      (mod) => mod.BarMetricChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

/** The endpoint caps `limit` at 100 — enough for the chart windows below. */
const CHART_REQUEST_LIMIT = 100;
const MONTHLY_WINDOW = 6;

/**
 * Patient dashboard chart block: a status donut plus a monthly volume bar for
 * every request the patient has posted. Inserted above `MyRequestsTable`.
 */
export default function PatientRequestsOverview() {
  const { data, isPending, isError } = useMyBloodRequests({
    limit: CHART_REQUEST_LIMIT,
  });
  const requests = data?.data ?? [];

  const statusSlices = useMemo(() => {
    const counts = new Map<string, number>(
      REQUEST_STATUS_ORDER.map((status) => [status, 0]),
    );
    for (const request of requests) {
      counts.set(request.status, (counts.get(request.status) ?? 0) + 1);
    }
    return REQUEST_STATUS_ORDER.map((status) => ({
      name: humanizeToken(status),
      value: counts.get(status) ?? 0,
    })).filter((slice) => slice.value > 0);
  }, [requests]);

  const monthlyBars = useMemo(
    () =>
      reduceIntoBuckets<BloodRequest, { name: string; value: number }>(
        requests,
        monthBuckets(MONTHLY_WINDOW),
        (request) => bucketKeyOfMonth(new Date(request.createdAt)),
        (bucket) => ({ name: bucket.label, value: 0 }),
        (bar) => ({ ...bar, value: bar.value + 1 }),
      ),
    [requests],
  );

  if (isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Charts unavailable</AlertTitle>
        <AlertDescription>
          Your request history did not load. Reload the page to try again.
        </AlertDescription>
      </Alert>
    );
  }

  const statusTotal = statusSlices.reduce((sum, slice) => sum + slice.value, 0);
  const monthTotal = monthlyBars.reduce((sum, bar) => sum + bar.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard
        title="Requests by status"
        description={
          statusTotal > 0
            ? `${statusTotal} request${statusTotal === 1 ? "" : "s"} across the workflow.`
            : "Post a request to see its status breakdown."
        }
      >
        <DonutChart
          data={statusSlices}
          colorMap={REQUEST_STATUS_COLORS}
          emptyMessage="No requests to chart yet."
        />
      </ChartCard>

      <ChartCard
        title="Requests per month"
        description={
          monthTotal > 0
            ? `${monthTotal} request${monthTotal === 1 ? "" : "s"} over the last ${MONTHLY_WINDOW} months.`
            : "No requests in the last few months."
        }
      >
        <BarMetricChart
          data={monthlyBars}
          seriesName="Requests"
          emptyMessage="No requests to chart yet."
        />
      </ChartCard>
    </div>
  );
}
