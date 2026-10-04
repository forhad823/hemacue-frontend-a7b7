import type { Metadata } from "next";
import CreateRequestWizard from "@/components/modules/blood-requests/create-request-wizard";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "New Blood Request",
  description:
    "Post a verified blood request in four steps: patient, hospital, urgency and review.",
};

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Post a blood request"
        description="An admin verifies every request before compatible donors are notified."
      />
      <CreateRequestWizard />
    </div>
  );
}
