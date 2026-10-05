"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks";
import { userApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import { setRoleCookie } from "@/lib/session-client";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, HeartPulse } from "lucide-react";

interface DemoAccount {
  label: string;
  role: "ADMIN" | "PATIENT" | "DONOR";
  email: string;
  password: string;
  icon: typeof ShieldCheck;
  variant: "default" | "outline" | "secondary";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Admin Demo",
    role: "ADMIN",
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "testeradmin@gmail.com",
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Tester@admin12345",
    icon: ShieldCheck,
    variant: "default",
  },
  {
    label: "Patient Demo",
    role: "PATIENT",
    email: process.env.NEXT_PUBLIC_DEMO_PATIENT_EMAIL || "patient-2@gmail.com",
    password: process.env.NEXT_PUBLIC_DEMO_PATIENT_PASSWORD || "Password123!",
    icon: User,
    variant: "secondary",
  },
  {
    label: "Donor Demo",
    role: "DONOR",
    email: process.env.NEXT_PUBLIC_DEMO_DONOR_EMAIL || "donor-2@gmail.com",
    password: process.env.NEXT_PUBLIC_DEMO_DONOR_PASSWORD || "Password123!",
    icon: HeartPulse,
    variant: "outline",
  },
];

export default function DemoLoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const queryClient = useQueryClient();
  const { mutate: login, isPending } = useLogin();

  const handleDemoLogin = (acc: DemoAccount) => {
    login(
      { email: acc.email, password: acc.password },
      {
        onSuccess: async () => {
          try {
            const meRes = await queryClient.fetchQuery({
              queryKey: queryKeys.users.me,
              queryFn: () => userApi.getMe(),
            });
            const role = meRes.data.role;
            setRoleCookie(role);
            toast.add({
              title: `${acc.label} Successful`,
              description: `Logged in as ${role}`,
              type: "success",
            });
            const target = nextParam || `/${role.toLowerCase()}`;
            router.push(target);
          } catch (err: unknown) {
            toast.add({
              title: "Profile Fetch Failed",
              description: "Could not retrieve user role",
              type: "error",
            });
          }
        },
        onError: (err) => {
          toast.add({
            title: "Demo Login Failed",
            description: err.message || "Invalid credentials",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="rounded-xl border border-dashed border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
      <div className="mb-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          ⚡ One-Click Demo Access
        </p>
        <p className="text-xs text-muted-foreground">
          Explore Hemacue instantly with pre-configured accounts
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          return (
            <Button
              key={acc.role}
              type="button"
              variant={acc.variant}
              size="sm"
              disabled={isPending}
              onClick={() => handleDemoLogin(acc)}
              className="w-full justify-center gap-1.5 text-xs font-medium"
            >
              <Icon className="size-3.5" />
              {acc.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
