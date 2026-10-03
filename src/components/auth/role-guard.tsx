"use client";
import { useGetMe } from "@/hooks";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import AuthLoading from "./auth-loading";
import AccessDenied from "./access-denied";
import type { UserRole } from "@/types";

interface Props {
  children: ReactNode;
  roles: UserRole[];
}

export default function RoleGuard({ children, roles }: Props) {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending) return;
    if (isError || !user) router.replace("/login");
  }, [isPending, isError, user, router]);

  if (isPending) return <AuthLoading />;
  if (isError || !user) return <AuthLoading label="Redirecting..." />;
  if (roles.includes(user.role)) return <>{children}</>;
  return <AccessDenied />;
}
