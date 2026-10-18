import type { Metadata } from "next";
import AdminPaymentsTable from "@/components/modules/admin/payments-table";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Payments — Admin",
  description:
    "Platform-wide bKash ledger: filter by status, search trx IDs and sort by amount or date.",
};

export default function AdminPaymentsPage() {
  return (
    <div>
      <PageHeading
        title="Payments"
        description="Every bKash transaction on the platform, newest first. Refunds are issued from the blood-request view."
      />
      <AdminPaymentsTable />
    </div>
  );
}
