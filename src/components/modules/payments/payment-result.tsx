import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PaymentResultAction {
  label: string;
  href: string;
}

interface PaymentResultProps {
  icon: LucideIcon;
  tone: "success" | "warning";
  title: string;
  description: string;
  bullets?: string[];
  primaryAction: PaymentResultAction;
  secondaryAction?: PaymentResultAction;
}

const TONES = {
  success: {
    ring: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge: "Payment successful",
  },
  warning: {
    ring: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badge: "Payment not completed",
  },
} as const;

/** Shared result frame for the bKash redirect landing pages. */
export function PaymentResult({
  icon: Icon,
  tone,
  title,
  description,
  bullets,
  primaryAction,
  secondaryAction,
}: PaymentResultProps) {
  const styles = TONES[tone];

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center justify-items-center text-center">
          <div
            className={cn(
              "mb-2 flex size-14 items-center justify-center rounded-full",
              styles.ring,
            )}
          >
            <Icon className="size-7" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {styles.badge}
          </p>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bullets && bullets.length > 0 && (
            <ul className="space-y-1.5 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span aria-hidden>•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              render={<Link href={primaryAction.href} />}
            >
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button
                variant="outline"
                className="flex-1"
                render={<Link href={secondaryAction.href} />}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
