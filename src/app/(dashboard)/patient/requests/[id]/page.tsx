import type { Metadata } from "next";
import RequestDetail from "@/components/modules/blood-requests/request-detail";

export const metadata: Metadata = {
  title: "Request Detail",
  description:
    "Request details, donor assignments, status transitions and paid services.",
};

interface RequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;
  return <RequestDetail requestId={id} />;
}
