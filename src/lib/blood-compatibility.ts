import type { BloodGroup } from "@/types";

/**
 * Donor group -> the patient groups that donor can serve.
 *
 * This is the exact inverse of `BLOOD_COMPATIBILITY_MAP` in
 * `hemacue-backend/src/app/modules/donorMatch/donorMatch.service.ts`, so the
 * donor dashboard can filter the public request feed without a second endpoint.
 * The backend still re-validates compatibility on assign and on accept.
 */
const DONOR_TO_PATIENT_GROUPS: Record<BloodGroup, BloodGroup[]> = {
  O_NEGATIVE: ["O_NEGATIVE"],
  O_POSITIVE: ["O_NEGATIVE", "O_POSITIVE"],
  A_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE"],
  A_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "A_NEGATIVE", "A_POSITIVE"],
  B_NEGATIVE: ["O_NEGATIVE", "B_NEGATIVE"],
  B_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "B_NEGATIVE", "B_POSITIVE"],
  AB_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "AB_NEGATIVE"],
  AB_POSITIVE: [
    "O_NEGATIVE",
    "O_POSITIVE",
    "A_NEGATIVE",
    "A_POSITIVE",
    "B_NEGATIVE",
    "B_POSITIVE",
    "AB_NEGATIVE",
    "AB_POSITIVE",
  ],
};

/** Patient blood groups a donor with this group can donate to. */
export function compatiblePatientGroups(donorGroup: BloodGroup): BloodGroup[] {
  return DONOR_TO_PATIENT_GROUPS[donorGroup];
}

/** True when a donor of `donorGroup` can donate to a patient of `patientGroup`. */
export function canDonorServePatient(
  donorGroup: BloodGroup,
  patientGroup: BloodGroup,
): boolean {
  return DONOR_TO_PATIENT_GROUPS[donorGroup].includes(patientGroup);
}
