"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/shared/chart-card";
import { formatCurrency } from "@/lib/format";

export interface MonthlyRevenuePoint {
  /** Axis label, e.g. "Oct". */
  name: string;
  /** BDT collected via PREMIUM_NOTIFICATION payments. */
  premium: number;
  /** BDT collected via EMERGENCY_LOGISTICS payments. */
  logistics: number;
}

interface RevenueChartProps {
  data: MonthlyRevenuePoint[];
}

/**
 * Stacked monthly revenue for the two paid services. Loaded through
 * `next/dynamic` — Recharts must never enter the initial bundle.
 */
export default function RevenueChart({ data }: RevenueChartProps) {
  const total = data.reduce(
    (sum, point) => sum + point.premium + point.logistics,
    0,
  );

  return (
    <ChartCard
      title="Monthly revenue"
      description={
        total > 0
          ? `${formatCurrency(total)} collected across the last ${data.length} months.`
          : "No completed payments yet."
      }
    >
      {total === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No revenue to chart.
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
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-popover)",
                  color: "var(--color-popover-foreground)",
                  fontSize: "0.75rem",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
              />
              <Bar
                dataKey="premium"
                name="Premium notification"
                stackId="revenue"
                fill="var(--color-chart-1)"
              />
              <Bar
                dataKey="logistics"
                name="Emergency logistics"
                stackId="revenue"
                fill="var(--color-chart-2)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
