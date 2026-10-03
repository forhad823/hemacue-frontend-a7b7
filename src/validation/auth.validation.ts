import { z } from "zod";
import { BloodGroup } from "@/types";

const passwordRegexes = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  num: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

const passwordField = (label = "Password") =>
  z
    .string()
    .min(1, `${label} is required`)
    .min(6, `${label} must be at least 6 characters long`)
    .regex(
      passwordRegexes.lower,
      `${label} must contain at least 1 lowercase letter`,
    )
    .regex(
      passwordRegexes.upper,
      `${label} must contain at least 1 uppercase letter`,
    )
    .regex(passwordRegexes.num, `${label} must contain at least 1 number`)
    .regex(
      passwordRegexes.special,
      `${label} must contain at least 1 special character`,
    );

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
  password: passwordField(),
  role: z.enum(["DONOR", "PATIENT"]).default("DONOR"),
  bloodGroup: z.enum(Object.values(BloodGroup) as [string, ...string[]]),
  phone: z
    .string()
    .refine((val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
      message: "Please provide valid Bangladeshi number",
    }),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({ email: z.email() });

export const resendOtpSchema = z.object({ email: z.email() });

export const resetPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: passwordField("New password"),
});

export const googleLoginSchema = z.object({ idToken: z.string().min(1) });

//* GP - 017, 013
//* BL - 019, 014
//* Airtel - 016
//* Robi - 018
//* TeleTalk - 01512345678
//! City Cell - 011 (Already dead)
//! there is no 012
//todo we need to confirm from [3-9]

//? Either +880, 880, 0
