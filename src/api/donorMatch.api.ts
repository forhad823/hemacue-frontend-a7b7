import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AssignDonorPayload,
  CompatibleDonor,
  CompatibleDonorQueryParams,
  DonorAssignment,
  MyDonation,
  MyDonationsQueryParams,
} from "@/types";

const toQuery = (p: MyDonationsQueryParams): Record<string, string> =>
  Object.fromEntries(
    Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

export const donorMatchApi = {
  compatibleDonors: (p: CompatibleDonorQueryParams) =>
    apiClient<ApiResponse<CompatibleDonor[]>>(
      "/donor-matches/compatible-donors",
      { method: "GET", query: p },
    ),

  assignDonor: (p: AssignDonorPayload) =>
    apiClient<ApiResponse<DonorAssignment>>("/donor-matches/assign-donor", {
      method: "POST",
      body: p,
    }),

  myDonations: (p: MyDonationsQueryParams = {}) =>
    apiClient<ApiResponse<MyDonation[]>>("/donor-matches/my-donations", {
      method: "GET",
      query: toQuery(p),
    }),
};
