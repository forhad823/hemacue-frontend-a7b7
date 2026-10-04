"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/shared/chart-card";

export interface StatusBar {
  name: string;
  value: number;
}

interface RequestsChartProps {
  data: StatusBar[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "var(--color-chart-4)",
  Verified: "var(--color-chart-3)",
  "Donor assigned": "var(--color-chart-2)",
  "In progress": "var(--color-chart-1)",
  Completed: "var(--color-chart-2)",
  Cancelled: "var(--color-chart-5)",
};

/**
 * Loaded through `next/dynamic` — Recharts must never enter the initial bundle.
 */
export default function RequestsChart({ data }: RequestsChartProps) {
  const total = data.reduce((sum, bar) => sum + bar.value, 0);

  const DEFAULT_BAR_COLOR = "var(--color-chart-1)";

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status] ?? DEFAULT_BAR_COLOR;

  return (
    <ChartCard
      title="Blood requests by status"
      description={
        total > 0
          ? `${total} request${total === 1 ? "" : "s"} in the system.`
          : "No requests yet."
      }
    >
      {total === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No request data to chart.
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
                name="Requests"
                radius={[6, 6, 0, 0]}
                shape={(props) => (
                  <Rectangle
                    {...props}
                    fill={getStatusColor(props.payload.name)}
                  />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
