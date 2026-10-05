"use client";
import { authApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearSession, persistSession } from "@/lib/session-client";

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: LoginPayload) => {
      const res = await authApi.login(p);
      await persistSession(res.data);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useGoogleOAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: GoogleLoginPayload) => {
      const res = await authApi.googleLogin(p);
      await persistSession(res.data);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: (p: RegisterPayload) => authApi.register(p),
  });
}

export function useResendRegisterOtp() {
  return useMutation({
    mutationFn: (p: ResendOtpPayload) => authApi.resendRegisterOtp(p),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (p: ForgotPasswordPayload) => authApi.forgotPassword(p),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (p: ResetPasswordPayload) => authApi.resetPassword(p),
  });
}

export function useVerifyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: VerifyEmailPayload) => {
      const res = await authApi.verifyEmail(p);
      await persistSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        return await authApi.logout();
      } finally {
        await clearSession(); // clear the frontend copies even if the API call fails
      }
    },
    onSuccess: () => qc.clear(),
  });
}
