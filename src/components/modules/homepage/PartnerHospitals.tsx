import { Building2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { PARTNER_HOSPITALS } from "@/lib/constants";

/**
 * Text-only hospital grid — no fabricated logos, no external image URLs.
 * All entries are real Bangladeshi hospitals from PARTNER_HOSPITALS constants.
 */
export default function PartnerHospitals() {
  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Network coverage"
        title="Partnered with hospitals across Bangladesh"
        description="Hemacue requests originate from and are fulfilled at these verified medical facilities, ensuring every donation reaches a real patient."
        align="center"
        className="max-w-2xl"
      />

      <ul
        aria-label="Partner hospitals"
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PARTNER_HOSPITALS.map((hospital) => (
          <li
            key={hospital.id}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {hospital.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {hospital.district}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Partner list reflects hospitals where verified Hemacue requests have
        originated or been fulfilled.
      </p>
    </section>
  );
}
