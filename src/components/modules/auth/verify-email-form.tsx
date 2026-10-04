"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useVerifyAccount, useResendRegisterOtp, useCountdown } from "@/hooks";
import { verifyEmailSchema } from "@/validation";
import { userApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import { setRoleCookie } from "@/lib/session-client";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Mail, RefreshCw } from "lucide-react";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const queryClient = useQueryClient();

  const { seconds, isLocked, start: startCooldown } = useCountdown(60);
  const { mutate: verifyAccount, isPending: isVerifying } = useVerifyAccount();
  const { mutate: resendOtp, isPending: isResending } = useResendRegisterOtp();

  const form = useForm({
    defaultValues: {
      email: emailParam,
      otp: "",
    },
    validators: {
      onSubmit: verifyEmailSchema,
    },
    onSubmit: ({ value }) => {
      verifyAccount(value, {
        onSuccess: async (res) => {
          try {
            const meRes = await queryClient.fetchQuery({
              queryKey: queryKeys.users.me,
              queryFn: () => userApi.getMe(),
            });
            const role = meRes.data.role;
            setRoleCookie(role);
            toast.add({
              title: "Email Verified!",
              description: `Welcome to Hemacue, ${meRes.data.name}`,
              type: "success",
            });
            router.push(`/${role.toLowerCase()}`);
          } catch {
            const fallbackRole = res.data.user?.role || "DONOR";
            setRoleCookie(fallbackRole);
            router.push(`/${fallbackRole.toLowerCase()}`);
          }
        },
        onError: (err) => {
          toast.add({
            title: "Verification Failed",
            description: err.message || "Invalid or expired OTP. Please try again.",
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
        description: "Please register first or check the email parameter.",
        type: "error",
      });
      return;
    }
    startCooldown();
    resendOtp(
      { email: emailParam },
      {
        onSuccess: () => {
          toast.add({
            title: "New OTP Sent",
            description: `Verification code emailed to ${emailParam}`,
            type: "success",
          });
        },
        onError: (err) => {
          toast.add({
            title: "Resend Failed",
            description: err.message || "Failed to resend OTP. Please wait before retrying.",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-primary dark:bg-red-950/40">
          <Mail className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-foreground">{emailParam || "your email"}</span>
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
          <form.Field name="otp">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="flex flex-col items-center">
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Verification Code
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

          <Button disabled={isVerifying} type="submit" className="w-full">
            {isVerifying ? (
              <>
                <Spinner /> Verifying...
              </>
            ) : (
              "Verify Email & Proceed"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-muted-foreground">Didn&apos;t receive the code?</p>
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
              <RefreshCw className="size-3.5" /> Resend Verification Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 
