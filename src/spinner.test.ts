import { describe, expect, it } from "vitest";
import { spinner } from "./spinner";
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
        /* no-op for the harness */
      },
      clearLine() {
        /* no-op for the harness */
      },
    } as unknown as NodeJS.WriteStream,
  };
}

describe("spinner (non-TTY stream)", () => {
  it("prints the start message once and writes a final line on succeed", () => {
    const { lines, stream } = makeStream(false);
    const sp = spinner({ text: "Building", stream }).start();
    expect(sp.isSpinning).toBe(false); // no interval scheduled in non-TTY mode
    expect(stripAnsi(lines[0])).toMatch(/Building\n$/);

    sp.succeed("Built");
    expect(stripAnsi(lines.at(-1)!)).toMatch(/Built\n$/);
  });

  it("fail() writes a single line", () => {
    const { lines, stream } = makeStream(false);
    const sp = spinner({ text: "Doing", stream }).start();
    sp.fail("Crashed");
    expect(stripAnsi(lines.at(-1)!)).toMatch(/Crashed\n$/);
  });
});

describe("spinner (TTY stream)", () => {
  it("starts an interval and stop() clears it", () => {
    const { stream } = makeStream(true);
    const sp = spinner({ text: "Working", stream, interval: 10 }).start();
    expect(sp.isSpinning).toBe(true);
    sp.stop();
    expect(sp.isSpinning).toBe(false);
  });

  it("update() changes the text without restarting", () => {
    const { stream } = makeStream(true);
    const sp = spinner({ text: "First", stream, interval: 10 }).start();
    sp.update("Second");
    expect(sp.isSpinning).toBe(true);
    sp.stop();
  });
});
