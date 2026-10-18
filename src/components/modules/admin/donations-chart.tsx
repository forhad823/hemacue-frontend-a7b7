"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/shared/chart-card";

export interface WeeklyCountPoint {
  /** Axis label, e.g. "12 Oct". */
  name: string;
  value: number;
}

interface DonationsChartProps {
  data: WeeklyCountPoint[];
}

/**
 * Weekly settlement volume over the recent weeks.
 *
 * Per the Step 3 plan this buckets `GET /admin/payments` by week: completed
 * bKash settlements are the only per-event completion signal admins can fetch
 * in bulk (`useAdminPayments({ limit: 100 })`), so the chart is labelled for
 * what it plots rather than for the donation workflow it accompanies.
 *
 * Loaded through `next/dynamic` — Recharts must never enter the initial bundle.
 */
export default function DonationsChart({ data }: DonationsChartProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <ChartCard
      title="Completed payments per week"
      description={
        total > 0
          ? `${total} settled transaction${total === 1 ? "" : "s"} over the last ${data.length} weeks.`
          : "No settled transactions yet."
      }
    >
      {total === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No payments to chart.
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-popover)",
                  color: "var(--color-popover-foreground)",
                  fontSize: "0.75rem",
                }}
              />
              <Bar
                dataKey="value"
                name="Settled payments"
                fill="var(--color-chart-3)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
