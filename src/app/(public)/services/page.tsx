import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Droplets,
  ScrollText,
  Search,
  Truck,
  Wallet,
} from "lucide-react";
import { CtaSection } from "@/components/shared/cta-section";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Donor matching, verified blood requests, premium notifications, emergency logistics, bKash payments and audit logging — everything the Hemacue platform does for patients and donors.",
  keywords: [
    "compatible blood donor search",
    "emergency blood request Bangladesh",
    "blood donation logistics",
    "bKash blood request payment",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — Hemacue",
    description:
      "Six capabilities that take a blood request from a hospital bed to a completed donation.",
    url: "/services",
    type: "website",
  },
};

const services = [
  {
    id: "donor-matching",
    icon: Search,
    title: "Donor Matching",
    description:
      "Patients enter their blood group and district; Hemacue returns only the donors who are medically compatible, currently available and outside their 90-day cooldown.",
    points: [
      "Full A/B/AB/O compatibility matrix, including Rh sign",
      "Filters by district, availability and last donation date",
      "Already-assigned donors are excluded from the result set",
    ],
  },
  {
    id: "blood-requests",
    icon: Droplets,
    title: "Verified Blood Requests",
    description:
      "A request captures everything a donor needs before accepting: patient profile, units required, hospital, district and a real deadline.",
    points: [
      "Urgency levels: normal, high and emergency",
      "Admin verification before any donor is notified",
      "Status machine from pending to completed or cancelled",
    ],
  },
  {
    id: "premium-notification",
    icon: BellRing,
    title: "Premium Notification",
    description:
      "Standard matching notifies compatible donors free of charge. A paid premium tier widens the search when the first wave of donors does not respond in time.",
    points: [
      "Requested per blood request, never per platform",
      "bKash tokenized checkout with an emailed invoice",
      "Recorded on the request so the team can see what was paid for",
    ],
  },
  {
    id: "emergency-logistics",
    icon: Truck,
    title: "Emergency Logistics",
    description:
      "For emergencies where finding a donor is not the hardest part, patients can unlock courier support so the blood physically reaches the hospital.",
    points: [
      "Paid through the same bKash checkout flow",
      "Administrators can refund when a courier cannot deliver",
      "Tied to the request, so cost and outcome stay auditable",
    ],
  },
  {
    id: "bkash-payments",
    icon: Wallet,
    title: "bKash Payments",
    description:
      "Premium services are paid with bKash tokenized checkout. Payments are confirmed server-side and a PDF invoice is emailed to the payer.",
    points: [
      "Initiate and execute handled by the backend, never the browser",
      "Completed payments flip the matching flags on the request",
      "Rate-limited endpoints and full payment history per user",
    ],
  },
  {
    id: "audit-logging",
    icon: ScrollText,
    title: "Audit Logging",
    description:
      "Every meaningful action is recorded with the actor, the entity and the timestamp, so trust never depends on somebody's memory.",
    points: [
      "Donor accept and decline events",
      "Request status transitions with previous and next state",
      "Payment completion, refund, role updates and blocks",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Six capabilities behind every donation"
        description="From the first compatibility check to the final audit entry, each service exists to remove one specific failure point in an emergency."
      />

      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform capabilities"
          title="What Hemacue does for patients, donors and admins"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ id, icon: Icon, title, description, points }) => (
            <Card
              key={id}
              id={id}
              className="group h-full scroll-mt-24 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5"
            >
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="mt-4 text-base font-semibold">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{description}</p>
                <ul className="flex flex-col gap-2">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs">
                      <span
                        aria-hidden
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-primary"
                      />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Not sure where to start?"
            title="Create an account and pick your role"
            description="Patients raise requests, donors receive compatible alerts, and admins keep the network verified. Your role decides which dashboard you land on."
            align="center"
          />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              className="w-full gap-2 sm:w-auto"
              render={<Link href="/register?role=PATIENT" />}
            >
              I need blood
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              render={<Link href="/register?role=DONOR" />}
            >
              I want to donate
            </Button>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
