import type { PaymentStatus, PaymentType } from "./enums.type";

export interface Payment {
  id: string;
  userId: string;
  requestId: string;
  paymentGateway: string;
  paymentID: string;
  trxID: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  payerReference: string | null;
  paidAt: string | null;
  refundTrxId: string | null;
  refundAmount: string | null;
  refundReason: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentPayload {
  requestId: string;
  paymentType: PaymentType;
  amount: number;
}
export interface InitiatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  payment: Pick<
    Payment,
    "id" | "status" | "paymentType" | "amount" | "currency" | "requestId"
  >;
}
export interface ExecutePaymentPayload {
  paymentID: string;
}
export interface RefundPaymentPayload {
  reason: string;
}
