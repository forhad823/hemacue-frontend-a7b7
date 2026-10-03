import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import { UserRole } from "@/types";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={[UserRole.ADMIN]}>{children}</RoleGuard>;
}
