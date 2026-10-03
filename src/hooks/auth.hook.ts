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

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: LoginPayload) => authApi.login(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: (p: RegisterPayload) => authApi.register(p),
  });
}

export function useVerifyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: VerifyEmailPayload) => authApi.verifyEmail(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
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

export function useGoogleOAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: GoogleLoginPayload) => authApi.googleLogin(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}
