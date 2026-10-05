import Link from "next/link";
import type { ReactNode } from "react";
import { HemacueLogo } from "@/components/shared/hemacue-logo";
import { CONTACT_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrandIllustrationProps {
  variant: "not-found" | "error";
  className?: string;
}

/**
 * The Hemacue drop with a flat-lining heartbeat. Every colour comes from the
 * theme tokens (primary / accent / background), so it follows light and dark
 * mode without any extra work.
 */
export function BrandIllustration({
  variant,
  className,
}: BrandIllustrationProps) {
  const isError = variant === "error";

  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label={
        isError
          ? "A blood drop with a warning mark above a flat heartbeat line"
          : "A blood drop with a question mark above a flat heartbeat line"
      }
      className={cn(
        "h-auto w-full max-w-xs animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none",
        className,
      )}
    >
      <defs>
        <linearGradient id="hemacue-drop-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)" }} />
          <stop
            offset="1"
            style={{
              stopColor: "color-mix(in oklch, var(--primary) 65%, black)",
            }}
          />
        </linearGradient>
      </defs>

      {/* Soft backdrop */}
      <ellipse cx="160" cy="224" rx="84" ry="8" className="fill-primary/10" />
      <circle cx="160" cy="112" r="94" className="fill-accent" />
      <circle
        cx="160"
        cy="112"
        r="106"
        fill="none"
        className="stroke-primary/25"
        strokeWidth="1.5"
        strokeDasharray="3 9"
        strokeLinecap="round"
      />

      {/* Floating droplets */}
      <path
        d="M56 78c0-4 4-8 4-12 0 4 4 8 4 12a4 4 0 0 1-8 0z"
        className="fill-primary/35"
      />
      <path
        d="M268 150c0-3 3-6 3-9 0 3 3 6 3 9a3 3 0 0 1-6 0z"
        className="fill-primary/25"
      />
      <path
        d="M84 168c0-2 2-4 2-6 0 2 2 4 2 6a2 2 0 0 1-4 0z"
        className="fill-primary/30"
      />

      {/* The brand drop (same silhouette as the logo mark) */}
      <g transform="translate(82 18) scale(6.5)">
        <path
          d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
          fill="url(#hemacue-drop-gradient)"
        />
        <path
          d="M12 11v6M9 14h6"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M8.6 16.6a3.6 3.6 0 0 0 1.9 2"
          fill="none"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* Heartbeat that fades into a flat line */}
      <path
        d="M30 196H112l9-20 13 40 11-28 7 8H206"
        fill="none"
        className="stroke-primary"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M214 196H290"
        fill="none"
        className="stroke-primary/40"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 9"
      />

      {/* Status badge */}
      <circle
        cx="228"
        cy="68"
        r="24"
        className="fill-background stroke-primary"
        strokeWidth="3"
      />
      <text
        x="228"
        y="78"
        textAnchor="middle"
        className="fill-primary text-[28px] font-bold"
      >
        {isError ? "!" : "?"}
      </text>
    </svg>
  );
}

interface UtilityPageProps {
  illustration: ReactNode;
  /** Small eyebrow above the title, e.g. "404". */
  code?: string;
  title: string;
  description: string;
  actions: ReactNode;
  children?: ReactNode;
}

/**
 * Full-screen layout shared by the 404 and error pages: logo, illustration,
 * message, actions, and the 24/7 emergency line so a donor or patient who hits
 * a dead end still has a way to get help.
 */
export function UtilityPage({
  illustration,
  code,
  title,
  description,
  actions,
  children,
}: UtilityPageProps) {
  return (
    <main className="relative isolate flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />

      <Link href="/" aria-label="Hemacue home" className="mb-8">
        <HemacueLogo />
      </Link>

      {illustration}

      {code && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {code}
        </p>
      )}
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-balance text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {actions}
      </div>

      {children}

      <p className="mt-10 text-xs text-muted-foreground">
        Need blood urgently? Call our {CONTACT_INFO.phoneNote.toLowerCase()}{" "}
        <a
          href={`tel:${CONTACT_INFO.phone.replace(/[^\d+]/g, "")}`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {CONTACT_INFO.phone}
        </a>
      </p>
    </main>
  );
}
