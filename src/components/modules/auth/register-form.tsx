"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  MapPin,
  Building,
  Home,
  Droplet,
} from "lucide-react";
import { registerSchema } from "@/validation";
import { useRegistration } from "@/hooks";
import { BloodGroup } from "@/types";
import { formatBloodGroup } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import GoogleLoginComponent from "../google-login/GoogleLogin";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "PATIENT" ? "PATIENT" : "DONOR";

  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending: registerPending } = useRegistration();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: defaultRole as "DONOR" | "PATIENT",
      bloodGroup: BloodGroup.O_POSITIVE as BloodGroup,
      phone: "",
      district: "",
      city: "",
      address: "",
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: ({ value }) => {
      register(value, {
        onSuccess: () => {
          toast.add({
            title: "Verification OTP Sent",
            description: `Check your inbox at ${value.email}`,
            type: "success",
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/verify-email?${params.toString()}`);
        },
        onError: (err) => {
          toast.add({
            title: "Registration Failed",
            description:
              err.message || "Could not register account. Please try again.",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your Hemacue account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join our network to donate blood or request emergency blood assistance
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
          {/* Role selector */}
          <form.Field name="role">
            {(field) => (
              <Field>
                <FieldLabel>Registering as</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.handleChange("DONOR")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                      field.state.value === "DONOR"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Droplet className="size-4 text-red-600" /> Blood Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => field.handleChange("PATIENT")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                      field.state.value === "PATIENT"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <UserIcon className="size-4 text-blue-600" /> Patient /
                    Requester
                  </button>
                </div>
              </Field>
            )}
          </form.Field>

          {/* Full Name */}
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Rahim Uddin"
                      className="pl-9"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="rahim@gmail.com"
                      className="pl-9"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Password */}
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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

          {/* Blood Group & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="bloodGroup">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Blood Group</FieldLabel>
                  <select
                    id={field.name}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as BloodGroup)
                    }
                  >
                    {Object.values(BloodGroup).map((bg) => (
                      <option
                        key={bg}
                        value={bg}
                        className="bg-popover text-popover-foreground"
                      >
                        {formatBloodGroup(bg)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="01700000000"
                        className="pl-9"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          {/* District & City */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="district">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>District</FieldLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. Dhaka"
                        className="pl-9"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="city">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      City / Sub-district
                    </FieldLabel>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. Mirpur"
                        className="pl-9"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          {/* Address */}
          <form.Field name="address">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Detailed Address (Optional)
                </FieldLabel>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="House, Road, Block..."
                    className="pl-9"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                  />
                </div>
              </Field>
            )}
          </form.Field>

          <Button disabled={registerPending} type="submit" className="w-full">
            {registerPending ? (
              <>
                <Spinner /> Creating Account...
              </>
            ) : (
              "Create Account & Send OTP"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
