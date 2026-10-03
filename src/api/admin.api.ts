import apiClient from "@/lib/apiClient";
import type {
  AdminUser,
  AdminUsersQueryParams,
  ApiResponse,
  AuditLog,
  AuditLogsQueryParams,
  DashboardStats,
  UpdateUserRolePayload,
} from "@/types";

export const adminApi = {
  users: (p: AdminUsersQueryParams = {}) =>
    apiClient<ApiResponse<AdminUser[]>>("/admin/users", {
      method: "GET",
      query: p,
    }),

  updateUser: (id: string, p: UpdateUserRolePayload) =>
    apiClient<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: p,
    }),

  dashboardStats: () =>
    apiClient<ApiResponse<DashboardStats>>("/admin/dashboard-stats", {
      method: "GET",
    }),

  auditLogs: (p: AuditLogsQueryParams = {}) =>
    apiClient<ApiResponse<AuditLog[]>>("/admin/audit-logs", {
      method: "GET",
      query: p,
    }),
};
