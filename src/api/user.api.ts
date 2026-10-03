import apiClient from "@/lib/apiClient";
import type { ApiResponse, UpdateProfilePayload, UserProfile } from "@/types";

export const userApi = {
  getMe: () =>
    apiClient<ApiResponse<UserProfile>>("/users/me", { method: "GET" }),

  updateMe: (p: UpdateProfilePayload) =>
    apiClient<ApiResponse<UserProfile>>("/users/me", {
      method: "PATCH",
      body: p,
    }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return apiClient<
      ApiResponse<Pick<UserProfile, "id" | "name" | "email" | "avatarUrl">>
    >("/users/me/avatar", { method: "PATCH", body: fd });
  },
};
