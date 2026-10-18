import {
  BarChart3,
  CreditCard,
  Droplets,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import type { SidebarGroup } from "@/types";

export const adminRoutes: SidebarGroup[] = [
  {
    title: "Management",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Users", url: "/admin/manage", icon: Users },
      { title: "Blood Requests", url: "/admin/blood-requests", icon: Droplets },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];
