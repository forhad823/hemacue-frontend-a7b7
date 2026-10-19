/**
 * Deterministic hero personalization — "AI" in the rule-based sense.
 *
 * `DEFAULT_HERO` is the single source of the slide-1 marketing copy: `Hero.tsx`
 * renders it verbatim for anonymous visitors, and `personalizeHero` derives
 * role-aware variants from real user state. Same inputs → same copy; no clock,
 * no network, nothing invented.
 *
 * Swap for an LLM call by replacing `personalizeHero`'s return value with a
 * remote completion; `HeroContent` and every caller stay unchanged.
 */
import { type CooldownState, formatBloodGroup } from "@/lib/format";
import type { UserProfile, UserRole } from "@/types";

export interface HeroContent {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

/** Anonymous-visitor copy — also the fallback whenever nothing applies. */
export const DEFAULT_HERO: HeroContent = {
  eyebrow: "24/7 emergency blood network",
  headline: "Every Drop Counts.",
  headlineAccent: "Every Second Matters.",
  subhead:
    "Hemacue connects verified blood donors with patients in critical need across Bangladesh. Requests are matched by blood group and district, verified by an admin, and tracked until the blood reaches the hospital.",
  primaryCta: { label: "Request Blood", href: "/register?role=PATIENT" },
  secondaryCta: { label: "Become a Donor", href: "/register?role=DONOR" },
};

/** Minimal user slice the personalizer needs — no full profile dependency. */
export type HeroUser = Pick<UserProfile, "role" | "bloodGroup" | "isAvailable">;

export function personalizeHero(
  user: HeroUser | null | undefined,
  cooldown: CooldownState | null,
  availableRequestCount: number,
  activeRequestCount: number,
): HeroContent {
  if (!user) return DEFAULT_HERO;

  if (user.role === ("ADMIN" satisfies UserRole)) {
    return {
      ...DEFAULT_HERO,
      eyebrow: "Admin control centre",
      headline: "The Network,",
      headlineAccent: "At Your Fingertips.",
      subhead:
        "Verify requests, monitor donor coverage and track premium bKash payments across the platform.",
      primaryCta: { label: "Open Dashboard", href: "/admin" },
      secondaryCta: { label: "Review Requests", href: "/admin/blood-requests" },
    };
  }

  if (user.role === ("DONOR" satisfies UserRole)) {
    const group = formatBloodGroup(user.bloodGroup);

    if (!user.isAvailable) {
      return {
        ...DEFAULT_HERO,
        eyebrow: "Donor profile paused",
        headline: "Pause Today,",
        headlineAccent: "Save Lives Tomorrow.",
        subhead: `Set yourself available again and compatible ${group} requests in your district will reach you the moment an admin verifies them.`,
        primaryCta: { label: "Go to Donor Dashboard", href: "/donor" },
        secondaryCta: { label: "Browse Requests", href: "/donor/requests" },
      };
    }

    if (cooldown && !cooldown.isEligible) {
      return {
        ...DEFAULT_HERO,
        eyebrow: "Resting between donations",
        headline: "Recover Well,",
        headlineAccent: "Donate Strong.",
        subhead: `${cooldown.label}. Compatible ${group} requests keep arriving — you will be first in line once the cooldown ends.`,
        primaryCta: { label: "Go to Donor Dashboard", href: "/donor" },
        secondaryCta: { label: "My Donations", href: "/donor/analytics" },
      };
    }

    return {
      ...DEFAULT_HERO,
      eyebrow: "You are eligible to donate",
      headline:
        availableRequestCount > 0
          ? `${availableRequestCount} Open`
          : "Someone Nearby",
      headlineAccent:
        availableRequestCount > 0
          ? `Request${availableRequestCount === 1 ? "" : "s"} Need ${group}.`
          : `Needs ${group} Blood.`,
      subhead:
        availableRequestCount > 0
          ? `Verified ${group} requests from hospitals are waiting for a donor like you. Browse, accept, and track the assignment to completion.`
          : `New ${group} requests are posted every day. Browse the board and set an alert so the next match reaches you first.`,
      primaryCta: { label: "Find Requests", href: "/donor/requests" },
      secondaryCta: { label: "Go to Donor Dashboard", href: "/donor" },
    };
  }

  if (user.role === ("PATIENT" satisfies UserRole)) {
    if (activeRequestCount > 0) {
      return {
        ...DEFAULT_HERO,
        eyebrow: `${activeRequestCount} active request${activeRequestCount === 1 ? "" : "s"}`,
        headline: "Your Requests,",
        headlineAccent: "Tracked to Delivery.",
        subhead:
          "Watch compatible donors respond, assign them to the hospital, and unlock premium SMS boosts any time from your dashboard.",
        primaryCta: { label: "Track My Requests", href: "/patient" },
        secondaryCta: { label: "New Request", href: "/patient/new" },
      };
    }

    return {
      ...DEFAULT_HERO,
      eyebrow: "Need blood urgently?",
      headline: "Post a Request,",
      headlineAccent: "We Handle the Rest.",
      subhead:
        "Describe the hospital, blood group and urgency once — admins verify it and compatible donors in your district are alerted.",
      primaryCta: { label: "New Request", href: "/patient/new" },
      secondaryCta: { label: "Go to Dashboard", href: "/patient" },
    };
  }

  return DEFAULT_HERO;
}
