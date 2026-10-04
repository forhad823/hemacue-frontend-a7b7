import type { Metadata } from "next";
import RegisterForm from "@/components/modules/auth/register-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register Account",
  description:
    "Create a Hemacue account to donate blood or post emergency blood requests.",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
