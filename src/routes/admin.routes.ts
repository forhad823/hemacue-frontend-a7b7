import {
  LayoutDashboard,
  Users,
  ScrollText,
  Droplets,
} from "lucide-react";
import type { SidebarGroup } from "@/types";

export const adminRoutes: SidebarGroup[] = [
  {
    title: "Management",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Users", url: "/admin/manage", icon: Users },
      { title: "Blood Requests", url: "/admin/blood-requests", icon: Droplets },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
    ],
  },
];
