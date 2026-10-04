"use client";

import RouteErrorFallback from "@/components/dashboard/route-error-fallback";

export default function DonorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      title="The donor dashboard could not load"
      description={
        error.message || "We could not reach the API for your donations."
      }
      onRetry={reset}
    />
  );
}
