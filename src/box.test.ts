import { describe, expect, it } from "vitest";
import { box } from "./box";
import { stripAnsi } from "./strip-ansi";

describe("box", () => {
  it("wraps single-line text with a default round border", () => {
    const out = stripAnsi(box("hi"));
    expect(out).toContain("╭");
    expect(out).toContain("╮");
    expect(out).toContain("╰");
    expect(out).toContain("╯");
    expect(out).toContain("│ hi │");
  });

  it("respects borderStyle", () => {
    expect(stripAnsi(box("hi", { borderStyle: "double" }))).toContain("╔");
    expect(stripAnsi(box("hi", { borderStyle: "ascii" }))).toContain("+");
  });

  it("pads multi-line text to the longest line", () => {
    const lines = stripAnsi(box("short\nmuch longer")).split("\n");
    const widths = lines.map((l) => l.length);
    expect(new Set(widths).size).toBe(1);
  });

  it("supports center alignment", () => {
    const lines = stripAnsi(box("short\nmuch longer", { align: "center" })).split("\n");
    // The "short" line should have whitespace on both sides
    const shortLine = lines.find((l) => l.includes("short"))!;
    expect(shortLine.indexOf("short")).toBeGreaterThan(2);
  });

  it("ignores ANSI when measuring width", () => {
    const colored = "\x1b[31mred\x1b[39m";
    const lines = stripAnsi(box(colored)).split("\n");
    const widths = lines.map((l) => l.length);
    expect(new Set(widths).size).toBe(1);
  });
});
