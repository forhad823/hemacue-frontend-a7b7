import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/modules/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to your Hemacue account to manage blood requests or donation availability.",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
