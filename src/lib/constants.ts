export interface NavLink {
  href: string;
  label: string;
}

/** Primary navigation shared by the public header (desktop + mobile) and the footer. */
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

/** Single source of truth for the contact details rendered in the footer and on /contact. */
export const CONTACT_INFO = {
  address:
    "Shahbag, Dhaka Medical College Hospital Area, Dhaka-1000, Bangladesh",
  phone: "+880 1700-000000",
  phoneNote: "24/7 Emergency Line",
  email: "emergency@hemacue.org",
  supportEmail: "support@hemacue.org",
  availability: "Open 24 hours a day, 7 days a week",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Dhaka+Medical+College+Hospital",
} as const;

/** 64 administrative divisions, used by every district filter and form select. */
export const DISTRICTS: string[] = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barishal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Chuadanga",
  "Cumilla",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gopalganj",
  "Gaibandha",
  "Habiganj",
  "Jamalpur",
  "Jashore",
  "Jhalokati",
  "Jhalokhati",
  "Joypurhat",
  "Khagrachhari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
];

/** Number of days a donor must rest between two whole-blood donations. */
export const DONATION_COOLDOWN_DAYS = 90;

/** Paid services, priced in BDT. The backend never trusts these amounts. */
export const PAYMENT_PRICING = {
  PREMIUM_NOTIFICATION: 200,
  EMERGENCY_LOGISTICS: 500,
} as const;

/**
 * Mirrors `hemacue-backend/src/app/middlewares/rateLimiter.ts` — the real
 * Redis-backed limiter values enforced per client IP.
 */
export const RATE_LIMITS = {
  /** Every `/api/v1` route. */
  global: { maxRequests: 100, windowMinutes: 15 },
  /** Auth + payment initiation/execution routes. */
  authPayment: { maxRequests: 30, windowMinutes: 15 },
} as const;

export const BLOOD_GROUP_OPTIONS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
] as const;

export const URGENCY_OPTIONS = [
  {
    value: "NORMAL",
    label: "Normal",
    description: "Planned transfusion within the next 48 hours.",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Needed within 24 hours — hospital is waiting.",
  },
  {
    value: "EMERGENCY",
    label: "Emergency",
    description: "Life-threatening right now. Notify every compatible donor.",
  },
] as const;

export const REQUEST_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "DONOR_ASSIGNED", label: "Donor assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const USER_ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PATIENT", label: "Patient" },
  { value: "DONOR", label: "Donor" },
] as const;

/** Shared by every payment table filter (patient history, admin payments). */
export const PAYMENT_STATUS_OPTIONS = [
  { value: "INITIALIZED", label: "Initialized" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { value: "PREMIUM_NOTIFICATION", label: "Premium Notification" },
  { value: "EMERGENCY_LOGISTICS", label: "Emergency Logistics" },
] as const;

export const AUDIT_ACTION_OPTIONS = [
  "USER_ROLE_UPDATED",
  "USER_UPDATED",
  "USER_BLOCKED",
  "STATUS_CHANGE",
  "DONOR_ACCEPTED",
  "DONOR_DECLINED",
  "PAYMENT_COMPLETED",
  "PAYMENT_REFUNDED",
  "REQUEST_CREATED",
] as const;

// ─── Home page static data ────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: "Patient" | "Donor" | "Admin";
  location: string;
}

/** Three first-person testimonials representing every user role on the platform. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "My son needed O-negative blood within two hours. Hemacue matched two compatible donors in our district within minutes. The admin verified the request overnight and by morning the blood was at Dhaka Medical College. I cannot describe what that meant to our family.",
    name: "Fatema Khanam",
    role: "Patient",
    location: "Dhaka",
  },
  {
    id: "t2",
    quote:
      "I have been a donor for three years. What I love about Hemacue is that I am never pressured — the 90-day cooldown is enforced automatically and I can toggle my availability with one click. Knowing the request is admin-verified before I am even notified gives me real confidence.",
    name: "Rakibul Islam",
    role: "Donor",
    location: "Chattogram",
  },
  {
    id: "t3",
    quote:
      "As a moderator I review every request before it reaches donors. The audit log gives me a complete timeline and the bKash payment trail makes refunds transparent. Hemacue is the most accountable blood-matching platform I have worked with.",
    name: "Nusrat Jahan",
    role: "Admin",
    location: "Rajshahi",
  },
] as const;

export interface PartnerHospital {
  id: string;
  name: string;
  district: string;
}

/**
 * Real Bangladeshi hospitals active on the Hemacue network.
 * Text-only — no fabricated logos, no external image URLs.
 */
export const PARTNER_HOSPITALS: PartnerHospital[] = [
  { id: "h1", name: "Dhaka Medical College Hospital", district: "Dhaka" },
  { id: "h2", name: "Sir Salimullah Medical College", district: "Dhaka" },
  { id: "h3", name: "Shaheed Suhrawardy Medical College", district: "Dhaka" },
  {
    id: "h4",
    name: "Chittagong Medical College Hospital",
    district: "Chattogram",
  },
  { id: "h5", name: "Rajshahi Medical College Hospital", district: "Rajshahi" },
  { id: "h6", name: "Sylhet MAG Osmani Medical College", district: "Sylhet" },
  { id: "h7", name: "Khulna Medical College Hospital", district: "Khulna" },
  {
    id: "h8",
    name: "Mymensingh Medical College Hospital",
    district: "Mymensingh",
  },
] as const;

export interface HomeFaqEntry {
  id: string;
  question: string;
  answer: string;
}

/** Top 4 FAQs shown on the home page. Full list lives on /faq. */
export const HOME_FAQ_ENTRIES: HomeFaqEntry[] = [
  {
    id: "hfaq-1",
    question: "How does Hemacue match donors to patients?",
    answer:
      "When a patient posts a blood request, Hemacue's compatibility engine filters donors by ABO/Rh blood group, district, and availability. Donors who are within their 90-day cooldown period are automatically excluded. Only medically compatible, available donors are notified — so every match is both safe and logistically practical.",
  },
  {
    id: "hfaq-2",
    question: "Why is there a 90-day cooldown between donations?",
    answer:
      "The World Health Organisation recommends at least 56 days between whole-blood donations; Hemacue enforces a conservative 90-day window to prioritise donor health. The cooldown is calculated from your last accepted donation and is shown as a live countdown on your donor dashboard. You cannot be assigned to a new request until the period is over.",
  },
  {
    id: "hfaq-3",
    question: "Is my blood request verified before donors are contacted?",
    answer:
      "Yes. Every request goes through an admin verification step before any donor is notified. This prevents spam and ensures the hospital details, blood group and urgency information are accurate. Verified requests are shown with a green 'Verified' badge and move to the matching queue immediately.",
  },
  {
    id: "hfaq-4",
    question: "What are the paid premium services and are they refundable?",
    answer:
      "Hemacue offers two optional paid upgrades via bKash: Premium SMS Notification (৳200) blasts an alert to a wider pool of compatible donors, and Emergency Logistics (৳500) arranges a verified courier to physically transport the blood to the hospital. Both services are refundable through the admin panel if the request is cancelled before the service is delivered.",
  },
] as const;
