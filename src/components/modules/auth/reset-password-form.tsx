"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, RefreshCw, KeyRound } from "lucide-react";
import { resetPasswordSchema } from "@/validation";
import { useResetPassword, useForgotPassword, useCountdown } from "@/hooks";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const { seconds, isLocked, start: startCooldown } = useCountdown(60);

  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();
  const { mutate: forgotPassword, isPending: isResending } =
    useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: emailParam,
      otp: "",
      newPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: ({ value }) => {
      resetPassword(value, {
        onSuccess: () => {
          toast.add({
            title: "Password Changed Successfully",
            description: "You can now log in with your new password.",
            type: "success",
          });
          router.push("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Reset Failed",
            description:
              err.message || "Invalid or expired OTP. Please try again.",
            type: "error",
          });
        },
      });
    },
  });

  const handleResendOtp = () => {
    if (!emailParam) {
      toast.add({
        title: "Email Required",
        description: "Please specify an email address.",
        type: "error",
      });
      return;
    }
    startCooldown();
    forgotPassword(
      { email: emailParam },
      {
        onSuccess: () => {
          toast.add({
            title: "Reset Code Sent",
            description: `A new reset OTP has been emailed to ${emailParam}`,
            type: "success",
          });
        },
        onError: (err) => {
          toast.add({
            title: "Resend Failed",
            description:
              err.message || "Failed to resend code. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-primary dark:bg-red-950/40">
          <KeyRound className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the OTP sent to{" "}
          <span className="font-medium text-foreground">
            {emailParam || "your email"}
          </span>{" "}
          and choose a new password
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* Email Address (Disabled/Read-only display if available) */}
          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Account Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    className="pl-9"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </Field>
            )}
          </form.Field>

          {/* OTP Code */}
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field
                  data-invalid={isInvalid}
                  className="flex flex-col items-center"
                >
                  <FieldLabel htmlFor={field.name} className="self-start">
                    6-Digit OTP Code
                  </FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* New Password */}
          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="≥6 chars (1 upper, 1 lower, 1 num, 1 special)"
                      className="pl-9 pr-9"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={isResetting} type="submit" className="w-full">
            {isResetting ? (
              <>
                <Spinner /> Resetting Password...
              </>
            ) : (
              "Reset Password & Sign In"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get the code?
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLocked || isResending}
          onClick={handleResendOtp}
          className="gap-1.5 text-xs"
        >
          {isResending ? (
            <>
              <Spinner /> Sending...
            </>
          ) : isLocked ? (
            `Resend OTP in ${seconds}s`
          ) : (
            <>
              <RefreshCw className="size-3.5" /> Resend Code
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Remember your password? Sign In
        </Link>
      </div>
    </div>
  );
}
