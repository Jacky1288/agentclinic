import { describe, expect, test } from "vitest";
import { renderToString } from "react-dom/server";
import { Header } from "../../src/components/layout/Header";
import { Main } from "../../src/components/layout/Main";
import { Footer } from "../../src/components/layout/Footer";
import { MainLayout } from "../../src/components/layout/MainLayout";
import Home from "../../src/app/page";

describe("Layout subcomponents render their landmark + copy", () => {
  test("Header renders a <header> with the AgentClinic wordmark", () => {
    const html = renderToString(<Header />);
    expect(html).toMatch(/^<header\b/);
    expect(html).toContain("AgentClinic");
    expect(html).toMatch(/Open daily/i);
  });

  test("Footer renders a <footer> with the phase note + copyright", () => {
    const html = renderToString(<Footer />);
    expect(html).toMatch(/^<footer\b/);
    expect(html).toMatch(/Phase 0 skeleton/i);
    expect(html).toContain("© AgentClinic");
  });

  test("Main wraps its children in a single <main> landmark", () => {
    const html = renderToString(
      <Main>
        <span>child copy</span>
      </Main>,
    );
    expect(html).toMatch(/^<main\b/);
    expect(html).toContain("child copy");
    expect(html.match(/<main\b/g) ?? []).toHaveLength(1);
  });
});

describe("MainLayout composes Header / Main / Footer in order", () => {
  test("rendered HTML has header, then main, then footer", () => {
    const html = renderToString(
      <MainLayout>
        <p>page content</p>
      </MainLayout>,
    );
    const headerIdx = html.indexOf("<header");
    const mainIdx = html.indexOf("<main");
    const footerIdx = html.indexOf("<footer");
    expect(headerIdx).toBeGreaterThanOrEqual(0);
    expect(mainIdx).toBeGreaterThan(headerIdx);
    expect(footerIdx).toBeGreaterThan(mainIdx);
    expect(html).toContain("page content");
  });

  test("MainLayout renders exactly one <main> landmark (no nesting)", () => {
    const html = renderToString(
      <MainLayout>
        <p>inner</p>
      </MainLayout>,
    );
    expect(html.match(/<main\b/g) ?? []).toHaveLength(1);
  });

  test("MainLayout root carries the main-layout chassis class", () => {
    const html = renderToString(
      <MainLayout>
        <p>inner</p>
      </MainLayout>,
    );
    expect(html).toMatch(/class="main-layout"/);
  });
});

describe("Home page renders the landing copy", () => {
  test("heading, tagline, and joke blurb all present", () => {
    const html = renderToString(<Home />);
    expect(html).toMatch(/<h1\b[^>]*>AgentClinic<\/h1>/);
    expect(html).toMatch(/Spec-driven demo/i);
    expect(html).toMatch(/prompt fatigue/i);
    expect(html).toMatch(/context\s+exhaustion/i);
    expect(html).toMatch(/hallucination/i);
  });

  test("Home does not introduce its own <main> (MainLayout owns it)", () => {
    const html = renderToString(<Home />);
    expect(html).not.toMatch(/<main\b/);
  });
});
