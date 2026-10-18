"use client";

import {
  BarMetricChart,
  type BarMetricDatum,
} from "@/components/shared/bar-metric-chart";
import { ChartCard } from "@/components/shared/chart-card";
import { REQUEST_STATUS_COLORS } from "@/lib/dashboard-chart-data";

export type StatusBar = BarMetricDatum;

interface RequestsChartProps {
  data: StatusBar[];
}

/**
 * Loaded through `next/dynamic` — Recharts must never enter the initial bundle.
 */
export default function RequestsChart({ data }: RequestsChartProps) {
  const total = data.reduce((sum, bar) => sum + bar.value, 0);

  return (
    <ChartCard
      title="Blood requests by status"
      description={
        total > 0
          ? `${total} request${total === 1 ? "" : "s"} in the system.`
          : "No requests yet."
      }
    >
      <BarMetricChart
        data={data}
        colorMap={REQUEST_STATUS_COLORS}
        fallbackColor="var(--color-chart-1)"
        seriesName="Requests"
        emptyMessage="No request data to chart."
      />
    </ChartCard>
  );
}
