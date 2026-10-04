import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import { UserRole } from "@/types";

export default function DonorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={[UserRole.DONOR, UserRole.ADMIN]}>{children}</RoleGuard>
  );
}
