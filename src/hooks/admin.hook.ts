"use client";
import { adminApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminUsersQueryParams,
  AuditLogsQueryParams,
  UpdateUserRolePayload,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminUsers(params: AdminUsersQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.users(params),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserRolePayload;
    }) => adminApi.updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => adminApi.dashboardStats(),
  });
}

export function useAuditLogs(params: AuditLogsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminApi.auditLogs(params),
  });
}
