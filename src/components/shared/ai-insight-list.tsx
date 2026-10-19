"use client";

import {
  Info,
  type LucideIcon,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Insight, InsightTone } from "@/lib/ai/insights";
import { cn } from "@/lib/utils";

const TONE_META: Record<InsightTone, { icon: LucideIcon; className: string }> =
  {
    positive: {
      icon: TrendingUp,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      icon: TriangleAlert,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: Info,
      className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  };

interface AiInsightListProps {
  insights: Insight[];
}

/**
 * Renders the deterministic `Insight[]` a generator returned. Pure presentational —
 * every number and sentence comes from the caller's real data; nothing is invented here.
 * Renders nothing when there are no insights.
 */
export function AiInsightList({ insights }: AiInsightListProps) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Sparkles className="size-4" />
          </span>
          Insights
        </CardTitle>
        <CardDescription>
          Derived from your live data — no guessing, just patterns worth acting
          on.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0">
          {insights.map((insight) => {
            const meta = TONE_META[insight.tone];
            const Icon = meta.icon;

            return (
              <li
                key={insight.id}
                className="flex items-start gap-3 border-b py-3 last:border-b-0 last:pb-0 first:pt-0"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-md p-1.5",
                    meta.className,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">
                    {insight.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                {insight.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-0.5 shrink-0 cursor-pointer"
                    render={<Link href={insight.action.href} />}
                  >
                    {insight.action.label}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
