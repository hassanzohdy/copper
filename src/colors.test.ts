import { describe, expect, it } from "vitest";
import { colors, createColors, type Colors } from "./colors";

const enabled: Colors = createColors(true);
const disabled: Colors = createColors(false);

describe("createColors(enabled)", () => {
  it("exposes isColorSupported reflecting the requested mode", () => {
    expect(enabled.isColorSupported).toBe(true);
    expect(disabled.isColorSupported).toBe(false);
  });

  it("wraps text with the expected ANSI codes when enabled", () => {
    expect(enabled.red("hi")).toBe("\x1b[31mhi\x1b[39m");
    expect(enabled.bold("hi")).toBe("\x1b[1mhi\x1b[22m");
    expect(enabled.bgGreen("ok")).toBe("\x1b[42mok\x1b[49m");
  });

  it("is a no-op when disabled (returns the raw value as a string)", () => {
    expect(disabled.red("hi")).toBe("hi");
    expect(disabled.bold("hi")).toBe("hi");
    expect(disabled.bgGreen("ok")).toBe("ok");
  });

  it("coerces non-string input to string", () => {
    expect(enabled.red(42)).toBe("\x1b[31m42\x1b[39m");
    expect(enabled.red(null)).toBe("\x1b[31mnull\x1b[39m");
    expect(disabled.red(42)).toBe("42");
  });

  it("safely composes when an inner closer collides with the outer opener", () => {
    // bold(red("x")) — bold's close (22m) must not eat red's runs
    const composed = enabled.bold(enabled.red("x"));
    expect(composed).toMatch(/\x1b\[1m/); // bold opens
    expect(composed).toMatch(/\x1b\[31m/); // red opens
    expect(composed).toMatch(/\x1b\[39m/); // red closes
    expect(composed).toMatch(/\x1b\[22m$/); // bold closes last
  });

  it("uses 256-color sequences for the extended palette", () => {
    expect(enabled.lime("x")).toBe("\x1b[38;5;118mx\x1b[39m");
    expect(enabled.brown("x")).toBe("\x1b[38;5;94mx\x1b[39m");
    expect(enabled.bgGold("x")).toBe("\x1b[48;5;214mx\x1b[49m");
  });

  it("re-exposes the factory on each instance", () => {
    expect(typeof colors.createColors).toBe("function");
    const off = colors.createColors(false);
    expect(off.red("x")).toBe("x");
  });

  it("reset wraps with leading and trailing CSI 0", () => {
    expect(enabled.reset("hi")).toBe("\x1b[0mhi\x1b[0m");
    expect(disabled.reset("hi")).toBe("hi");
  });
});

describe("default colors singleton", () => {
  it("has the expected color keys", () => {
    const keys = Object.keys(colors);
    for (const k of [
      "red", "redBright", "bgRed",
      "blue", "blueBright", "bgBlue",
      "lime", "teal", "brown", "gold", "chocolate",
      "purple", "pink", "lavender", "indigo", "orange", "slate",
      "bold", "italic", "underline", "dim", "inverse", "hidden", "strikethrough", "reset",
    ]) {
      expect(keys, `missing ${k}`).toContain(k);
    }
  });

  it("has no leftover *2 keys from the v1 source", () => {
    const keys = Object.keys(colors);
    expect(keys.find((k) => k.endsWith("2"))).toBeUndefined();
    expect(keys.find((k) => k.startsWith("limeGreen"))).toBeUndefined();
  });
});
