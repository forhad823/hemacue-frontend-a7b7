import type {
  AuthProvider,
  BloodGroup,
  UserRole,
  UserStatus,
} from "./enums.type";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  phone: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;
  status: UserStatus;
  lastDonatedAt: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  totalBloodRequests?: number;
  totalCompletedDonations?: number;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  district?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  lastDonatedAt?: string;
  bloodGroup?: BloodGroup;
}
