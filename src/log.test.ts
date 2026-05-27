import { describe, expect, it } from "vitest";
import { createLogger } from "./log";
import { stripAnsi } from "./strip-ansi";

function makeStream() {
  const lines: string[] = [];
  const stream = {
    write(chunk: string) {
      lines.push(chunk);
      return true;
    },
  } as unknown as NodeJS.WritableStream;
  return { lines, stream };
}

describe("createLogger", () => {
  it("emits one line per call with the level symbol prefix", () => {
    const { lines, stream } = makeStream();
    const log = createLogger({ stream });
    log.info("hello");
    log.success("done");
    log.error(new Error("boom"));

    expect(lines).toHaveLength(3);
    expect(stripAnsi(lines[0])).toMatch(/hello\n$/);
    expect(stripAnsi(lines[1])).toMatch(/done\n$/);
    expect(stripAnsi(lines[2])).toMatch(/boom/);
  });

  it("suppresses lower levels when `level` is configured", () => {
    const { lines, stream } = makeStream();
    const log = createLogger({ stream, level: "warn" });
    log.debug("d");
    log.info("i");
    log.success("s");
    log.warn("w");
    log.error("e");

    expect(lines).toHaveLength(2); // only warn + error survive
    expect(stripAnsi(lines[0])).toMatch(/w\n$/);
    expect(stripAnsi(lines[1])).toMatch(/e\n$/);
  });

  it("stringifies non-string args", () => {
    const { lines, stream } = makeStream();
    const log = createLogger({ stream });
    log.info("port", 4000, { ok: true });
    expect(stripAnsi(lines[0])).toContain(`port 4000 {"ok":true}`);
  });
});
