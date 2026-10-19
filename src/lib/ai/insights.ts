/**
 * Deterministic dashboard insights — "AI" in the rule-based sense.
 *
 * Every generator is a PURE function: same inputs, same `Insight[]`, no clock,
 * no network, no React. Swap for an LLM call by replacing the returned
 * `Insight[]` with a remote completion; the shape and every caller stay
 * unchanged. Insights only ever describe data the caller already has — they
 * never fabricate rows or numbers.
 */

import type { CooldownState } from "@/lib/format";
import { formatCurrency } from "@/lib/format";
import type { BloodRequest, DashboardStats, MyDonation } from "@/types";

export type InsightTone = "positive" | "warning" | "info";

export interface Insight {
  /** Stable — used as the React key. */
  id: string;
  tone: InsightTone;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** The plan asks for 2–4 cards per dashboard. */
const MAX_INSIGHTS = 4;

function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`);
}

function countOf(count: number, singular: string): string {
  return `${String(count)} ${plural(count, singular)}`;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function generateAdminInsights(stats: DashboardStats): Insight[] {
  const insights: Insight[] = [];

  const pending = stats.bloodRequestsByStatus.PENDING ?? 0;
  const donors = stats.usersByRole.DONOR ?? 0;
  const { totalRevenue, totalCompletedPayments } = stats.payments;

  if (pending > 0) {
    insights.push({
      id: "admin-pending-requests",
      tone: "info",
      title: `${countOf(pending, "request")} awaiting verification`,
      description:
        "Verify pending requests so compatible donors get notified without delay.",
      action: { label: "Review requests", href: "/admin/blood-requests" },
    });
  }

  if (totalCompletedPayments > 0 && totalRevenue > 0) {
    insights.push({
      id: "admin-revenue",
      tone: "positive",
      title: `${formatCurrency(totalRevenue)} from ${countOf(totalCompletedPayments, "completed payment")}`,
      description:
        "Premium notifications and emergency logistics settled through bKash this period.",
      action: { label: "Open payments", href: "/admin/payments" },
    });
  }

  if (donors === 0) {
    insights.push({
      id: "admin-no-donors",
      tone: "warning",
      title: "No donors registered yet",
      description:
        "Share the donor registration link to grow the compatible-donor pool before the next emergency.",
      action: { label: "Manage users", href: "/admin/manage" },
    });
  }

  if (stats.totalCompletedDonations > 0) {
    insights.push({
      id: "admin-completed-donations",
      tone: "positive",
      title: `${countOf(stats.totalCompletedDonations, "donation")} completed`,
      description:
        "Every completed assignment means blood reached a hospital bed in need.",
    });
  }

  return insights.slice(0, MAX_INSIGHTS);
}

// ─── Patient ─────────────────────────────────────────────────────────────────

/**
 * `now` is injected (never read from the clock here) so the function stays
 * pure and unit-testable — callers pass `Date.now()` at the call site.
 */
export function generatePatientInsights(
  requests: BloodRequest[],
  now: number,
): Insight[] {
  const insights: Insight[] = [];

  const stalePending = requests
    .filter(
      (request) =>
        request.status === "PENDING" &&
        now - Date.parse(request.createdAt) > DAY_MS,
    )
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const oldestStale = stalePending[0];

  if (oldestStale) {
    insights.push({
      id: "patient-stale-pending",
      tone: "info",
      title: `Your request for ${oldestStale.patientName} has been pending for over 24 hours`,
      description:
        "An admin is reviewing it. You can also share the request link to reach donors sooner.",
      action: {
        label: "Open request",
        href: `/patient/requests/${oldestStale.id}`,
      },
    });
  }

  const unboosted = requests.find(
    (request) =>
      request.status !== "COMPLETED" &&
      request.status !== "CANCELLED" &&
      !request.isPremiumNotificationPaid,
  );
  if (unboosted) {
    insights.push({
      id: "patient-boost-available",
      tone: "info",
      title: "Boost this request with premium notification",
      description: `A one-time bKash payment SMS-alerts every compatible donor in ${unboosted.district}.`,
      action: {
        label: "Open request",
        href: `/patient/requests/${unboosted.id}`,
      },
    });
  }

  const completedCount = requests.filter(
    (request) => request.status === "COMPLETED",
  ).length;
  if (completedCount > 0) {
    insights.push({
      id: "patient-completed",
      tone: "positive",
      title: `You have completed ${countOf(completedCount, "blood request")}`,
      description:
        "Thank you for closing the loop — hospitals confirmed delivery on each one.",
    });
  }

  const activeCount = requests.filter(
    (request) =>
      request.status !== "COMPLETED" && request.status !== "CANCELLED",
  ).length;
  if (activeCount > 0 && !oldestStale) {
    insights.push({
      id: "patient-active",
      tone: "info",
      title: `${countOf(activeCount, "active request")} on the platform`,
      description:
        "Track donor assignments and request progress from your dashboard.",
      action: { label: "Track requests", href: "/patient" },
    });
  }

  return insights.slice(0, MAX_INSIGHTS);
}

// ─── Donor ───────────────────────────────────────────────────────────────────

export function generateDonorInsights(
  donations: MyDonation[],
  cooldown: CooldownState,
): Insight[] {
  const insights: Insight[] = [];

  if (!cooldown.isEligible && cooldown.daysRemaining > 0) {
    insights.push({
      id: "donor-cooldown",
      tone: "info",
      title: `You can donate again in ${countOf(cooldown.daysRemaining, "day")}`,
      description:
        "Rest keeps the donor registry safe — your profile stays visible to admins meanwhile.",
    });
  }

  const notifiedCount = donations.filter(
    (donation) => donation.status === "NOTIFIED",
  ).length;
  if (notifiedCount > 0) {
    insights.push({
      id: "donor-invitations",
      tone: "warning",
      title: `You have ${countOf(notifiedCount, "pending donation invitation")}`,
      description:
        "Respond before the requester's deadline so they can plan the hospital visit.",
      action: { label: "Review invitations", href: "/donor" },
    });
  }

  const acceptedCount = donations.filter(
    (donation) =>
      donation.status === "ACCEPTED" || donation.status === "COMPLETED",
  ).length;
  if (acceptedCount > 0) {
    insights.push({
      id: "donor-accepted",
      tone: "positive",
      title: `You've accepted ${countOf(acceptedCount, "donation")}`,
      description:
        "Thank you — every accepted assignment is a life potentially saved.",
    });
  }

  if (cooldown.isEligible && notifiedCount === 0) {
    insights.push({
      id: "donor-eligible",
      tone: "positive",
      title: "You're eligible to donate now",
      description:
        "Open requests matching your blood group are waiting for a donor like you.",
      action: { label: "Find requests", href: "/donor/requests" },
    });
  }

  return insights.slice(0, MAX_INSIGHTS);
}
