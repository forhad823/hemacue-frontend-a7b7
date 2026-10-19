/**
 * Deterministic search-suggestion engine.
 *
 * Ranks EXISTING index entries against a query — it never fabricates rows.
 * Swap for an LLM call by replacing `rankSuggestions`' return value with a
 * remote completion; the `Suggestion[]` shape and every caller stay unchanged.
 *
 * Scoring (documented on purpose — the order matters):
 *   text starts with query            → 100
 *   any word starts with query        →  60
 *   text contains query               →  30
 *   edit distance ≤ 2 (fuzzy)         →  10
 *   no match                          →   0
 */
import { levenshtein } from "./levenshtein";

export type SuggestionCategory =
  | "hospital"
  | "district"
  | "bloodGroup"
  | "patient"
  | "trxId";

export interface Suggestion {
  text: string;
  category: SuggestionCategory;
  /** Higher = better. Used for ordering only. */
  score: number;
}

export interface SuggestionIndex {
  hospitals: string[];
  districts: string[];
  /** Human labels, e.g. ["A+", "A-", …], derived from BLOOD_GROUP_OPTIONS. */
  bloodGroups: string[];
  /** Person-identifying strings: patient names, payer emails, user names. */
  patients: string[];
  /** bKash transaction + payment IDs from the payments table. */
  trxIds: string[];
}

/** One index entry with its bucket tag, before scoring. */
export interface FlatSuggestion {
  text: string;
  category: SuggestionCategory;
}

/** Below this, the fuzzy branch is too noisy to be helpful. */
export const MIN_SUGGESTION_QUERY_LENGTH = 2;

const SCORE_PREFIX = 100;
const SCORE_WORD_PREFIX = 60;
const SCORE_SUBSTRING = 30;
const SCORE_FUZZY = 10;

/** Word separators worth treating as boundaries for the "word starts with" rule. */
const WORD_SPLIT_REGEX = /[\s,/_\-()]+/;

export function scoreSuggestion(text: string, query: string): number {
  const haystack = text.toLowerCase();
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;

  if (haystack.startsWith(needle)) return SCORE_PREFIX;
  if (
    haystack.split(WORD_SPLIT_REGEX).some((word) => word.startsWith(needle))
  ) {
    return SCORE_WORD_PREFIX;
  }
  if (haystack.includes(needle)) return SCORE_SUBSTRING;

  // Fuzzy branch: edit distance can never be smaller than the length
  // difference, so skip the DP for obviously-distant pairs.
  if (
    Math.abs(haystack.length - needle.length) <= 2 &&
    levenshtein(haystack, needle) <= 2
  ) {
    return SCORE_FUZZY;
  }

  return 0;
}

/** Concatenates every bucket with its category tag — memoized by the hook. */
export function flattenIndex(index: SuggestionIndex): FlatSuggestion[] {
  const tagged = (
    texts: string[],
    category: SuggestionCategory,
  ): FlatSuggestion[] => texts.map((text) => ({ text, category }));

  return [
    ...tagged(index.hospitals, "hospital"),
    ...tagged(index.districts, "district"),
    ...tagged(index.bloodGroups, "bloodGroup"),
    ...tagged(index.patients, "patient"),
    ...tagged(index.trxIds, "trxId"),
  ];
}

/** Filter + score + sort + dedupe + slice. Pure — safe to memoize on inputs. */
export function rankSuggestions(
  query: string,
  entries: FlatSuggestion[],
  limit = 6,
): Suggestion[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < MIN_SUGGESTION_QUERY_LENGTH) return [];

  const scored: Suggestion[] = [];
  for (const entry of entries) {
    const score = scoreSuggestion(entry.text, needle);
    if (score > 0) scored.push({ ...entry, score });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.text.localeCompare(b.text) ||
      a.category.localeCompare(b.category),
  );

  // The same string can live in two buckets (a patient named "Dhaka"); show it once.
  const seen = new Set<string>();
  const unique: Suggestion[] = [];
  for (const suggestion of scored) {
    const key = suggestion.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(suggestion);
    if (unique.length >= limit) break;
  }

  return unique;
}
