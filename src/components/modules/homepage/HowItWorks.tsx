import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Register with your blood group",
    description:
      "Create an account as a patient or a donor, verify your email with the OTP we send you, and set your district and city so matching stays local.",
  },
  {
    title: "Raise or receive a request",
    description:
      "Patients post hospital, units and urgency. Donors mark themselves available. Both sides always see the same verified request state.",
  },
  {
    title: "Match, notify and assign",
    description:
      "Compatible, available donors are filtered out automatically, notified, and assigned. Donors accept or decline — accepted donors lock the request.",
  },
  {
    title: "Deliver and close the loop",
    description:
      "The request moves from in progress to completed, the donor cooldown is recorded, and every transition is written to the audit log.",
  },
];

/** Four-step walkthrough of the request-to-donation lifecycle. */
export default function HowItWorks() {
  return (
    <section className="border-y border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from emergency to transfusion"
          description="The same transparent workflow runs for every request — whether it is planned surgery or a midnight emergency."
        />

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "border border-primary/30 bg-background text-primary",
                    )}
                  >
                    {index + 1}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 bg-linear-to-r from-primary/40 to-transparent lg:block"
                    />
                  ) : null}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
