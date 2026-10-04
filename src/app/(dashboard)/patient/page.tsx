import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import MyRequestsTable from "@/components/modules/blood-requests/my-requests-table";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Blood Requests",
  description:
    "Track every blood request you have posted and its donor coverage.",
};

export default function PatientRequestsPage() {
  return (
    <div>
      <PageHeading
        title="My blood requests"
        description="Filter by status, then open a request to assign donors or pay for a boost."
      >
        <Button
          size="sm"
          className="gap-1.5"
          render={<Link href="/patient/new" />}
        >
          <FilePlus2 className="size-4" />
          New request
        </Button>
      </PageHeading>
      <MyRequestsTable />
    </div>
  );
}
