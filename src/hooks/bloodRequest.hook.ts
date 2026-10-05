"use client";
import { bloodRequestApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  BloodRequestQueryParams,
  CreateBloodRequestPayload,
  RequestStatus,
  UpdateBloodRequestPayload,
} from "@/types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

interface BloodRequestListOptions {
  /** Hold the query until its inputs (e.g. the donor's blood group) are known. */
  enabled?: boolean;
  /** Keep showing the previous page while the next one loads. */
  keepPrevious?: boolean;
}

export function useBloodRequests(
  params: BloodRequestQueryParams = {},
  options: BloodRequestListOptions = {},
) {
  return useQuery({
    queryKey: queryKeys.bloodRequests.all(params),
    queryFn: () => bloodRequestApi.list(params),
    enabled: options.enabled ?? true,
    placeholderData: options.keepPrevious ? keepPreviousData : undefined,
  });
}

export function useMyBloodRequests(params: BloodRequestQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.bloodRequests.my(params),
    queryFn: () => bloodRequestApi.myRequests(params),
  });
}

export function useBloodRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.bloodRequests.byId(id),
    queryFn: () => bloodRequestApi.byId(id),
    enabled: !!id,
  });
}

export function useCreateBloodRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateBloodRequestPayload) => bloodRequestApi.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function useUpdateBloodRequest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateBloodRequestPayload) => bloodRequestApi.update(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function useDeleteBloodRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bloodRequestApi.softDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function useUpdateRequestStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: RequestStatus) =>
      bloodRequestApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blood-requests"] });
      qc.invalidateQueries({ queryKey: queryKeys.bloodRequests.byId(id) });
    },
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      response,
    }: {
      id: string;
      response: "ACCEPTED" | "DECLINED";
    }) => bloodRequestApi.respond(id, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blood-requests"] });
      qc.invalidateQueries({ queryKey: queryKeys.donors.myDonations });
    },
  });
}
