import { db } from "@/lib/db";
import type { FeedbackInput } from "@/lib/validation/feedback";

export async function createFeedback(input: FeedbackInput): Promise<void> {
  await db.feedback.create({
    data: {
      subject: input.subject,
      message: input.message,
      contact: input.contact ?? null,
    },
  });
}

export async function listRecentFeedback({
  limit = 20,
}: { limit?: number } = {}) {
  return db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type FeedbackRow = Awaited<
  ReturnType<typeof listRecentFeedback>
>[number];
