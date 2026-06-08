"use client";

import { useActionState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/validation/feedback";
import { submitFeedback } from "./actions";
import { initialFeedbackFormState } from "./form-state";

const textareaClass =
  "flex min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500";

export function FeedbackForm() {
  const [state, formAction] = useActionState(
    submitFeedback,
    initialFeedbackFormState,
  );
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { subject: "", message: "", contact: "" },
  });

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
      >
        <h2 className="text-base font-semibold">Thanks — got it.</h2>
        <p className="mt-2">
          We&rsquo;ll read your note. If you left a way to reach you, expect a
          reply in a day or two.
        </p>
      </div>
    );
  }

  const onSubmit: SubmitHandler<FeedbackInput> = (data) => {
    const fd = new FormData();
    fd.append("subject", data.subject);
    fd.append("message", data.message);
    if (data.contact) fd.append("contact", data.contact);
    startTransition(() => formAction(fd));
  };

  const serverErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const fieldError = (key: keyof FeedbackInput) =>
    errors[key]?.message ?? serverErrors[key];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {state.status === "error" && !state.fieldErrors ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What's this about?"
          autoComplete="off"
          aria-invalid={Boolean(fieldError("subject")) || undefined}
          {...register("subject")}
        />
        {fieldError("subject") ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldError("subject")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          rows={6}
          placeholder="What worked, what didn't, what you'd like next."
          aria-invalid={Boolean(fieldError("message")) || undefined}
          className={cn(textareaClass)}
          {...register("message")}
        />
        {fieldError("message") ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldError("message")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact">
          Contact{" "}
          <span className="font-normal text-slate-400 dark:text-slate-500">
            (optional)
          </span>
        </Label>
        <Input
          id="contact"
          placeholder="Email, handle, anything you'd like a reply at"
          autoComplete="off"
          aria-invalid={Boolean(fieldError("contact")) || undefined}
          {...register("contact")}
        />
        {fieldError("contact") ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {fieldError("contact")}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send feedback"}
        </Button>
      </div>
    </form>
  );
}
