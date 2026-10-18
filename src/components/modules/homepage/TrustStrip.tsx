import {
  BadgeCheck,
  ClipboardList,
  Clock,
  ShieldCheck,
} from "lucide-react";

const TRUST_BADGES = [
  {
    id: "verified",
    icon: BadgeCheck,
    title: "Admin-Verified Requests",
    description:
      "Every blood request is reviewed by a moderator before any donor is notified — no spam, no false alarms.",
  },
  {
    id: "cooldown",
    icon: Clock,
    title: "90-Day Donor Cooldown",
    description:
      "Donor health is paramount. Hemacue enforces a medical 90-day rest window between donations — enforced automatically.",
  },
  {
    id: "bkash",
    icon: ShieldCheck,
    title: "bKash-Secured Payments",
    description:
      "Premium notification and logistics services are settled through bKash tokenized checkout with full refund support.",
  },
  {
    id: "audit",
    icon: ClipboardList,
    title: "Full Audit Trail",
    description:
      "Every status change, role update, and payment is written to an immutable audit log — transparent by design.",
  },
] as const;

/** Four trust badges displayed as a horizontal strip below the Hero section. */
export default function TrustStrip() {
  return (
    <section className="border-b border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BADGES.map(({ id, icon: Icon, title, description }) => (
            <li key={id} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Lightweight skeleton for the TrustStrip so Suspense has something to show. */
export function TrustStripSkeleton() {
  return (
    <div className="border-b border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-start gap-3">
              <div className="mt-0.5 size-9 shrink-0 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
