import { z } from "zod";
import { BloodGroup, UrgencyLevel } from "@/types";

export const createBloodRequestSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientAge: z.coerce.number().int().min(1).max(120),
  bloodGroup: z.enum(Object.values(BloodGroup) as [string, ...string[]]),
  unitsRequired: z.coerce.number().int().min(1).optional(),
  hospitalName: z.string().min(1, "Hospital name is required"),
  hospitalAddress: z.string().min(1, "Hospital address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  urgency: z
    .enum(Object.values(UrgencyLevel) as [string, ...string[]])
    .optional(),
  neededBy: z.string().min(1, "Needed-by date is required"),
  notes: z.string().optional(),
});

export const updateBloodRequestSchema = createBloodRequestSchema.partial();
