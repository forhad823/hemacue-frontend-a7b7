import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeading } from "@/components/shared/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AUDIT_ACTION_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  DONATION_COOLDOWN_DAYS,
  PAYMENT_PRICING,
  RATE_LIMITS,
  REQUEST_STATUS_OPTIONS,
  URGENCY_OPTIONS,
  USER_ROLE_OPTIONS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Settings — Admin",
  description:
    "Read-only reference of the platform constants Hemacue actually enforces.",
};

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const roleLabels = USER_ROLE_OPTIONS.map((role) => role.label).join(", ");

  return (
    <div>
      <PageHeading
        title="Settings"
        description="The enforced platform constants — cooldown, pricing, rate limits and coverage — in one read-only view."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SettingsCard
          title="Donor rules"
          description="Safety windows applied by the donor-matching engine."
        >
          <SettingRow
            label="Donation cooldown"
            value={`${DONATION_COOLDOWN_DAYS} days`}
          />
          <SettingRow label="Account roles" value={roleLabels} />
          <SettingRow
            label="Cooldown check"
            value="Before every compatible-donor search"
          />
        </SettingsCard>

        <SettingsCard
          title="Paid services (bKash)"
          description="Tokenized checkout prices in BDT; the backend re-verifies every amount."
        >
          <SettingRow
            label="Premium notification"
            value={formatCurrency(PAYMENT_PRICING.PREMIUM_NOTIFICATION)}
          />
          <SettingRow
            label="Emergency logistics"
            value={formatCurrency(PAYMENT_PRICING.EMERGENCY_LOGISTICS)}
          />
          <SettingRow label="Settlement currency" value="BDT" />
          <SettingRow label="Refund approval" value="Admin only" />
        </SettingsCard>

        <SettingsCard
          title="API rate limits"
          description="Redis-backed counters, applied per client IP."
        >
          <SettingRow
            label="Global API"
            value={`${RATE_LIMITS.global.maxRequests} req / ${RATE_LIMITS.global.windowMinutes} min`}
          />
          <SettingRow
            label="Auth & payments"
            value={`${RATE_LIMITS.authPayment.maxRequests} req / ${RATE_LIMITS.authPayment.windowMinutes} min`}
          />
        </SettingsCard>

        <SettingsCard
          title="Platform coverage"
          description="Reference data every filter and form draws from."
        >
          <SettingRow
            label="Blood groups"
            value={String(BLOOD_GROUP_OPTIONS.length)}
          />
          <SettingRow label="Districts" value={String(DISTRICTS.length)} />
          <SettingRow
            label="Urgency levels"
            value={String(URGENCY_OPTIONS.length)}
          />
          <SettingRow
            label="Request statuses"
            value={String(REQUEST_STATUS_OPTIONS.length)}
          />
          <SettingRow
            label="Audited actions"
            value={String(AUDIT_ACTION_OPTIONS.length)}
          />
        </SettingsCard>
      </div>
    </div>
  );
}
