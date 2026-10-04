"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TableSkeleton } from "@/components/dashboard/skeletons";
import { ChartCard } from "@/components/shared/chart-card";
import { StatCard } from "@/components/shared/stat-card";
import { useGetMe, useMyDonations } from "@/hooks";
import { BLOOD_GROUP_OPTIONS, DONATION_COOLDOWN_DAYS } from "@/lib/constants";
import { getCooldownState } from "@/lib/format";
import type { AssignmentStatus } from "@/types";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

/** Only these count as "actually donated" — NOTIFIED and DECLINED are noise. */
const DONATED_STATUSES: AssignmentStatus[] = ["ACCEPTED", "COMPLETED"];

const STATUS_LABELS: Record<string, string> = {
  NOTIFIED: "Notified",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  COMPLETED: "Donation completed",
  CANRectangleED: "CanRectangleed",
};

function labelFor<T extends { label: string; value: string }>(
  options: readonly T[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * Donor lifetime analytics, derived entirely from the donor's own assignments
 * so nothing has to be persisted server-side.
 */
export default function AnalyticsCharts() {
  const { data, isPending } = useMyDonations();
  const { data: me } = useGetMe();
  const donations = data?.data ?? [];
  const user = me?.data;
  const cooldown = getCooldownState(
    user?.lastDonatedAt ?? null,
    user?.isAvailable,
  );

  const responded = donations.filter((donation) =>
    ["ACCEPTED", "DECLINED", "COMPLETED"].includes(donation.status),
  ).length;
  const accepted = donations.filter((donation) =>
    DONATED_STATUSES.includes(donation.status),
  ).length;
  const acceptanceRate = responded
    ? Math.round((accepted / responded) * 100)
    : 0;

  const monthly = useMemo(() => {
    const buckets = new Map<
      string,
      { month: string; units: number; requests: number }
    >();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - offset);
      buckets.set(date.toISOString().slice(0, 7), {
        month: date.toLocaleDateString("en-GB", { month: "short" }),
        units: 0,
        requests: 0,
      });
    }

    for (const donation of donations) {
      if (!DONATED_STATUSES.includes(donation.status)) continue;
      const key = (donation.respondedAt ?? donation.assignedAt).slice(0, 7);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.requests += 1;
      bucket.units += donation.request.unitsRequired ?? 1;
    }

    return [...buckets.values()];
  }, [donations]);

  const statusSplit = useMemo(() => {
    const counts = new Map<AssignmentStatus, number>();
    for (const donation of donations) {
      counts.set(donation.status, (counts.get(donation.status) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, value]) => ({
      status,
      name: STATUS_LABELS[status] ?? status,
      value,
    }));
  }, [donations]);

  const byHospital = useMemo(() => {
    const counts = new Map<string, number>();
    for (const donation of donations) {
      if (!DONATED_STATUSES.includes(donation.status)) continue;
      const hospital = donation.request.hospitalName;
      counts.set(
        hospital,
        (counts.get(hospital) ?? 0) + (donation.request.unitsRequired ?? 1),
      );
    }
    return [...counts.entries()]
      .map(([hospital, units]) => ({ hospital, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [donations]);

  const byBloodGroup = useMemo(() => {
    const counts = new Map<string, number>();
    for (const donation of donations) {
      if (!DONATED_STATUSES.includes(donation.status)) continue;
      const group = donation.request.bloodGroup;
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    return [...counts.entries()].map(([group, requests]) => ({
      group,
      label: labelFor(BLOOD_GROUP_OPTIONS, group),
      requests,
    }));
  }, [donations]);

  if (isPending) {
    return <TableSkeleton rows={6} />;
  }

  if (donations.length === 0) {
    return (
      <>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Assignments" value={donations.length} />
          <StatCard label="Acceptance rate" value={`${acceptanceRate}%`} />
          <StatCard
            label={
              cooldown.isEligible ? "Donation status" : "Cooldown remaining"
            }
            value={
              cooldown.isEligible ? "Ready" : `${cooldown.daysRemaining} days`
            }
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            "Donations over time",
            "Units by hospital",
            "Outcome mix",
            "Patient groups",
          ].map((title) => (
            <ChartCard key={title} title={title}>
              <p className="py-10 text-center text-sm text-muted-foreground">
                No donation history yet.
              </p>
            </ChartCard>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assignments" value={donations.length} />
        <StatCard label="Donations completed" value={accepted} />
        <StatCard label="Acceptance rate" value={`${acceptanceRate}%`} />
        <StatCard
          label={cooldown.isEligible ? "Donation status" : "Cooldown remaining"}
          value={
            cooldown.isEligible
              ? cooldown.label
              : `${cooldown.daysRemaining} days`
          }
          trend={
            cooldown.isEligible
              ? undefined
              : `Rest for ${DONATION_COOLDOWN_DAYS} days between donations`
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Units donated per month"
          description="Last six months, from accepted and completed assignments."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthly}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="donorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-chart-1)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip cursor={{ stroke: "var(--color-border)" }} />
                <Area
                  type="monotone"
                  dataKey="units"
                  name="Units"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#donorUnits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Units by hospital"
          description="Where your donations have landed."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byHospital}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="hospital"
                  width={140}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="units" name="Units" radius={[0, 4, 4, 0]}>
                  {byHospital.map((entry, index) => (
                    <Rectangle
                      key={entry.hospital}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Outcome mix"
          description="How your assignments ended up."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                >
                  {statusSplit.map((entry, index) => (
                    <Rectangle
                      key={entry.status}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Patient blood groups helped"
          description="The kinds of patients you have supported."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byBloodGroup}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="requests" name="Donations" radius={[4, 4, 0, 0]}>
                  {byBloodGroup.map((entry, index) => (
                    <Rectangle
                      key={entry.group}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
