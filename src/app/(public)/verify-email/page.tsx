import type { Metadata } from "next";
import VerifyEmailForm from "@/components/modules/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address with the 6-digit OTP code sent to your inbox.",
};

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <VerifyEmailForm />
      </div>
    </div>
  );
}
