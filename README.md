# 🩸 Hemacue — Emergency Blood Donation & Medical Logistics Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.0-FF4154?style=for-the-badge&logo=reactquery)](https://tanstack.com/query)
[![bKash](https://img.shields.io/badge/bKash-Tokenized_API-E2136E?style=for-the-badge)](https://developer.bka.sh/)
[![Biome](https://img.shields.io/badge/Biome-2.4-60A5FA?style=for-the-badge)](https://biomejs.dev/)

> **Hemacue** is a modern, high-reliability emergency blood donation and medical logistics web platform built with Next.js 15 App Router, TypeScript, and Tailwind CSS. It bridges the critical gap between blood seekers (patients) and eligible donors through smart compatibility matching, real-time medical eligibility cooldown enforcement (90 days), automated workflow state machines, and integrated bKash Tokenized payments for premium logistics and notification services.

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠 Tech Stack & System Architecture](#-tech-stack--system-architecture)
- [📂 Comprehensive Project Structure](#-comprehensive-project-structure)
- [🌐 Backend API & Route Integration Matrix](#-backend-api--route-integration-matrix)
- [🔐 Authentication & Role-Based Security (RBAC)](#-authentication--role-based-security-rbac)
- [💳 bKash Payment & Invoice Workflow](#-bkash-payment--invoice-workflow)
- [🚀 Quick Start & Environment Setup](#-quick-start--environment-setup)
- [🔧 Development Scripts & Quality Control](#-development-scripts--quality-control)
- [📄 Documentation Links](#-documentation-links)

---

## ✨ Key Features

### 🩸 Patient & Blood Requester Workflow

- **Emergency & Standard Requests:** Create detailed blood requests specifying patient name, required blood group, hospital address, district, quantity, urgency, and deadline.
- **Smart Compatible Donor Matching:** Search eligible donors based on medical ABO/Rh blood compatibility rules while strictly excluding donors under the 90-day cooldown period.
- **Donor Assignment:** Directly assign compatible donors to blood requests and track response states (`PENDING`, `ACCEPTED`, `DECLINED`).
- **Guarded State Machine Lifecycle:** Track request progression through guarded statuses: <br/>
  PENDING > VERIFIED > DONOR_ASSIGNED > IN_PROGRESS > COMPLETED
- **bKash Logistics & Boosting:** Trigger bKash payments for premium SMS notification blasts and emergency courier logistics.

### 💖 Donor Portal

- **Available Requests Feed:** Browse active blood requests matching donor blood group and district location.
- **Match Response Actions:** One-click `ACCEPT` or `DECLINE` match assignments.
- **Donation History & Analytics:** Interactive charts tracking total donations, saved lives, and countdown timers until the next eligible donation date.
- **Profile & Availability Management:** Update profile details, upload avatar images to Cloudinary, and toggle donor availability status (`isAvailable`).

### 🛡 Admin Moderation & Audit Dashboard

- **Platform Analytics:** Real-time metrics on registered users, active blood requests, successful donations, and total BDT revenue.
- **User Management & RBAC:** Search and filter users by role (`DONOR`, `PATIENT`, `ADMIN`) or blood group, promote roles, and block/unblock accounts.
- **Blood Request Moderation & Refunds:** Moderate blood requests, reassign donors, soft-delete entries, and issue bKash transaction refunds.
- **System Audit Trails:** Paginated log inspection tool for tracking system actions, user updates, and administrative overrides.

---

## 🛠 Tech Stack & System Architecture

- **Framework:** Next.js 15 (App Router, Server Components, Route Handlers, ISR Revalidation)
- **Language:** TypeScript (Strict type safety across API contracts and component props)
- **State Management & Data Fetching:** TanStack Query v5 (React Query) for optimistic updates, automatic background refetching, and Query Cache key management
- **Styling & UI Primitives:** Tailwind CSS, Shadcn UI, Radix UI primitives, Lucide React icons, Framer Motion animations
- **Forms & Validation:** React Hook Form, Zod schema validation
- **Authentication:** JWT (HTTP-Only Cookies & Bearer Tokens), Google OAuth 2.0 Integration
- **Storage & Integrations:** Cloudinary (Avatar image uploads), bKash Tokenized Checkout API v1.2, Nodemailer (OTP emails & invoice attachments)
- **Formatting & Linting:** Biome.js, ESLint

---

## 📂 Comprehensive Project Structure

Below is the exhaustive directory tree of the Hemacue frontend project:

```bash
hemacue-frontend/
├── public/                             # Static public assets
│
├── src/
│   ├── api/                           # Domain-based API client functions
│   │   ├── admin.api.ts               # Admin users, roles, dashboard stats & audit logs
│   │   ├── auth.api.ts                # Registration, login, OTP, OAuth & password reset
│   │   ├── bloodRequest.api.ts        # Blood request CRUD & status operations
│   │   ├── donorMatch.api.ts          # Donor matching, assignments & donation history
│   │   ├── index.ts                   # Central API exports
│   │   ├── payment.api.ts             # bKash payment operations
│   │   ├── public.api.ts              # Public live statistics API
│   │   └── user.api.ts                # Current user profile & avatar operations
│   │
│   ├── app/                           # Next.js App Router
│   │   ├── (dashboard)/               # Authenticated dashboard route group
│   │   │   ├── admin/                 # Admin dashboard
│   │   │   │   ├── audit-logs/
│   │   │   │   │   └── page.tsx       # Audit logs
│   │   │   │   ├── blood-requests/
│   │   │   │   │   └── page.tsx       # Blood request management
│   │   │   │   ├── manage/
│   │   │   │   │   └── page.tsx       # User management
│   │   │   │   ├── error.tsx          # Admin error boundary
│   │   │   │   ├── layout.tsx         # Admin dashboard layout
│   │   │   │   ├── loading.tsx        # Admin loading UI
│   │   │   │   └── page.tsx           # Admin overview & analytics
│   │   │   │
│   │   │   ├── donor/                 # Donor dashboard
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx       # Donation analytics & history
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx       # Donor profile
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx       # Compatible blood requests
│   │   │   │   ├── error.tsx          # Donor error boundary
│   │   │   │   ├── layout.tsx         # Donor dashboard layout
│   │   │   │   ├── loading.tsx        # Donor loading UI
│   │   │   │   └── page.tsx           # Donor dashboard
│   │   │   │
│   │   │   ├── patient/               # Patient dashboard
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Create blood request
│   │   │   │   ├── payments/
│   │   │   │   │   └── page.tsx       # Payment history
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx       # Patient profile
│   │   │   │   ├── requests/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx    # Blood request details & donor matching
│   │   │   │   ├── error.tsx          # Patient error boundary
│   │   │   │   ├── layout.tsx         # Patient dashboard layout
│   │   │   │   ├── loading.tsx        # Patient loading UI
│   │   │   │   └── page.tsx           # Patient dashboard
│   │   │   │
│   │   │   └── layout.tsx             # Shared dashboard layout
│   │   │
│   │   ├── (public)/                  # Unauthenticated public routes
│   │   │   ├── about/
│   │   │   │   └── page.tsx           # About Hemacue
│   │   │   ├── contact/
│   │   │   │   └── page.tsx           # Contact/support
│   │   │   ├── faq/
│   │   │   │   └── page.tsx           # Frequently asked questions
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx           # Request password-reset OTP
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Login & Google OAuth
│   │   │   ├── register/
│   │   │   │   └── page.tsx           # User registration
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx           # Reset password
│   │   │   ├── services/
│   │   │   │   └── page.tsx           # Services overview
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx           # Email OTP verification
│   │   │   ├── layout.tsx             # Public pages layout
│   │   │   └── page.tsx               # Landing/home page
│   │   │
│   │   ├── api/                       # Next.js Route Handlers
│   │   │   └── auth/
│   │   │       └── session/
│   │   │           └── route.ts       # Auth session/cookie synchronization
│   │   │
│   │   ├── payment/                   # Payment result routes
│   │   │   ├── callback/
│   │   │   │   └── page.tsx           # bKash callback
│   │   │   ├── cancel/
│   │   │   │   └── page.tsx           # Cancelled payment
│   │   │   ├── error.tsx              # Payment error boundary
│   │   │   ├── layout.tsx             # Payment layout
│   │   │   ├── loading.tsx            # Payment loading UI
│   │   │   └── success/
│   │   │       └── page.tsx           # Successful payment & receipt
│   │   │
│   │   ├── favicon.ico                # Application favicon
│   │   ├── global-error.tsx           # Root-level error boundary
│   │   ├── globals.css                # Global styles & Tailwind CSS
│   │   ├── layout.tsx                 # Root layout, metadata & providers
│   │   ├── loading.tsx                # Global loading UI
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── components/                   # Reusable React components
│   │   ├── auth/                      # Authentication guards & states
│   │   │   ├── access-denied.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   ├── auth-loading.tsx
│   │   │   └── role-guard.tsx
│   │   │
│   │   ├── dashboard/                 # Dashboard shell components
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── route-error-fallback.tsx
│   │   │   ├── skeletons.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   ├── layout/                   # Public/global layout components
│   │   │   └── public/
│   │   │       ├── Footer.tsx
│   │   │       ├── Header.tsx
│   │   │       ├── HeaderAuthActions.tsx
│   │   │       ├── HeaderNav.tsx
│   │   │       └── MobileNav.tsx
│   │   │
│   │   ├── modules/                  # Feature-specific UI components
│   │   │   ├── admin/
│   │   │   │   ├── audit-logs-table.tsx
│   │   │   │   ├── blood-requests-table.tsx
│   │   │   │   ├── overview.tsx
│   │   │   │   ├── requests-chart.tsx
│   │   │   │   ├── users-chart.tsx
│   │   │   │   └── users-table.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── demo-login-panel.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── reset-password-form.tsx
│   │   │   │   └── verify-email-form.tsx
│   │   │   │
│   │   │   ├── blood-requests/
│   │   │   │   ├── create-request-wizard.tsx
│   │   │   │   ├── my-requests-table.tsx
│   │   │   │   └── request-detail.tsx
│   │   │   │
│   │   │   ├── contact/
│   │   │   │   └── ContactForm.tsx
│   │   │   │
│   │   │   ├── donors/
│   │   │   │   ├── analytics-charts.tsx
│   │   │   │   ├── my-donations-table.tsx
│   │   │   │   ├── open-requests-table.tsx
│   │   │   │   └── overview.tsx
│   │   │   │
│   │   │   ├── faq/
│   │   │   │   └── FaqAccordion.tsx
│   │   │   │
│   │   │   ├── google-login/
│   │   │   │   └── GoogleLogin.tsx
│   │   │   │
│   │   │   ├── homepage/
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   └── LiveStats.tsx
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── payment-history-table.tsx
│   │   │   │   └── payment-result.tsx
│   │   │   │
│   │   │   └── user/
│   │   │       ├── avatar-dropzone.tsx
│   │   │       └── profile-form.tsx
│   │   │
│   │   ├── shared/                   # Shared application components
│   │   │   ├── blood-group-badge.tsx
│   │   │   ├── chart-card.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── data-table-shell.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── filter-select.tsx
│   │   │   ├── hemacue-logo.tsx
│   │   │   ├── page-heading.tsx
│   │   │   ├── page-hero.tsx
│   │   │   ├── pagination-bar.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── section-heading.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── urgency-badge.tsx
│   │   │   └── utility-page.tsx
│   │   │
│   │   └── ui/                     # Reusable Shadcn/Base UI primitives
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── pagination.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── spinner.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── tooltip.tsx
│   │
│   ├── hooks/                           # TanStack Query & reusable custom hooks
│   │   ├── admin.hook.ts
│   │   ├── auth.hook.ts
│   │   ├── bloodRequest.hook.ts
│   │   ├── donorMatch.hook.ts
│   │   ├── index.ts
│   │   ├── payment.hook.ts
│   │   ├── use-countdown.ts
│   │   ├── use-debounce.ts
│   │   ├── use-mobile.ts
│   │   ├── use-search-params-state.ts
│   │   └── user.hook.ts
│   │
│   ├── lib/                             # Core utilities & application infrastructure
│   │   ├── apiClient.ts                 # ofetch-based API client
│   │   ├── auth-cookies.ts              # Authentication cookie constants/helpers
│   │   ├── blood-compatibility.ts       # Blood compatibility rules
│   │   ├── constants.ts                 # Application constants & enums
│   │   ├── format.ts                    # Formatting helpers
│   │   ├── query-keys.ts                # TanStack Query key factories
│   │   ├── session-client.ts            # Client-side session/token synchronization
│   │   └── utils.ts                     # Shared utility functions
│   ├── providers/                      #React context/application providers
│   │   ├── google-auth.provider.tsx     # Google OAuth provider
│   │   ├── index.tsx                    # Combined providers entry point
│   │   ├── query.provider.tsx           # TanStack Query provider
│   │   └── theme.provider.tsx           # Dark/light theme provider
│   │
│   ├── routes/                         # Dashboard navigation configuration
│   │   ├── admin.routes.ts
│   │   ├── donor.routes.ts
│   │   ├── index.ts
│   │   └── patient.routes.ts
│   │
│   ├── service/                        # Server-side application services
│   │   └── refreshToken.ts             # Refresh-token service
│   │
│   ├── types/                          # TypeScript types & API contracts
│   │   ├── admin.type.ts
│   │   ├── api.type.ts
│   │   ├── auth.type.ts
│   │   ├── blood-request.type.ts
│   │   ├── donor-match.type.ts
│   │   ├── enums.type.ts
│   │   ├── index.ts
│   │   ├── payment.type.ts
│   │   ├── public.type.ts
│   │   ├── sidebar.type.ts
│   │   └── user.type.ts
│   │
│   ├── utils/                          # Small specialized utilities
│   │   └── jwt.ts                      # JWT decoding helpers
│   │
│   ├── validation/                     # Zod validation schemas
│   │   ├── admin.validation.ts
│   │   ├── auth.validation.ts
│   │   ├── blood-request.validation.ts
│   │   ├── contact.validation.ts
│   │   ├── index.ts
│   │   ├── payment.validation.ts
│   │   └── user.validation.ts
│   │
│   └── proxy.ts                       # Proxy/RBAC-related request handling
│
├── API-overview-hemacue-backend.md    # Backend REST API specification/reference
├── biome.json                         # Biome formatter & linter configuration
├── components.json                    # Shadcn UI configuration
├── next-env.d.ts                      # Next.js TypeScript declarations
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies, scripts & package manager
├── postcss.config.mjs                 # PostCSS/Tailwind configuration
├── tailwind.config.ts                 # Tailwind theme/design configuration
├── tsconfig.json                      # TypeScript compiler configuration
└── tsconfig.tsbuildinfo               # TypeScript incremental build information
```

---

## 🌐 Backend API & Route Integration Matrix

For complete technical details on how all 32 backend REST API endpoints map to Next.js routes and React Query hooks, view the [`hemacue-api-map.md`](file://hemacue-api-map.md) specification file.

| Module      | Method   | Endpoint                                  | Frontend Route                         | Hook / API Client                  | Access Level           |
| :---------- | :------- | :---------------------------------------- | :------------------------------------- | :--------------------------------- | :--------------------- |
| **Auth**    | `POST`   | `/api/v1/auth/register`                   | `/register`                            | `useRegistration()`                | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/verify-email`               | `/verify-email`                        | `useVerifyAccount()`               | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/verify-email/resend-otp`    | `/verify-email`                        | `useResendRegisterOtp()`           | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/login`                      | `/login`                               | `useLogin()`                       | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/refresh-token`              | Internal Interceptor                   | `authApi.refreshToken`             | Public / Cookie        |
| **Auth**    | `POST`   | `/api/v1/auth/google-login`               | `/login`, `/register`                  | `useGoogleOAuth()`                 | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/forgot-password`            | `/forgot-password`                     | `useForgotPassword()`              | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/reset-password`             | `/reset-password`                      | `useResetPassword()`               | Public                 |
| **Auth**    | `POST`   | `/api/v1/auth/logout`                     | Global Header / Nav                    | `useLogout()`                      | Authenticated          |
| **User**    | `GET`    | `/api/v1/users/me`                        | Profiles & Dashboards                  | `useMe()`                          | DONOR, PATIENT, ADMIN  |
| **User**    | `PATCH`  | `/api/v1/users/me`                        | `/donor/profile`, `/patient/profile`   | `useUpdateProfile()`               | DONOR, PATIENT, ADMIN  |
| **User**    | `PATCH`  | `/api/v1/users/me/avatar`                 | `/donor/profile`, `/patient/profile`   | `useUploadAvatar()`                | DONOR, PATIENT, ADMIN  |
| **Request** | `POST`   | `/api/v1/blood-requests`                  | `/patient/new`                         | `useCreateBloodRequest()`          | PATIENT, ADMIN         |
| **Request** | `GET`    | `/api/v1/blood-requests`                  | `/`, `/about`, `/admin/blood-requests` | `useBloodRequests()` / `publicApi` | Public / Admin         |
| **Request** | `GET`    | `/api/v1/blood-requests/my-requests`      | `/patient`, `/donor/requests`          | `useMyBloodRequests()`             | PATIENT, DONOR, ADMIN  |
| **Request** | `GET`    | `/api/v1/blood-requests/:id`              | `/patient/requests/[id]`               | `useBloodRequestById()`            | Public / Authenticated |
| **Request** | `PATCH`  | `/api/v1/blood-requests/:id`              | `/patient/requests/[id]`               | `useUpdateBloodRequest()`          | PATIENT, ADMIN         |
| **Request** | `DELETE` | `/api/v1/blood-requests/:id`              | `/patient/requests/[id]`               | `useSoftDeleteBloodRequest()`      | PATIENT, ADMIN         |
| **Donor**   | `GET`    | `/api/v1/donor-matches/compatible-donors` | `/patient/requests/[id]`               | `useCompatibleDonors()`            | PATIENT, ADMIN         |
| **Donor**   | `POST`   | `/api/v1/donor-matches/assign-donor`      | `/patient/requests/[id]`               | `useAssignDonor()`                 | PATIENT, ADMIN         |
| **Donor**   | `POST`   | `/api/v1/blood-requests/:id/respond`      | `/donor/requests`                      | `useRespondBloodRequest()`         | DONOR                  |
| **Donor**   | `PATCH`  | `/api/v1/blood-requests/:id/status`       | `/patient/requests/[id]`               | `useUpdateBloodRequestStatus()`    | PATIENT, ADMIN         |
| **Donor**   | `GET`    | `/api/v1/donor-matches/my-donations`      | `/donor`, `/donor/analytics`           | `useMyDonations()`                 | DONOR                  |
| **Payment** | `POST`   | `/api/v1/payments/initiate`               | `/patient/requests/[id]`               | `useInitiatePayment()`             | PATIENT, ADMIN         |
| **Payment** | `POST`   | `/api/v1/payments/execute`                | `/payment/callback`                    | `useExecutePayment()`              | PATIENT, ADMIN         |
| **Payment** | `POST`   | `/api/v1/payments/refund/:requestId`      | `/admin/manage`                        | `useRefundPayment()`               | ADMIN                  |
| **Payment** | `GET`    | `/api/v1/payments/mine`                   | `/patient/payments`                    | `useMyPayments()`                  | PATIENT, ADMIN         |
| **Payment** | `GET`    | `/api/v1/payments/:id`                    | `/patient/payments`                    | `usePaymentById()`                 | PATIENT, ADMIN         |
| **Admin**   | `GET`    | `/api/v1/admin/users`                     | `/admin/manage`                        | `useAdminUsers()`                  | ADMIN                  |
| **Admin**   | `PATCH`  | `/api/v1/admin/users/:id/role`            | `/admin/manage`                        | `useUpdateUserRole()`              | ADMIN                  |
| **Admin**   | `GET`    | `/api/v1/admin/dashboard-stats`           | `/admin`                               | `useAdminDashboardStats()`         | ADMIN                  |
| **Admin**   | `GET`    | `/api/v1/admin/audit-logs`                | `/admin/audit-logs`                    | `useAdminAuditLogs()`              | ADMIN                  |

---

## 🔐 Authentication & Role-Based Security (RBAC)

1. **HTTP-Only Cookies & Bearer Headers:** Authentication tokens (`accessToken`, `refreshToken`) are stored in secure HTTP-Only cookies to protect against XSS vectors, while also sent via `Authorization: Bearer <token>` headers for REST calls.
2. **Next.js Route Middleware (`middleware.ts`):** Intercepts incoming navigation requests to `/patient/*`, `/donor/*`, and `/admin/*`, ensuring users match required roles.
3. **Automatic Token Rotation:** The Axios interceptor (`src/lib/apiClient.ts`) listens for 401 response codes and transparently fetches a new access token via `/auth/refresh-token` before retrying failed queries.

---

## 💳 bKash Payment & Invoice Workflow

1. **Initiate (`POST /payments/initiate`):** Patients select premium SMS alerts (`PREMIUM_NOTIFICATION`) or courier logistics (`EMERGENCY_LOGISTICS`) on `/patient/requests/[id]`, generating a bKash checkout URL.
2. **bKash Sandbox/Production Checkout:** The user completes PIN/OTP verification on bKash's secure portal.
3. **Execute & Receipt (`POST /payments/execute`):** Upon redirection back to `/payment/callback`, the return token is executed, generating a downloadable PDF invoice and emailing a digital receipt.

---

## 🚀 Quick Start & Environment Setup

### Prerequisites

- **Node.js**: `v18.x` or higher
- **Backend API**: Running instance of Hemacue Backend (default: `http://localhost:5000/api/v1`)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/hemacue-frontend.git
cd hemacue-frontend
npm install
```

### 2. Configure Environment Variables (`.env.local`)

```env
# Backend REST API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Frontend Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Development Scripts & Quality Control

| Command          | Purpose                                                      |
| :--------------- | :----------------------------------------------------------- |
| `npm run dev`    | Starts Next.js development server on `http://localhost:3000` |
| `npm run build`  | Compiles production build and optimizes routes               |
| `npm run start`  | Launches production server                                   |
| `npm run lint`   | Runs Biome & ESLint code quality checks                      |
| `npm run format` | Auto-formats code with Biome                                 |

---

## 📄 Documentation Links

- [Frontend to Backend API Map (`hemacue-api-map.md`)](file:///E:/code%20and%20relavent%20documets/ph%20zankar%20mahbub/level-2-next-level-web-7/mission-6-fullstack/hemacue-frontend-a7b7/hemacue-api-map.md)
- [Hemacue Backend API Overview](file:///E:/code%20and%20relavent%20documets/ph%20zankar%20mahbub/level-2-next-level-web-7/mission-6-fullstack/hemacue-frontend-a7b7/project.txt)
