"use client";
import { paymentApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  ExecutePaymentPayload,
  InitiatePaymentPayload,
  RefundPaymentPayload,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (p: InitiatePaymentPayload) => paymentApi.initiate(p),
  });
}

export function useExecutePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: ExecutePaymentPayload) => paymentApi.execute(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: RefundPaymentPayload;
    }) => paymentApi.refund(requestId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blood-requests"] }),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.byId(id),
    queryFn: () => paymentApi.byId(id),
    enabled: !!id,
  });
}
