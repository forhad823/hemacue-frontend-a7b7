"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminUser,
  AdminUsersQueryParams,
  AuditLogsQueryParams,
  UpdateUserRolePayload,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*  Query key prefixes                                                         */
/*  A prefix matches EVERY cached query that starts with it, whatever params   */
/*  (page, search, filters) it was fetched with.                               */
/* -------------------------------------------------------------------------- */
const ADMIN_USERS_PREFIX = ["admin", "users"] as const;
const ADMIN_AUDIT_LOGS_PREFIX = ["admin", "audit-logs"] as const;

/** Shape of a cached users page. Only `data` matters for the optimistic patch. */
type AdminUsersCache = { data: AdminUser[] };

type UpdateUserVariables = {
  id: string;
  payload: UpdateUserRolePayload;
};

/**
 * Returns a copy of `user` with only the fields present in `payload` changed.
 * Fields that are `undefined` in the payload are left untouched.
 */
function applyUserPatch(
  user: AdminUser,
  payload: UpdateUserRolePayload,
): AdminUser {
  const { role, status, isDeleted } = payload;

  return {
    ...user,
    ...(role !== undefined && { role }),
    ...(status !== undefined && { status }),
    ...(isDeleted !== undefined && { isDeleted }),
  };
}

export function useAdminUsers(params: AdminUsersQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.users(params),
    placeholderData: (previous) => previous,
  });
}

/**
 * Updates a user's role, status, or deleted flag (admin only).
 *
 * Usage:
 *   const { mutate } = useUpdateUserRole();
 *   mutate({ id: user.id, payload: { role: "DONOR" } });
 *
 * Flow (optimistic update):
 *   1. onMutate  -> save a snapshot of every cached users page, then patch the
 *                   user in all of them so the UI updates instantly.
 *   2. onError   -> restore the snapshots (rollback).
 *   3. onSettled -> refetch users and audit logs so the UI matches the server,
 *                   whether the request succeeded or failed.
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) =>
      adminApi.updateUser(id, payload),

    // Step 1: optimistic update
    onMutate: async ({ id, payload }) => {
      // Stop in-flight refetches from overwriting our optimistic data.
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_PREFIX });

      // Snapshot every cached users page: [[queryKey, data], ...]
      const snapshots = queryClient.getQueriesData<AdminUsersCache>({
        queryKey: ADMIN_USERS_PREFIX,
      });

      // Patch the changed user in every cached page.
      queryClient.setQueriesData<AdminUsersCache>(
        { queryKey: ADMIN_USERS_PREFIX },
        (cache) =>
          cache && {
            ...cache,
            data: cache.data.map((user) =>
              user.id === id ? applyUserPatch(user, payload) : user,
            ),
          },
      );

      // Returned value becomes `context` in onError.
      return { snapshots };
    },

    // Step 2: rollback on failure
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },

    // Step 3: sync with the server (runs after success AND failure)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_PREFIX });
      queryClient.invalidateQueries({ queryKey: ADMIN_AUDIT_LOGS_PREFIX });
    },
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
    placeholderData: (previous) => previous,
  });
}
