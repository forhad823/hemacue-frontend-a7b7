import type { Metadata } from "next";
import AdminOverview from "@/components/modules/admin/overview";

export const metadata: Metadata = {
  title: "Admin Overview",
  description:
    "Platform totals for accounts, blood requests, completed donations and revenue.",
};

export default function AdminOverviewPage() {
  return <AdminOverview />;
}
