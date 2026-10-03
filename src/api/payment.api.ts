import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  ExecutePaymentPayload,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  Payment,
  RefundPaymentPayload,
} from "@/types";

export const paymentApi = {
  initiate: (p: InitiatePaymentPayload) =>
    apiClient<ApiResponse<InitiatePaymentResponse>>("/payments/initiate", {
      method: "POST",
      body: p,
    }),

  execute: (p: ExecutePaymentPayload) =>
    apiClient<ApiResponse<Payment>>("/payments/execute", {
      method: "POST",
      body: p,
    }),

  refund: (requestId: string, p: RefundPaymentPayload) =>
    apiClient<ApiResponse<Payment>>(`/payments/refund/${requestId}`, {
      method: "POST",
      body: p,
    }),

  byId: (id: string) =>
    apiClient<ApiResponse<Payment>>(`/payments/${id}`, { method: "GET" }),
};
