import { z } from "zod";

export const feedbackSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject must be at most 120 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
  contact: z
    .string()
    .trim()
    .max(200, "Contact must be at most 200 characters")
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
