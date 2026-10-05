"use client";

import { Inter } from "next/font/google";
import { useEffect } from "react";
import { HemacueLogo } from "@/components/shared/hemacue-logo";
import "./globals.css";
import { BrandIllustration } from "@/components/shared/utility-page";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

/**
 * Applies the saved theme before first paint. The root layout (and with it the
 * ThemeProvider) is replaced while this boundary is showing, so next-themes is
 * not available here. It stores the choice under the "theme" key.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

/**
 * Last-resort boundary. It replaces the root layout, so it must render its own
 * <html> and <body>, and it cannot rely on providers, hooks from them, or
 * client routing. Plain elements and a normal <a> keep it dependency-free.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <title>Something went wrong | Hemacue</title>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <main className="relative isolate flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
          />

          <a href="/" aria-label="Hemacue home" className="mb-8">
            <HemacueLogo />
          </a>

          <BrandIllustration variant="error" />

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Something went wrong
          </p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            That didn&apos;t go as planned
          </h1>
          <p className="mt-3 max-w-md text-balance text-muted-foreground">
            An unexpected problem stopped Hemacue from loading. Nothing
            you&apos;ve saved was lost. Try again, or head back home.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Back to home
            </a>
          </div>

          {error.digest && (
            <p className="mt-6 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <p className="mt-10 text-xs text-muted-foreground">
            Need blood urgently? Call our 24/7 emergency line{" "}
            <a
              href="tel:+8801700000000"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              +880 1700-000000
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
