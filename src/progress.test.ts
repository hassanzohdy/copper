import { describe, expect, it } from "vitest";
import { progress } from "./progress";
import { stripAnsi } from "./strip-ansi";

function makeStream(isTTY: boolean) {
  const lines: string[] = [];
  return {
    lines,
    stream: {
      isTTY,
      write(chunk: string) {
        lines.push(chunk);
        return true;
      },
      cursorTo() {
        /* no-op */
      },
      clearLine() {
        /* no-op */
      },
    } as unknown as NodeJS.WriteStream,
  };
}

describe("progress", () => {
  it("ticks toward completion", () => {
    const { stream } = makeStream(true);
    const bar = progress({ total: 4, stream });
    bar.tick();
    bar.tick();
    expect(bar.current).toBe(2);
    bar.tick(10); // clamps
    expect(bar.current).toBe(4);
    expect(bar.isComplete).toBe(true);
  });

  it("update sets the value (clamped)", () => {
    const { stream } = makeStream(true);
    const bar = progress({ total: 10, stream });
    bar.update(5);
    expect(bar.current).toBe(5);
    bar.update(-3);
    expect(bar.current).toBe(0);
    bar.update(99);
    expect(bar.current).toBe(10);
  });

  it("done() writes a final newline (TTY)", () => {
    const { lines, stream } = makeStream(true);
    const bar = progress({ total: 2, stream });
    bar.tick();
    bar.done();
    expect(lines.at(-1)).toBe("\n");
    expect(bar.current).toBe(2);
  });

  it("done() prints a full line in non-TTY mode", () => {
    const { lines, stream } = makeStream(false);
    const bar = progress({ total: 5, stream });
    bar.tick();
    bar.done();
    expect(lines).toHaveLength(1); // no incremental redraws
    expect(stripAnsi(lines[0])).toMatch(/5\/5/);
  });
});
