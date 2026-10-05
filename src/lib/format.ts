import { DONATION_COOLDOWN_DAYS } from "@/lib/constants";
import type { BloodGroup, RequestStatus } from "@/types";

/** Converts a backend blood-group enum value into its short clinical label (A_POSITIVE -> A+). */
export function formatBloodGroup(group: BloodGroup): string {
  return group
    .replace("_POSITIVE", "+")
    .replace("_NEGATIVE", "-")
    .replace("_", "");
}

/** "12 Mar 2026" — used across tables where the exact day matters more than the time. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** "12 Mar 2026, 14:05" — used for audit trails and payment timestamps. */
export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** "৳1,200" — bKash settles in BDT, so amounts are always shown grouped. */
export function formatCurrency(amount: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("BDT", "৳");
}

/** Whole days between today and a future date; negative when the date has passed. */
export function daysUntil(
  value: string | Date | null | undefined,
): number | null {
  if (!value) return null;
  const target = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export interface CooldownState {
  isEligible: boolean;
  daysRemaining: number;
  eligibleOn: string | null;
  label: string;
}

/**
 * Mirrors the backend rule: a donor is eligible again once the last donation is
 * older than 90 days, or if they have never donated.
 */
export function getCooldownState(
  lastDonatedAt: string | null,
  isAvailable = true,
): CooldownState {
  if (!lastDonatedAt) {
    return {
      isEligible: isAvailable,
      daysRemaining: 0,
      eligibleOn: null,
      label: isAvailable
        ? "Eligible to donate now"
        : "Mark yourself available to donate",
    };
  }

  const eligibleAt = new Date(lastDonatedAt);
  eligibleAt.setDate(eligibleAt.getDate() + DONATION_COOLDOWN_DAYS);
  const daysRemaining = daysUntil(eligibleAt) ?? 0;

  if (daysRemaining > 0) {
    return {
      isEligible: false,
      daysRemaining,
      eligibleOn: eligibleAt.toISOString(),
      label: `Eligible in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
    };
  }

  return {
    isEligible: isAvailable,
    daysRemaining: 0,
    eligibleOn: eligibleAt.toISOString(),
    label: isAvailable
      ? "Eligible to donate now"
      : "Cooldown over — set yourself available",
  };
}

/** Mirrors ALLOWED_STATUS_TRANSITIONS in the backend so the UI never offers an illegal move. */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  RequestStatus,
  RequestStatus[]
> = {
  PENDING: ["VERIFIED", "CANCELLED"],
  VERIFIED: ["CANCELLED"],
  DONOR_ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

/** Only admins may verify a request; every other transition follows the shared map. */
export function getAvailableTransitions(
  status: RequestStatus,
  role?: string,
): RequestStatus[] {
  const transitions = ALLOWED_STATUS_TRANSITIONS[status];
  return role === "ADMIN"
    ? transitions
    : transitions.filter((next) => next !== "VERIFIED");
}

/** Human label for an enum-ish token: DONOR_ASSIGNED -> "Donor assigned". */
export function humanizeToken(token: string): string {
  const spaced = token.replaceAll("_", " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
