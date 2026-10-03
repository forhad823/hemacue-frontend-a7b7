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
    .enum(Object.values(BloodGroup) as [string, ...string[]])
    .optional(),
});
