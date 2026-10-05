# 🗺 Hemacue API Mapping & Integration Specification (`hemacue-api-map.md`)

> **Project:** Hemacue — Emergency Blood Donation & Medical Logistics Platform  
> **Frontend Stack:** Next.js 15 App Router (TypeScript, TanStack Query v5, Axios, Tailwind CSS, Shadcn UI)  
> **Backend API Version:** `v1` (`http://localhost:5000/api/v1`)  
> **Auth Strategy:** Bearer Token Header (`Authorization: Bearer <accessToken>`) + HTTP-Only Session Cookies (`accessToken`, `refreshToken`)

---

## ⚡ At a Glance: Frontend Paths & Backend API Mapping Matrix

The table below provides a complete reference connecting every backend API endpoint to its consuming frontend route, React Query hook, API service method, access control requirement, and UI component.

| # | Backend Module | Method | Backend Endpoint | Frontend Path / Route | API Client Method | Custom React Hook | Access / Role | UI Component & Action |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Auth** | `POST` | `/api/v1/auth/register` | `/register` | `authApi.register` | `useRegistration()` | Public | `RegisterForm` — User account registration |
| 2 | **Auth** | `POST` | `/api/v1/auth/verify-email` | `/verify-email` | `authApi.verifyEmail` | `useVerifyAccount()` | Public | `VerifyEmailForm` — 6-digit OTP email activation |
| 3 | **Auth** | `POST` | `/api/v1/auth/verify-email/resend-otp` | `/verify-email` | `authApi.resendRegisterOtp` | `useResendRegisterOtp()` | Public | `VerifyEmailForm` — Cooldown-protected OTP resend |
| 4 | **Auth** | `POST` | `/api/v1/auth/login` | `/login` | `authApi.login` | `useLogin()` | Public | `LoginForm` — Password authentication |
| 5 | **Auth** | `POST` | `/api/v1/auth/refresh-token` | Internal / `/api/auth/session` | `authApi.refreshToken` | Interceptor / Server Route | Public / Cookie | `apiClient.ts` & `refreshToken.ts` — Auto token rotation |
| 6 | **Auth** | `POST` | `/api/v1/auth/google-login` | `/login`, `/register` | `authApi.googleLogin` | `useGoogleOAuth()` | Public | `GoogleLogin` button — OAuth 2.0 credential sign-in |
| 7 | **Auth** | `POST` | `/api/v1/auth/forgot-password` | `/forgot-password` | `authApi.forgotPassword` | `useForgotPassword()` | Public | `ForgotPasswordForm` — Password reset OTP trigger |
| 8 | **Auth** | `POST` | `/api/v1/auth/reset-password` | `/reset-password` | `authApi.resetPassword` | `useResetPassword()` | Public | `ResetPasswordForm` — Password reset execution |
| 9 | **Auth** | `POST` | `/api/v1/auth/logout` | Top Navbar & Sidebars | `authApi.logout` | `useLogout()` | Authenticated | `DashboardHeader`, `HeaderAuthActions` — Logout & clear state |
| 10 | **User** | `GET` | `/api/v1/users/me` | `/donor/profile`, `/patient/profile`, `/admin` | `userApi.getMe` | `useMe()` | DONOR, PATIENT, ADMIN | `ProfileForm`, `DashboardSidebar` — User profile & menu |
| 11 | **User** | `PATCH` | `/api/v1/users/me` | `/donor/profile`, `/patient/profile` | `userApi.updateMe` | `useUpdateProfile()` | DONOR, PATIENT, ADMIN | `ProfileForm` — Update details & availability switch |
| 12 | **User** | `PATCH` | `/api/v1/users/me/avatar` | `/donor/profile`, `/patient/profile` | `userApi.uploadAvatar` | `useUploadAvatar()` | DONOR, PATIENT, ADMIN | `AvatarDropzone` — Cloudinary image upload |
| 13 | **Blood Request** | `POST` | `/api/v1/blood-requests` | `/patient/new` | `bloodRequestApi.create` | `useCreateBloodRequest()` | PATIENT, ADMIN | `CreateRequestWizard` — Submit blood donation request |
| 14 | **Blood Request** | `GET` | `/api/v1/blood-requests` | `/`, `/about`, `/services`, `/admin/blood-requests` | `bloodRequestApi.list` / `publicApi` | `useBloodRequests()` | Public / Admin | `LiveStats`, `OpenRequestsTable`, `BloodRequestsTable` |
| 15 | **Blood Request** | `GET` | `/api/v1/blood-requests/my-requests` | `/patient`, `/donor/requests` | `bloodRequestApi.myRequests` | `useMyBloodRequests()` | PATIENT, DONOR, ADMIN | `MyRequestsTable` — User's requested blood listings |
| 16 | **Blood Request** | `GET` | `/api/v1/blood-requests/:id` | `/patient/requests/[id]` | `bloodRequestApi.byId` | `useBloodRequestById()` | Public / Authenticated | `RequestDetail` — Full request details page |
| 17 | **Blood Request** | `PATCH` | `/api/v1/blood-requests/:id` | `/patient/requests/[id]`, `/admin/blood-requests` | `bloodRequestApi.update` | `useUpdateBloodRequest()` | PATIENT, ADMIN | `RequestDetail`, `BloodRequestsTable` — Update request |
| 18 | **Blood Request** | `DELETE` | `/api/v1/blood-requests/:id` | `/patient/requests/[id]`, `/admin/blood-requests` | `bloodRequestApi.softDelete` | `useSoftDeleteBloodRequest()` | PATIENT, ADMIN | `RequestDetail`, `BloodRequestsTable` — Delete request |
| 19 | **Donor Match** | `GET` | `/api/v1/donor-matches/compatible-donors` | `/patient/requests/[id]` | `donorMatchApi.compatibleDonors` | `useCompatibleDonors()` | PATIENT, ADMIN | `RequestDetail` — Compatible donor match panel |
| 20 | **Donor Match** | `POST` | `/api/v1/donor-matches/assign-donor` | `/patient/requests/[id]` | `donorMatchApi.assignDonor` | `useAssignDonor()` | PATIENT, ADMIN | `RequestDetail` — Assign donor button |
| 21 | **Donor Match** | `POST` | `/api/v1/blood-requests/:id/respond` | `/donor/requests` | `bloodRequestApi.respond` | `useRespondBloodRequest()` | DONOR | `OpenRequestsTable` — Donor ACCEPT / DECLINE match |
| 22 | **Donor Match** | `PATCH` | `/api/v1/blood-requests/:id/status` | `/patient/requests/[id]`, `/admin/blood-requests` | `bloodRequestApi.updateStatus` | `useUpdateBloodRequestStatus()` | PATIENT, ADMIN | `RequestDetail` — State machine status stepper |
| 23 | **Donor Match** | `GET` | `/api/v1/donor-matches/my-donations` | `/donor`, `/donor/analytics` | `donorMatchApi.myDonations` | `useMyDonations()` | DONOR | `MyDonationsTable`, `AnalyticsCharts` — Donation history |
| 24 | **Payment** | `POST` | `/api/v1/payments/initiate` | `/patient/requests/[id]` | `paymentApi.initiate` | `useInitiatePayment()` | PATIENT, ADMIN | `RequestDetail` — bKash logistics/boost payment trigger |
| 25 | **Payment** | `POST` | `/api/v1/payments/execute` | `/payment/callback` | `paymentApi.execute` | `useExecutePayment()` | PATIENT, ADMIN | `PaymentResult` — bKash token execution & receipt |
| 26 | **Payment** | `POST` | `/api/v1/payments/refund/:requestId` | `/admin/manage`, `/admin/blood-requests` | `paymentApi.refund` | `useRefundPayment()` | ADMIN | `BloodRequestsTable` — Execute bKash payment refund |
| 27 | **Payment** | `GET` | `/api/v1/payments/mine` | `/patient/payments` | `paymentApi.mine` | `useMyPayments()` | PATIENT, ADMIN | `PaymentHistoryTable` — User transaction history |
| 28 | **Payment** | `GET` | `/api/v1/payments/:id` | `/patient/payments`, `/payment/success` | `paymentApi.byId` | `usePaymentById()` | PATIENT, ADMIN | `PaymentResult` — View payment invoice & receipt |
| 29 | **Admin** | `GET` | `/api/v1/admin/users` | `/admin/manage` | `adminApi.users` | `useAdminUsers()` | ADMIN | `UsersTable` — List, filter, & search platform users |
| 30 | **Admin** | `PATCH` | `/api/v1/admin/users/:id/role` | `/admin/manage` | `adminApi.updateUser` | `useUpdateUserRole()` | ADMIN | `UsersTable` — Update user role & block/unblock status |
| 31 | **Admin** | `GET` | `/api/v1/admin/dashboard-stats` | `/admin` | `adminApi.dashboardStats` | `useAdminDashboardStats()` | ADMIN | `AdminOverview`, `RequestsChart`, `UsersChart` |
| 32 | **Admin** | `GET` | `/api/v1/admin/audit-logs` | `/admin/audit-logs` | `adminApi.auditLogs` | `useAdminAuditLogs()` | ADMIN | `AuditLogsTable` — Audit logs viewer & search |

---

## 🔍 Comprehensive Module Technical Specifications

### 1. Auth Module (`/api/v1/auth`)

#### 1.1 `POST /auth/register`
- **Frontend Source:** `src/components/modules/auth/register-form.tsx`
- **Route:** `/register`
- **Hook & API:** `useRegistration()` $\rightarrow$ `authApi.register(payload)`
- **Payload Schema:** `RegisterPayload` (`name`, `email`, `password`, `role`, `bloodGroup`, `phone`, `district`, `city`, `address`)
- **Behavior:** On success, redirects user to `/verify-email?email=<encoded-email>` to input 6-digit Nodemailer OTP.

#### 1.2 `POST /auth/verify-email`
- **Frontend Source:** `src/components/modules/auth/verify-email-form.tsx`
- **Route:** `/verify-email`
- **Hook & API:** `useVerifyAccount()` $\rightarrow$ `authApi.verifyEmail({ email, otp })`
- **Behavior:** Validates Redis OTP. On success, persists JWT cookies via `persistSession()`, invalidates user query cache, and redirects based on user role (`/patient`, `/donor`, or `/admin`).

#### 1.3 `POST /auth/verify-email/resend-otp`
- **Frontend Source:** `src/components/modules/auth/verify-email-form.tsx`
- **Route:** `/verify-email`
- **Hook & API:** `useResendRegisterOtp()` $\rightarrow$ `authApi.resendRegisterOtp({ email })`
- **Behavior:** Resends OTP with a 60-second countdown timer managed by `useCountdown()`.

#### 1.4 `POST /auth/login`
- **Frontend Source:** `src/components/modules/auth/login-form.tsx`
- **Route:** `/login`
- **Hook & API:** `useLogin()` $\rightarrow$ `authApi.login({ email, password })`
- **Behavior:** Authenticates credentials, stores `accessToken` and `refreshToken` in HTTP-Only cookies via `persistSession()`, and redirects to target dashboard route.

#### 1.5 `POST /auth/refresh-token`
- **Frontend Source:** `src/lib/apiClient.ts` & `src/service/refreshToken.ts`
- **Invocation:** Intercepts 401 Unauthorized responses.
- **Hook & API:** `authApi.refreshToken(refreshToken)`
- **Behavior:** Silently rotates expired access tokens without interrupting active user workflows.

#### 1.6 `POST /auth/google-login`
- **Frontend Source:** `src/components/modules/google-login/GoogleLogin.tsx`
- **Route:** `/login` & `/register`
- **Hook & API:** `useGoogleOAuth()` $\rightarrow$ `authApi.googleLogin({ idToken })`
- **Behavior:** Authenticates Google OAuth 2.0 credential payload and establishes user session.

#### 1.7 `POST /auth/forgot-password` & `POST /auth/reset-password`
- **Frontend Source:** `forgot-password-form.tsx` (`/forgot-password`) & `reset-password-form.tsx` (`/reset-password`)
- **Hooks & API:** `useForgotPassword()` & `useResetPassword()`
- **Behavior:** Triggers OTP email dispatch and accepts new password validation (`Zod` schema).

#### 1.8 `POST /auth/logout`
- **Frontend Source:** `DashboardHeader.tsx`, `HeaderAuthActions.tsx`
- **Hook & API:** `useLogout()` $\rightarrow$ `authApi.logout()`
- **Behavior:** Clears session cookies via `clearSession()` and purges TanStack Query client cache (`qc.clear()`).

---

### 2. User & Profile Module (`/api/v1/users`)

#### 2.1 `GET /users/me`
- **Frontend Source:** `src/components/modules/user/profile-form.tsx`, `DashboardSidebar.tsx`
- **Hook & API:** `useMe()` $\rightarrow$ `userApi.getMe()`
- **Behavior:** Hydrates active user profile data, blood group badge, donor availability, and avatar.

#### 2.2 `PATCH /users/me`
- **Frontend Source:** `src/components/modules/user/profile-form.tsx`
- **Routes:** `/donor/profile`, `/patient/profile`
- **Hook & API:** `useUpdateProfile()` $\rightarrow$ `userApi.updateMe(payload)`
- **Payload:** `UpdateProfilePayload` (`name`, `phone`, `district`, `city`, `address`, `isAvailable`)

#### 2.3 `PATCH /users/me/avatar`
- **Frontend Source:** `src/components/modules/user/avatar-dropzone.tsx`
- **Routes:** `/donor/profile`, `/patient/profile`
- **Hook & API:** `useUploadAvatar()` $\rightarrow$ `userApi.uploadAvatar(file)`
- **Behavior:** Uploads image avatar file using `multipart/form-data` to Cloudinary.

---

### 3. Blood Request Module (`/api/v1/blood-requests`)

#### 3.1 `POST /blood-requests`
- **Frontend Source:** `src/components/modules/blood-requests/create-request-wizard.tsx`
- **Route:** `/patient/new`
- **Hook & API:** `useCreateBloodRequest()` $\rightarrow$ `bloodRequestApi.create(payload)`
- **Behavior:** Validates patient name, required blood group, hospital address, district, quantity, urgency, and deadline using `blood-request.validation.ts`.

#### 3.2 `GET /blood-requests`
- **Frontend Source:** `LiveStats.tsx` (`/`), `OpenRequestsTable.tsx`, `BloodRequestsTable.tsx` (`/admin/blood-requests`)
- **Hook & API:** `useBloodRequests(queryParams)` & `publicApi.getLiveStats()`
- **Behavior:** Supports pagination (`page`, `limit`), filtering by `bloodGroup`, `district`, `urgency`, `status`, and text search.

#### 3.3 `GET /blood-requests/my-requests`
- **Frontend Source:** `src/components/modules/blood-requests/my-requests-table.tsx`
- **Routes:** `/patient`, `/donor/requests`
- **Hook & API:** `useMyBloodRequests()` $\rightarrow$ `bloodRequestApi.myRequests()`

#### 3.4 `GET /blood-requests/:id`, `PATCH /blood-requests/:id`, `DELETE /blood-requests/:id`
- **Frontend Source:** `src/components/modules/blood-requests/request-detail.tsx`
- **Route:** `/patient/requests/[id]`
- **Hooks & API:** `useBloodRequestById()`, `useUpdateBloodRequest()`, `useSoftDeleteBloodRequest()`

---

### 4. Smart Donor Matching & Request Workflow (`/donor-matches` & `/blood-requests`)

#### 4.1 `GET /donor-matches/compatible-donors`
- **Frontend Source:** `src/components/modules/blood-requests/request-detail.tsx`
- **Route:** `/patient/requests/[id]`
- **Hook & API:** `useCompatibleDonors({ bloodGroup, district, requestId })`
- **Behavior:** Evaluates medical compatibility matrix (`blood-compatibility.ts`) and excludes donors currently under 90-day donation cooldown.

#### 4.2 `POST /donor-matches/assign-donor`
- **Frontend Source:** `request-detail.tsx`
- **Hook & API:** `useAssignDonor()` $\rightarrow$ `donorMatchApi.assignDonor({ requestId, donorId })`

#### 4.3 `POST /blood-requests/:id/respond`
- **Frontend Source:** `src/components/modules/donors/open-requests-table.tsx`
- **Route:** `/donor/requests`
- **Hook & API:** `useRespondBloodRequest()` $\rightarrow$ `bloodRequestApi.respond(id, "ACCEPTED" | "DECLINED")`

#### 4.4 `PATCH /blood-requests/:id/status`
- **Frontend Source:** `request-detail.tsx`, `blood-requests-table.tsx`
- **Hook & API:** `useUpdateBloodRequestStatus()` $\rightarrow$ `bloodRequestApi.updateStatus(id, status)`
- **Guarded Workflow:** `PENDING` $\rightarrow$ `VERIFIED` $\rightarrow$ `DONOR_ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.

#### 4.5 `GET /donor-matches/my-donations`
- **Frontend Source:** `my-donations-table.tsx`, `analytics-charts.tsx`
- **Routes:** `/donor`, `/donor/analytics`
- **Hook & API:** `useMyDonations()` $\rightarrow$ `donorMatchApi.myDonations()`

---

### 5. bKash Tokenized Payments Module (`/payments`)

#### 5.1 `POST /payments/initiate`
- **Frontend Source:** `request-detail.tsx` (Boost Modal)
- **Route:** `/patient/requests/[id]`
- **Hook & API:** `useInitiatePayment()` $\rightarrow$ `paymentApi.initiate({ requestId, amount, addOnType })`
- **Behavior:** Obtains bKash Tokenized Checkout URL and redirects browser to bKash gateway.

#### 5.2 `POST /payments/execute`
- **Frontend Source:** `src/components/modules/payments/payment-result.tsx`
- **Route:** `/payment/callback`
- **Hook & API:** `useExecutePayment()` $\rightarrow$ `paymentApi.execute({ paymentID })`
- **Behavior:** Finalizes transaction upon returning from gateway, generates PDF invoice, and dispatches email confirmation.

#### 5.3 `POST /payments/refund/:requestId`
- **Frontend Source:** `blood-requests-table.tsx`
- **Route:** `/admin/manage`, `/admin/blood-requests`
- **Hook & API:** `useRefundPayment()` $\rightarrow$ `paymentApi.refund(requestId, { reason })`

#### 5.4 `GET /payments/mine` & `GET /payments/:id`
- **Frontend Source:** `payment-history-table.tsx` (`/patient/payments`) & `payment-result.tsx` (`/payment/success`)
- **Hooks & API:** `useMyPayments()`, `usePaymentById()`

---

### 6. Admin Administration & Audit Module (`/api/v1/admin`)

#### 6.1 `GET /admin/users` & `PATCH /admin/users/:id/role`
- **Frontend Source:** `src/components/modules/admin/users-table.tsx`
- **Route:** `/admin/manage`
- **Hooks & API:** `useAdminUsers()`, `useUpdateUserRole()`
- **Behavior:** Facilitates user searching, role updates (`DONOR`, `PATIENT`, `ADMIN`), and block/unblock actions.

#### 6.2 `GET /admin/dashboard-stats`
- **Frontend Source:** `overview.tsx`, `requests-chart.tsx`, `users-chart.tsx`
- **Route:** `/admin`
- **Hook & API:** `useAdminDashboardStats()` $\rightarrow$ `adminApi.dashboardStats()`

#### 6.3 `GET /admin/audit-logs`
- **Frontend Source:** `src/components/modules/admin/audit-logs-table.tsx`
- **Route:** `/admin/audit-logs`
- **Hook & API:** `useAdminAuditLogs()` $\rightarrow$ `adminApi.auditLogs()`
