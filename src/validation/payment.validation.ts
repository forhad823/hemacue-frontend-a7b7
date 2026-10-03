import { z } from "zod";
import { PaymentType } from "@/types";

export const initiatePaymentSchema = z.object({
  requestId: z.uuid(),
  paymentType: z.enum(Object.values(PaymentType) as [string, ...string[]]),
  amount: z.coerce.number().positive(),
});
export const executePaymentSchema = z.object({ paymentID: z.string().min(1) });
export const refundPaymentSchema = z.object({ reason: z.string().min(1) });
