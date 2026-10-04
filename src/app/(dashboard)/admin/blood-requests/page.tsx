import type { Metadata } from "next";
import AdminBloodRequestsTable from "@/components/modules/admin/blood-requests-table";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Blood Requests — Admin",
  description:
    "Moderate the public blood-request feed, verify requests and cancel false reports.",
};

export default function AdminBloodRequestsPage() {
  return (
    <div>
      <PageHeading
        title="Blood requests"
        description="Verify genuine reports, cancel false ones and watch donor coverage per request."
      />
      <AdminBloodRequestsTable />
    </div>
  );
}
