import type { Metadata } from "next";
import OpenRequestsTable from "@/components/modules/donors/open-requests-table";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Open Requests",
  description:
    "Verified blood requests your blood group can donate to, newest need first.",
};

export default function DonorRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Open requests"
        description="Only requests your blood group is compatible with are listed. A patient or admin assigns donors from here."
      />
      <OpenRequestsTable />
    </div>
  );
}
