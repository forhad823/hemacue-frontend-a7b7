# Sample Front-End Project Structure for inspiration (not for copy paste)

A detailed overview of the folder structure for this Next.js front-end application — a role-based healthcare platform (patients, doctors, admins) with authentication, appointment booking, and doctor schedule management.

---

## Table of Contents

- [Overview](#overview)
- [Full Folder Structure](#full-folder-structure)
- [Root Level Files](#root-level-files)
- [Public Assets](#public-assets)
- [Source Directory (`src/`)](#source-directory-src)
  - [`src/api/`](#srcapi)
  - [`src/app/`](#srcapp)
  - [`src/assets/`](#srcassets)
  - [`src/components/`](#srccomponents)
  - [`src/hooks/`](#srchooks)
  - [`src/lib/`](#srclib)
  - [`src/providers/`](#srcproviders)
  - [`src/routes/`](#srcroutes)
  - [`src/types/`](#srctypes)
  - [`src/utils/`](#srcutils)
  - [`src/validation/`](#srcvalidation)
- [Architectural Notes](#architectural-notes)

---

## Overview

This project is a **Next.js (App Router)** application organized in a **feature-based / domain-driven** manner. It supports three primary user roles — **Admin**, **Doctor**, and **Patient** — each with its own dashboard section, plus a public marketing and authentication area.

The codebase follows these conventions:

- **Route groups** to separate authenticated (`dashboard`) and public (`public`) layouts without affecting URLs.
- **Role-based route segmentation** inside the dashboard.
- **Colocated modules** for features (doctor approval, schedules, bookings, appointments).
- **Typed API layer** with matching hooks, types, and validation schemas.
- **shadcn/ui** primitives under `components/ui/`.

---

## Full Folder Structure

```text
.
│   .env
│   .gitignore
│   AGENTS.md
│   biome.json
│   CLAUDE.md
│   components.json
│   next-env.d.ts
│   next.config.ts
│   package.json
│   pnpm-lock.yaml
│   postcss.config.mjs
│   README.md
│   tsconfig.json
│
├───public
│       file.svg
│       globe.svg
│       login.jpg
│       logo.svg
│       next.svg
│       register.jpg
│       vercel.svg
│       window.svg
│
└───src
    ├───api
    │       appointment.api.ts
    │       auth.api.ts
    │       doctor.api.ts
    │       index.ts
    │       schedule.api.ts
    │
    ├───app
    │   │   favicon.ico
    │   │   globals.css
    │   │   layout.tsx
    │   │
    │   ├───(dashboard)
    │   │   │   layout.tsx
    │   │   │
    │   │   ├───admin
    │   │   │   │   layout.tsx
    │   │   │   │   page.tsx
    │   │   │   │
    │   │   │   └───approve-doctor
    │   │   │           page.tsx
    │   │   │
    │   │   ├───dashboard
    │   │   │   │   layout.tsx
    │   │   │   │   page.tsx
    │   │   │   │
    │   │   │   └───my-appointments
    │   │   │           page.tsx
    │   │   │
    │   │   └───doctor
    │   │       │   layout.tsx
    │   │       │   page.tsx
    │   │       │
    │   │       └───schedules
    │   │               page.tsx
    │   │
    │   └───(public)
    │       ├───(authentication)
    │       │   ├───apply
    │       │   │   │   page.tsx
    │       │   │   │
    │       │   │   └───verify-account
    │       │   │           page.tsx
    │       │   │
    │       │   ├───login
    │       │   │       page.tsx
    │       │   │
    │       │   └───register
    │       │       │   page.tsx
    │       │       │
    │       │       └───verify-account
    │       │               page.tsx
    │       │
    │       └───(marketing)
    │           │   layout.tsx
    │           │   page.tsx
    │           │
    │           ├───about-us
    │           │       page.tsx
    │           │
    │           └───doctors
    │               │   page.tsx
    │               │
    │               └───[id]
    │                       page.tsx
    │
    ├───assets
    │   └───svg
    │           Logo.tsx
    │
    ├───components
    │   ├───auth
    │   │       access-denied.tsx
    │   │       auth-guard.tsx
    │   │       auth-loading.tsx
    │   │       role-guard.tsx
    │   │
    │   ├───dashboard
    │   │       dashboard-shell.tsx
    │   │       dashboard-sidebar.tsx
    │   │
    │   ├───form
    │   │       create-schedule-form.tsx
    │   │       doctor-apply-form.tsx
    │   │       login-form.tsx
    │   │       register-form.tsx
    │   │       verify-account-form.tsx
    │   │
    │   ├───layout
    │   │   └───public
    │   │           Footer.tsx
    │   │           Header.tsx
    │   │
    │   ├───modules
    │   │   ├───doctor-approval
    │   │   │       doctor-approval-table-loading.tsx
    │   │   │       doctor-approval-table.tsx
    │   │   │       doctor-approval-tabs.tsx
    │   │   │       doctor-review-sheet.tsx
    │   │   │
    │   │   ├───doctor-schedule
    │   │   │       schedule-actions.tsx
    │   │   │       schedule-create-dialog.tsx
    │   │   │       schedule-detail-sheet.tsx
    │   │   │       schedule-list-loading.tsx
    │   │   │       schedule-list.tsx
    │   │   │       schedule-table.tsx
    │   │   │
    │   │   ├───doctors
    │   │   │       doctor-booking.tsx
    │   │   │       doctor-list.tsx
    │   │   │
    │   │   ├───google-login
    │   │   │       GoogleLogin.tsx
    │   │   │
    │   │   ├───homepage
    │   │   │       Hero.tsx
    │   │   │
    │   │   └───my-appointments
    │   │           appointment-list.tsx
    │   │
    │   └───ui
    │           button.tsx
    │           calendar.tsx
    │           card.tsx
    │           checkbox.tsx
    │           dialog.tsx
    │           field.tsx
    │           input-otp.tsx
    │           input.tsx
    │           label.tsx
    │           pagination.tsx
    │           popover.tsx
    │           separator.tsx
    │           sheet.tsx
    │           sidebar.tsx
    │           skeleton.tsx
    │           spinner.tsx
    │           table-pagination.tsx
    │           table.tsx
    │           tabs.tsx
    │           textarea.tsx
    │           toast.tsx
    │           tooltip.tsx
    │
    ├───hooks
    │       appointment.hook.ts
    │       auth.hook.ts
    │       debounce.hook.ts
    │       doctor.hook.ts
    │       index.ts
    │       schedule.hook.ts
    │       use-mobile.ts
    │
    ├───lib
    │       apiClient.ts
    │       utils.ts
    │
    ├───providers
    │       google-auth.provider.tsx
    │       index.tsx
    │       query.provider.tsx
    │
    ├───routes
    │       admin.routes.ts
    │       doctor.routes.ts
    │       index.ts
    │       patient.routes.ts
    │
    ├───types
    │       api.type.ts
    │       appointment.type.ts
    │       auth.type.ts
    │       doctor.type.ts
    │       index.ts
    │       schedule.type.ts
    │       sidebar.type.ts
    │       user.type.ts
    │
    ├───utils
    │       file-size.util.ts
    │       index.ts
    │
    └───validation
            auth.validation.ts
            doctor-application.validation.ts
            index.ts
            schedule.validation.ts
```

---

## Root Level Files

| File                 | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `.env`         | Local environment variables (API URLs, secrets, OAuth keys).  |
| `.gitignore`         | Files and folders excluded from Git.                          |
| `AGENTS.md`          | Instructions/documentation for AI agents working on the repo. |
| `biome.json`         | Biome configuration for linting and formatting.               |
| `CLAUDE.md`          | Guidance file for AI assistants (e.g., Claude).               |
| `components.json`    | shadcn/ui configuration (aliases, style, Tailwind config).    |
| `next-env.d.ts`      | Auto-generated Next.js TypeScript declarations.               |
| `next.config.ts`     | Next.js runtime and build configuration.                      |
| `package.json`       | Project metadata, dependencies, and scripts.                  |
| `pnpm-lock.yaml`     | Deterministic dependency lockfile for pnpm.                   |
| `postcss.config.mjs` | PostCSS setup (Tailwind, autoprefixer).                       |
| `README.md`          | Project documentation (this file).                            |
| `tsconfig.json`      | TypeScript compiler configuration and path aliases.           |

---

## Public Assets

The `public/` directory contains static files served from the root URL:

| File                                                            | Purpose                             |
| --------------------------------------------------------------- | ----------------------------------- |
| `logo.svg`                                                      | Brand logo.                         |
| `login.jpg` / `register.jpg`                                    | Illustration assets for auth pages. |
| `globe.svg`, `file.svg`, `window.svg`, `next.svg`, `vercel.svg` | Default/boilerplate SVG assets.     |

---

## Source Directory (`src/`)

All application code lives under `src/`.

### `src/api/`

The **API layer** — thin wrappers around backend endpoints, usually consumed by hooks in `src/hooks/`.

| File                 | Responsibility                                             |
| -------------------- | ---------------------------------------------------------- |
| `auth.api.ts`        | Login, register, verify account, refresh token, logout etc |
| `doctor.api.ts`      | Doctor listing, profile, approval-related requests etc     |
| `appointment.api.ts` | Booking, listing, and managing appointments etc            |
| `schedule.api.ts`    | Create/update/delete doctor schedules etc                  |
| `index.ts`           | Barrel export for all API modules. etc                     |

### `src/app/`

The **Next.js App Router** directory. Uses **route groups** to apply distinct layouts without affecting URL paths.

#### Root

| File          | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `layout.tsx`  | Root layout (providers, global styles, fonts). |
| `globals.css` | Global Tailwind/CSS styles.                    |
| `favicon.ico` | Site favicon.                                  |

#### `(dashboard)/`

Authenticated area. All routes here share a common dashboard layout.

- `layout.tsx` — Dashboard shell wrapper (sidebar + content).
- `admin/`
  - `page.tsx` — Admin dashboard home.
  - `approve-doctor/page.tsx` — Review and approve doctor applications.
- `dashboard/`
  - `page.tsx` — Patient dashboard home.
  - `my-appointments/page.tsx` — Patient's appointment history.
- `doctor/`
  - `page.tsx` — Doctor dashboard home.
  - `schedules/page.tsx` — Manage the doctor's availability.

#### `(public)/`

Public-facing area split into authentication and marketing.

- `(authentication)/`
  - `login/page.tsx` — Login page.
  - `register/page.tsx` — Patient registration.
    - `verify-account/page.tsx` — Registration verification (OTP).
  - `apply/page.tsx` — Doctor application.
    - `verify-account/page.tsx` — Application verification.
- `(marketing)/`
  - `layout.tsx` — Marketing layout (Header + Footer).
  - `page.tsx` — Landing page.
  - `about-us/page.tsx` — About page.
  - `doctors/page.tsx` — Browse doctors.
  - `doctors/[id]/page.tsx` — Doctor detail / booking page (dynamic route).

### `src/assets/`

Non-static assets used inside components.

- `svg/Logo.tsx` — React SVG logo component (themeable/inline).

### `src/components/`

Reusable UI and feature components, grouped by concern.

| Folder           | Responsibility                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `auth/`          | Route/role guards and auth state UI (`auth-guard`, `role-guard`, `access-denied`, `auth-loading`).                   |
| `dashboard/`     | Dashboard layout pieces (`dashboard-shell`, `dashboard-sidebar`).                                                    |
| `form/`          | Form components (`login-form`, `register-form`, `doctor-apply-form`, `verify-account-form`, `create-schedule-form`). |
| `layout/public/` | Public site chrome — `Header.tsx`, `Footer.tsx`.                                                                     |
| `modules/`       | Feature-scoped composite components (see below).                                                                     |
| `ui/`            | shadcn/ui primitives (button, card, table, dialog, sheet, etc.).                                                     |

**`components/modules/` breakdown:**

| Module             | Purpose                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `doctor-approval/` | Admin UI for reviewing and approving doctor applications (table, tabs, review sheet, loading state). |
| `doctor-schedule/` | Doctor schedule management (list, table, create dialog, detail sheet, actions, loading).             |
| `doctors/`         | Public doctor browsing (`doctor-list`) and booking (`doctor-booking`).                               |
| `my-appointments/` | Patient's appointment list view.                                                                     |
| `google-login/`    | Google OAuth login button.                                                                           |
| `homepage/`        | Landing page sections (e.g., `Hero`).                                                                |

### `src/hooks/`

Custom React hooks wrapping API calls and UI logic, typically using React Query.

| File                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `auth.hook.ts`        | Auth queries/mutations (login, register, session). |
| `doctor.hook.ts`      | Doctor-related queries/mutations.                  |
| `appointment.hook.ts` | Appointment queries/mutations.                     |
| `schedule.hook.ts`    | Doctor schedule queries/mutations.                 |
| `debounce.hook.ts`    | Debounce utility hook (search inputs, etc.).       |
| `use-mobile.ts`       | Responsive helper to detect mobile viewport.       |
| `index.ts`            | Barrel export.                                     |

### `src/lib/`

Shared low-level utilities and configured clients.

| File           | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `apiClient.ts` | Configured HTTP client (base URL, auth headers, interceptors). |
| `utils.ts`     | General helpers (e.g., `cn()` classname merge).                |

### `src/providers/`

React context providers composed at the app root.

| File                       | Purpose                             |
| -------------------------- | ----------------------------------- |
| `query.provider.tsx`       | React Query client provider.        |
| `google-auth.provider.tsx` | Google OAuth context.               |
| `index.tsx`                | Composes and exports all providers. |

### `src/routes/`

Navigation route definitions, grouped by role, used by sidebars and menus.

| File                | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `admin.routes.ts`   | Admin sidebar/menu routes.               |
| `doctor.routes.ts`  | Doctor sidebar/menu routes.              |
| `patient.routes.ts` | Patient sidebar/menu routes.             |
| `index.ts`          | Barrel export + route resolution helper. |

### `src/types/`

Centralized TypeScript type definitions grouped by domain.

| File                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `auth.type.ts`        | Auth-related types (User, Session, Tokens). |
| `user.type.ts`        | User model and role types.                  |
| `doctor.type.ts`      | Doctor profile and application types.       |
| `appointment.type.ts` | Appointment models and statuses.            |
| `schedule.type.ts`    | Doctor schedule/availability types.         |
| `api.type.ts`         | Generic API response/pagination wrappers.   |
| `sidebar.type.ts`     | Sidebar item/navigation types.              |
| `index.ts`            | Barrel export.                              |

### `src/utils/`

Pure, framework-agnostic utility functions.

| File                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `file-size.util.ts` | Format byte sizes into human-readable strings. |
| `index.ts`          | Barrel export.                                 |

### `src/validation/`

Validation schemas (e.g., Zod) shared between forms and API layers.

| File                               | Purpose                          |
| ---------------------------------- | -------------------------------- |
| `auth.validation.ts`               | Login/register/verify schemas.   |
| `doctor-application.validation.ts` | Doctor application form schema.  |
| `schedule.validation.ts`           | Schedule creation/update schema. |
| `index.ts`                         | Barrel export.                   |

---

## Architectural Notes

1. **Route Groups for Layouts** — `(dashboard)` and `(public)` provide distinct root layouts without polluting URLs. Nested groups `(authentication)` and `(marketing)` further isolate concerns within the public area.
2. **Role-Based Dashboard** — `admin`, `doctor`, and `dashboard` (patient) sections live side-by-side under `(dashboard)`, each with its own layout and pages.
3. **Feature Modules** — Complex UI lives in `components/modules/<feature>/`, keeping related tables, dialogs, sheets, and loading states together.
4. **Layered Data Flow** — `api/` (HTTP calls) → `hooks/` (React Query) → `components/` (UI). Types in `types/` and schemas in `validation/` are shared across all three layers.
5. **UI Library** — shadcn/ui primitives are collected in `components/ui/`, configured via `components.json`.
6. **Guards & Access Control** — `auth-guard`, `role-guard`, and `access-denied` enforce authentication and role-based access at layout boundaries.
7. **Static vs. Inline Assets** — Global static files live in `public/`; component-scoped SVGs live in `src/assets/svg/`.
8. **Routes as Data** — Role-specific navigation is defined in `src/routes/` and consumed by the dashboard sidebar for a single source of truth.
