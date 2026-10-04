import Link from "next/link";
import { HemacueLogo } from "@/components/shared/hemacue-logo";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import HeaderAuthActions from "./HeaderAuthActions";
import HeaderNav from "./HeaderNav";
import MobileNav from "./MobileNav";

/**
 * Public header rendered on the server so the logo and navigation are part of
 * the static HTML. Only the auth-aware actions and the mobile drawer hydrate.
 */
export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-lg focus-visible:outline-none">
          <HemacueLogo />
        </Link>

        <HeaderNav className="hidden md:flex" />

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <HeaderAuthActions />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}