"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { useGetMe, useLogout } from "@/hooks";
import { clearRoleCookie } from "@/lib/session-client";
import { LogOut, User, Home } from "lucide-react";

export function DashboardHeader() {
  const { data } = useGetMe();
  const logoutMutation = useLogout();
  const user = data?.data;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearRoleCookie();
        window.location.href = "/login";
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="cursor-pointer" />
        <Separator orientation="vertical" className="h-4" />
        <Button variant="ghost" size="sm" render={<Link href="/" />} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Home className="size-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="relative size-8 rounded-full cursor-pointer p-0">
                <Avatar className="size-8 border border-border">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={
                  <Link
                    href={`/${user.role.toLowerCase()}/profile`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="size-4" />
                    <span>Profile & Settings</span>
                  </Link>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
