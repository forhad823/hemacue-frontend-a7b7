import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa6";
import { HemacueLogo } from "@/components/shared/hemacue-logo";
import { CONTACT_INFO, PUBLIC_NAV_LINKS } from "@/lib/constants";

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", Icon: FaFacebook },
  { href: "https://x.com", label: "X (Twitter)", Icon: FaXTwitter },
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://github.com", label: "GitHub", Icon: FaGithub },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 text-muted-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <HemacueLogo />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Connecting verified blood donors with patients in critical
              emergency need across Bangladesh. Built with automated matching
              and instant notifications.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Emergency Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <span className="font-semibold text-foreground">
                  {CONTACT_INFO.phone} ({CONTACT_INFO.phoneNote})
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>{CONTACT_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} Hemacue Emergency Blood System. All
            rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span>Designed for medical emergencies with</span>
            <Heart className="text-destructive fill-destructive animate-pulse size-3.5" />
          </p>
        </div>
      </div>
    </footer>
  );
}