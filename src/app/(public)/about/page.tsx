import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, Eye, Scale, Target, X } from "lucide-react";
import { CtaSection } from "@/components/shared/cta-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import LiveStats, {
  LiveStatsSkeleton,
} from "@/components/modules/homepage/LiveStats";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hemacue exists to close the gap between blood banks and people who need blood in an emergency. Learn the problem we solve, our mission and the technology behind the platform.",
  keywords: [
    "about Hemacue",
    "blood donation platform",
    "healthcare Bangladesh",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hemacue",
    description:
      "The mission, the problem and the stack behind Hemacue's emergency blood network.",
    url: "/about",
    type: "website",
  },
};

const principles = [
  {
    icon: Target,
    title: "Our mission",
    description:
      "Make sure that a patient who needs blood in Dhaka at 2am can find a compatible, available donor in minutes — without phone trees, group chats or guesswork.",
  },
  {
    icon: Eye,
    title: "Our vision",
    description:
      "A district-wise emergency blood network for Bangladesh where every request is verified, every donor is protected by a real cooldown, and every handover is auditable.",
  },
  {
    icon: Scale,
    title: "What we optimise for",
    description:
      "Speed of matching, medical correctness of the compatibility rules, and donor safety. Nothing is ranked, boosted or sold by position.",
  },
];

const problemPoints = [
  "Emergency requests spread across group chats, posters and phone calls with no verification.",
  "Donors are contacted without checking medical compatibility or recent donation history.",
  "No single place shows whether a request was actually fulfilled at the hospital.",
];

const solutionPoints = [
  "Every request carries blood group, units, urgency, hospital and district.",
  "Compatible donors are filtered by blood group, availability and the 90-day cooldown before notification.",
  "A verified status machine tracks each request from pending to completed, with an audit trail.",
];

const stack = [
  {
    label: "Next.js 16 App Router",
    detail: "Server Components, streaming and route-level caching",
  },
  {
    label: "TypeScript",
    detail: "Strict types end to end, no `any` in the data layer",
  },
  {
    label: "Tailwind CSS v4 + shadcn/ui",
    detail: "Design tokens for the blood, urgency and trust palette",
  },
  {
    label: "TanStack Query",
    detail: "Server-state caching, mutations and cache invalidation",
  },
  {
    label: "Express 5 + Prisma 7",
    detail: "REST API with a typed PostgreSQL data layer",
  },
  {
    label: "JWT + Redis",
    detail: "Access and refresh tokens with rate-limited endpoints",
  },
  {
    label: "bKash tokenized checkout",
    detail: "Sandbox payments, invoice generation and refunds",
  },
  {
    label: "Cloudinary + Nodemailer",
    detail: "Avatar uploads, OTP and invoice emails",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Hemacue"
        title="Blood donation should not depend on who you happen to know"
        description="Hemacue is a full-stack emergency blood platform for Bangladesh: verified requests, medically correct donor matching, and a complete audit trail from the first OTP to the transfusion."
      >
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            className="w-full gap-2 shadow-md shadow-primary/20 sm:w-auto"
            render={<Link href="/services" />}
          >
            Explore the services
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            render={<Link href="/contact" />}
          >
            Talk to support
          </Button>
        </div>
      </PageHero>

      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why we exist"
          title="Mission, vision and the principles behind the product"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="h-full">
              <CardContent className="flex flex-col gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/30">
        <div className="container mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              The problem
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Emergency blood demand in Bangladesh is real, but the process
              around it is fragmented and unsafe.
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {problemPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Our solution
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              One verified workflow that both patients and donors can trust.
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {solutionPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Suspense fallback={<LiveStatsSkeleton />}>
        <LiveStats />
      </Suspense>

      <section className="container mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Under the hood"
          title="The stack behind Hemacue"
          description="A production-shaped full-stack project: typed API, relational data model, role-based access, payments and audit logging."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((item) => (
            <Card key={item.label} size="sm">
              <CardContent className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
