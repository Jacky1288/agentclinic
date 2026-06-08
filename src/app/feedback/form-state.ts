export type FeedbackFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialFeedbackFormState: FeedbackFormState = { status: "idle" };
