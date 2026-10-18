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

const AUTO_ADVANCE_MS = 2_000;
const GROUP_SPOTLIGHT_MS = 800;
const BLOOD_GROUPS = Object.values(BloodGroup);

const trustPoints = [
  { icon: HeartPulse, label: "Blood-group compatibility engine" },
  { icon: ShieldCheck, label: "90-day donor cooldown enforced" },
  { icon: Wallet, label: "bKash-secured premium services" },
  { icon: BellRing, label: "Every request admin-verified" },
];

// ─── Auto-advance hook ───────────────────────────────────────────────────────
//
// Pause conditions (React state, not refs, so the effect re-runs and the
// interval is cleared + restarted whenever any of them changes):
//   1. Manual pause via the play/pause button.
//   2. Pointer hovering the carousel CONTROL BAR only — not the whole hero.
//      (The hero is 65–70 vh, i.e. most of the viewport; pausing on the whole
//      section meant a mouse parked anywhere over the hero froze the rotation
//      forever, which is exactly the bug reported. Hovering the controls still
//      pauses so the timer never ticks away while the user is about to click.)
//   3. Browser tab hidden (visibilitychange).
//   4. prefers-reduced-motion — rotation starts paused (a11y default) but the
//      user can explicitly press play to opt back in.
//
// `cycle` increments every time a fresh interval window starts; the progress
// bar is keyed on it so the visual countdown always restarts in lockstep with
// the timer (including after pause/resume and manual navigation).

function useAutoAdvance(length: number) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
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

    setCycle((c) => c + 1);
    const t = setInterval(() => {
      setIndex(() => (index + 1) % length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(t);
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
  // a time so the card reads like a live matching scan. Disabled entirely under
  // prefers-reduced-motion (hover highlight still works, without transforms).
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
  const headlineWordCount = slide.headline.split(" ").length;

  // WAI-ARIA carousel pattern: each slide is a labelled group. Kept as a
  // spread object because Biome's useSemanticElements rule suggests replacing a
  // static role="group" attribute with <fieldset>, which is wrong for slides.
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
      {/* ── Decorative background blobs ─────────────────────────────────────
          animate-pulse runs continuously; motion-reduce:animate-none respects
          the user's OS-level reduced-motion preference. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/8 via-background to-background"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-40 left-1/4 -z-10 size-112 rounded-full blur-3xl",
          "animate-pulse motion-reduce:animate-none",
          "transition-colors duration-700",
          slide.blobColor,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 -z-10 size-96 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-950/40 animate-pulse motion-reduce:animate-none"
      />

      <div className="container mx-auto flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* ── Slide layout ──────────────────────────────────────────────────
            The outer grid has no key/animation — it is stable across slides.
            Only the text content inside the left column is keyed and animated
            so the blood-group card on the right never jumps or flickers. */}
        <div
          {...slideA11yProps}
          className="grid flex-1 items-center gap-12 lg:grid-cols-12"
        >
          {/* ── Left column — animated text content ───────────────────────
              Each block carries a key so React fully unmounts and remounts it
              on every slide change, re-triggering the animate-in entrance.
              fill-mode-backwards keeps delayed elements invisible until their
              turn instead of flashing in before the delay elapses.
              Cascade: eyebrow (0 ms) → headline words (70 ms apart) →
              accent phrase → subhead (150 ms) → CTAs (200 ms) */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Eyebrow badge — live emergency pulse */}
            <Badge
              key={`eyebrow-${index}`}
              variant="outline"
              className="gap-2 border-primary/25 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-500 motion-reduce:animate-none"
            >
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {slide.eyebrow}
            </Badge>

            {/* Headline — word-by-word emergency cascade */}
            <h1
              key={`headline-${index}`}
              className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {slide.headline.split(" ").map((word, i) => (
                <Fragment key={word}>
                  <span
                    className="inline-block animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
              <span
                key={`headline-accent-${index}`}
                className={cn(
                  "bg-linear-to-r bg-clip-text text-transparent animate-in fade-in fill-mode-backwards motion-reduce:animate-none",
                  slide.accentFrom,
                  slide.accentTo,
                )}
                style={{ animationDelay: `${headlineWordCount * 70}ms` }}
              >
                {slide.headlineAccent}
              </span>
            </h1>

            {/* Subhead */}
            <p
              key={`subhead-${index}`}
              className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-500 delay-150 motion-reduce:animate-none"
            >
              {slide.subhead}
            </p>

            {/* CTA row */}
            <div
              key={`ctas-${index}`}
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-500 delay-200 motion-reduce:animate-none"
            >
              <Button
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
                render={<Link href={slide.primaryCta.href} />}
              >
                <PrimaryIcon className="size-4" />
                {slide.primaryCta.label}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
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
            <div className="animate-in fade-in slide-in-from-right-8 fill-mode-backwards duration-700 motion-reduce:animate-none rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl shadow-red-500/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    key={`card-icon-${index}`}
                    className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary animate-in fade-in zoom-in-95 fill-mode-backwards duration-300 motion-reduce:animate-none"
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
                      style={{ animationDelay: `${300 + i * 60}ms` }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border py-3 transition-all duration-300",
                        "animate-in fade-in zoom-in-95 fill-mode-backwards motion-reduce:animate-none",
                        isActive
                          ? "scale-105 border-primary/60 bg-primary/10 text-primary shadow-lg shadow-primary/10 motion-reduce:scale-100"
                          : "border-border/60 bg-background/80 hover:border-primary/40",
                      )}
                    >
                      <Droplet
                        className={cn(
                          "size-4 transition-all duration-300",
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
          {/* Auto-advance countdown — restarts in lockstep with the timer via
              the `cycle` key; freezes (play-state: paused) whenever rotation is
              paused. Slide accent colours keep it tied to the current story. */}
          <div
            aria-hidden
            className="h-1 w-full overflow-hidden rounded-full bg-muted/70 motion-reduce:hidden"
          >
            <div
              key={`${index}-${cycle}`}
              style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
              className={cn(
                "h-full w-full rounded-full bg-linear-to-r",
                slide.accentFrom,
                slide.accentTo,
                "animate-in slide-in-from-left-full ease-linear fill-mode-forwards",
                !autoPlayActive && "paused",
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
                className="size-9 transition-transform hover:scale-105 motion-reduce:transform-none"
                onClick={prev}
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-9 transition-transform hover:scale-105 motion-reduce:transform-none"
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
                className="size-9 transition-transform hover:scale-105 motion-reduce:transform-none"
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
                    "size-2 rounded-full transition-all duration-300 hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
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
