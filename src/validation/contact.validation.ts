import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(value),
      { message: "Please provide a valid Bangladeshi number" },
    ),
  subject: z.enum([
    "GENERAL",
    "BLOOD_REQUEST",
    "DONOR_SUPPORT",
    "PAYMENT",
    "TECHNICAL",
  ]),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(600, "Message must be at most 600 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactSubjects = [
  { value: "GENERAL", label: "General enquiry" },
  { value: "BLOOD_REQUEST", label: "Blood request help" },
  { value: "DONOR_SUPPORT", label: "Donor support" },
  { value: "PAYMENT", label: "Payment or bKash issue" },
  { value: "TECHNICAL", label: "Technical problem" },
] as const;