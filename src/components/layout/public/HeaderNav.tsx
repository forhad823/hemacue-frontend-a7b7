"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HeaderNavProps {
  variant?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
}

/** Navigation link list with active-route highlighting, shared by desktop and mobile header. */
export default function HeaderNav({
  variant = "horizontal",
  onNavigate,
  className,
}: HeaderNavProps) {
  const pathname = usePathname();
  const isVertical = variant === "vertical";

  return (
    <nav
      aria-label="Main"
      className={cn(
        isVertical ? "flex flex-col gap-1" : "items-center gap-6",
        className,
      )}
    >
      {PUBLIC_NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md text-sm font-medium transition-colors",
              isVertical ? "px-3 py-2" : "",
              isActive
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}