import type { Metadata } from "next";
import { Suspense } from "react";
import { publicApi } from "@/api/public.api";
import { ExploreClient } from "@/components/modules/explore/explore-client";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Explore Blood Requests | Hemacue",
  description:
    "Browse active blood donation requests across Bangladesh. Filter by blood group, district, urgency and status.",
};

export default async function ExplorePage() {
  // Server-side initial fetch — leverages ISR cache via Next.js patched fetch.
  const initialData = await publicApi.listRequests({ limit: 9 });

  return (
    <>
      <PageHero
        eyebrow="Live requests"
        title="Explore Blood Requests"
        description="Browse and filter active blood donation requests across Bangladesh. Help save lives by finding a request that matches your blood type."
      />
      <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <Suspense>
          <ExploreClient initialData={initialData} />
        </Suspense>
      </section>
    </>
  );
}
