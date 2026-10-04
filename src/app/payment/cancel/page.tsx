"use client";

import { XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PaymentResult } from "@/components/modules/payments/payment-result";
import { useGetMe } from "@/hooks";
import { UserRole } from "@/types";

const DASHBOARD_BY_ROLE = {
  [UserRole.PATIENT]: "/patient",
  [UserRole.DONOR]: "/donor",
  [UserRole.ADMIN]: "/admin",
} as const;

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const { data: me } = useGetMe();

  const paymentID = searchParams.get("paymentID");
  const requestId = searchParams.get("requestId");
  const reason = searchParams.get("reason");

  const dashboard =
    DASHBOARD_BY_ROLE[me?.data.role ?? UserRole.PATIENT] ?? "/patient";

  // A failed confirmation is different from a customer-initiated cancel.
  const failedVerification = reason === "verification_failed";

  return (
    <PaymentResult
      icon={XCircle}
      tone="warning"
      title={failedVerification ? "Payment not confirmed" : "Payment cancelled"}
      description={
        failedVerification
          ? "bKash did not confirm this transaction, so nothing has been charged."
          : "You cancelled the bKash checkout, so no money was taken from your account."
      }
      bullets={[
        paymentID
          ? `Payment reference: ${paymentID}`
          : "No payment reference was returned.",
        "The request keeps its original status — nothing was upgraded.",
        failedVerification
          ? "You can safely retry the payment from the request page."
          : "You can restart the payment from the request page at any time.",
      ]}
      primaryAction={
        requestId
          ? { label: "Back to request", href: `/patient/requests/${requestId}` }
          : { label: "Back to my requests", href: "/patient/requests" }
      }
      secondaryAction={{ label: "Back to dashboard", href: dashboard }}
    />
  );
}
