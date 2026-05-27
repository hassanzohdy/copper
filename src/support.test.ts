import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectColorSupport } from "./support";

const originalEnv = { ...process.env };
const originalArgv = [...process.argv];

const reset = () => {
  for (const k of Object.keys(process.env)) delete process.env[k];
  Object.assign(process.env, originalEnv);
  process.argv = [...originalArgv];
};

describe("detectColorSupport", () => {
  beforeEach(reset);
  afterEach(reset);

  it("honors NO_COLOR (off, regardless of FORCE_COLOR)", () => {
    process.env.NO_COLOR = "1";
    process.env.FORCE_COLOR = "1";
    expect(detectColorSupport()).toBe(false);
  });

  it("honors --no-color flag", () => {
    process.argv = [...originalArgv, "--no-color"];
    expect(detectColorSupport()).toBe(false);
  });

  it("honors FORCE_COLOR=0 (off, even though FORCE_COLOR is present)", () => {
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = "0";
    expect(detectColorSupport()).toBe(false);
  });

  it("turns colors on for any other FORCE_COLOR value", () => {
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = "1";
    expect(detectColorSupport()).toBe(true);
  });

  it("turns colors on for --color flag", () => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    process.argv = [...originalArgv, "--color"];
    expect(detectColorSupport()).toBe(true);
  });
});
