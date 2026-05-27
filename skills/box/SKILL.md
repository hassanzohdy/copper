---
name: mongez-copper-box
description: |
  Wrap CLI text in a Unicode (single / double / round / bold) or ASCII border, with padding, margin, color, and alignment. ANSI-aware width measurement so colored content lines up correctly.
  TRIGGER when: code imports `box`, `BoxOptions`, or `BoxStyle` from `@mongez/copper`; user asks "how do I draw a box around CLI text / banner / framed message / call-out / boxen replacement"; calls like `box("Deploy ok", { borderStyle: "round", borderColor: "green" })`.
  SKIP: HTML/CSS bordered components; ASCII-art bigger than a small framed message (use a dedicated figlet-style tool).
---

# Box

```ts
import { box } from "@mongez/copper";

console.log(
  box("Deploy successful", {
    borderStyle: "round",
    borderColor: "green",
    padding: 1,
  }),
);
```

```
╭─────────────────────╮
│                     │
│  Deploy successful  │
│                     │
╰─────────────────────╯
```

## Options

| Option | Default | Note |
|---|---|---|
| `padding` | `1` | Internal blank lines + side spaces |
| `margin` | `0` | Blank lines above and below the box |
| `borderStyle` | `"round"` | `"single"` `"double"` `"round"` `"bold"` `"ascii"` |
| `borderColor` | (none) | Any `ColorName` |
| `align` | `"left"` | `"left"` `"center"` `"right"` |

## Border styles

| Style | Sample |
|---|---|
| `single` | `┌─┐ │ └─┘` |
| `double` | `╔═╗ ║ ╚═╝` |
| `round` | `╭─╮ │ ╰─╯` |
| `bold` | `┏━┓ ┃ ┗━┛` |
| `ascii` | `+-+ \| +-+` — for terminals that don't render box-drawing |

## Multi-line content

```ts
box("Line one\nLonger second line\nThird", { align: "center" });
```

All lines are padded to the longest one, so the right border lines up. Width measurement strips ANSI first, so colored lines (`box(colors.red("…"))`) don't skew the box.

## When to use a box

- Final status messages (`Deploy successful`, `Build failed`).
- Banner at the top of an interactive CLI.
- Highlighting an actionable note (`Run "yarn upgrade-interactive"`).
- Wrapping a copy-and-paste command users should run.

Don't box long-form output — readers scan vertically, not within a frame.
