"use client";

import { ChartCard } from "@/components/shared/chart-card";
import { DonutChart, type DonutDatum } from "@/components/shared/donut-chart";

export type RoleSlice = DonutDatum;

interface UsersChartProps {
  data: RoleSlice[];
}

const ROLE_COLORS: Record<string, string> = {
  Admin: "var(--color-chart-3)",
  Patient: "var(--color-chart-1)",
  Donor: "var(--color-chart-2)",
};

/**
 * Recharts is a heavy dependency, so this module is only ever loaded through
 * `next/dynamic` from the admin overview and analytics pages (see
 * `overview.tsx` / `analytics.tsx`).
 */
export default function UsersChart({ data }: UsersChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ChartCard
      title="Users by role"
      description={
        total > 0
          ? `${total} active account${total === 1 ? "" : "s"} across the platform.`
          : "No accounts yet."
      }
    >
      <DonutChart
        data={data}
        colorMap={ROLE_COLORS}
        emptyMessage="No user data to chart."
      />
    </ChartCard>
  );
}
