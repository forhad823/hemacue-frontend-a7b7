import type { AssignmentStatus, BloodGroup, RequestStatus } from "./enums.type";
import type { BloodRequest } from "./blood-request.type";

export interface CompatibleDonor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bloodGroup: BloodGroup;
  district: string | null;
  city: string | null;
  address: string | null;
  isAvailable: boolean;
  lastDonatedAt: string | null;
  avatarUrl: string | null;
}

export interface CompatibleDonorQueryParams {
  bloodGroup: BloodGroup;
  district?: string;
  requestId?: string;
}

export interface AssignDonorPayload {
  donorId: string;
  requestId: string;
}

export interface DonorAssignment {
  id: string;
  requestId: string;
  donorId: string;
  status: AssignmentStatus;
  assignedAt: string;
  respondedAt: string | null;
}

export interface RespondToRequestPayload {
  response: AssignmentStatus;
}

export interface MyDonation {
  id: string;
  requestId: string;
  donorId: string;
  status: AssignmentStatus;
  assignedAt: string;
  respondedAt: string | null;
  request: Pick<
    BloodRequest,
    | "id"
    | "patientName"
    | "patientAge"
    | "bloodGroup"
    | "unitsRequired"
    | "hospitalName"
    | "hospitalAddress"
    | "district"
    | "city"
    | "urgency"
    | "status"
    | "neededBy"
    | "isLogisticsPaid"
    | "notes"
    | "createdAt"
  >;
}
