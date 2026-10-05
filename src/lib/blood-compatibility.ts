import type { BloodGroup } from "@/types";

/**
 * Patient group -> the donor groups that may give to that patient.
 *
 * Copy of `BLOOD_COMPATIBILITY_MAP` in
 * `hemacue-backend/src/app/modules/donorMatch/donorMatch.service.ts`, which is
 * keyed by the *patient's* group. Keep the two in sync: the backend is the
 * authority and re-validates compatibility on assign and on accept.
 */
const DONORS_FOR_PATIENT: Record<BloodGroup, BloodGroup[]> = {
  A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
  B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
  AB_POSITIVE: [
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
  ],
  AB_NEGATIVE: ["AB_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "O_NEGATIVE"],
  O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],
  O_NEGATIVE: ["O_NEGATIVE"],
};

const ALL_GROUPS = Object.keys(DONORS_FOR_PATIENT) as BloodGroup[];

/**
 * Donor group -> the patient groups that donor can serve.
 *
 * Derived by actually inverting the map above (a patient is served by a donor
 * exactly when the donor appears in that patient's list), so the two can never
 * drift apart. For example O- serves every group, while AB+ serves only AB+.
 */
const PATIENTS_FOR_DONOR = Object.fromEntries(
  ALL_GROUPS.map((donor) => [
    donor,
    ALL_GROUPS.filter((patient) => DONORS_FOR_PATIENT[patient].includes(donor)),
  ]),
) as Record<BloodGroup, BloodGroup[]>;

/** Patient blood groups a donor with this group can donate to. */
export function compatiblePatientGroups(donorGroup: BloodGroup): BloodGroup[] {
  return PATIENTS_FOR_DONOR[donorGroup];
}

/** True when a donor of `donorGroup` can donate to a patient of `patientGroup`. */
export function canDonorServePatient(
  donorGroup: BloodGroup,
  patientGroup: BloodGroup,
): boolean {
  return PATIENTS_FOR_DONOR[donorGroup].includes(patientGroup);
}
