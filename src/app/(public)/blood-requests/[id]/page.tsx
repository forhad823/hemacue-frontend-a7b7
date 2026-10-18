import type { Metadata } from "next";
import RequestDetail from "@/components/modules/blood-requests/request-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Blood Request Details | Hemacue",
    description: `View details for blood request ${id} on the Hemacue platform.`,
  };
}

export default async function PublicBloodRequestPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <RequestDetail requestId={id} />
    </div>
  );
}
