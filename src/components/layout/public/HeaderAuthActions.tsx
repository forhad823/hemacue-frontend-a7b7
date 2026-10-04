"use client";

import Link from "next/link";
import { Heart, LayoutDashboard, LogIn } from "lucide-react";
import { useGetMe } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const user = data?.data;

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
      <Button
        size="sm"
        className={cn("gap-2", stacked && "w-full justify-center")}
        render={<Link href={`/${user.role.toLowerCase()}`} />}
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Button>
    );
  }

  return (
    <div className={cn(stacked ? "flex flex-col gap-2" : "flex items-center gap-2", className)}>
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