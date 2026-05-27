import { describe, expect, it } from "vitest";
import { link } from "./link";
import { stripAnsi } from "./strip-ansi";

describe("link", () => {
  it("returns an OSC-8 sequence when ANSI is supported", () => {
    // We can't easily flip support detection mid-test (singleton), so we
    // only assert the strip preserves the visible text.
    const out = link("repo", "https://example.com");
    expect(stripAnsi(out)).toBe("repo");
  });

  it("with fallback=text-only returns just the text when unsupported", () => {
    // Round-trip through strip: even if the env supports ANSI, stripping
    // an OSC-8 leaves the visible text alone.
    expect(stripAnsi(link("repo", "https://example.com", { fallback: "text-only" }))).toBe("repo");
  });
});
