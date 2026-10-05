"use client";

import { Banknote, Droplets, HeartHandshake, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChartSkeleton, StatsSkeleton } from "@/components/dashboard/skeletons";
import { PageHeading } from "@/components/shared/page-heading";
import { StatCard } from "@/components/shared/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks";
import { humanizeToken } from "@/lib/format";
import type { RequestStatus, UserRole } from "@/types";

/** Recharts is ~100 kB gzipped — keep it out of the initial dashboard bundle. */
const UsersChart = dynamic(() => import("./users-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const RequestsChart = dynamic(() => import("./requests-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const ROLE_ORDER: UserRole[] = ["PATIENT", "DONOR", "ADMIN"];
const STATUS_ORDER: RequestStatus[] = [
  "PENDING",
  "VERIFIED",
  "DONOR_ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const cardAccents = [
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
];

export default function AdminOverview() {
  const { data, isPending, isError } = useDashboardStats();
  const stats = data?.data;

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <StatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Dashboard statistics unavailable</AlertTitle>
        <AlertDescription>
          The admin statistics endpoint did not respond. Reload the page or try
          again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  const userSlices = ROLE_ORDER.map((role) => ({
    name: humanizeToken(role),
    value: stats.usersByRole[role] ?? 0,
  })).filter((slice) => slice.value > 0);

  const statusBars = STATUS_ORDER.map((status) => ({
    name: humanizeToken(status),
    value: stats.bloodRequestsByStatus[status] ?? 0,
  })).filter((bar) => bar.value > 0);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Platform overview"
        description="Live totals across accounts, requests, donations and revenue."
      >
        <Button
          variant="outline"
          size="lg"
          className={
            "bg-red-700 text-white hover:text-white hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          }
          render={<Link href="/admin/manage" />}
        >
          Manage users
        </Button>
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          accent={cardAccents[0]}
          trend={`${stats.usersByRole.PATIENT ?? 0} patients · ${
            stats.usersByRole.DONOR ?? 0
          } donors`}
        />
        <StatCard
          label="Total Requests"
          value={stats.totalBloodRequests}
          icon={Droplets}
          accent={cardAccents[1]}
          trend={`${stats.bloodRequestsByStatus.PENDING ?? 0} awaiting verification`}
        />
        <StatCard
          label="Completed Donations"
          value={stats.totalCompletedDonations}
          icon={HeartHandshake}
          accent={cardAccents[2]}
          trend="Assignments delivered to hospitals"
        />
        <StatCard
          label="Total Revenue"
          value={`৳${stats.payments.totalRevenue.toLocaleString("en-BD")}`}
          icon={Banknote}
          accent={cardAccents[3]}
          trend={`${stats.payments.totalCompletedPayments} completed payments`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UsersChart data={userSlices} />
        <RequestsChart data={statusBars} />
      </div>
    </div>
  );
}
