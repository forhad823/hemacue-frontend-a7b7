"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { HOME_FAQ_ENTRIES } from "@/lib/constants";

/**
 * Top 4 FAQ entries from HOME_FAQ_ENTRIES constants, rendered in the existing
 * Accordion primitive. Links to the full /faq page for the complete list.
 *
 * This is a client component because Accordion (Radix UI) requires client-side
 * interactivity for open/close state.
 */
export default function FaqPreview() {
  return (
    <section className="border-t border-border/40 bg-muted/10">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Common questions"
            title="Frequently asked questions"
            description="Quick answers to what patients and donors ask most. The full FAQ covers eligibility, payments, and technical details."
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4 shrink-0 gap-1.5 sm:mt-0"
            render={<Link href="/faq" />}
          >
            View all FAQs
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        <div className="mt-8 max-w-3xl">
          <Accordion type="single" collapsible defaultValue={HOME_FAQ_ENTRIES[0].id}>
            {HOME_FAQ_ENTRIES.map((entry) => (
              <AccordionItem key={entry.id} value={entry.id}>
                <AccordionTrigger className="text-sm font-medium text-foreground">
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          More questions?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contact our support team
          </Link>{" "}
          or visit the{" "}
          <Link
            href="/faq"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            full FAQ page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
