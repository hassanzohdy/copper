import { progress } from "./progress";
import { spinner, SpinnerHandle } from "./spinner";

/**
 * @deprecated Use `progress({ total })` for a real progress bar with
 * `tick` / `update` / `done`. This helper is kept as a thin shim so v1
 * code does not break — it now returns a handle you can `stop()`.
 *
 * Renders an animated loading bar and resolves when `iterations` is hit.
 */
export function displayLoadingBar(iterations = 20, delay = 100): {
  promise: Promise<void>;
  stop: () => void;
} {
  const bar = progress({ total: iterations });
  let stopped = false;

  const promise = new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      if (stopped) {
        clearInterval(timer);
        return;
      }
      bar.tick();
      if (bar.isComplete) {
        clearInterval(timer);
        bar.done();
        resolve();
      }
    }, delay);
    if (typeof (timer as { unref?: () => void }).unref === "function") {
      (timer as { unref: () => void }).unref();
    }
  });

  return {
    promise,
    stop() {
      stopped = true;
      bar.stop();
    },
  };
}

/**
 * @deprecated Use `spinner({ text }).start()` and `.stop()` / `.succeed()`.
 *
 * Animates `...` on the current line until you call `stop()`. The v1
 * implementation never stopped on its own — this shim returns a handle
 * so the interval can actually be cleared.
 */
export function displayThreeDotsAnimation(_iterations = 3, delay = 1000): SpinnerHandle {
  return spinner({ text: "...", interval: delay, frames: [".", "..", "..."] }).start();
}
