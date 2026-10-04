"use client";

import RouteErrorFallback from "@/components/dashboard/route-error-fallback";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      title="The admin dashboard could not load"
      description={
        error.message ||
        "An unexpected error occurred while fetching admin data."
      }
      onRetry={reset}
    />
  );
}
