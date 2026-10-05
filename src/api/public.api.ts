import type { ApiResponse, BloodRequest, PublicLiveStats } from "@/types";
import { RequestStatus, UrgencyLevel } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const REVALIDATE_SECONDS = 60;
const DISTRICTS_SAMPLE_LIMIT = 100;

/**
 * Reads the public blood-request list through Next.js' patched `fetch` so the
 * response is cached and revalidated (ISR) instead of hitting the API on every
 * render. Server-only: it must never be imported from a client component.
 */
async function fetchPublicRequests(
  query: Record<string, string>,
): Promise<ApiResponse<BloodRequest[]> | null> {
  if (!BASE_URL) return null;

  const search = new URLSearchParams(query).toString();

  try {
    const response = await fetch(`${BASE_URL}/blood-requests?${search}`, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["public-blood-requests"],
      },
    });

    if (!response.ok) return null;

    return (await response.json()) as ApiResponse<BloodRequest[]>;
  } catch {
    return null;
  }
}

export const publicApi = {
  /**
   * Aggregates the public counters shown on the landing/about pages from the
   * unauthenticated `GET /blood-requests` endpoint. Resolves to `null` when the
   * backend is unreachable so the pages can still render their static content.
   */
  getLiveStats: async (): Promise<PublicLiveStats | null> => {
    const [total, emergency, completed, districts] = await Promise.all([
      fetchPublicRequests({ limit: "1" }),
      fetchPublicRequests({ limit: "1", urgency: UrgencyLevel.EMERGENCY }),
      fetchPublicRequests({ limit: "1", status: RequestStatus.COMPLETED }),
      fetchPublicRequests({ limit: String(DISTRICTS_SAMPLE_LIMIT) }),
    ]);

    if (!total) return null;

    return {
      totalRequests: total.meta?.total ?? total.data.length,
      emergencyRequests: emergency?.meta?.total ?? 0,
      completedRequests: completed?.meta?.total ?? 0,
      districtsCovered: new Set(
        (districts?.data ?? []).map((request) => request.district),
      ).size,
    };
  },
};
