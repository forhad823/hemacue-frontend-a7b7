import { z } from "zod";
import { BloodGroup, UrgencyLevel } from "@/types";

export const createBloodRequestSchema = z.object({
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientAge: z.coerce.number().int().min(1).max(120),
  bloodGroup: z.enum(
    Object.values(BloodGroup) as [BloodGroup, ...BloodGroup[]],
  ),
  unitsRequired: z.coerce.number().int().min(1).optional(),
  hospitalName: z.string().min(1, "Hospital name is required"),
  hospitalAddress: z.string().min(1, "Hospital address is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  urgency: z
    .enum(Object.values(UrgencyLevel) as [UrgencyLevel, ...UrgencyLevel[]])
    .optional(),
  neededBy: z.string().min(1, "Needed-by date is required"),
  notes: z.string().optional(),
});

export const updateBloodRequestSchema = createBloodRequestSchema.partial();

/**
 * The wizard keeps numeric inputs as raw strings so an empty field stays empty
 * instead of silently becoming NaN, then coerces them on submit.
 */
const numericString = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => {
      const parsed = Number(value);
      return (
        Number.isInteger(parsed) &&
        parsed >= min &&
        parsed <= max &&
        value !== ""
      );
    }, `${label} must be a whole number between ${min} and ${max}`);

const isoDateInFuture = z
  .string()
  .min(1, "Needed-by date is required")
  .refine((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed.getTime() >= today.getTime();
  }, "Needed-by date cannot be in the past");

/** One schema per wizard step; the payload is assembled from all four. */
export const requestWizardStepSchemas = {
  patient: z.object({
    patientName: createBloodRequestSchema.shape.patientName,
    patientAge: numericString("Patient age", 1, 120),
    bloodGroup: createBloodRequestSchema.shape.bloodGroup,
  }),
  hospital: z.object({
    hospitalName: createBloodRequestSchema.shape.hospitalName,
    hospitalAddress: createBloodRequestSchema.shape.hospitalAddress,
    district: createBloodRequestSchema.shape.district,
    city: createBloodRequestSchema.shape.city,
  }),
  urgency: z.object({
    urgency: z
      .enum(Object.values(UrgencyLevel) as [UrgencyLevel, ...UrgencyLevel[]])
      .default(UrgencyLevel.NORMAL),
    neededBy: isoDateInFuture,
    unitsRequired: numericString("Units required", 1, 20).default("1"),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must be 500 characters or fewer")
      .optional(),
  }),
  /** Step 4 reuses the live summary and submits without new input. */
  review: z.object({}),
} as const;

export type RequestWizardStep = keyof typeof requestWizardStepSchemas;

export const REQUEST_WIZARD_STEP_FIELDS = {
  patient: ["patientName", "patientAge", "bloodGroup"],
  hospital: ["hospitalName", "hospitalAddress", "district", "city"],
  urgency: ["urgency", "neededBy", "unitsRequired", "notes"],
  review: [],
} as const satisfies Record<RequestWizardStep, readonly string[]>;

/**
 * TanStack Form's standard-schema validator has to describe the *whole* form,
 * but the wizard validates one step at a time. This adapter returns the same
 * `{ field: [messages] }` shape TanStack expects for the active step only.
 */
export function validateRequestWizardStep(
  step: RequestWizardStep,
  values: object,
): Record<string, string[]> | undefined {
  const record = values as Record<string, unknown>;
  const fields = REQUEST_WIZARD_STEP_FIELDS[step] as readonly string[];
  const subset: Record<string, unknown> = {};
  for (const field of fields) subset[field] = record[field];

  const result = requestWizardStepSchemas[step].safeParse(subset);
  if (result.success) return undefined;

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    errors[field] = [...(errors[field] ?? []), issue.message];
  }
  return errors;
}

export const REQUEST_WIZARD_STEP_ORDER: RequestWizardStep[] = [
  "patient",
  "hospital",
  "urgency",
  "review",
];
