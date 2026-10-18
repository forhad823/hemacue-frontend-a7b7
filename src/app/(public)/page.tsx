import { Suspense } from "react";
import type { Metadata } from "next";
import { CtaSection } from "@/components/shared/cta-section";
import { ListingGridSkeleton } from "@/components/dashboard/skeletons";
import Features from "@/components/modules/homepage/Features";
import FaqPreview from "@/components/modules/homepage/FaqPreview";
import FeaturedRequests from "@/components/modules/homepage/FeaturedRequests";
import Hero from "@/components/modules/homepage/Hero";
import HowItWorks from "@/components/modules/homepage/HowItWorks";
import LiveStats, {
  LiveStatsSkeleton,
} from "@/components/modules/homepage/LiveStats";
import PartnerHospitals from "@/components/modules/homepage/PartnerHospitals";
import Testimonials, {
  TestimonialsSkeleton,
} from "@/components/modules/homepage/Testimonials";
import TrustStrip, {
  TrustStripSkeleton,
} from "@/components/modules/homepage/TrustStrip";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Hemacue matches verified blood donors with patients in critical need across Bangladesh. Post an emergency blood request or register as a donor — matching, verification and delivery tracking included.",
  keywords: [
    "blood donation Bangladesh",
    "emergency blood request",
    "blood donor matching",
    "O positive donor Dhaka",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hemacue — Every Drop Counts. Every Second Matters.",
    description:
      "Emergency blood matching platform for Bangladesh: verified donors, admin-verified requests and donor-friendly cooldowns.",
    url: "/",
    type: "website",
  },
};

/**
 * Home page — 10 meaningful sections:
 *
 * 1. Hero            — carousel, 65 vh, entrance animations
 * 2. TrustStrip      — 4 trust badges
 * 3. LiveStats       — server-side public counters (ISR 60 s)
 * 4. FeaturedRequests — 6 verified requests as ListingCards (ISR 60 s)
 * 5. Features        — three-pillar platform explainer
 * 6. HowItWorks      — four-step lifecycle
 * 7. Testimonials    — 3 role-based quote cards
 * 8. PartnerHospitals — 8 real Bangladeshi hospital names
 * 9. FaqPreview      — top 4 FAQs with Accordion
 * 10. CtaSection     — closing dual-CTA band
 */
export default function HomePage() {
  return (
    <>
      {/* 1 — Hero (client component — carousel requires state) */}
      <Hero />

      {/* 2 — Trust strip */}
      <Suspense fallback={<TrustStripSkeleton />}>
        <TrustStrip />
      </Suspense>

      {/* 3 — Live stats (server, ISR 60 s) */}
      <Suspense fallback={<LiveStatsSkeleton />}>
        <LiveStats />
      </Suspense>

      {/* 4 — Featured requests card grid (server, ISR 60 s) */}
      <Suspense fallback={<ListingGridSkeleton count={6} />}>
        <FeaturedRequests />
      </Suspense>

      {/* 5 — Platform features (static) */}
      <Features />

      {/* 6 — How it works (static) */}
      <HowItWorks />

      {/* 7 — Testimonials (static data, Suspense for streaming) */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      {/* 8 — Partner hospitals (static) */}
      <PartnerHospitals />

      {/* 9 — FAQ preview (client component, Accordion) */}
      <FaqPreview />

      {/* 10 — Closing CTA band */}
      <CtaSection />
    </>
  );
}
