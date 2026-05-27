---
name: mongez-copper-overview
description: |
  @mongez/copper is a zero-dependency CLI toolkit: ANSI colors (20+ named hues across foreground / background / bright variants), spinners, progress bars, themed loggers, boxed messages, OSC-8 hyperlinks, and ANSI stripping. `NO_COLOR` / `FORCE_COLOR` aware, browser-safe imports.
  TRIGGER when: code imports `colors`, `createColors`, `spinner`, `progress`, `log`, `createLogger`, `box`, `link`, `stripAnsi`, `symbols`, `isColorSupported`, or `detectColorSupport` from `@mongez/copper`; user asks "how do I color CLI output / make a spinner / draw a progress bar / build a CLI in Node"; replacing `chalk` / `picocolors` / `ora` / `cli-progress` / `boxen`.
  SKIP: browser-only styling (use CSS); `console.log` formatting alone with no `@mongez/copper` import; React component theming.
---

# @mongez/copper — overview

`@mongez/copper` is a zero-dependency, TypeScript-first CLI toolkit. One install gives you colors, spinners, progress bars, boxed messages, a themed logger, and OSC-8 hyperlinks — without the maintenance burden of pulling in `chalk` + `ora` + `cli-progress` + `boxen` separately.

## Install

```sh
yarn add @mongez/copper
# or
npm i @mongez/copper
```

## Import surface

Every export comes from the root:

```ts
import {
  colors, createColors, type Colors, type ColorName, type Formatter,
  spinner, type SpinnerHandle, type SpinnerOptions,
  progress, type ProgressHandle, type ProgressOptions,
  box, type BoxOptions, type BoxStyle,
  log, createLogger, type Logger, type LogLevel, type LoggerOptions,
  link,
  stripAnsi,
  symbols, type SymbolName,
  isColorSupported, detectColorSupport,
} from "@mongez/copper";
```

## Where features live

| Need | Use | Skill |
|---|---|---|
| Color/style text | `colors.red("…")`, `colors.bold(…)` | [colors](../colors/SKILL.md) |
| Animated loading | `spinner({ text }).start()` | [spinner](../spinner/SKILL.md) |
| Known-total bar | `progress({ total })` | [progress](../progress/SKILL.md) |
| Themed CLI logs | `log.info / warn / error / success` | [log](../log/SKILL.md) |
| Boxed message | `box("text", { borderStyle })` | [box](../box/SKILL.md) |
| Hyperlinks, ANSI strip, symbols | `link`, `stripAnsi`, `symbols` | [utilities](../utilities/SKILL.md) |
| Worked end-to-end examples | — | [recipes](../recipes/SKILL.md) |

## Color-support detection

`isColorSupported` is a boolean that's resolved at module load. Priority:

1. `NO_COLOR` env or `--no-color` argv → off (per [no-color.org](https://no-color.org)).
2. `FORCE_COLOR=0` / `FORCE_COLOR=false` → off.
3. `FORCE_COLOR` (any other value) or `--color` argv → on.
4. Windows → on (cmd / pwsh / Windows Terminal all render ANSI on Win10+).
5. TTY stdout with `TERM !== "dumb"` → on.
6. Any `CI` env var → on.
7. Otherwise → off.

`createColors(false)` short-circuits this — every formatter becomes the identity `String`, so colored builders can be re-run in test snapshots or piped output without ANSI noise.

## v2 breaking changes (from v1)

- `brown2*` → `brown*` (matches the v1 README contract).
- `limeGreen*` → `lime*` (matches the v1 README contract).
- `displayLoadingBar` / `displayThreeDotsAnimation` are kept but **return a handle** instead of leaking intervals — they're shims around the new `progress` / `spinner` APIs. Prefer the new ones.
- New: `spinner`, `progress`, `box`, `log`, `createLogger`, `link`, `stripAnsi`, `symbols`, `detectColorSupport`.
- New types: `Colors`, `ColorName`, `BoxStyle`, `BoxOptions`, `SpinnerHandle`, `SpinnerOptions`, `ProgressHandle`, `ProgressOptions`, `LogLevel`, `Logger`, `LoggerOptions`, `SymbolName`.
- `FORCE_COLOR=0` now correctly disables (v1 enabled colors as long as the var was *defined*).
- The `tty` module is loaded lazily — importing `@mongez/copper` in a browser bundle no longer blows up.

## Scope boundaries

- Need general string/array helpers? Use [`@mongez/reinforcements`](https://github.com/hassanzohdy/reinforcements).
- Need a full prompt/input library? Pair `@mongez/copper` with `@inquirer/prompts` or `prompts`.
- Need a file-system layer? Use [`@mongez/fs`](https://github.com/hassanzohdy/fs).
