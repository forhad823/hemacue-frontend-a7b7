import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: string;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
              accent ?? "bg-primary/10 text-primary dark:bg-primary/20",
            )}
          >
            <Icon className="size-6" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
