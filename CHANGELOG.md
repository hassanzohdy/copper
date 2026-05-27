# Changelog

All notable changes to `@mongez/copper` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — Major rewrite

### Breaking changes

- Renamed `colors.brown2`, `colors.brown2Bright`, `colors.bgBrown2`, `colors.bgBrown2Bright` → `brown`, `brownBright`, `bgBrown`, `bgBrownBright`. The `2` suffix was leftover scaffolding; the new names match what the v1 README documented.
- Renamed `colors.limeGreen`, `colors.limeGreenBright`, `colors.bgLimeGreen`, `colors.bgLimeGreenBright` → `lime`, `limeBright`, `bgLime`, `bgLimeBright`. Same reason.
- `displayLoadingBar(iter, delay)` now returns `{ promise, stop }` instead of `void`. v1 had no way to cancel the interval. Prefer the new `progress({ total })` API.
- `displayThreeDotsAnimation(iter, delay)` now returns a `SpinnerHandle`. v1 ran forever with no stop hook. Prefer the new `spinner({ text }).start()` API.
- `FORCE_COLOR=0` and `FORCE_COLOR=false` now **disable** colors (v1 enabled colors as long as the variable was *defined*).
- `tty` is loaded lazily — importing `@mongez/copper` in a browser bundle no longer crashes.

### Added

- **`spinner`** — animated single-line spinner with `start` / `update` / `stop` / `succeed` / `fail` / `warn` / `info` finalizers. TTY-aware fallback for CI / piped output. Interval is `unref`'d.
- **`progress`** — known-total progress bar with `tick` / `update` / `done` / `stop` and template tokens (`:bar` `:current` `:total` `:percent` `:elapsed` `:eta`).
- **`log` + `createLogger`** — themed CLI logger with `debug` / `info` / `success` / `warn` / `error`, level filtering, per-level theme overrides, custom output stream, and Error stack serialization.
- **`box`** — Unicode / ASCII bordered text with single / double / round / bold / ascii styles, padding, margin, alignment, and border color. ANSI-aware width measurement so colored content aligns correctly.
- **`link`** — OSC-8 clickable terminal hyperlink with `text (url)` or `text-only` fallback.
- **`stripAnsi`** — remove every ANSI escape including OSC-8 hyperlinks.
- **`symbols`** — `tick` / `cross` / `info` / `warning` / `arrow` / `pointer` / `ellipsis` / `bullet` / `line` and Braille spinner frames, with ASCII fallbacks on legacy Windows `cmd.exe`.
- **`detectColorSupport()`** — re-evaluate color support against the current env/argv (in addition to the cached `isColorSupported` boolean).
- Exported types: `Colors`, `ColorName`, `Formatter`, `BoxStyle`, `BoxOptions`, `SpinnerHandle`, `SpinnerOptions`, `ProgressHandle`, `ProgressOptions`, `LogLevel`, `Logger`, `LoggerOptions`, `SymbolName`.
- 38 vitest cases covering colors, support detection, strip-ansi, link, box, log, spinner, and progress.
- CI matrix on Node 18 / 20 / 22 on Ubuntu and Node 20 on Windows.
- Per-feature skill docs under `skills/` (overview, colors, spinner, progress, log, box, utilities, recipes) plus `llms.txt` and `llms-full.txt` for AI agent consumption.

### Changed

- `createColors(enabled)` now returns a type-recoverable object exported as `Colors`. The factory is re-exposed on every instance (`colors.createColors(false)`).
- Color-support detection has a new priority order documented in the overview skill and README.

---

## [1.0.1] — Initial release

- `colors` object with the 20+ palette (under v1 names — `brown2*`, `limeGreen*`).
- `createColors(enabled)` factory.
- `isColorSupported` flag.
- `displayLoadingBar` and `displayThreeDotsAnimation` legacy animations.
