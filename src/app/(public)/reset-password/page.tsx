import type { Metadata } from "next";
import ResetPasswordForm from "@/components/modules/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Hemacue account password using your verification OTP.",
};

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
