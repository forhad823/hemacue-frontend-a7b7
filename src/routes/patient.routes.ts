import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CreditCard,
  User,
} from "lucide-react";
import type { SidebarGroup } from "@/types";

export const patientRoutes: SidebarGroup[] = [
  {
    title: "Patient Dashboard",
    items: [
      { title: "My Requests", url: "/patient", icon: LayoutDashboard },
      { title: "New Request", url: "/patient/new", icon: PlusCircle },
      { title: "Payments", url: "/patient/payments", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Profile", url: "/patient/profile", icon: User }],
  },
];
