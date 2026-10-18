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

export interface BarMetricDatum {
  name: string;
  value: number;
}

interface BarMetricChartProps {
  data: BarMetricDatum[];
  /** Lookup by datum name (e.g. "Completed" -> chart color). Checked first. */
  colorMap?: Record<string, string>;
  fallbackColor?: string;
  /** Series name shown in the tooltip. */
  seriesName?: string;
  emptyMessage?: string;
}

const EMPTY_CLASS =
  "flex h-64 items-center justify-center text-sm text-muted-foreground";

/**
 * Recharts column chart shared by every dashboard bar (admin request statuses,
 * patient requests per month…). Recharts is ~100 kB gzipped — only ever load
 * this module through `next/dynamic({ ssr: false })` from a dashboard client
 * component.
 *
 * The chart area (and its empty state) lives here; the surrounding
 * `ChartCard` title/description stays with the caller.
 */
export function BarMetricChart({
  data,
  colorMap,
  fallbackColor = "var(--color-chart-1)",
  seriesName = "Value",
  emptyMessage = "No data to chart.",
}: BarMetricChartProps) {
  const total = data.reduce((sum, bar) => sum + bar.value, 0);

  if (total === 0) {
    return <p className={EMPTY_CLASS}>{emptyMessage}</p>;
  }

  const colorFor = (name: string): string => colorMap?.[name] ?? fallbackColor;

  return (
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
            name={seriesName}
            radius={[6, 6, 0, 0]}
            shape={(props) => (
              <Rectangle {...props} fill={colorFor(props.payload.name)} />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarMetricChart;
