import type { Metadata } from "next";
import { CtaSection } from "@/components/shared/cta-section";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import FaqAccordion, {
  type FaqEntry,
} from "@/components/modules/faq/FaqAccordion";
import { CONTACT_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Hemacue donor matching, the 90-day donation cooldown, request verification, bKash payments and how your data is handled.",
  keywords: ["blood donation FAQ", "donor cooldown", "bKash payment blood request"],
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Frequently Asked Questions — Hemacue",
    description:
      "How matching works, why donors rest for 90 days, how payments and refunds work, and who can see your data.",
    url: "/faq",
    type: "website",
  },
};

const gettingStarted: FaqEntry[] = [
  {
    id: "who-can-donate",
    question: "Who can become a donor on Hemacue?",
    answer:
      "Any healthy adult who is at least 18 years old, weighs above 50 kg and has donated before without a medical complication can register as a donor. You need a valid email address, your district and city, and your blood group. Hemacue never asks for medical documents — the platform relies on the compatibility rules and on your own declaration of availability.",
  },
  {
    id: "registration",
    question: "How do I register and why do I need an OTP?",
    answer:
      "Registration sends a six-digit OTP to your email address. Verifying it creates your account and signs you in. The OTP proves that the email belongs to you, which is what keeps patient details and donor phone numbers attached to real people.",
  },
  {
    id: "two-roles",
    question: "Can I be both a patient and a donor?",
    answer:
      "Each account has one role. If you post a request you are a patient on that account, and if you want to donate you need a donor account with your own blood group and availability. Keeping the roles separate is what makes the dashboards and the matching logic unambiguous.",
  },
];

const matching: FaqEntry[] = [
  {
    id: "how-matching-works",
    question: "How does donor matching work?",
    answer:
      "You enter the patient's blood group, and optionally a district and the request id. The backend returns donors whose blood group is medically compatible with that patient, who are marked available, who are not deleted, and whose last donation is either missing or older than the 90-day cooldown. Donors already assigned to that request are excluded so nobody is notified twice.",
  },
  {
    id: "compatibility",
    question: "Which blood groups can donate to which patients?",
    answer:
      "Donors are matched through the standard compatibility matrix. O negative can donate to every group, O positive can donate to any positive group, A negative can donate to A negative, A positive, O negative and O positive, B follows the same pattern as A, AB negative can donate to every negative group, and AB positive can donate to all eight groups. The rules are applied by the backend, never by the browser.",
  },
  {
    id: "cooldown",
    question: "What is the 90-day cooldown and how is it enforced?",
    answer:
      "A whole-blood donation removes red cells that your body needs time to rebuild, so Hemacue blocks another donation for 90 days. When a request is completed, the donor's last donation date is stamped and availability is switched off automatically. Updating your last donation date from the profile has the same effect.",
  },
  {
    id: "accept-decline",
    question: "What happens when a donor is notified?",
    answer:
      "You receive an assignment with a notified status. Accepting locks the request to you and cancels the other pending notifications, while declining frees the request for the next compatible donor. Both responses are recorded, so the patient always sees a truthful state.",
  },
  {
    id: "verification",
    question: "Why does a request have to be verified first?",
    answer:
      "Verification is what separates a real hospital need from a spam post. An admin checks the patient details, blood group and hospital before donors are notified. Only a verified request can be assigned to a donor, which protects donors from responding to unverifiable requests.",
  },
];

const paymentsAndSafety: FaqEntry[] = [
  {
    id: "payments",
    question: "How do the paid services work?",
    answer:
      "Standard donor matching is free. Two optional services are paid: a premium notification, which widens the search when the first wave of donors does not respond, and emergency logistics, which arranges courier support for emergencies. Payments run through bKash tokenized checkout, are confirmed by the backend and produce a PDF invoice emailed to you.",
  },
  {
    id: "refunds",
    question: "Can I get a refund for emergency logistics?",
    answer:
      "Yes. If a courier cannot deliver, an administrator can refund the latest completed logistics payment for that request. The payment is marked cancelled with the refund transaction id, the amount and the reason, and the request flag is reset so the platform stays consistent.",
  },
  {
    id: "data-safety",
    question: "Who can see my data?",
    answer:
      "Public visitors can see blood requests but never account data. Authenticated users see only their own profile and their own requests or donations. Donors are only contacted when they are compatible with a request, and every administrative action — role change, block, payment, refund — is written to an audit log with the actor and timestamp.",
  },
  {
    id: "blocked-accounts",
    question: "What happens if an account is blocked?",
    answer:
      "A blocked account cannot authenticate. Use the forgot password flow with your email address to receive a reset OTP, and contact support so an admin can review and reactivate the account. We never delete request history silently.",
  },
  {
    id: "support",
    question: "How do I reach a human?",
    answer: `Use the contact form, email ${CONTACT_INFO.supportEmail}, or call ${CONTACT_INFO.phone} — ${CONTACT_INFO.phoneNote.toLowerCase()}. If a donation is time-critical, call first: telephone is faster than email in an emergency.`,
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions patients and donors ask us most"
        description="Everything about matching, cooldowns, verification and payments — answered without jargon. Still stuck? Our support team is one call away."
      />

      <section className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <SectionHeading eyebrow="Getting started" title="Accounts and roles" />
          <div className="mt-6">
            <FaqAccordion items={gettingStarted} />
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Matching and donations"
            title="How requests and donors are matched"
          />
          <div className="mt-6">
            <FaqAccordion items={matching} />
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Payments and safety"
            title="Paid services, refunds and your data"
          />
          <div className="mt-6">
            <FaqAccordion items={paymentsAndSafety} />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}