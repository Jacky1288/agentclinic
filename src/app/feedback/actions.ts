"use server";

import { revalidatePath } from "next/cache";
import { createFeedback } from "@/lib/queries/feedback";
import { feedbackSchema } from "@/lib/validation/feedback";
import type { FeedbackFormState } from "./form-state";

function flattenZod(error: import("zod").ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function submitFeedback(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const raw = {
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    contact: String(formData.get("contact") ?? ""),
  };
  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenZod(parsed.error),
    };
  }
  await createFeedback(parsed.data);
  revalidatePath("/dashboard");
  return { status: "success" };
}
