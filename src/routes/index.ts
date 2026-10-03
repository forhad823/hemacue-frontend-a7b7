import type { SidebarGroup, UserRole } from "@/types";
import { adminRoutes } from "./admin.routes";
import { patientRoutes } from "./patient.routes";
import { donorRoutes } from "./donor.routes";

export * from "./admin.routes";
export * from "./patient.routes";
export * from "./donor.routes";

export const routesByRole: Record<UserRole, SidebarGroup[]> = {
  ADMIN: adminRoutes,
  PATIENT: patientRoutes,
  DONOR: donorRoutes,
};
