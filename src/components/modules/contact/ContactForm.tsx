"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ChevronDown, CircleCheck, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CONTACT_INFO } from "@/lib/constants";
import { contactSchema, contactSubjects } from "@/validation";

type ContactSubject = (typeof contactSubjects)[number]["value"];

const defaultSubject: ContactSubject = contactSubjects[0].value;

type SentMessage = {
  name: string;
  subject: ContactSubject;
  message: string;
};

/**
 * Public contact form. Validated with Zod through `@tanstack/react-form`. The
 * backend exposes no contact endpoint, so a valid submission is confirmed in the
 * UI and handed to the visitor's mail client pre-filled.
 */
export default function ContactForm() {
  const [sentMessage, setSentMessage] = useState<SentMessage | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: defaultSubject,
      message: "",
    },
    validators: {
      onChange: contactSchema,
    },
    onSubmit: ({ value }) => {
      setSentMessage({
        name: value.name,
        subject: value.subject,
        message: value.message,
      });
      toast.add({
        title: "Message validated",
        description: `Thanks ${value.name.split(" ")[0]} — we'll reach out soon.`,
        type: "success",
      });
      form.reset();
    },
  });

  const mailtoHref = sentMessage
    ? `mailto:${CONTACT_INFO.supportEmail}?subject=${encodeURIComponent(
        `[${CONTACT_INFO.supportEmail}] ${sentMessage.subject} — ${sentMessage.name}`,
      )}&body=${encodeURIComponent(sentMessage.message)}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {sentMessage && mailtoHref ? (
        <Alert>
          <CircleCheck className="size-4" />
          <AlertTitle>We have your message</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>
              Our support team reads every enquiry and replies within one
              working day. Your email client is ready to send the message
              straight to {CONTACT_INFO.supportEmail}.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              render={<a href={mailtoHref} />}
            >
              <Mail className="size-4" />
              Open in mail app
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Rahim Uddin"
                      autoComplete="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Phone (optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      inputMode="tel"
                      placeholder="01700000000"
                      autoComplete="tel"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="subject">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selected = contactSubjects.find(
                  (subject) => subject.value === field.state.value,
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        id={field.name}
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal"
                          />
                        }
                      >
                        {selected?.label ?? "Select a topic"}
                        <ChevronDown className="size-4 opacity-60" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuRadioGroup
                          value={field.state.value}
                          onValueChange={(value: string) => {
                            field.handleChange(value as ContactSubject);
                            field.handleBlur();
                          }}
                        >
                          {contactSubjects.map((subject) => (
                            <DropdownMenuRadioItem
                              key={subject.value}
                              value={subject.value}
                              className="cursor-pointer"
                            >
                              {subject.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FieldDescription>
                      Pick the topic that matches your issue so we route it to
                      the right person.
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="message">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={6}
                    placeholder="Tell us what happened — hospital name, blood group, district and how soon you need help."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    className="min-h-32 resize-y"
                  />
                  <FieldDescription>
                    At least 20 characters so we can help without a follow-up
                    call.
                  </FieldDescription>
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>

          <Button type="submit" size="lg" className="w-full gap-2">
            <Send className="size-4" />
            Send message
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
