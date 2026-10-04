import type { Metadata } from "next";
import AnalyticsCharts from "@/components/modules/donors/analytics-charts";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Donation Analytics",
  description:
    "Units donated per month, outcomes and the hospitals and blood groups you have helped.",
};

export default function DonorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Donation analytics"
        description="Everything here is derived from your own assignment history."
      />
      <AnalyticsCharts />
    </div>
  );
}
