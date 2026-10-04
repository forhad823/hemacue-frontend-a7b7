/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */

import { cn } from "@/lib/utils";

interface HemacueLogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function HemacueLogo({
  className,
  iconClassName,
  showText = true,
}: HemacueLogoProps) {
  return (
    <div
      className={cn("flex items-center gap-2.5 group select-none", className)}
    >
      <div
        className={cn(
          "relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-500/20 transition-transform group-hover:scale-105 dark:from-red-600 dark:to-red-800",
          iconClassName,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5 text-white"
        >
          <path
            d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
            fill="currentColor"
            className="text-white/90"
          />
          <path
            d="M12 11v6"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-700"
          />
          <path
            d="M9 14h6"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-700"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            Hemacue
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
            Emergency Blood
          </span>
        </div>
      )}
    </div>
  );
}
