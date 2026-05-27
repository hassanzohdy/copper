<div align="center">

# @mongez/copper

**A zero-dependency, TypeScript-first CLI toolkit — ANSI colors, spinners, progress bars, themed loggers, boxed messages, OSC-8 hyperlinks, and ANSI stripping in one tiny import.**

[![npm](https://img.shields.io/npm/v/@mongez/copper.svg)](https://www.npmjs.com/package/@mongez/copper)
[![license](https://img.shields.io/npm/l/@mongez/copper.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mongez/copper.svg)](https://bundlephobia.com/package/@mongez/copper)
[![downloads](https://img.shields.io/npm/dw/@mongez/copper.svg)](https://www.npmjs.com/package/@mongez/copper)
[![tests](https://img.shields.io/badge/tests-38%20passing-success.svg)](#testing)

</div>

---

## Why @mongez/copper?

Building a polished CLI in Node usually means stacking five or six separate dependencies — `chalk` for colors, `ora` for spinners, `cli-progress` for bars, `boxen` for frames, `figures` for symbols, `ansi-escapes` for cursor moves — then keeping all of them on compatible major versions while their authors quarrel about ESM vs CJS, peer ranges, and what counts as a breaking change. Each one carries its own conventions, its own option names, its own opinions about whether `NO_COLOR` is respected.

`@mongez/copper` is one package, zero runtime dependencies, one set of conventions, and full TypeScript types end-to-end. It respects `NO_COLOR` / `FORCE_COLOR`, degrades gracefully in non-TTY streams (CI, piped output), and ships ASCII fallbacks for the few Windows consoles that still can't render Unicode box-drawing.

```ts
import { colors, spinner, progress, box, log, link } from "@mongez/copper";

log.info("Starting build");

const sp = spinner({ text: "Compiling…" }).start();
await build();
sp.succeed("Compiled");

const bar = progress({ total: files.length, color: "lime" });
for (const f of files) { await upload(f); bar.tick(); }
bar.done();

console.log(box(`Deploy complete — ${link("view", "https://app.example.com")}`, {
  borderStyle: "round",
  borderColor: "green",
}));
```

---

## Features

| Feature | What it gives you |
|---|---|
| **`colors`** | ANSI colorizer with 20+ named hues across fg / bg / *Bright / bgBright* variants + modifiers (`bold`, `italic`, `dim`, `underline`, `inverse`, `hidden`, `strikethrough`, `reset`) |
| **`createColors(enabled)`** | Build a forced-on or forced-off colors instance |
| **`spinner`** | Animated single-line spinner with `succeed` / `fail` / `warn` / `info` finalizers; TTY-aware |
| **`progress`** | Known-total progress bar with `tick` / `update` / `done`, template tokens (`:bar` `:percent` `:eta` …) |
| **`log` / `createLogger`** | Themed level-aware logger with `debug` / `info` / `success` / `warn` / `error` |
| **`box`** | Wrap text in a Unicode (single / double / round / bold) or ASCII border with alignment & padding |
| **`link`** | OSC-8 clickable hyperlinks with `text (url)` fallback for older terminals |
| **`stripAnsi`** | Remove every ANSI escape including OSC-8 hyperlinks |
| **`symbols`** | `✔ ✖ ℹ ⚠ → ❯ … • ─` + Braille spinner frames, with ASCII fallbacks on legacy Windows |
| **`isColorSupported` / `detectColorSupport`** | `NO_COLOR` / `FORCE_COLOR` / TTY / CI detection |

Zero runtime dependencies. ~3 KB minified+gzipped. Tree-shakeable.

---

## Installation

```sh
npm install @mongez/copper
```

```sh
yarn add @mongez/copper
```

```sh
pnpm add @mongez/copper
```

No peer dependencies. Works on Node 18+ and in any modern bundler. The `tty` module is loaded lazily so importing this package in a browser bundle does not blow up — the color-detection function simply returns `false` there.

---

## Quick start

```ts
import {
  colors, spinner, progress, log, box, link, stripAnsi, symbols, createColors,
} from "@mongez/copper";

// 1. Colors with deep palette
console.log(colors.bold(colors.lime("Booting up…")));
console.log(colors.bgGold(colors.black(" WARNING ")));

// 2. Logger
log.info("Server", { port: 4000 });
log.success("Listening");
log.warn("Cache miss");
log.error(new Error("Database unreachable"));

// 3. Spinner
const sp = spinner({ text: "Reading config…" }).start();
await loadConfig();
sp.succeed("Config loaded");

// 4. Progress bar
const bar = progress({ total: 100, color: "cyan" });
for (let i = 0; i < 100; i++) {
  await tick();
  bar.tick();
}
bar.done();

// 5. Box
console.log(box("All good", { borderColor: "green" }));

// 6. Clickable link
console.log(`See ${link("docs", "https://example.com")} for details`);

// 7. Strip for tests
stripAnsi(colors.red("hi")); // "hi"

// 8. Force-off (snapshot tests, file logs)
const plain = createColors(false);
plain.red("hi"); // "hi"
```

---

## Colors

20+ named hues across foreground, background, `*Bright`, and `bgBright*` variants. Standard 4-bit colors use SGR 30-37 / 90-97; extended hues (`lime`, `teal`, `brown`, `gold`, `chocolate`, `pink`, `purple`, `lavender`, `indigo`, `orange`, `slate`) use 256-color sequences.

```ts
import { colors } from "@mongez/copper";

colors.red("error");
colors.bold(colors.cyan("info"));
colors.bgGreen(colors.black(" OK "));
colors.italic(colors.gray("hint"));
colors.bgLavender(colors.indigo("dreamy"));
```

### Reference

| Concept | Use | Note |
|---|---|---|
| Basic fg | `red`, `green`, `blue`, … | 4-bit SGR — universal support |
| Bright fg | `redBright`, `cyanBright`, … | 4-bit bright SGR |
| Background | `bgRed`, `bgGreen`, … | Paired with the fg color |
| Extended hues | `lime`, `teal`, `gold`, `pink`, `lavender`, `purple`, `indigo`, … | 256-color SGR |
| Modifiers | `bold`, `italic`, `dim`, `underline`, `inverse`, `hidden`, `strikethrough`, `reset` | Can be nested |
| Forced builder | `createColors(true)` / `createColors(false)` | Override env detection |
| Types | `Colors`, `ColorName`, `Formatter` | TS support for indexed access |

### Typed color names

```ts
import { colors, type ColorName } from "@mongez/copper";

function paint(level: "ok" | "fail", text: string) {
  const c: ColorName = level === "ok" ? "green" : "red";
  return colors[c](text);
}
```

### Replacing chalk

```diff
- import chalk from "chalk";
+ import { colors } from "@mongez/copper";

- chalk.red(text);
+ colors.red(text);

- chalk.red.bold(text);
+ colors.red(colors.bold(text));
```

For chalk's tagged-template syntax pair with [`colorize-template`](https://github.com/usmanyunusov/colorize-template):

```ts
import { createColorize } from "colorize-template";
import { colors } from "@mongez/copper";

const colorize = createColorize(colors);
colorize`{red.bold Build} took {yellow ${ms}ms}`;
```

---

## Spinner

```ts
import { spinner } from "@mongez/copper";

const sp = spinner({ text: "Compiling…" }).start();
try {
  await build();
  sp.succeed("Build complete");
} catch (err) {
  sp.fail("Build failed");
  throw err;
}
```

### Options

| Option | Default | Note |
|---|---|---|
| `text` | `""` | Trailing message; live-updatable via `.update(...)` |
| `frames` | `symbols.spinner` | Array of strings, cycled |
| `interval` | `80` | ms between frames |
| `color` | `"cyan"` | Any `ColorName` |
| `stream` | `process.stdout` | Switch to `stderr` for stderr-only output |

### Handle

`start(text?)`, `update(text)`, `stop()`, `succeed(text?)`, `fail(text?)`, `warn(text?)`, `info(text?)`, `.isSpinning`.

> Non-TTY streams (CI, piped output) don't animate — `start()` prints the text once and finalizers print one final line. No carriage-return artifacts.

---

## Progress

```ts
import { progress } from "@mongez/copper";

const bar = progress({ total: files.length, color: "lime" });
for (const file of files) {
  await upload(file);
  bar.tick();
}
bar.done();
```

### Options

| Option | Default | Note |
|---|---|---|
| `total` | — (required) | Target value |
| `width` | `30` | Bar character width |
| `complete` | `"█"` | Filled glyph |
| `incomplete` | `"░"` | Empty glyph |
| `color` | `"green"` | Applied to filled segment |
| `format` | `":bar :percent  :current/:total"` | Tokens below |
| `stream` | `process.stdout` |  |

### Template tokens

| Token | Renders |
|---|---|
| `:bar` | The colored bar |
| `:current` | Current value |
| `:total` | Total |
| `:percent` | `XX.X%` (right-padded) |
| `:elapsed` | `XX.Xs` since start |
| `:eta` | `XX.Xs` projected remaining |

### Handle

`tick(delta = 1)`, `update(value)`, `done()`, `stop()`, `.current`, `.total`, `.isComplete`.

---

## Logger

```ts
import { log } from "@mongez/copper";

log.info("Server starting on", 4000);
log.success("Ready");
log.warn("Cache miss");
log.error(new Error("DB unreachable"));
log.debug("payload", payload);
```

Each call writes one line with a colored level symbol: `ℹ` info, `✔` success, `⚠` warn, `✖` error, `•` debug.

### `createLogger(options)`

```ts
import { createLogger } from "@mongez/copper";

const log = createLogger({
  level: process.env.QUIET ? "warn" : "debug",
  stream: process.stderr,
  levels: {
    error: { symbol: "💥", label: "BOOM", color: colors.redBright },
  },
});
```

| Option | Default | Note |
|---|---|---|
| `level` | `"debug"` | Order: `debug < info < success < warn < error` |
| `stream` | `process.stdout` | |
| `levels` | (built-ins) | Per-level `{ symbol, label, color }` overrides |

Args are stringified: strings as-is, `Error` instances via `stack ?? message`, anything else via `JSON.stringify`.

---

## Box

```ts
import { box } from "@mongez/copper";

console.log(box("Deploy successful", {
  borderStyle: "round",
  borderColor: "green",
  padding: 1,
}));
```

### Options

| Option | Default | Note |
|---|---|---|
| `padding` | `1` | Internal blank lines + side spaces |
| `margin` | `0` | Blank lines above and below |
| `borderStyle` | `"round"` | `"single"` `"double"` `"round"` `"bold"` `"ascii"` |
| `borderColor` | (none) | Any `ColorName` |
| `align` | `"left"` | `"left"` `"center"` `"right"` |

Multi-line content is padded to the longest line; width is measured **after** stripping ANSI, so coloured input lines up correctly.

---

## Utilities

### `link(text, url, options?)`

```ts
console.log(`See ${link("the docs", "https://github.com/hassanzohdy/copper")}`);
```

| Option | Default | Behavior |
|---|---|---|
| `fallback` | `"text-and-url"` | Print `text (url)` when ANSI is unsupported |
| `fallback: "text-only"` | — | Print only `text` when unsupported |

### `stripAnsi(input)`

Removes every ANSI escape — colors, modifiers, cursor moves, **and** OSC-8 hyperlinks. Stringifies non-string input.

```ts
stripAnsi(colors.bold(colors.red("error")));  // "error"
stripAnsi(link("docs", "https://x.com"));     // "docs"
stripAnsi(42);                                // "42"
```

### `symbols`

```ts
import { symbols, colors } from "@mongez/copper";

console.log(`${colors.green(symbols.tick)} Saved`);
console.log(`${colors.red(symbols.cross)} Failed`);
console.log(`${colors.gray(symbols.pointer)} Press any key`);
```

| Key | Fancy | ASCII fallback |
|---|---|---|
| `tick` | `✔` | `√` |
| `cross` | `✖` | `×` |
| `info` | `ℹ` | `i` |
| `warning` | `⚠` | `‼` |
| `arrow` | `→` | `->` |
| `pointer` | `❯` | `>` |
| `ellipsis` | `…` | `...` |
| `bullet` | `•` | `*` |
| `line` | `─` | `-` |
| `spinner` | Braille array | `["-", "\\", "|", "/"]` |

### `isColorSupported` / `detectColorSupport()`

`isColorSupported` is evaluated at module load. `detectColorSupport()` re-evaluates against current env/argv:

1. `NO_COLOR` env or `--no-color` argv → off.
2. `FORCE_COLOR=0` / `FORCE_COLOR=false` → off.
3. `FORCE_COLOR` (other value) or `--color` argv → on.
4. Windows → on.
5. TTY stdout with `TERM !== "dumb"` → on.
6. `CI` env → on.
7. Otherwise → off.

---

## Recipes

### Themed deploy script

```ts
import { spinner, progress, box, log } from "@mongez/copper";

const auth = spinner({ text: "Authenticating…" }).start();
await login();
auth.succeed("Authenticated");

const bar = progress({ total: files.length, color: "lime" });
for (const f of files) { await upload(f); bar.tick(); }
bar.done();

console.log(box(`${files.length} files deployed`, {
  borderStyle: "round",
  borderColor: "green",
  padding: 1,
}));
```

### Honoring a `--quiet` flag

```ts
import { createLogger } from "@mongez/copper";

const log = createLogger({
  level: process.argv.includes("--quiet") ? "warn" : "debug",
  stream: process.stderr,
});

log.info("verbose status");   // hidden in --quiet
log.warn("worth showing");    // always visible
```

### Capturing CLI output for tests

```ts
import { createLogger, stripAnsi } from "@mongez/copper";

function captureLogs(run: (log: any) => void) {
  const lines: string[] = [];
  const stream = { write(c: string) { lines.push(c); return true; } } as any;
  run(createLogger({ stream }));
  return lines.map(stripAnsi);
}

const out = captureLogs(log => { log.info("started"); log.success("done"); });
// ["ℹ started\n", "✔ done\n"]
```

### Clickable error link

```ts
import { colors, link, symbols } from "@mongez/copper";

function reportError(code: string, message: string) {
  const url = `https://errors.example.com/${code}`;
  console.error(`${colors.red(symbols.cross)} ${message}`);
  console.error(`  ${colors.gray("See:")} ${link(code, url)}`);
}
```

### Startup banner

```ts
import { box, colors, link } from "@mongez/copper";

console.log(box([
  colors.bold(colors.cyan("my-cli")) + " " + colors.gray("v" + pkg.version),
  "",
  `Docs: ${link("read here", "https://example.com/docs")}`,
].join("\n"), {
  borderStyle: "double",
  borderColor: "cyan",
  padding: 1,
  align: "center",
}));
```

### Walking a directory with progress

```ts
import { spinner, progress, log } from "@mongez/copper";

const sp = spinner({ text: "Scanning…" }).start();
const files = await listAll("./src");
sp.succeed(`Found ${files.length} files`);

const bar = progress({ total: files.length });
for (const f of files) { await processFile(f); bar.tick(); }
bar.done();
log.success("Done");
```

### Error-only stderr, info to stdout

```ts
import { createLogger } from "@mongez/copper";

const out = createLogger({ stream: process.stdout, level: "info" });
const err = createLogger({ stream: process.stderr, level: "warn" });

out.info("Building…");
err.warn("Deprecated flag --legacy");
err.error("Build failed");
```

### Forcing colors off in file logs

```ts
import { createColors } from "@mongez/copper";

const plain = createColors(false);
fs.appendFileSync("deploy.log", plain.gray(new Date().toISOString()) + " done\n");
```

---

## v1 → v2 migration

| v1 | v2 | Why |
|---|---|---|
| `colors.brown2`, `bgBrown2`, … | `colors.brown`, `bgBrown`, … | The `2` suffix was leftover scaffolding; the new names match what the v1 README documented |
| `colors.limeGreen*` | `colors.lime*` | Same — matches the v1 README contract |
| `displayLoadingBar(iter, delay)` | `progress({ total })` (preferred) or the legacy shim, which now **returns `{ promise, stop }`** | v1 had no stop handle; the old export still exists for back-compat |
| `displayThreeDotsAnimation(iter, delay)` | `spinner({ text }).start()` (preferred) or the legacy shim, which now returns a `SpinnerHandle` | v1 ran forever with no way to stop |
| `FORCE_COLOR=0` enabled colors | `FORCE_COLOR=0` now **disables** | Matches the de-facto standard |
| `import tty from "tty"` at module load | `tty` is loaded lazily inside `detectColorSupport()` | Browser bundles no longer crash |

Everything else (`createColors`, all standard color/modifier names, `isColorSupported`) is source-compatible. New surface: `spinner`, `progress`, `log`, `createLogger`, `box`, `link`, `stripAnsi`, `symbols`, `detectColorSupport`, and the `Colors` / `ColorName` types.

---

## Testing

```sh
yarn test
```

38 tests across colors, color-support detection, strip-ansi, link, box, log, spinner, and progress. CI runs on Node 18 / 20 / 22 on Ubuntu and Node 20 on Windows.

---

## License

MIT © Hassan Zohdy. See [LICENSE](LICENSE).
