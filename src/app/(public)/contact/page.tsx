import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import ContactForm from "@/components/modules/contact/ContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Hemacue support team about blood requests, donor onboarding, bKash payments or anything else. 24/7 emergency line, email and office address.",
  keywords: [
    "contact Hemacue",
    "blood donation support",
    "emergency blood helpline",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Hemacue",
    description:
      "24/7 emergency line, support email and a validated enquiry form for the Hemacue team.",
    url: "/contact",
    type: "website",
  },
};

const channels = [
  {
    icon: Phone,
    label: "Emergency line",
    value: CONTACT_INFO.phone,
    note: CONTACT_INFO.phoneNote,
    href: `tel:${CONTACT_INFO.phone.replaceAll(" ", "")}`,
  },
  {
    icon: Mail,
    label: "Support email",
    value: CONTACT_INFO.supportEmail,
    note: "Replies within one working day",
    href: `mailto:${CONTACT_INFO.supportEmail}`,
  },
  {
    icon: Clock,
    label: "Availability",
    value: CONTACT_INFO.availability,
    note: "Including public holidays",
  },
  {
    icon: MapPin,
    label: "Office",
    value: CONTACT_INFO.address,
    note: "Dhaka, Bangladesh",
    href: CONTACT_INFO.mapsUrl,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We are reachable around the clock"
        description="Emergency? Call the hotline. Everything else — donor onboarding, request help, bKash receipts or a bug report — goes through the form or your inbox."
      />

      <section className="container mx-auto grid gap-6 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ul className="flex flex-col gap-4">
            {channels.map(({ icon: Icon, label, value, note, href }) => (
              <li key={label}>
                <Card size="sm" className="h-full">
                  <CardContent className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="break-words text-sm font-semibold text-foreground">
                        {href ? (
                          <a
                            href={href}
                            target={
                              href.startsWith("http") ? "_blank" : undefined
                            }
                            rel={
                              href.startsWith("http") ? "noreferrer" : undefined
                            }
                            className="underline-offset-4 hover:text-primary hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-3">
              <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/30 bg-primary/5">
                <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,var(--primary)_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="relative flex max-w-[16rem] flex-col items-center gap-2 text-center">
                  <MapPin className="size-6 text-primary" />
                  <p className="text-xs font-medium text-foreground">
                    {CONTACT_INFO.address}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                render={
                  <a
                    href={CONTACT_INFO.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <Navigation className="size-4" />
                Open in Google Maps
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="flex flex-col gap-2 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Send us a message
            </h2>
            <p className="text-sm text-muted-foreground">
              Fields marked by the validators run before anything is accepted —
              invalid emails and short messages never leave your browser.
            </p>
          </CardContent>
          <div className="border-t border-border/60 px-6 pb-6">
            <ContactForm />
          </div>
        </Card>
      </section>
    </>
  );
}
