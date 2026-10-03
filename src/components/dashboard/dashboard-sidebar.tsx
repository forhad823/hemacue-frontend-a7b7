"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, LogOut, HeartPulse} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@/hooks";
import { routesByRole } from "@/routes";
import { clearRoleCookie } from "@/lib/session-client";

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useGetMe();
  const logoutMutation = useLogout();
  const user = data?.data;

  const roleRoutes = user?.role ? routesByRole[user.role] || [] : [];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearRoleCookie();
        window.location.href = "/login";
      },
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-border/50 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Droplet className="size-5 fill-current" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-base tracking-tight text-primary">
                  Hemacue
                </span>
                <span className="text-xs text-muted-foreground">
                  Emergency Blood Service
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {roleRoutes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon || HeartPulse;
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.url} />}
                      >
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 pt-3">
        {user && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 border border-border">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-semibold truncate text-foreground">
                  {user.name}
                </span>
                <Badge
                  variant="outline"
                  className="w-fit px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider"
                >
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground cursor-pointer shrink-0"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
