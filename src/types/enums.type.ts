export const UserRole = {
  DONOR: "DONOR",
  PATIENT: "PATIENT",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const BloodGroup = {
  A_POSITIVE: "A_POSITIVE",
  A_NEGATIVE: "A_NEGATIVE",
  B_POSITIVE: "B_POSITIVE",
  B_NEGATIVE: "B_NEGATIVE",
  AB_POSITIVE: "AB_POSITIVE",
  AB_NEGATIVE: "AB_NEGATIVE",
  O_POSITIVE: "O_POSITIVE",
  O_NEGATIVE: "O_NEGATIVE",
} as const;
export type BloodGroup = (typeof BloodGroup)[keyof typeof BloodGroup];

export const UrgencyLevel = {
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  EMERGENCY: "EMERGENCY",
} as const;
export type UrgencyLevel = (typeof UrgencyLevel)[keyof typeof UrgencyLevel];

export const RequestStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  DONOR_ASSIGNED: "DONOR_ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const AssignmentStatus = {
  NOTIFIED: "NOTIFIED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type AssignmentStatus =
  (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

export const PaymentStatus = {
  INITIALIZED: "INITIALIZED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentType = {
  PREMIUM_NOTIFICATION: "PREMIUM_NOTIFICATION",
  EMERGENCY_LOGISTICS: "EMERGENCY_LOGISTICS",
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIAL: "CREDENTIAL",
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
