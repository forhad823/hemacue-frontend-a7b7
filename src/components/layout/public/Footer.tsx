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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <HemacueLogo />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
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
                  className="hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-primary transition-colors"
                >
                  Emergency Services
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Emergency Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Shahbag, Dhaka Medical College Hospital Area, Dhaka-1000,
                  Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">
                  +880 1700-000000 (24/7 Emergency Line)
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-primary shrink-0" />
                <span>emergency@hemacue.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} Hemacue Emergency Blood System. All
            rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span>Designed for medical emergencies with</span>
            <Heart className="size-3.5 text-red-500 fill-red-500 animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
}
