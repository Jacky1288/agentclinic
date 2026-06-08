import { describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/app/feedback/actions", () => ({
  submitFeedback: vi.fn(),
}));

const { FeedbackForm } = await import("../../src/app/feedback/feedback-form");
const FeedbackPage = (await import("../../src/app/feedback/page")).default;

describe("/feedback page + form", () => {
  test("page renders header and embeds the form", () => {
    const html = renderToString(FeedbackPage());
    expect(html).toContain("Send feedback");
    expect(html).toMatch(/We read every note/);
    // FeedbackForm fields show up
    expect(html).toMatch(/name="subject"/);
    expect(html).toMatch(/name="message"/);
    expect(html).toMatch(/name="contact"/);
  });

  test("form has labels for subject, message, and contact", () => {
    const html = renderToString(<FeedbackForm />);
    expect(html).toMatch(/for="subject"/);
    expect(html).toMatch(/for="message"/);
    expect(html).toMatch(/for="contact"/);
    expect(html).toMatch(/Subject/);
    expect(html).toMatch(/Message/);
    expect(html).toMatch(/Contact/);
    expect(html).toMatch(/optional/);
  });

  test("form has a submit button with the spec'd label", () => {
    const html = renderToString(<FeedbackForm />);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>[\s\S]*?Send feedback/);
  });
});
