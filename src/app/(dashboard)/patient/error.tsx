"use client";

import RouteErrorFallback from "@/components/dashboard/route-error-fallback";

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      title="This page could not load"
      description={
        error.message || "We could not reach the API for your blood requests."
      }
      onRetry={reset}
    />
  );
}
