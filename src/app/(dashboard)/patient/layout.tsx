import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import { UserRole } from "@/types";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={[UserRole.PATIENT, UserRole.ADMIN]}>{children}</RoleGuard>;
}
