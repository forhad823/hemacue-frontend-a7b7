import { humanizeToken } from "@/lib/format";
import type { DashboardStats, RequestStatus, UserRole } from "@/types";

/** Order in which user roles are stacked across the dashboard donut charts. */
export const USER_ROLE_ORDER: UserRole[] = ["PATIENT", "DONOR", "ADMIN"];

/** Order in which request statuses are stacked across the dashboard bar charts. */
export const REQUEST_STATUS_ORDER: RequestStatus[] = [
  "PENDING",
  "VERIFIED",
  "DONOR_ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

/** `{ name: "Patient", value: 12 }` slices for the users donut — zeroes dropped. */
export function buildUserSlices(
  stats: DashboardStats,
): { name: string; value: number }[] {
  return USER_ROLE_ORDER.map((role) => ({
    name: humanizeToken(role),
    value: stats.usersByRole[role] ?? 0,
  })).filter((slice) => slice.value > 0);
}

/** `{ name: "Pending", value: 4 }` bars for the requests chart — zeroes dropped. */
export function buildStatusBars(
  stats: DashboardStats,
): { name: string; value: number }[] {
  return REQUEST_STATUS_ORDER.map((status) => ({
    name: humanizeToken(status),
    value: stats.bloodRequestsByStatus[status] ?? 0,
  })).filter((bar) => bar.value > 0);
}

/**
 * Humanized request status → chart color, shared by every request-status
 * chart (admin overview bar, patient status donut) so colours never drift.
 */
export const REQUEST_STATUS_COLORS: Record<string, string> = {
  Pending: "var(--color-chart-4)",
  Verified: "var(--color-chart-3)",
  "Donor assigned": "var(--color-chart-2)",
  "In progress": "var(--color-chart-1)",
  Completed: "var(--color-chart-2)",
  Cancelled: "var(--color-chart-5)",
};
