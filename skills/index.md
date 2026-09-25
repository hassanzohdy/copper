---
description: |
  Use @mongez/copper to build polished terminal output: start with colors for ANSI styling and support detection, then choose spinner for indeterminate work or progress when a total is known. Add log for leveled messages, box for terminal callouts, and utilities for links, symbols, or stripping ANSI. Recipes combines these APIs into deploy and file-walking flows. Not this package → use @mongez/fs for filesystem operations, @mongez/reinforcements for general helpers, or @inquirer/prompts for interactive input.
---

# @mongez/copper skills

## Terminal output

- [Colors](colors/SKILL.md) — ANSI colors, modifiers, chaining, and color-support control.
- [Log](log/SKILL.md) — leveled, themed CLI logging.
- [Box](box/SKILL.md) — bordered and ANSI-width-aware terminal messages.

## Work feedback

- [Spinner](spinner/SKILL.md) — single-line feedback for work with no known total.
- [Progress](progress/SKILL.md) — TTY-aware progress bars for known totals.

## Supporting APIs

- [Utilities](utilities/SKILL.md) — OSC-8 links, ANSI stripping, symbols, and support detection.
- [Recipes](recipes/SKILL.md) — complete CLI compositions using Copper APIs together.

For package scope, imports, and a feature map, see [overview](overview/SKILL.md).
