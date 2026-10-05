import type {
  AdminUsersQueryParams,
  AuditLogsQueryParams,
  BloodRequestQueryParams,
  CompatibleDonorQueryParams,
  MyPaymentsQueryParams,
} from "@/types";

export const queryKeys = {
  auth: { me: ["auth", "me"] as const }, // Nothing else in the project reads queryKeys.auth.me, so i can remove this key from query-keys.ts once nothing references it.
  users: {
    me: ["users", "me"] as const,
    all: (p?: AdminUsersQueryParams) => ["users", "all", p] as const,
  },
  bloodRequests: {
    all: (p?: BloodRequestQueryParams) => ["blood-requests", p] as const,
    my: (p?: BloodRequestQueryParams) => ["blood-requests", "my", p] as const,
    byId: (id: string) => ["blood-requests", id] as const,
  },
  donors: {
    compatible: (p: CompatibleDonorQueryParams) =>
      ["donors", "compatible", p] as const,
    myDonations: ["donors", "my-donations"] as const,
  },
  payments: {
    byId: (id: string) => ["payments", id] as const,
    mine: (p?: MyPaymentsQueryParams) => ["payments", "mine", p] as const,
  },
  admin: {
    users: (p?: AdminUsersQueryParams) => ["admin", "users", p] as const,
    stats: ["admin", "stats"] as const,
    auditLogs: (p?: AuditLogsQueryParams) =>
      ["admin", "audit-logs", p] as const,
  },
};
