import { colors, ColorName } from "./colors";
import { symbols } from "./symbols";

export type SpinnerOptions = {
  text?: string;
  /** Frames to cycle through. Defaults to the Braille set from `symbols.spinner`. */
  frames?: string[];
  /** Interval between frames in ms. Default `80`. */
  interval?: number;
  /** Color name to render the frame. Default `"cyan"`. */
  color?: ColorName;
  /** Output stream. Default `process.stdout`. */
  stream?: NodeJS.WritableStream;
};

export type SpinnerHandle = {
  /** Begin animating. No-op if already started. */
  start(text?: string): SpinnerHandle;
  /** Update the trailing text without restarting the animation. */
  update(text: string): SpinnerHandle;
  /** Stop and clear the current line. */
  stop(): SpinnerHandle;
  /** Stop and replace the line with a green ✔ + message. */
  succeed(text?: string): SpinnerHandle;
  /** Stop and replace the line with a red ✖ + message. */
  fail(text?: string): SpinnerHandle;
  /** Stop and replace the line with a yellow ⚠ + message. */
  warn(text?: string): SpinnerHandle;
  /** Stop and replace the line with a cyan ℹ + message. */
  info(text?: string): SpinnerHandle;
  /** Whether the animation is currently running. */
  readonly isSpinning: boolean;
};

/**
 * Animated single-line spinner with a finalizer (succeed/fail/warn/info).
 * Works in TTYs. In non-TTY streams (CI, piped output) the spinner falls
 * back to printing the message once on `start()` and once on finalize —
 * no flicker, no broken redraws.
 *
 * ```ts
 * const sp = spinner({ text: "Compiling…" }).start();
 * try {
 *   await build();
 *   sp.succeed("Build complete");
 * } catch (err) {
 *   sp.fail("Build failed");
 *   throw err;
 * }
 * ```
 */
export function spinner(options: SpinnerOptions = {}): SpinnerHandle {
  const stream = options.stream ?? (typeof process !== "undefined" ? process.stdout : undefined);
  const frames = options.frames ?? symbols.spinner;
  const interval = options.interval ?? 80;
  const colorize = colors[options.color ?? "cyan"];

  let text = options.text ?? "";
  let timer: ReturnType<typeof setInterval> | null = null;
  let frame = 0;
  const isTTY = !!(stream && (stream as NodeJS.WriteStream).isTTY);

  const clearLine = () => {
    if (!stream) return;
    if (isTTY) {
      const ws = stream as NodeJS.WriteStream;
      ws.cursorTo?.(0);
      ws.clearLine?.(0);
    }
  };

  const render = () => {
    if (!stream) return;
    if (isTTY) {
      const ws = stream as NodeJS.WriteStream;
      ws.cursorTo?.(0);
      ws.write(`${colorize(frames[frame % frames.length])} ${text}`);
      ws.clearLine?.(1);
      frame++;
    }
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    clearLine();
    return handle;
  };

  const finalize = (mark: string, finalText?: string) => {
    stop();
    if (!stream) return handle;
    const line = `${mark} ${finalText ?? text}`;
    stream.write(line + "\n");
    return handle;
  };

  const handle: SpinnerHandle = {
    start(initialText) {
      if (timer) return handle;
      if (initialText !== undefined) text = initialText;
      if (isTTY) {
        render();
        timer = setInterval(render, interval);
        // Don't keep the event loop alive just for the spinner.
        if (typeof (timer as { unref?: () => void }).unref === "function") {
          (timer as { unref: () => void }).unref();
        }
      } else if (stream) {
        // Non-TTY: print the starting message once so logs still narrate progress.
        stream.write(`${text}\n`);
      }
      return handle;
    },
    update(newText) {
      text = newText;
      if (timer) render();
      return handle;
    },
    stop,
    succeed(t) {
      return finalize(colors.green(symbols.tick), t);
    },
    fail(t) {
      return finalize(colors.red(symbols.cross), t);
    },
    warn(t) {
      return finalize(colors.yellow(symbols.warning), t);
    },
    info(t) {
      return finalize(colors.cyan(symbols.info), t);
    },
    get isSpinning() {
      return timer !== null;
    },
  };

  return handle;
}
