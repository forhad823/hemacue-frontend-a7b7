export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  users: {
    me: ["users", "me"] as const,
    all: (p?: Record<string, unknown>) => ["users", "all", p] as const,
  },
  bloodRequests: {
    all: (p?: Record<string, unknown>) => ["blood-requests", p] as const,
    my: (p?: Record<string, unknown>) => ["blood-requests", "my", p] as const,
    byId: (id: string) => ["blood-requests", id] as const,
  },
  donors: {
    compatible: (p: Record<string, unknown>) =>
      ["donors", "compatible", p] as const,
    myDonations: ["donors", "my-donations"] as const,
  },
  payments: {
    byId: (id: string) => ["payments", id] as const,
  },
  admin: {
    users: (p?: Record<string, unknown>) => ["admin", "users", p] as const,
    stats: ["admin", "stats"] as const,
    auditLogs: (p?: Record<string, unknown>) =>
      ["admin", "audit-logs", p] as const,
  },
};
