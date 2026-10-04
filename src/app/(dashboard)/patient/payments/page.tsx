import type { Metadata } from "next";
import PaymentHistoryTable from "@/components/modules/payments/payment-history-table";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Payment History",
  description:
    "Every bKash payment for premium notifications and emergency logistics, with transaction IDs.",
};

export default function PatientPaymentsPage() {
  return (
    <div>
      <PageHeading
        title="Payment history"
        description="Invoices are emailed as PDF once bKash confirms each payment."
      />
      <PaymentHistoryTable />
    </div>
  );
}
