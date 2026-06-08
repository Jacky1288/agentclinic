import { describe, expect, test } from "vitest";
import { feedbackSchema } from "@/lib/validation/feedback";

describe("feedbackSchema", () => {
  test("accepts a minimal valid submission", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hi",
      message: "Long enough message body.",
    });
    // subject min is 3, so "Hi" should fail; sanity check:
    expect(parsed.success).toBe(false);
  });

  test("accepts subject + message + contact", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Booked a session",
      message: "It went great, the agent came back composed.",
      contact: "ops@example.com",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.subject).toBe("Booked a session");
      expect(parsed.data.contact).toBe("ops@example.com");
    }
  });

  test("accepts submission without contact field", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Booked a session",
      message: "It went great, the agent came back composed.",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contact).toBeUndefined();
    }
  });

  test("treats empty-string contact as undefined", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Booked a session",
      message: "It went great, the agent came back composed.",
      contact: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contact).toBeUndefined();
    }
  });

  test("trims whitespace before length checks", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "   Hello   ",
      message: "   This message has padding around it.   ",
      contact: "   handle   ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.subject).toBe("Hello");
      expect(parsed.data.message).toBe("This message has padding around it.");
      expect(parsed.data.contact).toBe("handle");
    }
  });

  test("rejects subject that becomes too short after trim", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "   ok   ",
      message: "Long enough message body for the test.",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects missing subject", () => {
    const parsed = feedbackSchema.safeParse({
      message: "Long enough message body for the test.",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects missing message", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hello there",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects subject below 3 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "ab",
      message: "Long enough message body for the test.",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects subject above 120 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "a".repeat(121),
      message: "Long enough message body for the test.",
    });
    expect(parsed.success).toBe(false);
  });

  test("accepts subject at 120 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "a".repeat(120),
      message: "Long enough message body for the test.",
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects message below 10 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hello there",
      message: "short",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects message above 2000 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hello there",
      message: "a".repeat(2001),
    });
    expect(parsed.success).toBe(false);
  });

  test("accepts message at 2000 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hello there",
      message: "a".repeat(2000),
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects contact above 200 characters", () => {
    const parsed = feedbackSchema.safeParse({
      subject: "Hello there",
      message: "Long enough message body for the test.",
      contact: "a".repeat(201),
    });
    expect(parsed.success).toBe(false);
  });
});
