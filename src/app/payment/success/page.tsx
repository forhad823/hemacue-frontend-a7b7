"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PaymentResult } from "@/components/modules/payments/payment-result";
import { useGetMe } from "@/hooks";
import { formatCurrency } from "@/lib/format";
import { UserRole } from "@/types";

const DASHBOARD_BY_ROLE = {
  [UserRole.PATIENT]: "/patient",
  [UserRole.DONOR]: "/donor",
  [UserRole.ADMIN]: "/admin",
} as const;

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { data: me } = useGetMe();

  const trxID = searchParams.get("trxID");
  const requestId = searchParams.get("requestId");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") ?? "BDT";

  const dashboard =
    DASHBOARD_BY_ROLE[me?.data.role ?? UserRole.PATIENT] ?? "/patient";

  return (
    <PaymentResult
      icon={CheckCircle2}
      tone="success"
      title="Payment successful"
      description="bKash confirmed your payment and the request has been upgraded."
      bullets={[
        trxID
          ? `Transaction ID: ${trxID}`
          : "Transaction ID available in your payment history.",
        amount
          ? `Amount paid: ${formatCurrency(Number(amount), currency)}`
          : "A PDF invoice has been emailed to your registered address.",
        "Premium notifications reach matching donors immediately.",
      ]}
      primaryAction={
        requestId
          ? { label: "View request", href: `/patient/requests/${requestId}` }
          : { label: "View my requests", href: "/patient/requests" }
      }
      secondaryAction={{ label: "Back to dashboard", href: dashboard }}
    />
  );
}
