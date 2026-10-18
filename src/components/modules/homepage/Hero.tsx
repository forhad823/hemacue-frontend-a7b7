"use client";

import {
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Droplet,
  HeartPulse,
  Pause,
  Play,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  Fragment,
  type KeyboardEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBloodGroup } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BloodGroup } from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────

// false  → animations ALWAYS play, even if the OS has "reduce motion" on.
// true   → honour the OS setting (recommended for production accessibility):
//          carousel starts paused and entrance animations are disabled.
const RESPECT_REDUCED_MOTION = false;

const AUTO_ADVANCE_MS = 4_000;
const GROUP_SPOTLIGHT_MS = 900;
const WORD_STAGGER_MS = 120;

// ─── Self-contained animation CSS ────────────────────────────────────────────
// Defined here so nothing depends on tw-animate-css or on the OS motion
// setting. Only the "from" state is declared; each animation ends on the
// element's natural styles. `backwards` fill keeps delayed elements hidden
// until their turn without overriding later hover/active styles.

const HERO_CSS = `
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(32px); }
}
@keyframes hero-word-in {
  from { opacity: 0; transform: translateY(0.6em) scale(0.96); filter: blur(6px); }
}
@keyframes hero-fade-right {
  from { opacity: 0; transform: translateX(64px); }
}
@keyframes hero-pop {
  from { opacity: 0; transform: scale(0.7) translateY(12px); }
}
@keyframes hero-icon-in {
  from { opacity: 0; transform: scale(0.4) rotate(-25deg); }
}
@keyframes hero-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes hero-float-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(40px, 30px, 0) scale(1.12); }
}
@keyframes hero-float-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(-36px, -28px, 0) scale(1.1); }
}

.hero-fade-up    { animation: hero-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
.hero-word       { animation: hero-word-in 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
.hero-fade-right { animation: hero-fade-right 1000ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
.hero-pop        { animation: hero-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.hero-icon-in    { animation: hero-icon-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.hero-progress   { animation: hero-progress linear forwards; transform-origin: left center; }
.hero-float-a    { animation: hero-float-a 9s ease-in-out infinite; }
.hero-float-b    { animation: hero-float-b 11s ease-in-out infinite; }

${
  RESPECT_REDUCED_MOTION
    ? `@media (prefers-reduced-motion: reduce) {
  .hero-fade-up, .hero-word, .hero-fade-right, .hero-pop,
  .hero-icon-in, .hero-progress, .hero-float-a, .hero-float-b {
    animation: none !important;
  }
}`
    : ""
}
`;

// ─── Slide data ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: "request",
    eyebrow: "24/7 emergency blood network",
    headline: "Every Drop Counts.",
    headlineAccent: "Every Second Matters.",
    subhead:
      "Hemacue connects verified blood donors with patients in critical need across Bangladesh. Requests are matched by blood group and district, verified by an admin, and tracked until the blood reaches the hospital.",
    primaryCta: {
      label: "Request Blood",
      href: "/register?role=PATIENT",
      icon: Droplet,
    },
    secondaryCta: {
      label: "Become a Donor",
      href: "/register?role=DONOR",
      icon: HeartPulse,
    },
    accentFrom: "from-red-600",
    accentTo: "to-rose-600",
    blobColor: "bg-primary/10",
    illustrationIcon: Droplet,
  },
  {
    id: "donate",
    eyebrow: "Safe, verified, no pressure",
    headline: "Your Blood Can",
    headlineAccent: "Save a Life Today.",
    subhead:
      "Register once with your blood group and district. Hemacue only reaches out when you are genuinely compatible. The 90-day cooldown is enforced automatically — your health is always the priority.",
    primaryCta: {
      label: "Become a Donor",
      href: "/register?role=DONOR",
      icon: HeartPulse,
    },
    secondaryCta: {
      label: "How It Works",
      href: "/services",
      icon: ArrowRight,
    },
    accentFrom: "from-emerald-600",
    accentTo: "to-teal-600",
    blobColor: "bg-emerald-500/10",
    illustrationIcon: HeartPulse,
  },
  {
    id: "logistics",
    eyebrow: "bKash-secured premium services",
    headline: "Emergency Logistics,",
    headlineAccent: "Delivered to Your Hospital.",
    subhead:
      "When every minute matters, unlock premium SMS notification blasts and verified courier logistics through bKash tokenized checkout — transparent, refundable, and tracked from assignment to completion.",
    primaryCta: { label: "Explore Services", href: "/services", icon: Truck },
    secondaryCta: { label: "See Pricing", href: "/services", icon: Wallet },
    accentFrom: "from-violet-600",
    accentTo: "to-purple-600",
    blobColor: "bg-violet-500/10",
    illustrationIcon: Truck,
  },
] as const;

const BLOOD_GROUPS = Object.values(BloodGroup);

const trustPoints = [
  { icon: HeartPulse, label: "Blood-group compatibility engine" },
  { icon: ShieldCheck, label: "90-day donor cooldown enforced" },
  { icon: Wallet, label: "bKash-secured premium services" },
  { icon: BellRing, label: "Every request admin-verified" },
];

// ─── Auto-advance hook ───────────────────────────────────────────────────────
//
// Pause conditions:
//   1. Manual pause via the play/pause button.
//   2. Pointer hovering the carousel control bar only.
//   3. Browser tab hidden.
//   4. (Only if RESPECT_REDUCED_MOTION) OS reduced-motion → starts paused.
//
// `cycle` increments every time a fresh timer window starts; the progress bar
// is keyed on it so the countdown restarts in lockstep with the timer.

function useAutoAdvance(length: number) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!RESPECT_REDUCED_MOTION) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) setIsPaused(true);
    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      setIsPaused(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = () =>
      setIsHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const autoPlayActive = !isPaused && !isControlsHovered && !isHidden;

  useEffect(() => {
    if (!autoPlayActive) return;

    setCycle((c) => c + 1); // restarts the progress bar in sync
    const t = setTimeout(() => {
      setIndex((index + 1) % length);
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(t);
  }, [autoPlayActive, index, length]);

  const goTo = useCallback(
    (i: number) => setIndex(((i % length) + length) % length),
    [length],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % length), [length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + length) % length),
    [length],
  );
  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return {
    index,
    cycle,
    goTo,
    next,
    prev,
    isPaused,
    togglePause,
    autoPlayActive,
    prefersReducedMotion,
    onControlsMouseEnter: () => setIsControlsHovered(true),
    onControlsMouseLeave: () => setIsControlsHovered(false),
  };
}

// ─── Hero component ──────────────────────────────────────────────────────────

export default function Hero() {
  const {
    index,
    cycle,
    goTo,
    next,
    prev,
    isPaused,
    togglePause,
    autoPlayActive,
    prefersReducedMotion,
    onControlsMouseEnter,
    onControlsMouseLeave,
  } = useAutoAdvance(SLIDES.length);

  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
  const touchStartX = useRef(0);

  // Blood-group "compatibility engine" spotlight — walks the grid one group at
  // a time so the card reads like a live matching scan.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const t = setInterval(() => {
      setSpotlightIndex((i) => (i + 1) % BLOOD_GROUPS.length);
    }, GROUP_SPOTLIGHT_MS);

    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  const slide = SLIDES[index];
  const PrimaryIcon = slide.primaryCta.icon;
  const SecondaryIcon = slide.secondaryCta.icon;
  const IllustrationIcon = slide.illustrationIcon;
  const activeGroup = hoveredGroup ?? spotlightIndex;
  const headlineWords = slide.headline.split(" ");
  const accentDelay = headlineWords.length * WORD_STAGGER_MS + 100;
  const subheadDelay = accentDelay + 250;
  const ctaDelay = subheadDelay + 150;

  // WAI-ARIA carousel pattern: each slide is a labelled group.
  const slideA11yProps = {
    role: "group" as const,
    "aria-roledescription": "slide",
    "aria-label": `Slide ${index + 1} of ${SLIDES.length}: ${slide.eyebrow}`,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) < 48) return;
    if (deltaX < 0) next();
    else prev();
  };

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border/40 min-h-[65vh] lg:min-h-[70vh] flex flex-col"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero carousel"
      aria-roledescription="carousel"
    >
      <style>{HERO_CSS}</style>

      {/* ── Decorative background blobs (slow drifting motion) ─────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/8 via-background to-background"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-40 left-1/4 -z-10 size-112 rounded-full blur-3xl",
          "hero-float-a transition-colors duration-700",
          slide.blobColor,
        )}
      />
      <div
        aria-hidden
        className="hero-float-b pointer-events-none absolute -right-24 top-24 -z-10 size-96 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-950/40"
      />

      <div className="container mx-auto flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* ── Slide layout ──────────────────────────────────────────────────
            The outer grid is stable across slides. Only the text blocks in
            the left column are keyed, so they remount and replay their
            entrance on every slide change.
            Cascade: eyebrow → headline words (stagger) → accent phrase →
            subhead → CTAs. */}
        <div
          {...slideA11yProps}
          className="grid flex-1 items-center gap-12 lg:grid-cols-12"
        >
          {/* ── Left column — animated text content ─────────────────────── */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow badge — live emergency pulse */}
            <Badge
              key={`eyebrow-${index}`}
              variant="outline"
              className="hero-fade-up gap-2 border-primary/25 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur"
            >
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {slide.eyebrow}
            </Badge>

            {/* Headline — word-by-word emergency cascade */}
            <h1
              key={`headline-${index}`}
              className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {headlineWords.map((word, i) => (
                <Fragment key={`${word}-${String(i)}`}>
                  <span
                    className="hero-word inline-block"
                    style={{ animationDelay: `${150 + i * WORD_STAGGER_MS}ms` }}
                  >
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
              <span
                key={`headline-accent-${index}`}
                className={cn(
                  "hero-word inline-block bg-linear-to-r bg-clip-text text-transparent",
                  slide.accentFrom,
                  slide.accentTo,
                )}
                style={{ animationDelay: `${accentDelay}ms` }}
              >
                {slide.headlineAccent}
              </span>
            </h1>

            {/* Subhead */}
            <p
              key={`subhead-${index}`}
              className="hero-fade-up mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
              style={{ animationDelay: `${subheadDelay}ms` }}
            >
              {slide.subhead}
            </p>

            {/* CTA row */}
            <div
              key={`ctas-${index}`}
              className="hero-fade-up mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              style={{ animationDelay: `${ctaDelay}ms` }}
            >
              <Button
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                render={<Link href={slide.primaryCta.href} />}
              >
                <PrimaryIcon className="size-4" />
                {slide.primaryCta.label}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                render={<Link href={slide.secondaryCta.href} />}
              >
                <SecondaryIcon className="size-4" />
                {slide.secondaryCta.label}
              </Button>
            </div>

            {/* Trust points — static, not animated per-slide */}
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right column — blood group card (static, never re-keyed) ── */}
          <div className="lg:col-span-5">
            <div className="hero-fade-right rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-red-500/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    key={`card-icon-${index}`}
                    className="hero-icon-in flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <IllustrationIcon className="size-5" />
                  </span>
                  <h2 className="text-sm font-semibold text-foreground">
                    Every blood group covered
                  </h2>
                </div>
                <Link
                  href="/faq"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  How matching works
                </Link>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Donors are filtered by medical compatibility, availability and
                the 90-day donation cooldown before they are ever notified.
              </p>

              <ul
                className="mt-5 grid grid-cols-4 gap-2"
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {BLOOD_GROUPS.map((group, i) => {
                  const isActive = i === activeGroup;
                  return (
                    <li
                      key={group}
                      onMouseEnter={() => setHoveredGroup(i)}
                      style={{ animationDelay: `${500 + i * 90}ms` }}
                      className={cn(
                        "hero-pop flex flex-col items-center gap-1 rounded-xl border py-3 transition-all duration-500",
                        isActive
                          ? "scale-110 border-primary/60 bg-primary/10 text-primary shadow-lg shadow-primary/20"
                          : "border-border/60 bg-background/80 hover:border-primary/40",
                      )}
                    >
                      <Droplet
                        className={cn(
                          "size-4 transition-all duration-500",
                          isActive
                            ? "fill-primary text-primary"
                            : "fill-primary/40 text-primary/60",
                        )}
                      />
                      <span className="text-xs font-semibold tabular-nums">
                        {formatBloodGroup(group)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 rounded-xl bg-primary/5 p-4">
                <p className="text-xs font-medium text-foreground">
                  Not sure what you need?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Post a request with hospital, district and urgency — our
                  matching engine surfaces only the donors who can actually
                  help.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto gap-1 p-0 text-xs"
                  render={<Link href="/services" />}
                >
                  Explore all services
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Countdown progress + carousel controls ───────────────────────── */}
        <div className="mt-10">
          {/* Auto-advance countdown — remounts on every timer restart via the
              `cycle` key, and freezes while rotation is paused. */}
          <div
            aria-hidden
            className="h-1 w-full overflow-hidden rounded-full bg-muted/70"
          >
            <div
              key={cycle}
              style={{
                animationDuration: `${AUTO_ADVANCE_MS}ms`,
                animationPlayState: autoPlayActive ? "running" : "paused",
              }}
              className={cn(
                "hero-progress h-full w-full rounded-full bg-linear-to-r",
                slide.accentFrom,
                slide.accentTo,
              )}
            />
          </div>

          <div
            role="toolbar"
            aria-label="Carousel controls"
            className="mt-3 flex items-center justify-between"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") onControlsMouseEnter();
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") onControlsMouseLeave();
            }}
          >
            {/* Prev / Play-Pause / Next arrows */}
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="size-9 transition-transform hover:scale-105"
                onClick={prev}
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-9 transition-transform hover:scale-105"
                onClick={togglePause}
                aria-label={
                  isPaused
                    ? "Resume automatic rotation"
                    : "Pause automatic rotation"
                }
                aria-pressed={isPaused}
              >
                {isPaused ? (
                  <Play className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-9 transition-transform hover:scale-105"
                onClick={next}
                aria-label="Next slide"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Dot indicators */}
            <div
              role="tablist"
              aria-label="Carousel slide indicators"
              className="flex gap-2"
            >
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "size-2 rounded-full transition-all duration-500 hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    i === index
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                  )}
                />
              ))}
            </div>

            {/* Rotation state + slide counter */}
            <div className="flex items-center gap-2">
              <p
                className="hidden text-xs text-muted-foreground sm:block"
                aria-live="polite"
                aria-atomic
              >
                {autoPlayActive ? "Auto-rotating" : "Paused"}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {index + 1} / {SLIDES.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
