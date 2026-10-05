import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  BloodRequest,
  BloodRequestQueryParams,
  CreateBloodRequestPayload,
  RequestStatus,
  UpdateBloodRequestPayload,
} from "@/types";

const toQuery = (p: BloodRequestQueryParams = {}) =>
  Object.fromEntries(
    Object.entries(p)
      .filter(
        ([, v]) =>
          v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
      )
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]),
  );

export const bloodRequestApi = {
  create: (p: CreateBloodRequestPayload) =>
    apiClient<ApiResponse<BloodRequest>>("/blood-requests", {
      method: "POST",
      body: p,
    }),

  list: (p: BloodRequestQueryParams = {}) =>
    apiClient<ApiResponse<BloodRequest[]>>("/blood-requests", {
      method: "GET",
      query: toQuery(p),
    }),

  myRequests: (p: BloodRequestQueryParams = {}) =>
    apiClient<ApiResponse<BloodRequest[]>>("/blood-requests/my-requests", {
      method: "GET",
      query: toQuery(p),
    }),

  byId: (id: string) =>
    apiClient<ApiResponse<BloodRequest>>(`/blood-requests/${id}`, {
      method: "GET",
    }),

  update: (id: string, p: UpdateBloodRequestPayload) =>
    apiClient<ApiResponse<BloodRequest>>(`/blood-requests/${id}`, {
      method: "PATCH",
      body: p,
    }),

  softDelete: (id: string) =>
    apiClient<ApiResponse<null>>(`/blood-requests/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: RequestStatus) =>
    apiClient<ApiResponse<{ status: RequestStatus }>>(
      `/blood-requests/${id}/status`,
      {
        method: "PATCH",
        body: { status },
      },
    ),

  respond: (id: string, response: "ACCEPTED" | "DECLINED") =>
    apiClient<ApiResponse<null>>(`/blood-requests/${id}/respond`, {
      method: "POST",
      body: { response },
    }),
};
