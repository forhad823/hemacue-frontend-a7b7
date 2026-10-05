import { House, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BrandIllustration,
  UtilityPage,
} from "@/components/shared/utility-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist or has moved.",
};

export default function NotFound() {
  return (
    <UtilityPage
      illustration={<BrandIllustration variant="not-found" />}
      code="Error 404"
      title="We couldn't find that page"
      description="The link may be out of date, or the page may have moved. Let's get you back to somewhere that can help."
      actions={
        <>
          <Link href="/" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            <House className="size-4" />
            Back to home
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2",
            )}
          >
            <MessageCircle className="size-4" />
            Contact us
          </Link>
        </>
      }
    />
  );
}
