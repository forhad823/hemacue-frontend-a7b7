"use client";

import {
  Rectangle,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartCard } from "@/components/shared/chart-card";

export interface RoleSlice {
  name: string;
  value: number;
}

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
 * `next/dynamic` from the admin overview (see `overview.tsx`).
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
      {total === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No user data to chart.
        </p>
      ) : (
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
                {data.map((slice) => (
                  <Rectangle
                    key={slice.name}
                    fill={ROLE_COLORS[slice.name] ?? "var(--color-chart-4)"}
                  />
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
      )}
    </ChartCard>
  );
}
