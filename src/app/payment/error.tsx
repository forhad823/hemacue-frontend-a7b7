"use client";

import RouteErrorFallback from "@/components/dashboard/route-error-fallback";

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      title="Something went wrong with this payment"
      description={
        error.message ||
        "We could not reach the payment service. No money has been taken."
      }
      onRetry={reset}
    />
  );
}
