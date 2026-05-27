import { colors, ColorName } from "./colors";

export type ProgressOptions = {
  total: number;
  width?: number;
  /** Character drawn for completed segments. Default `█`. */
  complete?: string;
  /** Character drawn for the remaining segments. Default `░`. */
  incomplete?: string;
  /** Color name applied to the filled segment. Default `"green"`. */
  color?: ColorName;
  /**
   * Stream to draw on. Defaults to `process.stdout`. If the stream is not
   * a TTY the bar prints a single completion line on `done()` instead of
   * redrawing.
   */
  stream?: NodeJS.WritableStream;
  /**
   * Template for the rendered line. Tokens:
   *   `:bar` `:current` `:total` `:percent` `:eta` `:elapsed`
   * Default: `":bar :percent  :current/:total"`.
   */
  format?: string;
};

export type ProgressHandle = {
  tick(delta?: number): ProgressHandle;
  update(current: number): ProgressHandle;
  /** Force-complete (sets current = total) and writes a final newline. */
  done(): ProgressHandle;
  /** Stop without finishing — useful on errors. Clears the line. */
  stop(): ProgressHandle;
  readonly current: number;
  readonly total: number;
  readonly isComplete: boolean;
};

const DEFAULT_FORMAT = ":bar :percent  :current/:total";

/**
 * Drop-in CLI progress bar. Best paired with a known `total`. If you
 * don't know the total up front, use `spinner` instead.
 *
 * ```ts
 * const bar = progress({ total: files.length });
 * for (const file of files) {
 *   await upload(file);
 *   bar.tick();
 * }
 * bar.done();
 * ```
 */
export function progress(options: ProgressOptions): ProgressHandle {
  const stream = options.stream ?? (typeof process !== "undefined" ? process.stdout : undefined);
  const width = options.width ?? 30;
  const complete = options.complete ?? "█";
  const incomplete = options.incomplete ?? "░";
  const colorize = colors[options.color ?? "green"];
  const template = options.format ?? DEFAULT_FORMAT;
  const isTTY = !!(stream && (stream as NodeJS.WriteStream).isTTY);

  const startedAt = Date.now();
  let current = 0;
  let stopped = false;

  const renderLine = () => {
    const ratio = options.total === 0 ? 1 : Math.min(1, current / options.total);
    const filled = Math.round(ratio * width);
    const bar = colorize(complete.repeat(filled)) + incomplete.repeat(width - filled);
    const elapsed = (Date.now() - startedAt) / 1000;
    const eta = ratio > 0 ? (elapsed / ratio) * (1 - ratio) : 0;

    return template
      .replace(":bar", bar)
      .replace(":percent", `${(ratio * 100).toFixed(1).padStart(5)}%`)
      .replace(":current", String(current))
      .replace(":total", String(options.total))
      .replace(":elapsed", elapsed.toFixed(1) + "s")
      .replace(":eta", eta.toFixed(1) + "s");
  };

  const draw = () => {
    if (!stream || stopped) return;
    if (isTTY) {
      const ws = stream as NodeJS.WriteStream;
      ws.cursorTo?.(0);
      ws.write(renderLine());
      ws.clearLine?.(1);
    }
  };

  const handle: ProgressHandle = {
    tick(delta = 1) {
      current = Math.min(options.total, current + delta);
      draw();
      return handle;
    },
    update(value) {
      current = Math.max(0, Math.min(options.total, value));
      draw();
      return handle;
    },
    done() {
      current = options.total;
      if (stream && isTTY) {
        draw();
        stream.write("\n");
      } else if (stream) {
        stream.write(renderLine() + "\n");
      }
      stopped = true;
      return handle;
    },
    stop() {
      stopped = true;
      if (stream && isTTY) {
        const ws = stream as NodeJS.WriteStream;
        ws.cursorTo?.(0);
        ws.clearLine?.(0);
      }
      return handle;
    },
    get current() {
      return current;
    },
    get total() {
      return options.total;
    },
    get isComplete() {
      return current >= options.total;
    },
  };

  return handle;
}
