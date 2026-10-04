export interface NavLink {
  href: string;
  label: string;
}

/** Primary navigation shared by the public header (desktop + mobile) and the footer. */
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
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
