import type { BloodGroup } from "@/types";

/** Converts a backend blood-group enum value into its short clinical label (A_POSITIVE -> A+). */
export function formatBloodGroup(group: BloodGroup): string {
  return group
    .replace("_POSITIVE", "+")
    .replace("_NEGATIVE", "−")
    .replace("_", "");
}