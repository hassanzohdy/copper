import { afterEach, describe, expect, it, vi } from "vitest";
import { stripAnsi } from "./strip-ansi";

/**
 * `isColorSupported` is read once, when `./support` loads, so each test sets
 * the environment first and then loads a fresh copy of `./link`. Without this
 * the result depended on the machine running the tests (a TTY, `CI`,
 * `NO_COLOR`, `FORCE_COLOR=0`).
 */
async function loadLink(supported: boolean): Promise<typeof import("./link").link> {
  vi.stubEnv("NO_COLOR", undefined);
  vi.stubEnv("FORCE_COLOR", supported ? "1" : "0");
  vi.resetModules();
  return (await import("./link")).link;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("link", () => {
  it("returns an OSC-8 sequence when ANSI is supported", async () => {
    const link = await loadLink(true);
    const out = link("repo", "https://example.com");
    expect(out).toBe("\x1b]8;;https://example.com\x1b\\repo\x1b]8;;\x1b\\");
    expect(stripAnsi(out)).toBe("repo");
  });

  it("falls back to `text (url)` when ANSI is not supported", async () => {
    const link = await loadLink(false);
    expect(link("repo", "https://example.com")).toBe("repo (https://example.com)");
  });

  it("with fallback=text-only returns just the text when unsupported", async () => {
    const link = await loadLink(false);
    expect(link("repo", "https://example.com", { fallback: "text-only" })).toBe("repo");
  });
});
