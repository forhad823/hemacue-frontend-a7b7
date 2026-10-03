import type { BloodGroup, UserRole } from "./enums.type";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: typeof UserRole.DONOR | typeof UserRole.PATIENT;
  bloodGroup: BloodGroup;
  phone: string;
  district: string;
  city: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}
export interface ResendOtpPayload {
  email: string;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
export interface GoogleLoginPayload {
  idToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
