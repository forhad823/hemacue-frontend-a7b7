import { HeartPulse, Droplets, BarChart3, User } from "lucide-react";
import type { SidebarGroup } from "@/types";

export const donorRoutes: SidebarGroup[] = [
  {
    title: "Donor Dashboard",
    items: [
      { title: "My Donations", url: "/donor", icon: HeartPulse },
      { title: "Open Requests", url: "/donor/requests", icon: Droplets },
      { title: "Analytics", url: "/donor/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Profile & Cooldown", url: "/donor/profile", icon: User }],
  },
];
