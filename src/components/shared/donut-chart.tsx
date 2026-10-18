"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface DonutDatum {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: DonutDatum[];
  /** Lookup by datum name (e.g. "Patient" -> chart color). Checked first. */
  colorMap?: Record<string, string>;
  /** Ordered palette; cycled for slices that miss `colorMap`. */
  colors?: readonly string[];
  fallbackColor?: string;
  emptyMessage?: string;
}

const EMPTY_CLASS =
  "flex h-64 items-center justify-center text-sm text-muted-foreground";

/**
 * Recharts donut shared by every dashboard pie (admin roles, patient request
 * statuses…). Recharts is ~100 kB gzipped — only ever load this module through
 * `next/dynamic({ ssr: false })` from a dashboard client component.
 *
 * The chart area (and its empty state) lives here; the surrounding
 * `ChartCard` title/description stays with the caller.
 */
export function DonutChart({
  data,
  colorMap,
  colors,
  fallbackColor = "var(--color-chart-4)",
  emptyMessage = "No data to chart.",
}: DonutChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return <p className={EMPTY_CLASS}>{emptyMessage}</p>;
  }

  const colorFor = (slice: DonutDatum, index: number): string =>
    colorMap?.[slice.name] ?? colors?.[index % colors.length] ?? fallbackColor;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((slice, index) => (
              <Cell key={slice.name} fill={colorFor(slice, index)} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-popover)",
              color: "var(--color-popover-foreground)",
              fontSize: "0.75rem",
            }}
          />
          <Legend
            position="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DonutChart;
