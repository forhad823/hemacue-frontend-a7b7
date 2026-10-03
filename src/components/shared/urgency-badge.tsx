import { AlertTriangle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UrgencyLevel } from "@/types";

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: UrgencyLevel;
  className?: string;
}) {
  const map: Record<
    UrgencyLevel,
    { label: string; style: string; icon: typeof Clock }
  > = {
    NORMAL: {
      label: "Normal",
      style: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
      icon: Clock,
    },
    HIGH: {
      label: "High Urgency",
      style: "bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:border-orange-700",
      icon: AlertTriangle,
    },
    EMERGENCY: {
      label: "Emergency",
      style: "bg-red-600 text-white border-red-700 animate-pulse dark:bg-red-700 dark:border-red-800",
      icon: Zap,
    },
  };

  const current = map[urgency];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs",
        current.style,
        className,
      )}
    >
      <Icon className="size-3" />
      <span>{current.label}</span>
    </span>
  );
}
