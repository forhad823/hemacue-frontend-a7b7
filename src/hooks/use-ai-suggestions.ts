"use client";
import { useMemo } from "react";
import {
  flattenIndex,
  rankSuggestions,
  type Suggestion,
  type SuggestionIndex,
} from "@/lib/ai/suggestions";

/**
 * React adapter over the pure suggestion engine — no AI logic lives here.
 * The caller's `SearchInput` already debounces the query (Step 2); do not
 * add a second debounce.
 */
export function useAiSuggestions(
  query: string,
  index: SuggestionIndex,
  limit = 6,
): Suggestion[] {
  const entries = useMemo(() => flattenIndex(index), [index]);
  return useMemo(
    () => rankSuggestions(query, entries, limit),
    [query, entries, limit],
  );
}
