/**
 * Detects whether the current runtime can render ANSI colors.
 *
 * Heuristic order (highest to lowest priority):
 *  1. `NO_COLOR` env or `--no-color` flag → off (https://no-color.org).
 *  2. `FORCE_COLOR=0` env → off.
 *  3. `FORCE_COLOR` env (any other value) or `--color` flag → on.
 *  4. Windows terminals → on (cmd / pwsh / Windows Terminal all support ANSI since 10).
 *  5. `tty.isatty(1)` and `TERM !== "dumb"` → on.
 *  6. Any `CI` env var → on (GitHub Actions, GitLab, CircleCI render ANSI).
 *  7. Otherwise → off (browser, piped output without FORCE_COLOR, etc.).
 *
 * The `tty` module is loaded lazily so importing this file in a browser
 * bundle does not blow up.
 */
export function detectColorSupport(): boolean {
  const env =
    typeof process !== "undefined" && process.env ? process.env : ({} as NodeJS.ProcessEnv);
  const argv =
    typeof process !== "undefined" && Array.isArray(process.argv) ? process.argv : [];

  if ("NO_COLOR" in env || argv.includes("--no-color")) return false;
  if (env.FORCE_COLOR === "0" || env.FORCE_COLOR === "false") return false;
  if ("FORCE_COLOR" in env || argv.includes("--color")) return true;

  if (typeof process === "undefined") return false;
  if (process.platform === "win32") return true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tty = require("tty") as typeof import("tty");
    if (tty.isatty && tty.isatty(1) && env.TERM !== "dumb") return true;
  } catch {
    /* not running under Node — fall through */
  }

  return "CI" in env;
}

export const isColorSupported: boolean = detectColorSupport();
