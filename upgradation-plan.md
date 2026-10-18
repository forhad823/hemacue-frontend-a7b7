# Analysis Summary

## Current State vs. Requirements

| Area                        | Current                                                                                                        | Required                             | Gap                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| **Home sections**           | 5 (Hero, LiveStats, Features, HowItWorks, CtaSection)                                                          | 10+ meaningful                       | **5+ needed**                          |
| **Hero**                    | `py-14/py-20`, no carousel, no animation                                                                       | 60–70vh, carousel, animation         | **Full redesign**                      |
| **Card listing**            | Feature cards = icon + title + text + CTA (no image, no meta)                                                  | image + title + desc + meta + action | **New `ListingCard` component**        |
| **Public Explore page**     | None (only dashboard tables)                                                                                   | Dedicated public route               | **New route**                          |
| **Table sorting**           | Only `admin/users` table                                                                                       | All listing tables                   | **6 tables to update**                 |
| **Table filtering/search**  | `admin/users`, `admin/blood-requests`, `audit-logs`, `my-requests` have them; `my-donations`, `payments` don't | All tables                           | **2+ tables to update**                |
| **Admin sidebar**           | 4 items (Overview, Users, Blood Requests, Audit Logs)                                                          | ≥6                                   | **2+ items + backend endpoint**        |
| **Patient dashboard chart** | None                                                                                                           | Required                             | **Add chart**                          |
| **AI features**             | None                                                                                                           | ≥2                                   | **Build 2–3 rule-based "AI" features** |

---

# `upgradation-plan.md`

# Hemacue Upgrade Plan — 5-Step Implementation Guide

> **Purpose:** Bring the Hemacue frontend + backend up to the site-review requirements
> without breaking any existing feature. Each step is self-contained, additive, and
> leaves the codebase compiling and deployable.
>
> **Audience:** Any developer (or lower-grade LLM) following the steps sequentially.
> Every step lists _what_, _why_, _how_, and _guard rails_.

---

## 🛑 GLOBAL GUARD RAILS (read before touching any code)

These rules apply to **every** step. Violating them is considered a regression.

### G1 — DRY (Don't Repeat Yourself)

- **Never** copy-paste a component, hook, or helper. If you find yourself writing the same
  JSX or logic twice, extract it into `src/components/shared/` or `src/lib/`.
- Existing shared primitives (`Button`, `Card`, `Badge`, `DataTableShell`, `EmptyState`,
  `SearchInput`, `FilterSelect`, `PaginationBar`, `StatCard`, `BloodGroupBadge`,
  `RequestStatusBadge`, `UrgencyBadge`, `formatDate`, `formatCurrency`, `humanizeToken`,
  `useDebounce`, `useSearchParamsState`) **already exist — reuse them**.
  Grep `src/components/shared/` and `src/lib/` before writing anything new.
- Server-side enums exist in **two places** (`src/types/enums.type.ts` frontend and
  `hemacue-backend/prisma/schema/enums.prisma` backend). Any new enum value must be added
  to **both**, never duplicated elsewhere.

### G2 — No `any`, No `unknown` leakage

- `any` is **forbidden**. Use a precise interface, a discriminated union, or a generic.
- `unknown` is allowed **only** at I/O boundaries (API responses, `catch` blocks), and it
  **must** be narrowed with a type-guard function or a Zod schema before use.
- When defining a function that accepts a shape, prefer `interface Props { … }` over
  `type Props = { … }` for public API surfaces (interface is extendable).
- Example of the correct pattern for API error narrowing:
  ```ts
  function isApiError(value: unknown): value is ApiErrorResponse {
    return typeof value === "object" && value !== null && "message" in value;
  }
  ```

### G3 — No redundant code

- A constant used in 2+ files goes to `src/lib/constants.ts`.
- A formatter used in 2+ files goes to `src/lib/format.ts`.
- A query key used in 2+ hooks goes to `src/lib/query-keys.ts`.
- A backend enum imported in 2+ modules must be imported from the **single** generated
  `../../../../generated/prisma/enums` barrel (already the convention — do not break it).
- URL search-param handling must reuse `useSearchParamsState`; do not write a new one.

### G4 — Backward compatibility

- Do not rename/remove existing exported functions, types, or route files. Add new
  exports alongside.
- Every new API endpoint is **additive**: no existing endpoint changes its response shape.
- Every schema migration is **additive**: `ADD COLUMN`, `CREATE TYPE`, `CREATE INDEX` —
  no `DROP COLUMN`, no `ALTER COLUMN … SET NOT NULL` without a default.
- Existing tables keep **identical** columns; sorting/filtering is added via new props.

### G5 — Verify before moving on

- After each step, run `pnpm lint`, `pnpm build` (frontend) and `npm run lint:check`
  (backend) to confirm nothing broke.
- After each step, manually exercise the **exact** flow described in the step's
  _Verification Checklist_.

---

## 📦 STEP 1 — Home Page Overhaul + Shared `ListingCard`

### What this step is

1. Build the shared `ListingCard` component (**image, title, short description, meta
   info, primary action**).
2. Redesign `Hero` to be **60–70 vh tall**, with a **manual + auto-advancing carousel**
   and **entrance animations**.
3. Add **5 new home-page sections** so the home page has **10 meaningful sections
   total**.

### Why this step is needed

- The site review explicitly requires _“minimum 10 meaningful home sections”_,
  _“hero height 60–70% of the screen”_, _“interactive slider/carousel”_, and a
  _“card-based listing with image, title, short description, meta info, and
  View Details/Actions button”_.
- Building `ListingCard` first lets **Step 2's Explore page** reuse it — that is the DRY
  payoff for doing this step first.

### Detailed implementation

#### 1.1 — `src/components/shared/listing-card.tsx` (new file)

```tsx
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListingCardMeta {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export interface ListingCardProps {
  /** Primary visual. When omitted the `icon` fallback is rendered in a tinted tile. */
  image?: { src: string; alt: string };
  /** Fallback icon when `image` is not supplied (feature cards). */
  icon?: LucideIcon;
  /** Optional badge above the title (e.g. urgency, status). */
  badge?: ReactNode;
  title: string;
  description: string;
  /** Short data points rendered as a bulleted strip below the description. */
  meta: ListingCardMeta[];
  /** Primary action ("View details", "Assign donor", etc.). */
  actions: ReactNode;
  /** Optional secondary footer content (timestamp, location hint). */
  footer?: ReactNode;
  className?: string;
}
```

Implementation notes:

- Wrap everything in the **existing** `Card` / `CardHeader` / `CardContent` /
  `CardFooter` (from `src/components/ui/card.tsx`).
- Use `next/image` with `sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"`,
  `className="h-44 w-full object-cover"`, `width={640}`, `height={360}`.
- Image host must already be allowed: `res.cloudinary.com` and
  `lh3.googleusercontent.com` are whitelisted in `next.config.ts`. For any new
  image source, update `next.config.ts > images.remotePatterns` **once** — do not
  bypass with `<img>`.
- Meta strip: `flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground`, each item
  `inline-flex items-center gap-1`.
- Actions row uses `CardFooter` with `justify-between` (primary CTA left, secondary
  right if provided).

#### 1.2 — Redesign `src/components/modules/homepage/Hero.tsx`

Target: `min-h-[65vh] lg:min-h-[70vh]` (use `min-h`, never `h` — content must never
overflow on very short screens).

**Carousel** — no third-party dependency (project already vendors enough). Implement a
`useHeroSlides` local hook _inside the same file_:

```tsx
const SLIDES = [
  { eyebrow, headline, subhead, ctas, illustrationIcon, accentClass },
  { … }, // 3 slides total: Request, Donate, Emergency Logistics
] as const;

const AUTO_ADVANCE_MS = 6_000;

function useAutoAdvance(length: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % length), AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [length]);
  return { index, setIndex, next: …, prev: … };
}
```

**Required carousel UI:**

- Slide content is a `<div role="group" aria-roledescription="slide">`.
- **Manual controls**: previous / next arrow `<Button size="icon">` (reuse `Button`) and
  three **dot indicators** below; the active dot uses `bg-primary`.
- **Auto-advance** pauses on `hover` and when the browser tab is hidden
  (`document.visibilityState`); respect `prefers-reduced-motion` by **disabling
  auto-advance** when `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.

**Required animation:**

- Use **`tw-animate-css`** (already imported in `globals.css`) — `animate-in fade-in`,
  `slide-in-from-bottom-4`, `duration-500`.
- Animate each slide's headline + subhead + CTA with `key={index}` so React remounts and
  re-triggers the entrance animation.
- Animate the decorative background blobs with `animate-pulse` (motion-reduce respect
  via `motion-reduce:animate-none`).

**Structure that must be preserved:**

- Keep the `trustPoints` list and the blood-group grid — they are meaningful content,
  not decoration. Only restyle them.
- Keep both CTAs (`/register?role=PATIENT` and `/register?role=DONOR`) — they are the
  only sign-up entry points on the home page.

#### 1.3 — Add 5 new home-page sections

Create **one file per section** in `src/components/modules/homepage/` — do **not** put
them all in `page.tsx`.

| #   | File                   | Data source                                                                                                                                            | Purpose                                                                          |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 1   | `TrustStrip.tsx`       | static constants                                                                                                                                       | 4 trust badges (verified requests, 90-day cooldown, bKash secured, audit logged) |
| 2   | `FeaturedRequests.tsx` | server-side `publicApi.getFeaturedRequests()` (see Step 2.3b) **or** `bloodRequestApi.list({ limit: 6, status: "VERIFIED" })` for now — see note below | Card grid of 3–6 recent requests using `ListingCard`                             |
| 3   | `Testimonials.tsx`     | static array in `src/lib/constants.ts` (`TESTIMONIALS`)                                                                                                | 3 quote cards (patient, donor, admin)                                            |
| 4   | `PartnerHospitals.tsx` | static array (`PARTNER_HOSPITALS`)                                                                                                                     | Logo grid of real Bangladeshi hospital names (text-only, no fake logos)          |
| 5   | `FaqPreview.tsx`       | re-uses `contactSubjects`-style static array (`HOME_FAQ_ENTRIES`) + `Link` to `/faq`                                                                   | Top 4 FAQs inside the existing `Accordion` primitive                             |

> **Note on `FeaturedRequests`:** In this step, call
> `bloodRequestApi.list({ limit: 6, status: RequestStatus.VERIFIED, sortBy: "neededBy", sortOrder: "asc" })`
> from a **Server Component** (this section is `async`). Step 2 will swap this for
> `publicApi.getFeaturedRequests()` which uses Next.js `revalidate` caching — that swap
> is a one-line change and **must not change the JSX**.

#### 1.4 — Update `src/app/(public)/page.tsx`

```tsx
export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<TrustStripSkeleton />}>
        <TrustStrip />
      </Suspense>
      <Suspense fallback={<LiveStatsSkeleton />}>
        <LiveStats />
      </Suspense>
      <Suspense fallback={<ListingGridSkeleton count={6} />}>
        <FeaturedRequests />
      </Suspense>
      <Features />
      <HowItWorks />
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>
      <PartnerHospitals />
      <FaqPreview />
      <CtaSection />
    </>
  );
}
```

**Do not remove** `LiveStats`, `Features`, `HowItWorks`, or `CtaSection`. The new
sections sit **between** them. This is what keeps Step 1 additive.

Add a **`ListingGridSkeleton`** helper to `src/components/dashboard/skeletons.tsx` — it
is reused by Step 2.

### Guard rails specific to Step 1

- `ListingCard` must accept **either** `image` **or** `icon` — never both required.
  Use a discriminated union:
  ```ts
  type ListingCardVisual =
    | { image: { src: string; alt: string }; icon?: never }
    | { icon: LucideIcon; image?: never };
  ```
- Testimonial / hospital / FAQ data goes in `src/lib/constants.ts` as `as const` arrays
  so they are narrowed and reused elsewhere without re-typing.
- **Do not** import `framer-motion` — use `tw-animate-css` only. One animation strategy.
- **Do not** hard-code the same hero copy in multiple slides — extract strings to a
  `SLIDES` const at the top of `Hero.tsx`.

### Verification checklist for Step 1

- [ ] Home page renders **10 visible sections** (count distinct top-level `<section>`).
- [ ] Hero measures **≥ 65 vh** on a 1280×800 viewport and **≥ 60 vh** on 375×667.
- [ ] Hero carousel auto-advances every 6 s, has working prev/next + dots, and pauses on hover.
- [ ] `prefers-reduced-motion: reduce` disables auto-advance (test in DevTools → Rendering).
- [ ] `ListingCard` renders with image **and** without image (icon fallback) correctly.
- [ ] `pnpm lint && pnpm build` pass.
- [ ] No new `any` types introduced (grep `: any` and `as any` in changed files).

---

## 📦 STEP 2 — Public Explore Page + `useTableState` + Apply Sorting/Filtering/Search to All Tables

### What this step is

1. Build a **shared `useTableState` hook** (URL-synced pagination + sort + filters +
   debounced search).
2. Build **shared table toolbar primitives** (`SortableHeader`, `TableToolbar`).
3. Add a **public `/explore` page** that uses `ListingCard` for a card-grid + filter
   sidebar.
4. **Refactor every existing listing table** to use `useTableState`, adding the missing
   sorting/filtering/search **without changing visual identity** or existing behaviour.

### Why this step is needed

- The review requires a dedicated public **Explore/Listing page**, sorting on **all**
  listing tables, filtering on `MyDonationsTable` and `PaymentHistoryTable`, and search
  on the same two tables.
- Centralising table state means future tables (Step 3 admin pages) get sorting/filtering
  **for free** — a direct DRY win and the reason this step comes before Step 3.

### Detailed implementation

#### 2.1 — `src/hooks/use-table-state.ts` (new file)

```ts
"use client";
import { useCallback, useMemo } from "react";
import { useSearchParamsState } from "./use-search-params-state";

export type SortOrder = "asc" | "desc";

export interface TableSort {
  field: string;
  order: SortOrder;
}

export interface UseTableStateConfig {
  /** Fields the table can be sorted by (used for typing + validation). */
  sortFields: readonly string[];
  defaultSort?: TableSort;
  /** Names of filter params this table exposes (e.g. ["status", "district"]). */
  filterKeys?: readonly string[];
  defaultFilters?: Record<string, string>;
  pageSize?: number;
}

export function useTableState(config: UseTableStateConfig) {
  const defaults = useMemo(() => {
    const base: Record<string, string> = {
      page: "1",
      sortBy: config.defaultSort?.field ?? config.sortFields[0],
      sortOrder: config.defaultSort?.order ?? "desc",
      searchTerm: "",
    };
    for (const key of config.filterKeys ?? [])
      base[key] = config.defaultFilters?.[key] ?? "";
    return base;
  }, [
    config.defaultSort,
    config.filterKeys,
    config.defaultFilters,
    config.sortFields,
  ]);

  const { values, setValues } = useSearchParamsState(defaults);
  const page = Number(values.page) || 1;

  const setPage = useCallback(
    (next: number) => setValues({ page: String(next) }),
    [setValues],
  );
  const setSort = useCallback(
    (field: string) => {
      const isSame = values.sortBy === field;
      setValues({
        sortBy: field,
        sortOrder:
          isSame && values.sortOrder === "asc"
            ? "desc"
            : isSame
              ? "asc"
              : "asc",
        page: "1",
      });
    },
    [setValues, values.sortBy, values.sortOrder],
  );
  const setSearch = useCallback(
    (searchTerm: string) => setValues({ searchTerm, page: "1" }),
    [setValues],
  );
  const setFilter = useCallback(
    (key: string, value: string) => setValues({ [key]: value, page: "1" }),
    [setValues],
  );
  const reset = useCallback(
    () =>
      setValues(
        Object.fromEntries(
          Object.entries(defaults).map(([k, v]) => [
            k,
            k === "page" ? "1" : k.startsWith("sort") ? v : "",
          ]),
        ),
      ),
    [defaults, setValues],
  );

  const activeFilterCount =
    (config.filterKeys ?? []).filter((k) => values[k]).length +
    (values.searchTerm ? 1 : 0);
  const sort: TableSort = {
    field: values.sortBy,
    order: values.sortOrder as SortOrder,
  };
  const filters: Record<string, string> = Object.fromEntries(
    (config.filterKeys ?? []).map((k) => [k, values[k]]),
  );

  return {
    page,
    pageSize: config.pageSize ?? 10,
    sort,
    filters,
    searchTerm: values.searchTerm,
    setPage,
    setSort,
    setSearch,
    setFilter,
    reset,
    activeFilterCount,
  };
}
```

> **Do not** rewrite `useSearchParamsState`. It already handles `router.replace` and URL
> serialisation. `useTableState` is a _typed facade on top_, not a replacement.

#### 2.2 — Shared table primitives (`src/components/shared/`)

**`sortable-header.tsx`**

```tsx
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import type { TableSort } from "@/hooks/use-table-state";
import { cn } from "@/lib/utils";

export function SortableHeader({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: string;
  sort: TableSort;
  onSort: (f: string) => void;
}) {
  const active = sort.field === field;
  const Icon = !active
    ? ArrowUpDown
    : sort.order === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <Icon className={cn("size-3", active && "text-primary")} />
    </button>
  );
}
```

**`table-toolbar.tsx`** — composes `SearchInput`, `FilterSelect`, and a reset button.
Props: `{ search, onSearch, filters: ReactNode, activeFilterCount, onReset }`. Renders
the **same markup** every dashboard table already uses, so visual identity is unchanged.

**`listing-grid.tsx`** — wraps `ListingCard[]` in a responsive grid
(`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`) and shows `EmptyState` when `data.length === 0`.

#### 2.3 — Public Explore page

**Route:** `src/app/(public)/explore/page.tsx`

**Data:** Server Component fetches via `publicApi.listRequests()` (new method below);
optionally a Client Component `ExploreClient` for interactive filtering. Use the
**hybrid pattern already established in `LiveStats.tsx`** (server fetch → pass as
`initialData` to a client component that re-queries with TanStack Query).

**(a) New `publicApi` method — `src/api/public.api.ts`:**

```ts
listRequests: async (
  query: BloodRequestQueryParams = {},
): Promise<ApiResponse<BloodRequest[]> | null> => {
  return fetchPublicRequests(toQueryString(query));
};
```

Reuse the existing private `fetchPublicRequests` helper that already sets
`next: { revalidate: 60, tags: ["public-blood-requests"] }`.

**(b) New `publicApi.getFeaturedRequests`** — used by Step 1's `FeaturedRequests` too:

```ts
getFeaturedRequests: async (limit = 6): Promise<BloodRequest[]> => {
  const res = await fetchPublicRequests({
    limit: String(limit),
    status: "VERIFIED",
    sortBy: "neededBy",
    sortOrder: "asc",
  });
  return res?.data ?? [];
};
```

Swap Step 1's `FeaturedRequests` to use this method — same return type, no JSX changes.

**Explore page layout:**

- **Left sidebar** (`lg:col-span-3`): filters — blood group (`BLOOD_GROUP_OPTIONS`),
  district (`DISTRICTS`), urgency (`URGENCY_OPTIONS`), status (`REQUEST_STATUS_OPTIONS`),
  and a sort dropdown. All use the existing `FilterSelect`.
- **Right main** (`lg:col-span-9`): `ListingGrid` of `ListingCard`. Each card's `meta`
  shows blood group, urgency, units, district. Action = `Button render={<Link href={`/blood-requests/${req.id}`} />}` — **`/blood-requests/[id]` is a new public detail route** that re-uses the existing `RequestDetail` component in read-only mode.
- Use `useTableState` for URL sync.
- Pagination via existing `PaginationBar`.

**New route:** `src/app/(public)/blood-requests/[id]/page.tsx` — thin wrapper that
renders `<RequestDetail requestId={id} />`. This works today because `RequestDetail`
already handles read-only visitors via `canManage`.

#### 2.4 — Apply sorting/filtering/search to existing tables

Open each file and refactor **only the state handling** — the columns, cell renderers,
and JSX must remain identical unless specified.

| File                                                          | Currently has                             | Add                                                                                                                                                             |
| ------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/modules/admin/blood-requests-table.tsx`       | search, filters, pagination — **no sort** | sort by `patientName`, `neededBy`, `bloodGroup`, `urgency`, `status`. Wire to `useBloodRequests` (already accepts `sortBy`/`sortOrder`).                        |
| `src/components/modules/admin/audit-logs-table.tsx`           | search, filters, pagination               | sort by `createdAt` (already backend-supported). Add `SortableHeader` on the “When” column.                                                                     |
| `src/components/modules/blood-requests/my-requests-table.tsx` | search, status filter, pagination         | sort by `neededBy`, `createdAt`.                                                                                                                                |
| `src/components/modules/donors/my-donations-table.tsx`        | pagination **only**                       | search by patient/hospital; filters: `status` (AssignmentStatus), `urgency`, `bloodGroup`; sort by `assignedAt`, `neededBy`. **Backend change required below.** |
| `src/components/modules/payments/payment-history-table.tsx`   | pagination **only**                       | search by patient name / trxID; filters: `status`, `paymentType`; sort by `createdAt`, `amount`. **Backend change required below.**                             |

**Backend additions** (both **additive**):

**`hemacue-backend/src/app/modules/donorMatch/donorMatch.service.ts`** — extend
`getMyDonations(donorId, query)`:

```ts
export interface IMyDonationsQuery {
  page?: number;
  limit?: number;
  sortBy?: "assignedAt" | "neededBy";
  sortOrder?: "asc" | "desc";
  status?: AssignmentStatus;
  searchTerm?: string;
}
```

Add a `where` that ANDs on `donorId`, optional `status`, and `request.patientName/hospitalName` contains for `searchTerm`. Return `{ meta, data }`.

**`hemacue-backend/src/app/modules/payment/payment.service.ts`** — extend
`getMyPayments(userId, query)` the same way (`status`, `paymentType`, `searchTerm` on
`paymentID`/`trxID`, `sortBy` on `createdAt`/`amount`). Keep the existing `meta` shape.

**Update both validations** (`donorMatch.validation.ts`, `payment.validation.ts`) with
`z.object` schemas for the new query params — reuse `z.coerce.number()` for `page`/`limit`.

**Update both routes** (`donorMatch.route.ts`, `payment.route.ts`) to pass
`req.validatedQuery` (the pattern already exists in `admin.route.ts`).

**Update frontend API wrappers** (`src/api/donorMatch.api.ts`, `src/api/payment.api.ts`)
to accept `DonorDonationsQueryParams` / `MyPaymentsQueryParams` and forward them.
**Do not change** the return type shape.

### Guard rails specific to Step 2

- `useTableState` **must not** duplicate URL logic — it composes `useSearchParamsState`.
- `SortableHeader` **must not** know how to set state — it only calls `onSort(field)`.
- Table refactors **must not** introduce new columns. Existing column order stays.
- The `DataTableShell` component already accepts `Column<T>` with `header: ReactNode`
  — pass `<SortableHeader />` there; do **not** extend `DataTableShell`.
- New backend query params use `z.coerce.number()` (same as `adminUsersQuerySchema`) —
  do not hand-roll number parsing.
- All new backend query fields are **optional** with a sensible default —
  backward compatibility with the current mobile/curl clients.

### Verification checklist for Step 2

- [ ] `/explore` lists requests as cards with filter sidebar; filters update the URL.
- [ ] Every table listed above shows sortable column headers that toggle asc/desc and
      reset to page 1 on change.
- [ ] `MyDonationsTable` has a working search bar and status/urgency filters.
- [ ] `PaymentHistoryTable` has a working search bar and status/type filters.
- [ ] All filtering/search is debounced (search) and updates the URL.
- [ ] `pnpm lint && pnpm build` pass **and** `npm run lint:check` passes in `hemacue-backend`.
- [ ] `GET /api/v1/donor-matches/my-donations?status=ACCEPTED&searchTerm=Square` returns filtered data.

---

## 📦 STEP 3 — Dashboard Enhancements (Admin Sidebar ≥6, Patient Chart, New Admin Pages)

### What this step is

1. Add the **backend admin payments list endpoint** — `GET /api/v1/admin/payments`.
2. Add **`/admin/payments`** and **`/admin/analytics`** pages, plus a **static
   `/admin/settings`** page so the admin sidebar has **7 items**.
3. Add a **chart block** to the **patient dashboard** (`/patient`) showing request status
   breakdown + monthly request volume.

### Why this step is needed

- The review requires _“admin sidebar has minimum 6 menu items”_ (currently 4) and
  _“patient dashboard has no chart”_.
- Delivering this after Step 2 means both new admin tables can drop straight into
  `useTableState` — no bespoke state handling needed.

### Detailed implementation

#### 3.1 — Backend: `GET /api/v1/admin/payments`

**`hemacue-backend/src/app/modules/admin/admin.interface.ts`** — add:

```ts
export interface IAdminPaymentsQueryParams {
  page: number;
  limit: number;
  sortBy: "createdAt" | "amount";
  sortOrder: "asc" | "desc";
  status?: PaymentStatus;
  paymentType?: PaymentType;
  searchTerm?: string; // matches paymentID, trxID, user email
}
```

**`hemacue-backend/src/app/modules/admin/admin.validation.ts`** — add
`adminPaymentsQuerySchema` (mirror `adminUsersQuerySchema`, swap enums to
`PaymentStatus` / `PaymentType`).

**`hemacue-backend/src/app/modules/admin/admin.service.ts`** — add:

```ts
const getAllPayments = async (query: IAdminPaymentsQueryParams) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const where: Prisma.PaymentWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentType ? { paymentType: query.paymentType } : {}),
    ...(query.searchTerm
      ? {
          OR: [
            { paymentID: { contains: query.searchTerm, mode: "insensitive" } },
            { trxID: { contains: query.searchTerm, mode: "insensitive" } },
            {
              user: {
                email: { contains: query.searchTerm, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };
  const total = await prisma.payment.count({ where });
  const data = await prisma.payment.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      request: {
        select: {
          id: true,
          patientName: true,
          bloodGroup: true,
          hospitalName: true,
          status: true,
        },
      },
    },
  });
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};
```

Add `getAllPayments` to the exported `AdminService`.

**`hemacue-backend/src/app/modules/admin/admin.controller.ts`** — add
`getAllPayments` controller using the same `sendResponse` + `catchAsync` pattern as
`getAllUsers`.

**`hemacue-backend/src/app/modules/admin/admin.route.ts`** — add:

```ts
router.get(
  "/payments",
  auth(UserRole.ADMIN),
  validateRequest({ query: AdminValidation.adminPaymentsQuerySchema }),
  AdminController.getAllPayments,
);
```

#### 3.2 — Frontend: new admin API + hooks

**`src/api/admin.api.ts`** — add:

```ts
payments: (p: AdminPaymentsQueryParams = {}) =>
  apiClient<ApiResponse<PaymentWithRequest[]>>("/admin/payments", { method: "GET", query: p }),
```

Add `AdminPaymentsQueryParams` to `src/types/admin.type.ts` (re-use the backend shape).

**`src/hooks/admin.hook.ts`** — add:

```ts
export function useAdminPayments(params: AdminPaymentsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payments(params),
    queryFn: () => adminApi.payments(params),
    placeholderData: (prev) => prev,
  });
}
```

**`src/lib/query-keys.ts`** — add under `admin`: `payments: (p?) => ["admin", "payments", p] as const`.

#### 3.3 — New admin pages

**`src/app/(dashboard)/admin/payments/page.tsx`** — Server Component with `<PageHeading />` + `AdminPaymentsTable` client component.

**`src/components/modules/admin/payments-table.tsx`** — mirrors `audit-logs-table.tsx`:

- `useTableState({ sortFields: ["createdAt","amount"], filterKeys: ["status","paymentType"] })`
- Search input → `searchTerm`
- Two `FilterSelect`s for `status` and `paymentType`
- Columns: User (avatar + name/email), Service (`humanizeToken(paymentType)`), Request
  (patient name + blood group badge), Amount (`formatCurrency`), Status
  (`PaymentStatusBadge`), Trx ID (copy button), Date
- Uses `DataTableShell` — **no new table markup**
- Add a `useCopyToClipboard` hook in `src/hooks/use-copy-to-clipboard.ts` and refactor
  the existing inline copy logic in `payment-history-table.tsx` to use it (**DRY**).

**`src/app/(dashboard)/admin/analytics/page.tsx`** — Server Component.

**`src/components/modules/admin/analytics.tsx`** — client component:

- Uses `useDashboardStats()` (already exists)
- Renders `UsersChart` and `RequestsChart` (already exist as dynamic imports)
  **plus** two new charts (created with Recharts, same dynamic-import pattern):
  - `RevenueChart` — monthly revenue (aggregate `dashboardStats.payments.totalRevenue`
    distributed across last 6 months is impossible from a single number; so instead
    chart `paymentsByType` by calling `useAdminPayments({ limit: 100 })` and bucketing
    by `paymentType` + month client-side)
  - `DonationsChart` — completed donations over time (same technique: bucket
    `useAdminPayments` by week)
- All charts are `next/dynamic({ ssr: false, loading: () => <ChartSkeleton /> })` —
  copy the pattern from `overview.tsx`.

**`src/app/(dashboard)/admin/settings/page.tsx`** — static Server Component listing
platform constants (cooldown days, pricing, rate limits) read from `src/lib/constants.ts`.
This is genuinely useful — no fake data.

**`src/routes/admin.routes.ts`** — add 3 items:

```ts
{ title: "Payments", url: "/admin/payments", icon: CreditCard },
{ title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
{ title: "Settings", url: "/admin/settings", icon: Settings },
```

#### 3.4 — Patient dashboard chart

**`src/components/modules/blood-requests/patient-requests-overview.tsx`** (new):

- Uses `useMyBloodRequests()` — returns every request the patient has posted (already
  supports pagination; request `limit: 100` for the chart).
- Renders **`<ChartCard title="Requests by status">`** with a `PieChart` (re-use
  `src/components/modules/admin/users-chart.tsx` structure but chart statuses instead of
  roles — extract a shared `<DonutChart data={[…]} colors={[…]} />` in
  `src/components/shared/donut-chart.tsx` **before** writing this, and refactor
  `users-chart.tsx` to use it — **DRY**).
- Renders **`<ChartCard title="Requests per month">`** with a `BarChart` (re-use
  `src/components/modules/admin/requests-chart.tsx` structure — extract a shared
  `<BarMetricChart />` in `src/components/shared/bar-metric-chart.tsx` and refactor
  `requests-chart.tsx` to use it — **DRY**).
- Both charts are `next/dynamic` loaded.

**`src/app/(dashboard)/patient/page.tsx`** — insert
`<PatientRequestsOverview />` **above** `<MyRequestsTable />` inside a `<Suspense>`.
Do not remove `MyRequestsTable`.

### Guard rails specific to Step 3

- The **new backend endpoint is additive** — `GET /admin/payments` is new, nothing
  existing changes. `AdminService.getAllPayments` is a new export.
- Do **not** modify `PaymentService.getMyPayments` in this step (that was Step 2).
- Chart extraction (`DonutChart`, `BarMetricChart`) **must happen first** inside
  `src/components/shared/`, then refactor the two existing admin charts to use them.
  Otherwise Step 3 will introduce duplicate chart code — a DRY violation.
- `settings/page.tsx` renders **real platform constants** — no fabricated content.
- Do not add menu items without a real page.

### Verification checklist for Step 3

- [ ] Admin sidebar shows **7 items** and each navigates to a working page.
- [ ] `GET /api/v1/admin/payments` returns paginated payments with `user` and `request`.
- [ ] `AdminPaymentsTable` filters by status/type, searches by trxID/email, sorts by date/amount.
- [ ] Patient dashboard shows a status donut + monthly bar chart with real data.
- [ ] `pnpm lint && pnpm build` pass, backend `lint:check` passes.
- [ ] Existing admin overview (`/admin`) still shows its two charts unchanged (refactor must be behaviour-preserving).

---

## 📦 STEP 4 — AI Features (≥2)

### What this step is

1. **AI-powered search suggestions** — a fuzzy, category-aware autocomplete dropdown
   that powers every `SearchInput` in the app.
2. **AI-assisted dashboard insights** — natural-language insight cards generated from
   dashboard data, rendered on admin / patient / donor dashboards.
3. _(Bonus)_ **Dynamic hero** — the home hero swaps its headline + CTA based on the
   logged-in user's role and recent activity.

### Why this step is needed

- The review explicitly requires **minimum 2 AI features**.
- All three are **rule-based** (deterministic, testable, no external API cost, no
  OpenAI key required) — but architecturally they sit behind a single
  `aiService` module so that swapping in a real LLM later is a one-file change.

### Detailed implementation

#### 4.1 — AI search suggestions

**`src/lib/ai/suggestions.ts`** (new folder `src/lib/ai/` for all AI logic):

```ts
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
  bloodGroups: string[]; // e.g. ["A+","A-",…] derived from BLOOD_GROUP_OPTIONS
  patients: string[]; // from the loaded table rows
  trxIds: string[]; // from payments
}
```

**Scoring algorithm (deterministic — document it in the file header):**

```
score(text, query):
  if text.toLowerCase().startsWith(query) → 100
  else if any word starts with query        → 60
  else if text.toLowerCase().includes(query) → 30
  else if levenshtein(text, query) <= 2     → 10
  else                                       → 0
```

`levenshtein(a, b)` is a ~20-line classic DP function; place it **once** in
`src/lib/ai/levenshtein.ts`.

**`src/hooks/use-ai-suggestions.ts`:**

```ts
export function useAiSuggestions(
  query: string,
  index: SuggestionIndex,
  limit = 6,
): Suggestion[] { … }
```

- Memoize the flattened index (all categories concatenated with their category tag)
  with `useMemo` keyed on `index`.
- Filter + score + sort + slice. Debounce is **already handled** by the caller’s
  `SearchInput` (Step 2) — do not add a second debounce.

**`src/components/shared/ai-search-input.tsx`:**

- Wraps the existing `SearchInput` — **do not modify** `SearchInput`.
- Renders the suggestion dropdown **in a Popover** (Base UI Popover — but the project
  only ships Dropdown; **reuse `DropdownMenu`** with the `SearchInput` as the
  `DropdownMenuTrigger`… see guard rail below).
- Each suggestion shows: category icon (`MapPin` for district, `Hospital` for hospital,
  `Droplet` for blood group), text with the query **bolded**, and category label.
- Selecting a suggestion calls `onChange(suggestion.text)` and closes the popover.

> **Guard rail (crucial):** Base UI `DropdownMenu` opens on trigger _click_, not on
> typing. For a real autocomplete UX, use `DropdownMenu` **with `open` controlled by
> `query.length >= 2 && suggestions.length > 0`** and put the `SearchInput` **inside**
> the `DropdownMenuContent` as a custom anchor. If this proves fragile during
> implementation, fall back to an absolutely-positioned `<div role="listbox">` — the
> accessible fallback is fine; **do not** introduce `@headlessui/react` (not in
> `package.json`).

**Wire up** — replace `SearchInput` with `AiSearchInput` inside:

- `admin/users-table.tsx` (index from current page’s users + districts + blood groups)
- `admin/payments-table.tsx` (index from current page’s payments + trxIDs + patients)
- `donors/my-donations-table.tsx` (index from current page’s donations)
- `payments/payment-history-table.tsx` (index from current page’s payments)

Keep `SearchInput` as the internal building block — **one** search-input
implementation.

**`src/lib/ai/suggestion-index.ts`** — helper `buildSuggestionIndex({ users?, payments?, requests?, donations? })` returning the `SuggestionIndex` from whatever rows are on screen. Each table calls it with its own data — no duplication.

#### 4.2 — AI dashboard insights

**`src/lib/ai/insights.ts`** (new file):

```ts
export type InsightTone = "positive" | "warning" | "info";
export interface Insight {
  id: string; // stable — used as React key
  tone: InsightTone;
  title: string;
  description: string;
  action?: { label: string; href: string };
}
```

**Three generators (one per role — single source of truth):**

```ts
export function generateAdminInsights(stats: DashboardStats): Insight[];
export function generatePatientInsights(requests: BloodRequest[]): Insight[];
export function generateDonorInsights(
  donations: MyDonation[],
  cooldown: CooldownState,
): Insight[];
```

Each generator returns **2–4 insights** using **templated strings** driven by real
data. Examples of rules to implement:

**Admin:**

- `stats.bloodRequestsByStatus.PENDING > 0` → _"N requests are awaiting verification."_ + action to `/admin/blood-requests`.
- `stats.payments.totalRevenue > 0` → _"৳X revenue from N completed payments this period."_
- `stats.usersByRole.DONOR === 0` → _"No donors registered yet — invite donors."_ (warning)
- `stats.totalCompletedDonations > 0` → _"N donations completed — highest-impact month yet."_ (positive)

**Patient:**

- Any request `status === "PENDING"` for >24 h → _"Your request for X has been pending for >24 h — an admin is reviewing it."_
- Any request `isPremiumNotificationPaid === false` → _"Boost this request with premium notification to reach more donors."_ + action to request detail.
- `completedCount > 0` → _"You have completed N blood request(s)."_

**Donor:**

- Cooldown active → _"You can donate again in N days."_
- `donations.filter(d => d.status === "NOTIFIED").length > 0` → _"You have N pending donation invitations."_ + action to `/donor`.
- `acceptedCount > 0` → _"You've accepted N donation(s) — thank you."_

**`src/components/shared/ai-insight-list.tsx`:**
Renders a stacked list of `<Card>`s with tone-mapped icon + colour (`positive` → emerald,
`warning` → amber, `info` → sky). Actions use `<Button render={<Link href />}>`.
**No new card style** — reuse `Card`/`CardContent`/`Button`.

**Wire up:**

- `admin/overview.tsx` → add `<AiInsightList insights={generateAdminInsights(stats)} />` after the stat cards.
- `donors/overview.tsx` → add `<AiInsightList insights={generateDonorInsights(donations, cooldown)} />`.
- `patient/page.tsx` → add `<AiInsightList insights={generatePatientInsights(requests)} />` below the new chart.

Insights are computed client-side from data **already in the query cache** — no new
API calls.

#### 4.3 — Dynamic hero (bonus AI feature)

**`src/components/modules/homepage/hero-slice.ts`** (new file in AI folder):

```ts
export interface HeroContent {
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: { label: string; href: string };
}
export function personalizeHero(
  user: UserProfile | null,
  cooldown: CooldownState | null,
): HeroContent;
```

Rules (pure function, no React import):

- **Anonymous** → default hero (“Every Drop Counts…”).
- **Donor, cooldown active** → _“You've saved a life. Rest for N more days.”_ CTA → `/donor`.
- **Donor, eligible** → _“You're eligible to donate today. N requests need your blood type.”_ CTA → `/donor/requests`. (This needs a count — pass it in as `availableRequestCount: number` from the caller; use `useBloodRequests({ bloodGroups, limit: 1 }).data?.meta?.total`.)
- **Patient, has pending request** → _“N patients are waiting for donors. Track your request.”_ CTA → `/patient`.
- **Patient, no request** → _“Need blood? Post a request and reach verified donors.”_ CTA → `/patient/new`.

In `Hero.tsx`, call `personalizeHero` and use the returned strings for the **first
carousel slide** only. Slides 2–3 remain generic — this preserves Step 1’s carousel
while adding personalization. Hero remains a Server Component; the personalization
input comes from a new **client** wrapper `<PersonalizedHeroProvider>` that reads
`useGetMe()` and passes the result down as props via a client boundary.

> **Simpler alternative** (recommended for lower-grade LLMs): make `Hero.tsx` a client
> component in this step, keep the same markup, and call `useGetMe()` directly. The
> only cost is losing Server Component benefits for the hero — acceptable trade-off to
> avoid a complex client/server split.

### Guard rails specific to Step 4

- All AI logic lives in `src/lib/ai/`. **No AI logic in components or hooks** — hooks
  only adapt the pure functions.
- `generate*Insights` functions are **pure** — they must be unit-testable with plain
  objects. No `new Date()` inside; callers pass `Date.now()` if needed.
- Do **not** call an external LLM. The `src/lib/ai/` folder documents at the top of each
  file: _“Deterministic implementation. Swap for an LLM call by replacing the returned
  `Insight[]` / `HeroContent` / `Suggestion[]` — the rest of the app is unchanged.”_
- Suggestions must never fabricate rows — only rank **existing** items from the
  `SuggestionIndex`.
- One `levenshtein` implementation, one `buildSuggestionIndex`, one `personalizeHero`.
  If any of these would appear in two files, stop and extract.

### Verification checklist for Step 4

- [ ] Typing ≥2 chars in any table search shows a dropdown of category-tagged suggestions.
- [ ] Selecting a suggestion fills the search box and triggers the same filter as typing.
- [ ] Admin, patient, and donor dashboards each render ≥2 insight cards with real data.
- [ ] Hero on `/` swaps headline + CTA for a logged-in donor / patient / anonymous visitor.
- [ ] `pnpm lint && pnpm build` pass. No new `any`.
- [ ] `grep -r "from \"openai\"" src/` returns nothing — we are self-contained.

---

## 📦 STEP 5 — Polish, DRY Audit, Type-Safety Audit, Documentation

### What this step is

1. **Full DRY audit** across all files touched in Steps 1–4.
2. **Full type-safety audit** — zero `any`, zero leaked `unknown`.
3. **Backend consistency audit** — every new query param has validation + is documented.
4. **Update `README.md`** and add a **`docs/upgrade-notes.md`** summarising the new
   routes, endpoints, and AI modules.
5. **Final `pnpm build` + full manual smoke test** of every upgraded flow.

### Why this step is needed

- The review process penalises duplicated UI code and untyped data. Steps 1–4 add a lot
  of new surface; a final pass guarantees the codebase remains a good teaching artifact
  (which is what the assignment grades on).
- Updating docs is a **5% deployment + code-quality** grading item.

### Detailed implementation

#### 5.1 — DRY audit checklist

Run these greps; if any returns a **new** hit, refactor before finishing:

```bash
# 1. Any duplicated formatCurrency / formatDate?
grep -rn "new Intl.NumberFormat" src/ | grep -v "src/lib/format.ts"
grep -rn "new Intl.DateTimeFormat" src/ | grep -v "src/lib/format.ts"

# 2. Any duplicated card-grid markup?
grep -rn "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" src/ | grep -v "listing-grid"

# 3. Any duplicated sort-toggle button?
grep -rn "ArrowUpDown\|ArrowUp \|ArrowDown" src/components/ | grep -v "sortable-header"

# 4. Any second toast manager?
grep -rn "createToastManager" src/ | grep -v "src/components/ui/toast"

# 5. Any API base URL literal (other than apiClient / publicApi)?
grep -rn "localhost:5000\|NEXT_PUBLIC_API_BASE_URL" src/ | grep -v "src/lib/apiClient\|src/api/public.api\|src/service/refreshToken"

# 6. Any `as any`
grep -rn "as any\|: any" src/
```

Expected: **zero** output for 1–3, **zero** for 6.

#### 5.2 — Type-safety audit checklist

- Run `npx tsc --noEmit` in both `hemacue-frontend` and `hemacue-backend`; fix every
  error.
- Enable `@typescript-eslint/no-explicit-any` (or Biome equivalent) if not already
  enabled; the project uses Biome — add `noExplicitAny: "error"` to
  `biome.json > linter.rules.suspicious` **in both repos**. If that surfaces existing
  violations unrelated to Steps 1–4, downgrade to `"warn"` and open a follow-up ticket —
  never silently leave it at `"off"`.
- Replace any `Record<string, unknown>` that is **consumed** by app code with a typed
  interface. `Record<string, unknown>` **is allowed** at API call boundaries.

#### 5.3 — Backend consistency audit

- Every new route has a matching `validateRequest({ query: … })` block.
- Every new service function is exported via the service object.
- Every new Prisma query returns `{ meta, data }` for list endpoints.
- Every new query param appears in `admin.interface.ts` / `payment.interface.ts` /
  `donorMatch.interface.ts` (whichever owns it).
- `prisma/schema` files are unchanged in this upgrade (no migrations required — Steps
  1–4 added zero schema fields). If you _did_ add a field mid-way, run
  `npx prisma migrate dev --name <name>` and commit the SQL.

#### 5.4 — Documentation

**`docs/upgrade-notes.md`** (new):

- List new routes: `/explore`, `/blood-requests/[id]`, `/admin/payments`,
  `/admin/analytics`, `/admin/settings`.
- List new backend endpoint: `GET /admin/payments`.
- List new AI modules: `src/lib/ai/{suggestions,insights,hero-slice,levenshtein,suggestion-index}.ts`.
- List new shared components: `ListingCard`, `SortableHeader`, `TableToolbar`,
  `ListingGrid`, `DonutChart`, `BarMetricChart`, `AiSearchInput`, `AiInsightList`.
- List new hooks: `useTableState`, `useAiSuggestions`, `useAdminPayments`,
  `useCopyToClipboard`.
- One paragraph on _“how to swap in a real LLM”_ referencing the pure-function
  interfaces in `src/lib/ai/`.

**`README.md`** — update the “Key Features” section with:

- Home page (10+ sections, carousel hero)
- Public Explore page
- AI search suggestions + AI insights
- New admin pages

Do **not** delete existing README content — append.

#### 5.5 — Final manual smoke test

Run through this list **once** with `pnpm dev` + `npm run dev` (backend):

1. `/` → hero carousel advances, all 10 sections visible, featured requests render.
2. `/explore` → filters update URL, cards render, clicking a card → `/blood-requests/[id]`.
3. Login as patient → `/patient` shows chart + insights + requests table with search/filter/sort.
4. Login as donor → `/donor` shows insights; `my-donations` has search/filter/sort.
5. Login as admin → sidebar shows 7 items; `/admin/payments` filters/sorts;
   `/admin/analytics` renders 4 charts; `/admin/settings` renders constants.
6. Type into every search bar → AI suggestions dropdown appears and populates.
7. Home hero personalised for logged-in donor / patient / anonymous.
8. `pnpm build` (frontend) + `npm run lint:check` (backend) both pass.

### Guard rails specific to Step 5

- **No new features** in Step 5 — only refactors, docs, and fixes.
- Every refactor is behaviour-preserving. If a refactor changes a rendered pixel,
  revert it and reconsider.
- Biome config changes are **additive** (`noExplicitAny: "error"`). Do not change
  formatter rules — that would produce a mass diff.

### Verification checklist for Step 5

- [ ] `grep -rn ": any\|as any" src/` → **0 hits**.
- [ ] `npx tsc --noEmit` → **0 errors** in both repos.
- [ ] `pnpm build` → **success**.
- [ ] `npm run lint:check` in backend → **success**.
- [ ] `docs/upgrade-notes.md` exists and lists every new file.
- [ ] All 8 smoke-test flows pass.

---

## 🔁 Rollback strategy (if any step fails to merge)

Each step is **additive**:

- **Step 1** — revert by removing the 5 new section files and restoring the old
  `Hero.tsx` + `page.tsx`. `ListingCard` can stay (unused) with no impact.
- **Step 2** — revert by removing `use-table-state.ts`, `sortable-header.tsx`,
  `table-toolbar.tsx`, `listing-grid.tsx`, `/explore` route, and undoing the per-table
  refactors. Backend query params are optional — existing clients unaffected.
- **Step 3** — revert by removing `/admin/payments`, `/admin/analytics`,
  `/admin/settings` and the `GET /admin/payments` route. Sidebar entries are additive.
- **Step 4** — revert by removing `src/lib/ai/`, `AiSearchInput`, `AiInsightList`, and
  restoring the standard `SearchInput` / non-personalised hero.
- **Step 5** — pure docs/audits; nothing to revert.

Because **nothing renames** an existing export and **nothing removes** an existing
route or column, reverting a _later_ step never breaks an _earlier_ step.

---

## 📋 Final acceptance table (map to the review)

| Review item                          | Delivered by                                        |
| ------------------------------------ | --------------------------------------------------- |
| 10+ home sections                    | Step 1.3/1.4 (10 sections)                          |
| Hero 60–70 vh                        | Step 1.2                                            |
| Hero carousel                        | Step 1.2                                            |
| Hero animation                       | Step 1.2 (`tw-animate-css` + auto-advance)          |
| Card listing (image + meta + action) | Step 1.1 `ListingCard`, used in Step 1.3 + Step 2.3 |
| Public Explore page                  | Step 2.3                                            |
| Sorting on all tables                | Step 2.4 (every table + `SortableHeader`)           |
| Filtering on all tables              | Step 2.4 (`useTableState` + `FilterSelect`)         |
| Search on all tables                 | Step 2.4 (`SearchInput` + AI suggestions in Step 4) |
| Admin sidebar ≥6 items               | Step 3.3 (7 items)                                  |
| Patient dashboard chart              | Step 3.4                                            |
| AI feature #1 (search suggestions)   | Step 4.1                                            |
| AI feature #2 (dashboard insights)   | Step 4.2                                            |
| AI feature #3 (dynamic hero, bonus)  | Step 4.3                                            |
| DRY / no `any` / no redundancy       | Global G1–G3 + Step 5 audits                        |

```

---

### TL;DR for your lower-grade LLM workers

Feed them **one step at a time** in order. Each step is additive, compiles, and passes its own verification checklist before the next step starts. The **Guard Rails** at the top and per-step are non-negotiable — they're what prevents the DRY / `any` regressions you specifically asked to avoid.
```
