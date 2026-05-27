import { describe, expect, it } from "vitest";
import { createColors } from "./colors";
import { link } from "./link";
import { stripAnsi } from "./strip-ansi";

const c = createColors(true);

describe("stripAnsi", () => {
  it("removes basic SGR sequences", () => {
    expect(stripAnsi(c.red("hi"))).toBe("hi");
    expect(stripAnsi(c.bold(c.red("hi")))).toBe("hi");
  });

  it("removes 256-color sequences", () => {
    expect(stripAnsi(c.lime("hi"))).toBe("hi");
    expect(stripAnsi(c.bgGold("hi"))).toBe("hi");
  });

  it("removes OSC-8 hyperlinks", () => {
    const linked = link("repo", "https://example.com");
    expect(stripAnsi(linked)).toBe("repo");
  });

  it("returns the input unchanged when there are no escapes", () => {
    expect(stripAnsi("plain text")).toBe("plain text");
  });

  it("stringifies non-string input", () => {
    expect(stripAnsi(42)).toBe("42");
    expect(stripAnsi(null)).toBe("null");
    expect(stripAnsi(undefined)).toBe("undefined");
  });
});
