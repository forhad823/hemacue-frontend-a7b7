"use client";

import {
  CalendarClock,
  Droplets,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { StatsSkeleton } from "@/components/dashboard/skeletons";
import MyDonationsTable from "@/components/modules/donors/my-donations-table";
import { PageHeading } from "@/components/shared/page-heading";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe, useMyDonations } from "@/hooks";
import { DONATION_COOLDOWN_DAYS } from "@/lib/constants";
import { getCooldownState } from "@/lib/format";

/** Assignments that still need something from the donor. */
const PENDING_STATUSES = ["NOTIFIED", "ACCEPTED"];
/** Assignments that mean blood actually changed hands. */
const DONATED_STATUSES = ["ACCEPTED", "COMPLETED"];

export default function DonorOverview() {
  const { data, isPending } = useMyDonations();
  const { data: me } = useGetMe();
  const donations = data?.data ?? [];
  const user = me?.data;

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <StatsSkeleton />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const cooldown = getCooldownState(
    user?.lastDonatedAt ?? null,
    user?.isAvailable,
  );
  const donated = donations.filter((donation) =>
    DONATED_STATUSES.includes(donation.status),
  );
  const active = donations.filter((donation) =>
    PENDING_STATUSES.includes(donation.status),
  );
  const units = donated.reduce(
    (total, donation) => total + (donation.request.unitsRequired ?? 1),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Donor dashboard"
        description="Accept an assignment, report to the hospital, then mark the donation complete."
      >
        <Button
          size="sm"
          className="gap-1.5"
          render={<Link href="/donor/requests" />}
        >
          <Sparkles className="size-4" />
          Find requests
        </Button>
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Donations completed"
          value={donated.length}
          icon={HeartHandshake}
        />
        <StatCard label="Units donated" value={units} icon={Droplets} />
        <StatCard
          label="Awaiting my response"
          value={active.length}
          icon={Sparkles}
        />
        <StatCard
          label={cooldown.isEligible ? "Donation status" : "Cooldown remaining"}
          value={
            cooldown.isEligible ? "Ready" : `${cooldown.daysRemaining} days`
          }
          icon={CalendarClock}
        />
      </div>

      {!cooldown.isEligible && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Cooldown in effect</CardTitle>
            <CardDescription>
              Donors rest for {DONATION_COOLDOWN_DAYS} days between donations to
              protect the registry. You can still browse requests and update
              your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {cooldown.label}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">My donations</h2>
          <Button
            size="sm"
            variant="ghost"
            className="cursor-pointer"
            render={<Link href="/donor/analytics" />}
          >
            View analytics
          </Button>
        </div>
        <MyDonationsTable />
      </section>
    </div>
  );
}
