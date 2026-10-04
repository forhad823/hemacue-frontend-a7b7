"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

/**
 * Shared body for every `error.tsx` boundary. Route files stay one-liners so the
 * recovery UX stays identical across admin, patient, donor and payment routes.
 */
export default function RouteErrorFallback({
  title = "Something went wrong",
  description = "We could not load this view. The error has been contained, so the rest of your dashboard still works.",
  onRetry,
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Button onClick={onRetry} className="gap-2">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
