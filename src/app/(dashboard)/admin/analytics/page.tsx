import type { Metadata } from "next";
import AdminAnalytics from "@/components/modules/admin/analytics";
import { PageHeading } from "@/components/shared/page-heading";

export const metadata: Metadata = {
  title: "Analytics — Admin",
  description:
    "User roles, request statuses, monthly revenue and weekly settlement trends.",
};

export default function AdminAnalyticsPage() {
  return (
    <div>
      <PageHeading
        title="Analytics"
        description="Four live views over platform accounts, request flow and bKash revenue."
      />
      <AdminAnalytics />
    </div>
  );
}
