# Upgrade Notes

What changed in the Hemacue frontend (and its backend) across the four upgrade
steps, and how the new pieces fit together.

## New routes

| Route                  | Audience | What it does                                                          |
| ---------------------- | -------- | --------------------------------------------------------------------- |
| `/explore`             | Public   | Live blood-request board with URL-synced search, filters and sorting  |
| `/blood-requests/[id]` | Public   | Full request detail page reached from every `ListingCard`             |
| `/admin/payments`      | Admin    | Payment ledger with status/type filters, sorting and trxID copy       |
| `/admin/analytics`     | Admin    | Platform charts (donut + bar metric) built from dashboard stats       |
| `/admin/settings`      | Admin    | Read-only reference for cooldowns, urgency levels and rate limits     |

## New backend endpoint

- `GET /admin/payments` — admin-only payment list with `page`, `limit`,
  `sortBy` (`createdAt` | `amount`), `sortOrder`, `status`, `paymentType` and
  `searchTerm` (matches paymentID, trxID or payer email). Every param is
  validated by `adminPaymentsQuerySchema` and typed in `IAdminPaymentsQueryParams`.
  Returns the standard `{ meta, data }` envelope.

No Prisma schema fields were added — no migrations required.

## New AI modules (`src/lib/ai/`)

All three AI features are **deterministic** (rule-based, pure functions, no
external API). Each file documents its own swap point.

| File                        | Feature                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `suggestions.ts`            | Ranked autocomplete suggestions (prefix/word/substring/fuzzy scoring)    |
| `suggestion-index.ts`       | `buildSuggestionIndex()` — buckets on-screen rows into suggestion lists  |
| `levenshtein.ts`            | Single shared edit-distance implementation used by the fuzzy scorer       |
| `insights.ts`               | `generateAdminInsights` / `generatePatientInsights` / `generateDonorInsights` |
| `hero-slice.ts`             | `DEFAULT_HERO` + `personalizeHero()` — role-aware hero copy for slide 1   |

### How to swap in a real LLM

Every module sits behind a pure-function interface: `rankSuggestions` returns
`Suggestion[]`, the `generate*Insights` functions return `Insight[]`, and
`personalizeHero` returns `HeroContent`. To add a real LLM, replace the body of
one of those functions with a call to your model of choice (keeping the same
return shape, or mapping the response into it) and keep a deterministic
fallback for offline/error states. Because no component imports OpenAI or any
network client for these features — they only import types and pure helpers —
the rest of the app is unchanged by the swap. There is no `openai` dependency
in `package.json`.

## New shared components

| Component        | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `ListingCard`    | Image/badge/title/meta/actions card used by every request listing           |
| `ListingGrid`    | Responsive 1→2→3 card grid with built-in empty state                        |
| `SortableHeader` | Column header with direction icon; used by every sortable table             |
| `DonutChart`     | Status donut (Recharts, lazy-loaded out of initial bundles)                 |
| `BarMetricChart` | Monthly volume bar chart (Recharts, lazy-loaded)                            |
| `AiSearchInput`  | `SearchInput` wrapper with category-tagged suggestion dropdown              |
| `AiInsightList`  | Renders `Insight[]` cards with tone-mapped icons and deep-link actions      |

Table toolbars (search + filters) are composed inline in each table from
`SearchInput`/`AiSearchInput` + `FilterSelect` rather than a single toolbar
component.

## New hooks

| Hook                  | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `useTableState`       | URL-synced page/sort/filter state shared by every data table            |
| `useAiSuggestions`    | React adapter over `rankSuggestions` (memoized index + results)         |
| `useAdminPayments`    | Query for `GET /admin/payments`                                         |
| `useCopyToClipboard`  | Copy helper used by payment trxIDs and share buttons                    |

## Audit outcomes

- **DRY** — the plan's greps return zero hits for duplicated `Intl` formatters
  (all live in `src/lib/format.ts`), duplicated card-grid markup, second toast
  managers, API base URL literals, or `as any`. Two known documented mirrors
  remain: `dashboard/skeletons.tsx` mirrors `ListingGrid`'s class string for
  the loading state, and `ai-search-input.tsx` compares against the literal
  `"ArrowDown"` keyboard-event key (not a sort-icon duplicate).
- **Types** — `npx tsc --noEmit` passes in the frontend; Biome
  `noExplicitAny: "error"` is enabled in the frontend `biome.json`. The backend
  keeps `noExplicitAny: "warn"` because of one pre-existing `catch (error: any)`
  in `src/app/utils/jwt.ts` (unrelated to these upgrades).
- **Backend consistency** — every new route has `validateRequest`, every new
  service function is exported, list endpoints return `{ meta, data }`, and all
  query params are declared in `admin.interface.ts`.
