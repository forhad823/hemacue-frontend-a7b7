import Link from "next/link";
import { ArrowRight, Check, Droplet, HeartHandshake, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

const features = [
  {
    icon: Droplet,
    title: "Request Blood",
    description:
      "Post a request with the patient profile, hospital, district and how urgently the blood is needed.",
    points: [
      "Blood group, units and urgency (normal, high, emergency)",
      "Hospital and district details so donors stay nearby",
      "Admin verification before any donor is notified",
    ],
    href: "/register?role=PATIENT",
    cta: "Start a request",
  },
  {
    icon: HeartHandshake,
    title: "Become a Donor",
    description:
      "Register once with your blood group and location. Hemacue only reaches out when your group is genuinely compatible.",
    points: [
      "Automatic 90-day cooldown between donations",
      "Availability toggle you control at any time",
      "Accept or decline every request you are notified about",
    ],
    href: "/register?role=DONOR",
    cta: "Register as donor",
  },
  {
    icon: Truck,
    title: "Emergency Logistics",
    description:
      "When a request is flagged emergency, patients can unlock paid courier support so the blood physically reaches the hospital.",
    points: [
      "Paid through bKash tokenized checkout",
      "Refundable when the courier cannot deliver",
      "Tracked from assignment through completion",
    ],
    href: "/services",
    cta: "See how it works",
  },
];

/** Three-pillar explanation of the platform: request, donate, logistics. */
export default function Features() {
  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="What Hemacue does"
        title="One platform for the three moments that matter"
        description="From the moment a request is raised to the moment a donor accepts it, every step is tracked, verified and auditable."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, points, href, cta }) => (
          <Card
            key={title}
            className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5"
          >
            <CardHeader>
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <CardTitle className="mt-4 text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
              <p className="text-sm text-muted-foreground">{description}</p>
              <ul className="flex flex-1 flex-col gap-2.5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full justify-between gap-2"
                render={<Link href={href} />}
              >
                {cta}
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}