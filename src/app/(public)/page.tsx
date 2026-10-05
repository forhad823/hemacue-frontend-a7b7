import { Suspense } from "react";
import type { Metadata } from "next";
import { CtaSection } from "@/components/shared/cta-section";
import Features from "@/components/modules/homepage/Features";
import Hero from "@/components/modules/homepage/Hero";
import HowItWorks from "@/components/modules/homepage/HowItWorks";
import LiveStats, {
  LiveStatsSkeleton,
} from "@/components/modules/homepage/LiveStats";

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

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<LiveStatsSkeleton />}>
        <LiveStats />
      </Suspense>
      <Features />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
