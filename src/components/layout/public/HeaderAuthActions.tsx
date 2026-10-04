"use client";

import { Heart, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { humanizeToken } from "@/lib/format";
import { clearRoleCookie } from "@/lib/session-client";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

interface HeaderAuthActionsProps {
  stacked?: boolean;
  className?: string;
}

/**
 * Auth-aware part of the public header. It is isolated in its own client island
 * and renders a same-sized placeholder while the session query is in flight, so
 * the statically rendered header never shifts or blocks on the network.
 */
export default function HeaderAuthActions({
  stacked = false,
  className,
}: HeaderAuthActionsProps) {
  const { data, isPending } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();
  const user = data?.data;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        // The dashboard proxy and the client role guard both read this cookie.
        clearRoleCookie();
        toast.add({
          title: "Signed out",
          description: "You have been logged out of Hemacue.",
          type: "success",
        });
        router.replace("/login");
        router.refresh();
      },
      onError: () => {
        clearRoleCookie();
        router.replace("/login");
      },
    });
  };

  if (isPending) {
    return (
      <Skeleton
        aria-hidden
        className={cn("h-7 rounded-lg", stacked ? "w-full" : "w-32", className)}
      />
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 gap-2 px-1.5",
                stacked && "w-full justify-start",
                className,
              )}
            />
          }
        >
          <Avatar className="size-7 rounded-full border border-border">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">
            {user.name?.split(" ")[0]}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="truncate text-sm font-semibold leading-none">
                {user.name}
              </p>
              <p className="truncate text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <Badge
                variant="outline"
                className="mt-1 w-fit px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase"
              >
                {humanizeToken(user.role)}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <Link
                href={`/${user.role.toLowerCase()}`}
                className="cursor-pointer gap-2"
              />
            }
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </DropdownMenuItem>
          {user.role !== UserRole.ADMIN && (
            <DropdownMenuItem
              render={
                <Link
                  href={`/${user.role.toLowerCase()}/profile`}
                  className="cursor-pointer gap-2"
                />
              }
            >
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            className="cursor-pointer gap-2"
          >
            {isLoggingOut ? (
              <Spinner className="size-4" />
            ) : (
              <LogOut className="size-4" />
            )}
            {isLoggingOut ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div
      className={cn(
        stacked ? "flex flex-col gap-2" : "flex items-center gap-2",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn("gap-1.5", stacked && "w-full justify-center")}
        render={<Link href="/login" />}
      >
        <LogIn className="size-4" />
        Login
      </Button>
      <Button
        size="sm"
        className={cn("gap-1.5", stacked && "w-full justify-center")}
        render={<Link href="/register" />}
      >
        <Heart className="size-4 fill-current" />
        Register
      </Button>
    </div>
  );
}
