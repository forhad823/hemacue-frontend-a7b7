/** Live, backend-sourced counters rendered on the public pages (never hardcoded). */
export interface PublicLiveStats {
  totalRequests: number;
  emergencyRequests: number;
  completedRequests: number;
  districtsCovered: number;
}
