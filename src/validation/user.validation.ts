import { z } from "zod";
import { BloodGroup } from "@/types";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .refine((val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
      message: "Please provide valid Bangladeshi number",
    })
    .optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isAvailable: z.boolean().optional(),
  lastDonatedAt: z.string().optional(),
  bloodGroup: z
    .enum(Object.values(BloodGroup) as [BloodGroup, ...BloodGroup[]])
    .optional(),
});

/**
 * The profile form always renders every field, so its schema differs from the
 * API payload schema above: optional PATCH fields become required form fields
 * and empty strings are trimmed away before submission.
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val),
      "Please provide a valid Bangladeshi number",
    ),
  district: z.string().trim().max(60, "District is too long"),
  city: z.string().trim().max(60, "City is too long"),
  address: z
    .string()
    .trim()
    .max(200, "Address must be 200 characters or fewer"),
  bloodGroup: z.enum(
    Object.values(BloodGroup) as [BloodGroup, ...BloodGroup[]],
  ),
  isAvailable: z.boolean(),
  lastDonatedAt: z
    .string()
    .refine(
      (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
      "Please provide a valid date",
    ),
});
