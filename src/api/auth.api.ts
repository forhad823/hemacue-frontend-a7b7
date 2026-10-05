import apiClient from "@/lib/apiClient";
import type {
  AuthTokens,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  UserProfile,
  VerifyEmailPayload,
} from "@/types";
import type { ApiResponse } from "@/types";

export const authApi = {
  register: (p: RegisterPayload) =>
    apiClient<ApiResponse<null>>("/auth/register", { method: "POST", body: p }),

  verifyEmail: (p: VerifyEmailPayload) =>
    apiClient<ApiResponse<{ user: UserProfile } & AuthTokens>>(
      "/auth/verify-email",
      { method: "POST", body: p },
    ),

  resendRegisterOtp: (p: ResendOtpPayload) =>
    apiClient<ApiResponse<null>>("/auth/verify-email/resend-otp", {
      method: "POST",
      body: p,
    }), 

  login: (p: LoginPayload) =>
    apiClient<ApiResponse<AuthTokens>>("/auth/login", {
      method: "POST",
      body: p,
    }),

  refreshToken: (refreshToken?: string) =>
    apiClient<ApiResponse<AuthTokens>>("/auth/refresh-token", {
      method: "POST",
      body: refreshToken ? { refreshToken } : undefined,
    }),

  googleLogin: (p: GoogleLoginPayload) =>
    apiClient<ApiResponse<AuthTokens>>("/auth/google-login", {
      method: "POST",
      body: p,
    }),

  forgotPassword: (p: ForgotPasswordPayload) =>
    apiClient<ApiResponse<null>>("/auth/forgot-password", {
      method: "POST",
      body: p,
    }),

  resetPassword: (p: ResetPasswordPayload) =>
    apiClient<ApiResponse<null>>("/auth/reset-password", {
      method: "POST",
      body: p,
    }),

  logout: () =>
    apiClient<ApiResponse<null>>("/auth/logout", { method: "POST" }),
};

// Keep these named exports for backward compat with existing hooks/auth.api usage
export const userRegistration = authApi.register;
export const userLogin = authApi.login;
export const verifyAccount = authApi.verifyEmail;
export const userLogout = authApi.logout;
export const googleOAuth = authApi.googleLogin;
export const forgotPassword = authApi.forgotPassword;
export const resetPassword = authApi.resetPassword;
export const resendOtp = authApi.resendRegisterOtp;
export const refreshAuthToken = authApi.refreshToken;
