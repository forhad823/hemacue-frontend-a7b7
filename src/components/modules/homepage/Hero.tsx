import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Droplet,
  HeartPulse,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BloodGroup } from "@/types";
import { formatBloodGroup } from "@/lib/format";

const trustPoints = [
  {
    icon: HeartPulse,
    label: "Blood-group compatibility engine",
  },
  { icon: ShieldCheck, label: "90-day donor cooldown enforced" },
  { icon: Wallet, label: "bKash-secured premium services" },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/8 via-background to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 -z-10 size-112 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 -z-10 size-96 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-950/40"
      />

      <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-7">
            <Badge
              variant="outline"
              className="gap-2 border-primary/25 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur"
            >
              <BellRing className="size-3.5" />
              24/7 emergency blood network
            </Badge>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Every Drop Counts.{" "}
              <span className="bg-linear-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Every Second Matters.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              Hemacue connects verified blood donors with patients in critical
              need across Bangladesh. Requests are matched by blood group and
              district, verified by an admin, and tracked until the blood
              reaches the hospital.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20 sm:w-auto"
                render={<Link href="/register?role=PATIENT" />}
              >
                <Droplet className="size-4" />
                Request Blood
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 sm:w-auto"
                render={<Link href="/register?role=DONOR" />}
              >
                <HeartPulse className="size-4" />
                Become a Donor
              </Button>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-red-500/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Every blood group covered
                </h2>
                <Link
                  href="/faq"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  How matching works
                </Link>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Donors are filtered by medical compatibility, availability and
                the 90-day donation cooldown before they are ever notified.
              </p>

              <ul className="mt-5 grid grid-cols-4 gap-2">
                {Object.values(BloodGroup).map((group) => (
                  <li
                    key={group}
                    className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-background/80 py-3 transition-colors hover:border-primary/40"
                  >
                    <Droplet className="size-4 fill-primary text-primary" />
                    <span className="text-xs font-semibold tabular-nums">
                      {formatBloodGroup(group)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-medium text-foreground">
                  Not sure what you need?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Post a request with hospital, district and urgency — our
                  matching engine surfaces only the donors who can actually
                  help.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto gap-1 p-0 text-xs"
                  render={<Link href="/services" />}
                >
                  Explore all services
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
