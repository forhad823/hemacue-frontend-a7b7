import type { Metadata } from "next";
import DonorOverview from "@/components/modules/donors/overview";

export const metadata: Metadata = {
  title: "Donor Dashboard",
  description:
    "Your donation assignments, acceptance history and availability status in one place.",
};

export default function DonorDashboardPage() {
  return <DonorOverview />;
}
