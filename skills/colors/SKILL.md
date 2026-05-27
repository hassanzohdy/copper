---
name: mongez-copper-colors
description: |
  ANSI colorizer with a 20+ named palette (basic 4-bit + 256-color hues like `lime`, `teal`, `brown`, `gold`, `chocolate`, `pink`, `purple`, `lavender`, `indigo`, `orange`, `slate`), foreground / background / *Bright* / *bgBright* variants, plus modifiers (`bold`, `italic`, `dim`, `underline`, `inverse`, `hidden`, `strikethrough`, `reset`). Supports BOTH chalk-style chaining (`colors.red.bold("x")`) and picocolors-style composition (`colors.red(colors.bold("x"))`). `NO_COLOR` and `FORCE_COLOR` aware.
  TRIGGER when: code imports `colors`, `createColors`, `Colors`, `ColorName`, `ChainFormatter`, or `Formatter` from `@mongez/copper`; user asks "how do I color CLI text / chain colors / replace chalk / detect NO_COLOR / force colors / 256-color terminal output / get a typed color name"; calls like `colors.red(x)`, `colors.red.bold(x)`, `colors.bgGold(x)`, `colors.bold(colors.cyan(x))`.
  SKIP: browser/CSS styling (this is ANSI only); `console.log` without `@mongez/copper`; React/JSX text styling.
---

# Colors

Every color and modifier supports both call styles — pick whichever reads better at the site. Both produce identical ANSI output.

```ts
import { colors, createColors, type ColorName, type ChainFormatter } from "@mongez/copper";

// Chaining (chalk-style)
colors.red.bold("error");
colors.bgWhite.black.bold(" WARN ");

// Composition (picocolors-style)
colors.red(colors.bold("error"));
colors.bgWhite(colors.black(colors.bold(" WARN ")));

// Mix freely
colors.bold(colors.red.italic("emphatic"));
```

Chains are lazy and stateless — `colors.red.bold` is a callable formatter you can store and reuse:

```ts
const danger = colors.red.bold.underline;
danger("File not found");
danger("Connection refused");
```

## Modifiers

| Function | Effect |
|---|---|
| `bold(s)` | Bold |
| `dim(s)` | Faint |
| `italic(s)` | Italic |
| `underline(s)` | Underline |
| `strikethrough(s)` | Strikethrough |
| `inverse(s)` | Swap fg/bg |
| `hidden(s)` | Invisible (still copies on select) |
| `reset(s)` | Wraps with `CSI 0` on both sides |

## Palette (foreground)

Each row also has `*Bright`, `bg*`, and `bgBright*` variants unless noted.

| Family | Names |
|---|---|
| Neutral | `black`, `gray`, `white`, `blackBright`, `whiteBright` |
| Slate | `slate`, `slateBright` |
| Red | `red`, `redBright` |
| Orange | `orange`, `orangeBright` |
| Yellow | `yellow`, `yellowBright` |
| Gold | `gold`, `goldBright` |
| Chocolate | `chocolate`, `chocolateBright` |
| Brown | `brown`, `brownBright` |
| Green | `green`, `greenBright` |
| Lime | `lime`, `limeBright` |
| Teal | `teal`, `tealBright` |
| Cyan | `cyan`, `cyanBright` |
| Blue | `blue`, `blueBright` |
| Magenta | `magenta`, `magentaBright` |
| Purple | `purple`, `purpleBright` |
| Pink | `pink`, `pinkBright` |
| Lavender | `lavender`, `lavenderBright` |
| Indigo | `indigo`, `indigoBright` |

> The standard 4-bit colors (`red`/`green`/…/`white`) use the 30-37 / 90-97 sequences. The extended hues (`lime`, `teal`, `brown`, `gold`, …) use 256-color sequences (`\x1b[38;5;Nm`) so terminals must support 256 colors — which all common modern terminals do.

## `createColors(enabled?)` — force on or off

```ts
const off = createColors(false);
off.red("hi");        // "hi"  (no ANSI added)
off.isColorSupported; // false

const on = createColors(true);
on.red("hi");         // "\x1b[31mhi\x1b[39m"
```

Use this to:

- Strip ANSI from a colored builder before snapshotting a test (`createColors(false).red(x)`).
- Force ANSI in a sub-process whose `stdout` isn't a TTY but is being captured.
- Build a separate "diff" or "patch" themed instance with its own palette.

## Typed color names

```ts
import { colors, type ColorName } from "@mongez/copper";

function paint(level: "ok" | "fail", text: string) {
  const c: ColorName = level === "ok" ? "green" : "red";
  return colors[c](text);
}
```

`ColorName` excludes the meta keys `isColorSupported` and `createColors` so it's safe to index `colors[name]`.

## Replacing chalk

Near-1:1 import swap thanks to chaining:

```ts
- import chalk from "chalk";
+ import { colors } from "@mongez/copper";

- chalk.red(text);
+ colors.red(text);

- chalk.red.bold(text);
+ colors.red.bold(text);

- chalk.bgWhite.black.bold(text);
+ colors.bgWhite.black.bold(text);
```

For chalk's tagged-template syntax (`chalk\`{red ${value}}\``), use `colorize-template` against the copper instance:

```ts
import { createColorize } from "colorize-template";
import { colors } from "@mongez/copper";

const colorize = createColorize(colors);
colorize`{red.bold Build} took {yellow ${ms}ms}`;
```

## Composition safety

When you nest `colors.x(colors.y(text))` (or chain `colors.x.y(text)`) and `text` already contains the inner closer code, copper rewrites internal closers to re-open the outer color — so chains do not leak:

```ts
colors.bold(colors.red("inner"));
// "\x1b[1m\x1b[31minner\x1b[39m\x1b[22m"  ← red closer (39m) does not eat bold
```
