"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LayoutDashboard, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { HemacueLogo } from "@/components/shared/hemacue-logo";
import { useGetMe } from "@/hooks";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { data } = useGetMe();
  const user = data?.data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-visible:outline-none rounded-lg">
          <HemacueLogo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions (Theme Toggle & Auth Awareness) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <Button
              variant="default"
              size="sm"
              render={
                <Link
                  href={`/${user.role.toLowerCase()}`}
                  className="gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              }
            />
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link href="/login" className="gap-1.5 cursor-pointer">
                    <LogIn className="size-4" />
                    <span>Login</span>
                  </Link>
                }
              />
              <Button
                variant="default"
                size="sm"
                render={
                  <Link href="/register" className="gap-1.5 cursor-pointer">
                    <Heart className="size-4 fill-current" />
                    <span>Register</span>
                  </Link>
                }
              />
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="size-9"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {user ? (
              <Button
                variant="default"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
                render={<Link href={`/${user.role.toLowerCase()}`} />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                  render={<Link href="/login" />}
                >
                  Login
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                  render={<Link href="/register" />}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
