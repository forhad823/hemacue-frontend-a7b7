/**
 * Builds a `SuggestionIndex` from whatever rows a table currently has on
 * screen. Static buckets (districts, blood groups) are merged in so every
 * call site gets them for free — no duplication at the call sites.
 */
import { BLOOD_GROUP_OPTIONS, DISTRICTS } from "@/lib/constants";
import type { SuggestionIndex } from "./suggestions";

/**
 * Structural row shapes — every list payload (AdminUser, AdminPayment,
 * PaymentWithRequest, BloodRequest, MyDonation) satisfies one of these
 * without the index layer depending on the full API types.
 */
export interface SuggestionIndexInput {
  /** User rows — names/emails join the person bucket, districts the district bucket. */
  users?: { name?: string; email?: string; district?: string | null }[];
  /** Payment rows — trx/payment IDs plus payer email and request summaries. */
  payments?: {
    paymentID?: string;
    trxID?: string | null;
    user?: { email?: string | null } | null;
    request?: { patientName?: string; hospitalName?: string } | null;
  }[];
  /** Blood-request rows. */
  requests?: { patientName?: string; hospitalName?: string }[];
  /** Donor assignment rows (MyDonation). */
  donations?: {
    request?: { patientName?: string; hospitalName?: string } | null;
  }[];
}

export function buildSuggestionIndex(
  input: SuggestionIndexInput = {},
): SuggestionIndex {
  const hospitals = new Set<string>();
  const districts = new Set<string>(DISTRICTS);
  const patients = new Set<string>();
  const trxIds = new Set<string>();

  const addPerson = (value?: string | null) => {
    if (value) patients.add(value);
  };
  const addHospital = (value?: string | null) => {
    if (value) hospitals.add(value);
  };

  for (const user of input.users ?? []) {
    addPerson(user.name);
    addPerson(user.email);
    if (user.district) districts.add(user.district);
  }

  for (const payment of input.payments ?? []) {
    if (payment.paymentID) trxIds.add(payment.paymentID);
    if (payment.trxID) trxIds.add(payment.trxID);
    addPerson(payment.user?.email);
    addPerson(payment.request?.patientName);
    addHospital(payment.request?.hospitalName);
  }

  for (const request of input.requests ?? []) {
    addPerson(request.patientName);
    addHospital(request.hospitalName);
  }

  for (const donation of input.donations ?? []) {
    addPerson(donation.request?.patientName);
    addHospital(donation.request?.hospitalName);
  }

  return {
    hospitals: [...hospitals],
    districts: [...districts],
    bloodGroups: BLOOD_GROUP_OPTIONS.map((option) => option.label),
    patients: [...patients],
    trxIds: [...trxIds],
  };
}
