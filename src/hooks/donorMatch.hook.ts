"use client";
import { donorMatchApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type { AssignDonorPayload, CompatibleDonorQueryParams } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCompatibleDonors(params: CompatibleDonorQueryParams) {
  return useQuery({
    queryKey: queryKeys.donors.compatible(params),
    queryFn: () => donorMatchApi.compatibleDonors(params),
    enabled: !!params.bloodGroup,
  });
}

export function useAssignDonor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AssignDonorPayload) => donorMatchApi.assignDonor(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function useMyDonations() {
  return useQuery({
    queryKey: queryKeys.donors.myDonations,
    queryFn: () => donorMatchApi.myDonations(),
  });
}
