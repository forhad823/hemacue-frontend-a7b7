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
  address: "Shahbag, Dhaka Medical College Hospital Area, Dhaka-1000, Bangladesh",
  phone: "+880 1700-000000",
  phoneNote: "24/7 Emergency Line",
  email: "emergency@hemacue.org",
  supportEmail: "support@hemacue.org",
  availability: "Open 24 hours a day, 7 days a week",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Dhaka+Medical+College+Hospital",
} as const;