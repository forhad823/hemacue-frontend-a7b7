import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AssignDonorPayload,
  CompatibleDonor,
  CompatibleDonorQueryParams,
  DonorAssignment,
  MyDonation,
} from "@/types";

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

  myDonations: () =>
    apiClient<ApiResponse<MyDonation[]>>("/donor-matches/my-donations", {
      method: "GET",
    }),
};
