"use client";

import { useForm } from "@tanstack/react-form";
import {
  CalendarClock,
  HeartHandshake,
  MapPin,
  Save,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateProfile } from "@/hooks";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  DONATION_COOLDOWN_DAYS,
} from "@/lib/constants";
import { getCooldownState } from "@/lib/format";
import { UserRole } from "@/types";
import { profileFormSchema } from "@/validation";
import { AvatarDropzone } from "./avatar-dropzone";

/**
 * Shared by the patient and donor profile pages — the role only changes which
 * fields are emphasized, never the shape of the form (DRY).
 */
export default function ProfileForm() {
  const { data, isPending } = useGetMe();
  const updateProfile = useUpdateProfile();
  const user = data?.data;
  const isDonor = user?.role === UserRole.DONOR;
  const cooldown = getCooldownState(
    user?.lastDonatedAt ?? null,
    user?.isAvailable,
  );

  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      district: user?.district ?? "",
      city: user?.city ?? "",
      address: user?.address ?? "",
      bloodGroup: user?.bloodGroup ?? "O_POSITIVE",
      isAvailable: user?.isAvailable ?? false,
      lastDonatedAt: user?.lastDonatedAt ? user.lastDonatedAt.slice(0, 10) : "",
    },
    validators: {
      onChange: profileFormSchema,
    },
    onSubmit: ({ value }) => {
      updateProfile.mutate(
        {
          name: value.name.trim(),
          phone: value.phone.trim() || undefined,
          district: value.district.trim() || undefined,
          city: value.city.trim() || undefined,
          address: value.address.trim() || undefined,
          bloodGroup: value.bloodGroup,
          isAvailable: value.isAvailable,
          ...(value.lastDonatedAt
            ? { lastDonatedAt: new Date(value.lastDonatedAt).toISOString() }
            : {}),
        },
        {
          onSuccess: () =>
            toast.add({
              title: "Profile updated",
              description: "Your details are saved.",
              type: "success",
            }),
          onError: (error) =>
            toast.add({
              title: "Could not save your profile",
              description: error.message ?? "Please check the form and retry.",
              type: "error",
            }),
        },
      );
    },
  });

  if (isPending || !user) {
    return null;
  }

  const fieldErrors = form.state.fieldMeta;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Donors see your city and district only when they are matched with a
            request you can fulfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <AvatarDropzone avatarUrl={user.avatarUrl} name={user.name} />

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="name">
                  {(field) => (
                    <Field data-invalid={!!fieldErrors.name?.errors?.length}>
                      <FieldLabel htmlFor="name">Full name</FieldLabel>
                      <Input
                        id="name"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={fieldErrors.name?.errors} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="phone">
                  {(field) => (
                    <Field data-invalid={!!fieldErrors.phone?.errors?.length}>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        id="phone"
                        name={field.name}
                        type="tel"
                        placeholder="01712345678"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={fieldErrors.phone?.errors} />
                    </Field>
                  )}
                </form.Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <form.Field name="district">
                  {(field) => (
                    <Field
                      data-invalid={!!fieldErrors.district?.errors?.length}
                    >
                      <FieldLabel htmlFor="district">District</FieldLabel>
                      <Input
                        id="district"
                        name={field.name}
                        list="profile-districts"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <datalist id="profile-districts">
                        {DISTRICTS.map((district) => (
                          <option key={district} value={district} />
                        ))}
                      </datalist>
                      <FieldError errors={fieldErrors.district?.errors} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="city">
                  {(field) => (
                    <Field data-invalid={!!fieldErrors.city?.errors?.length}>
                      <FieldLabel htmlFor="city">City / area</FieldLabel>
                      <Input
                        id="city"
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={fieldErrors.city?.errors} />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="bloodGroup">
                  {(field) => (
                    <Field
                      data-invalid={!!fieldErrors.bloodGroup?.errors?.length}
                    >
                      <FieldLabel>Blood group</FieldLabel>
                      <div className="grid grid-cols-4 gap-1.5">
                        {BLOOD_GROUP_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.handleChange(option.value)}
                            aria-pressed={field.state.value === option.value}
                            className={
                              field.state.value === option.value
                                ? "cursor-pointer rounded-md border border-primary bg-primary px-1 py-1.5 text-xs font-bold text-primary-foreground"
                                : "cursor-pointer rounded-md border border-border px-1 py-1.5 text-xs font-semibold hover:bg-muted"
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <FieldError errors={fieldErrors.bloodGroup?.errors} />
                    </Field>
                  )}
                </form.Field>
              </div>

              <form.Field name="address">
                {(field) => (
                  <Field data-invalid={!!fieldErrors.address?.errors?.length}>
                    <FieldLabel htmlFor="address">Address</FieldLabel>
                    <Input
                      id="address"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="House 25, Road 2, Green Road"
                    />
                    <FieldError errors={fieldErrors.address?.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="isAvailable">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="isAvailable"
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                      onBlur={field.handleBlur}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="isAvailable">
                        I am available to donate right now
                      </FieldLabel>
                      <FieldDescription>
                        Compatible patients in your district are notified as
                        soon as this is on. Donors also need a rest period of{" "}
                        {DONATION_COOLDOWN_DAYS} days between donations.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              </form.Field>

              <form.Field name="lastDonatedAt">
                {(field) => (
                  <Field
                    data-invalid={!!fieldErrors.lastDonatedAt?.errors?.length}
                  >
                    <FieldLabel htmlFor="lastDonatedAt">
                      Last donation date
                    </FieldLabel>
                    <Input
                      id="lastDonatedAt"
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription>
                      We hold donors for {DONATION_COOLDOWN_DAYS} days between
                      donations. A completed request updates this automatically.
                    </FieldDescription>
                    <FieldError errors={fieldErrors.lastDonatedAt?.errors} />
                  </Field>
                )}
              </form.Field>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  {updateProfile.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {updateProfile.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{user.role}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Blood group</span>
              <BloodGroupBadge group={user.bloodGroup} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Email verified</span>
              <span className="font-medium">
                {user.isEmailVerified ? "Yes" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Location</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <MapPin className="size-3.5" />
                {[user.city, user.district].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {isDonor ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartHandshake className="size-4" />
                Donation status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">{cooldown.label}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {user.lastDonatedAt
                  ? `Last donated ${new Date(user.lastDonatedAt).toLocaleDateString("en-GB")}`
                  : "No donation recorded yet"}
              </p>
              {!cooldown.isEligible && (
                <Alert>
                  <AlertTitle>Cooldown active</AlertTitle>
                  <AlertDescription>
                    You will be removed from matching until{" "}
                    {cooldown.daysRemaining} day
                    {cooldown.daysRemaining === 1 ? "" : "s"} from now.
                  </AlertDescription>
                </Alert>
              )}
              {cooldown.isEligible && !user.isAvailable && (
                <Alert>
                  <ShieldAlert className="size-4" />
                  <AlertTitle>You are hidden from matching</AlertTitle>
                  <AlertDescription>
                    Tick the availability box above to start receiving requests.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need blood?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Post a request and verified donors in your area are notified
                automatically.
              </p>
              <Button size="sm" render={<Link href="/patient/new" />}>
                Create a blood request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
