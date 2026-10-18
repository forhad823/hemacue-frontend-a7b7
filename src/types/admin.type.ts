import type {
  BloodGroup,
  PaymentStatus,
  PaymentType,
  RequestStatus,
  UserRole,
  UserStatus,
} from "./enums.type";
import type { Payment } from "./payment.type";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  bloodGroup: BloodGroup;
  district: string | null;
  city: string | null;
  address: string | null;
  isAvailable: boolean;
  status: UserStatus;
  lastDonatedAt: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { bloodRequests: number; donorAssignments: number; payments: number };
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "role" | "createdAt";
  sortOrder?: "asc" | "desc";
  role?: UserRole;
  bloodGroup?: BloodGroup;
  district?: string;
  searchTerm?: string;
}

export interface AdminPaymentsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
  status?: PaymentStatus;
  paymentType?: PaymentType;
  /** Matches paymentID, trxID, or the payer's email. */
  searchTerm?: string;
}

/** Payer summary embedded in `GET /admin/payments` rows. */
export interface AdminPaymentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/** Blood-request summary embedded in `GET /admin/payments` rows. */
export interface AdminPaymentRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  status: RequestStatus;
}

export type AdminPayment = Payment & {
  user: AdminPaymentUser;
  request: AdminPaymentRequest;
};

export interface UpdateUserRolePayload {
  role?: UserRole;
  status?: UserStatus;
  isDeleted?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  totalBloodRequests: number;
  bloodRequestsByStatus: Record<RequestStatus, number>;
  totalCompletedDonations: number;
  payments: {
    totalCompletedPayments: number;
    totalRevenue: number;
    currency: string;
  };
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: UserRole } | null;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
  action?: string;
  entity?: string;
  actorEmail?: string;
}
