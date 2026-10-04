import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailForm from "@/components/modules/auth/verify-email-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Verify your email address with the 6-digit OTP code sent to your inbox.",
};

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
