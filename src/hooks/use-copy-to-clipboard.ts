"use client";
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/toast";

interface UseCopyToClipboardResult {
  /** Last value successfully copied — used to render "Copied" labels. */
  copiedValue: string | null;
  /**
   * Copies `value` and toasts the result.
   * `description` explains what was copied (defaults to the raw value).
   */
  copy: (value: string, description?: string) => Promise<void>;
}

/**
 * Single clipboard implementation shared by every table "copy" button
 * (bKash payment IDs, transaction IDs…) so the success/error toast behaviour
 * never drifts between tables.
 */
export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copy = useCallback(async (value: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      toast.add({
        title: "Copied",
        description: description ?? `${value} copied to your clipboard.`,
        type: "info",
      });
    } catch {
      toast.add({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        type: "error",
      });
    }
  }, []);

  return { copiedValue, copy };
}
