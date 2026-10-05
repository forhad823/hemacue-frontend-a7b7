"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Send,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateBloodRequest, useGetMe } from "@/hooks";
import {
  BLOOD_GROUP_OPTIONS,
  DISTRICTS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import { formatBloodGroup, humanizeToken } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodGroup, CreateBloodRequestPayload } from "@/types";
import { UrgencyLevel } from "@/types";
import {
  REQUEST_WIZARD_STEP_ORDER,
  type RequestWizardStep,
  validateRequestWizardStep,
} from "@/validation";

interface WizardValues {
  patientName: string;
  patientAge: string;
  bloodGroup: (typeof BLOOD_GROUP_OPTIONS)[number]["value"];
  hospitalName: string;
  hospitalAddress: string;
  district: string;
  city: string;
  urgency: (typeof URGENCY_OPTIONS)[number]["value"];
  neededBy: string;
  unitsRequired: string;
  notes: string;
}

const STEP_META: {
  key: RequestWizardStep;
  title: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    key: "patient",
    title: "Patient",
    description: "Who needs the blood, and which group?",
    icon: UserRound,
  },
  {
    key: "hospital",
    title: "Hospital",
    description: "Where should the donor go?",
    icon: Building2,
  },
  {
    key: "urgency",
    title: "Urgency",
    description: "How fast is the blood needed?",
    icon: Send,
  },
  {
    key: "review",
    title: "Review",
    description: "Check everything, then post the request.",
    icon: ClipboardCheck,
  },
];

export default function CreateRequestWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const createRequest = useCreateBloodRequest();
  const { data: me } = useGetMe();

  const stepKey = REQUEST_WIZARD_STEP_ORDER[stepIndex];

  // Annotated (not `satisfies`) so literal option values widen to their unions.
  const defaultValues: WizardValues = {
    patientName: "",
    patientAge: "",
    bloodGroup: me?.data.bloodGroup ?? "O_POSITIVE",
    hospitalName: "",
    hospitalAddress: "",
    district: me?.data.district ?? "",
    city: me?.data.city ?? "",
    urgency: UrgencyLevel.NORMAL,
    neededBy: "",
    unitsRequired: "1",
    notes: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      // Re-binding on every step change is what makes `canSubmit` mean
      // "this step is complete" instead of "the whole wizard is complete".
      onChange: ({ value }) => validateRequestWizardStep(stepKey, value),
      onSubmit: ({ value }) => validateRequestWizardStep(stepKey, value),
    },
    onSubmit: ({ value }) => {
      const payload: CreateBloodRequestPayload = {
        patientName: value.patientName.trim(),
        patientAge: Number(value.patientAge),
        bloodGroup: value.bloodGroup,
        unitsRequired: Number(value.unitsRequired),
        hospitalName: value.hospitalName.trim(),
        hospitalAddress: value.hospitalAddress.trim(),
        district: value.district,
        city: value.city.trim(),
        urgency: value.urgency,
        neededBy: new Date(`${value.neededBy}T23:59:59`).toISOString(),
        notes: value.notes.trim() || undefined,
      };

      createRequest.mutate(payload, {
        onSuccess: (response) => {
          toast.add({
            title: "Request posted",
            description:
              "An admin will verify it, then compatible donors will be notified.",
            type: "success",
          });
          router.push(`/patient/requests/${response.data.id}`);
        },
        onError: (error) =>
          toast.add({
            title: "Could not post the request",
            description:
              error.message ?? "Please check the form and try again.",
            type: "error",
          }),
      });
    },
  });

  const isLastStep = stepIndex === STEP_META.length - 1;

  const goNext = async () => {
    const fieldsForStep: (keyof WizardValues)[] =
      stepKey === "patient"
        ? ["patientName", "patientAge", "bloodGroup"]
        : stepKey === "hospital"
          ? ["hospitalName", "hospitalAddress", "district", "city"]
          : stepKey === "urgency"
            ? ["urgency", "neededBy", "unitsRequired", "notes"]
            : [];

    await Promise.all(
      fieldsForStep.map((field) => form.validateField(field, "change")),
    );

    if (form.state.canSubmit) {
      setStepIndex((index) => Math.min(index + 1, STEP_META.length - 1));
    }
  };

  const fieldError = (name: keyof WizardValues) => {
    const errors = form.state.fieldMeta[name]?.errors;
    return errors && errors.length > 0 ? errors : undefined;
  };

  const values = form.state.values;
  const urgencyOption = URGENCY_OPTIONS.find((o) => o.value === values.urgency);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>
            Step {stepIndex + 1} of {STEP_META.length}:{" "}
            {STEP_META[stepIndex].title}
          </CardTitle>
          <CardDescription>{STEP_META[stepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (isLastStep) {
                form.handleSubmit();
              } else {
                void goNext();
              }
            }}
          >
            <FieldGroup>
              {stepKey === "patient" && (
                <>
                  <form.Field name="patientName">
                    {(field) => (
                      <Field
                        data-invalid={
                          field.state.meta.isTouched &&
                          !!fieldError("patientName")
                        }
                      >
                        <FieldLabel htmlFor="patientName">
                          Patient name
                        </FieldLabel>
                        <Input
                          id="patientName"
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="e.g. Rahima Khatun"
                          autoComplete="off"
                        />
                        <FieldError errors={fieldError("patientName")} />
                      </Field>
                    )}
                  </form.Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <form.Field name="patientAge">
                      {(field) => (
                        <Field data-invalid={!!fieldError("patientAge")}>
                          <FieldLabel htmlFor="patientAge">Age</FieldLabel>
                          <Input
                            id="patientAge"
                            name={field.name}
                            type="number"
                            min={1}
                            max={120}
                            inputMode="numeric"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="45"
                          />
                          <FieldError errors={fieldError("patientAge")} />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="bloodGroup">
                      {(field) => (
                        <Field data-invalid={!!fieldError("bloodGroup")}>
                          <FieldLabel>Blood group</FieldLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {BLOOD_GROUP_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.handleChange(option.value)}
                                onBlur={field.handleBlur}
                                aria-pressed={
                                  field.state.value === option.value
                                }
                                className={cn(
                                  "cursor-pointer rounded-lg border px-2 py-2 text-sm font-semibold transition-colors",
                                  field.state.value === option.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background hover:bg-muted",
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          <FieldError errors={fieldError("bloodGroup")} />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                </>
              )}

              {stepKey === "hospital" && (
                <>
                  <form.Field name="hospitalName">
                    {(field) => (
                      <Field data-invalid={!!fieldError("hospitalName")}>
                        <FieldLabel htmlFor="hospitalName">
                          Hospital name
                        </FieldLabel>
                        <Input
                          id="hospitalName"
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="e.g. Dhaka Medical College Hospital"
                        />
                        <FieldError errors={fieldError("hospitalName")} />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="hospitalAddress">
                    {(field) => (
                      <Field data-invalid={!!fieldError("hospitalAddress")}>
                        <FieldLabel htmlFor="hospitalAddress">
                          Hospital address
                        </FieldLabel>
                        <Textarea
                          id="hospitalAddress"
                          name={field.name}
                          rows={2}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="House 25, Road 2, Green Road"
                        />
                        <FieldError errors={fieldError("hospitalAddress")} />
                      </Field>
                    )}
                  </form.Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <form.Field name="district">
                      {(field) => (
                        <Field data-invalid={!!fieldError("district")}>
                          <FieldLabel htmlFor="district">District</FieldLabel>
                          <Input
                            id="district"
                            name={field.name}
                            list="wizard-districts"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Dhaka"
                          />
                          <datalist id="wizard-districts">
                            {DISTRICTS.map((district) => (
                              <option key={district} value={district} />
                            ))}
                          </datalist>
                          <FieldError errors={fieldError("district")} />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="city">
                      {(field) => (
                        <Field data-invalid={!!fieldError("city")}>
                          <FieldLabel htmlFor="city">City / area</FieldLabel>
                          <Input
                            id="city"
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Dhaka"
                          />
                          <FieldError errors={fieldError("city")} />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                </>
              )}

              {stepKey === "urgency" && (
                <>
                  <form.Field name="urgency">
                    {(field) => (
                      <Field data-invalid={!!fieldError("urgency")}>
                        <FieldLabel>Urgency level</FieldLabel>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {URGENCY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.handleChange(option.value)}
                              onBlur={field.handleBlur}
                              aria-pressed={field.state.value === option.value}
                              className={cn(
                                "cursor-pointer rounded-lg border p-3 text-left transition-colors",
                                field.state.value === option.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted",
                              )}
                            >
                              <span className="block text-sm font-semibold">
                                {option.label}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </button>
                          ))}
                        </div>
                        <FieldError errors={fieldError("urgency")} />
                      </Field>
                    )}
                  </form.Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <form.Field name="neededBy">
                      {(field) => (
                        <Field data-invalid={!!fieldError("neededBy")}>
                          <FieldLabel htmlFor="neededBy">Needed by</FieldLabel>
                          <Input
                            id="neededBy"
                            name={field.name}
                            type="date"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          <FieldError errors={fieldError("neededBy")} />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="unitsRequired">
                      {(field) => (
                        <Field data-invalid={!!fieldError("unitsRequired")}>
                          <FieldLabel htmlFor="unitsRequired">
                            Units required
                          </FieldLabel>
                          <Input
                            id="unitsRequired"
                            name={field.name}
                            type="number"
                            min={1}
                            max={20}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          <FieldError errors={fieldError("unitsRequired")} />
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <form.Field name="notes">
                    {(field) => (
                      <Field data-invalid={!!fieldError("notes")}>
                        <FieldLabel htmlFor="notes">
                          Notes for the donor (optional)
                        </FieldLabel>
                        <Textarea
                          id="notes"
                          name={field.name}
                          rows={3}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Surgery scheduled at 8am, donor must report to the blood bank counter."
                        />
                        <FieldDescription>
                          Share anything a donor should know before travelling.
                        </FieldDescription>
                        <FieldError errors={fieldError("notes")} />
                      </Field>
                    )}
                  </form.Field>
                </>
              )}

              {stepKey === "review" && (
                <ReviewSummary values={values} onEdit={setStepIndex} />
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-1.5"
                  disabled={stepIndex === 0 || createRequest.isPending}
                  onClick={() =>
                    setStepIndex((index) => Math.max(index - 1, 0))
                  }
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>

                {isLastStep ? (
                  <Button
                    type="submit"
                    disabled={createRequest.isPending}
                    className="gap-1.5"
                  >
                    {createRequest.isPending ? (
                      <Spinner className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {createRequest.isPending ? "Posting..." : "Post request"}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!form.state.canSubmit}
                    className="gap-1.5"
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        {stepKey !== "review" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="size-4" />
                Review
              </CardTitle>
              <CardDescription>
                Live summary of what you have entered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <ReviewRow label="Patient">
                  {values.patientName || "—"}
                </ReviewRow>
                <ReviewRow label="Age">
                  {values.patientAge ? `${values.patientAge} yrs` : "—"}
                </ReviewRow>
                <ReviewRow label="Blood group">
                  <BloodGroupBadge group={values.bloodGroup as BloodGroup} />
                </ReviewRow>
                <ReviewRow label="Units">
                  {values.unitsRequired || "—"}
                </ReviewRow>
                <ReviewRow label="Hospital">
                  {values.hospitalName || "—"}
                </ReviewRow>
                <ReviewRow label="Location">
                  {values.district || values.city
                    ? [values.city, values.district].filter(Boolean).join(", ")
                    : "—"}
                </ReviewRow>
                <ReviewRow label="Urgency">
                  {humanizeToken(values.urgency)}
                </ReviewRow>
                <ReviewRow label="Needed by">
                  {values.neededBy || "—"}
                </ReviewRow>
                <ReviewRow label="Notes">{values.notes || "—"}</ReviewRow>
              </dl>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertTitle>What happens next</AlertTitle>
          <AlertDescription>
            <ol className="mt-1 list-decimal space-y-1 pl-4">
              {STEP_META.map((step, index) => (
                <li
                  key={step.key}
                  className={cn(
                    index < stepIndex && "text-muted-foreground line-through",
                  )}
                >
                  {step.title}: {step.description}
                </li>
              ))}
              <li className="text-muted-foreground">
                An admin verifies the request before donors are notified.
              </li>
            </ol>
            {urgencyOption?.value === UrgencyLevel.EMERGENCY && (
              <p className="mt-2 font-medium text-destructive">
                Emergency requests notify every compatible donor immediately.
              </p>
            )}
          </AlertDescription>
        </Alert>
      </aside>
    </div>
  );
}

/** Step 4 body: the same summary the sidebar previews, plus inline edit links. */
function ReviewSummary({
  values,
  onEdit,
}: {
  values: WizardValues;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Almost there</AlertTitle>
        <AlertDescription>
          An admin verifies every request before compatible donors are notified.
          You can jump back to any step to correct a detail.
        </AlertDescription>
      </Alert>

      <dl className="space-y-2 rounded-lg border border-border/60 p-4 text-sm">
        <ReviewRow label="Patient">
          <button
            type="button"
            onClick={() => onEdit(0)}
            className="cursor-pointer text-left hover:underline"
          >
            {values.patientName || "—"} ({values.patientAge || "?"} yrs,{" "}
            {formatBloodGroup(values.bloodGroup)})
          </button>
        </ReviewRow>
        <ReviewRow label="Hospital">
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="cursor-pointer text-left hover:underline"
          >
            {values.hospitalName || "—"}
          </button>
        </ReviewRow>
        <ReviewRow label="Location">
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="cursor-pointer text-left hover:underline"
          >
            {[values.city, values.district].filter(Boolean).join(", ") || "—"}
          </button>
        </ReviewRow>
        <ReviewRow label="Urgency">
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="cursor-pointer text-left hover:underline"
          >
            {humanizeToken(values.urgency)}
          </button>
        </ReviewRow>
        <ReviewRow label="Needed by">
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="cursor-pointer text-left hover:underline"
          >
            {values.neededBy || "—"}
          </button>
        </ReviewRow>
        <ReviewRow label="Units">{values.unitsRequired || "1"}</ReviewRow>
        <ReviewRow label="Notes">{values.notes || "—"}</ReviewRow>
      </dl>
    </div>
  );
}

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}
