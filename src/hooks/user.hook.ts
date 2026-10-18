"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateProfilePayload } from "@/types";

export function useGetMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => userApi.getMe(),
    retry: false,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateProfilePayload) => userApi.updateMe(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}
