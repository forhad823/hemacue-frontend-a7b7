import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string | number;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}
