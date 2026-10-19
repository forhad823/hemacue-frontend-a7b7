"use client";

import { AiInsightList } from "@/components/shared/ai-insight-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBloodRequests } from "@/hooks";
import { generatePatientInsights } from "@/lib/ai/insights";

/**
 * Identical params to `PatientRequestsOverview` → same React Query key →
 * shared cache, zero extra network traffic.
 */
const INSIGHT_REQUEST_LIMIT = 100;

/**
 * Deterministic insight cards for the patient dashboard, derived from the
 * same request rows the chart block already fetches. Non-critical UI: it
 * renders nothing on error and never blocks the table below it.
 */
export default function PatientInsights() {
  const { data, isPending, isError } = useMyBloodRequests({
    limit: INSIGHT_REQUEST_LIMIT,
  });

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return null;

  const insights = generatePatientInsights(data?.data ?? [], Date.now());
  return <AiInsightList insights={insights} />;
}
