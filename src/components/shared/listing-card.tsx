import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListingCardMeta {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

/**
 * Discriminated union: a card always has either an image OR an icon fallback —
 * never both required, never neither.
 */
type ListingCardVisual =
  | { image: { src: string; alt: string }; icon?: never }
  | { icon: LucideIcon; image?: never };

interface ListingCardBase {
  /** Optional badge above the title (e.g. urgency, status). */
  badge?: ReactNode;
  title: string;
  description: string;
  /** Short data points rendered as a strip below the description. */
  meta: ListingCardMeta[];
  /** Primary action ("View details", "Assign donor", etc.). */
  actions: ReactNode;
  /** Optional secondary footer content (timestamp, location hint). */
  footer?: ReactNode;
  className?: string;
}

export type ListingCardProps = ListingCardBase & ListingCardVisual;

/**
 * Shared listing card used by the home page FeaturedRequests section and the
 * public Explore page. Accepts either an image or an icon fallback — never both.
 *
 * Reuses the existing Card / CardHeader / CardContent / CardFooter primitives so
 * visual identity is consistent across the app.
 */
export function ListingCard({
  image,
  icon: Icon,
  badge,
  title,
  description,
  meta,
  actions,
  footer,
  className,
}: ListingCardProps) {
  return (
    <Card
      className={cn(
        "group h-full transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5",
        className,
      )}
    >
      {/* Visual area — image or icon tile */}
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={640}
          height={360}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="h-44 w-full object-cover"
        />
      ) : Icon ? (
        <div className="flex h-44 w-full items-center justify-center bg-primary/5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-8" />
          </span>
        </div>
      ) : null}

      <CardHeader>
        {badge ? <div className="mb-1">{badge}</div> : null}
        <CardTitle className="line-clamp-2 text-sm font-semibold leading-snug">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>

        {meta.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {meta.map((item) => {
              const MetaIcon = item.icon;
              return (
                <li
                  key={item.label}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                >
                  {MetaIcon ? <MetaIcon className="size-3 shrink-0" /> : null}
                  <span className="font-medium text-foreground/80">
                    {item.label}:
                  </span>
                  <span>{item.value}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        {actions}
        {footer ? (
          <span className="text-xs text-muted-foreground">{footer}</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
