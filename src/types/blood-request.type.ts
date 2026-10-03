import type { BloodGroup, RequestStatus, UrgencyLevel } from "./enums.type";

export interface BloodRequestRequester {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bloodGroup: BloodGroup;
  district?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  patientAge: number;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  urgency: UrgencyLevel;
  status: RequestStatus;
  neededBy: string;
  isPremiumNotificationPaid: boolean;
  isLogisticsPaid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: BloodRequestRequester;
  assignments?: DonorAssignmentWithDonor[];
  _count?: { assignments?: number; payments?: number };
}

export interface DonorAssignmentWithDonor {
  id: string;
  requestId: string;
  donorId: string;
  status: import("./enums.type").AssignmentStatus;
  assignedAt: string;
  respondedAt: string | null;
  donor?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    bloodGroup: BloodGroup;
    district?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
    lastDonatedAt: string | null;
    isAvailable: boolean;
  };
}

export interface CreateBloodRequestPayload {
  patientName: string;
  patientAge: number;
  bloodGroup: BloodGroup;
  unitsRequired?: number;
  hospitalName: string;
  hospitalAddress: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  urgency?: UrgencyLevel;
  neededBy: string;
  notes?: string;
}

export type UpdateBloodRequestPayload = Partial<CreateBloodRequestPayload>;

export interface BloodRequestQueryParams {
  page?: number;
  limit?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "neededBy"
    | "patientName"
    | "bloodGroup"
    | "urgency";
  sortOrder?: "asc" | "desc";
  bloodGroup?: BloodGroup;
  district?: string;
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  searchTerm?: string;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
}
