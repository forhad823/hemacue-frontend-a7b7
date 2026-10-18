import Link from "next/link";
import { ArrowRight, Calendar, Droplet, MapPin } from "lucide-react";
import { publicApi } from "@/api/public.api";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/shared/listing-card";
import { BloodGroupBadge } from "@/components/shared/blood-group-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";

/**
 * Server component — fetches up to 6 urgent VERIFIED blood requests and renders
 * them as ListingCard instances in a responsive grid.
 *
 * Uses publicApi.getFeaturedRequests() which is backed by ISR (60 s revalidation).
 * Step 2 will swap that method for a dedicated /public/featured-requests endpoint;
 * the JSX below must not change when that swap happens.
 */
export default async function FeaturedRequests() {
  const requests = await publicApi.getFeaturedRequests(6);

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Active requests"
          title="People who need your help right now"
          description="These are verified blood requests currently seeking compatible donors. Every card links to the full request details."
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-4 shrink-0 gap-1.5 sm:mt-0"
          render={<Link href="/login" />}
        >
          View all requests
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Droplet}
            title="No active requests right now"
            description="All urgent requests have been fulfilled. Check back soon or register as a donor to be notified when a new request arrives."
          />
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <li key={req.id}>
              <ListingCard
                icon={Droplet}
                badge={
                  <div className="flex flex-wrap items-center gap-1.5">
                    <BloodGroupBadge group={req.bloodGroup} />
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                }
                title={`${req.patientName} — ${req.hospitalName}`}
                description={
                  req.notes ??
                  `${req.unitsRequired} unit${req.unitsRequired !== 1 ? "s" : ""} of ${req.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")} blood needed at ${req.hospitalName}, ${req.district}.`
                }
                meta={[
                  {
                    label: "District",
                    value: req.district,
                    icon: MapPin,
                  },
                  {
                    label: "Units",
                    value: req.unitsRequired,
                    icon: Droplet,
                  },
                  {
                    label: "Needed by",
                    value: formatDate(req.neededBy),
                    icon: Calendar,
                  },
                ]}
                actions={
                  <Button
                    size="sm"
                    className="gap-1.5"
                    render={<Link href="/login" />}
                  >
                    View details
                    <ArrowRight className="size-3.5" />
                  </Button>
                }
                footer={`Posted ${formatDate(req.createdAt)}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
