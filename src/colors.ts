// Originally adapted from https://github.com/alexeyraspopov/picocolors, then
// extended with a broader 256-color palette (lime, teal, brown, gold,
// chocolate, pink, purple, lavender, indigo, orange, slate), a real
// `createColors(enabled)` factory, and chalk-style chaining
// (`colors.red.bold("x")`) on top of composition.
import { isColorSupported as defaultSupport } from "./support";

export type Formatter = (input: string | number | null | undefined) => string;

const replaceClose = (
  string: string,
  close: string,
  replace: string,
  index: number,
): string => {
  const start = string.substring(0, index) + replace;
  const end = string.substring(index + close.length);
  const nextIndex = end.indexOf(close);
  return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end;
};

const formatter = (open: string, close: string, replace: string = open): Formatter => {
  return (input) => {
    const string = "" + input;
    const index = string.indexOf(close, open.length);
    return ~index
      ? open + replaceClose(string, close, replace, index) + close
      : open + string + close;
  };
};

/**
 * Tuple of every color and modifier name in declaration order. Single
 * source of truth for the `ColorName` union and for which keys the
 * chaining Proxy treats as chainable.
 */
export const COLOR_NAMES = [
  "dim", "italic", "underline", "bold", "inverse", "hidden", "strikethrough", "reset",
  "black", "blackBright", "gray", "white", "whiteBright",
  "bgBlack", "bgBlackBright", "bgWhite", "bgWhiteBright",
  "slate", "slateBright", "bgSlate", "bgSlateBright",
  "red", "redBright", "bgRed", "bgRedBright",
  "orange", "orangeBright", "bgOrange", "bgOrangeBright",
  "yellow", "yellowBright", "bgYellow", "bgYellowBright",
  "gold", "goldBright", "bgGold", "bgGoldBright",
  "chocolate", "chocolateBright", "bgChocolate", "bgChocolateBright",
  "brown", "brownBright", "bgBrown", "bgBrownBright",
  "green", "greenBright", "bgGreen", "bgGreenBright",
  "lime", "limeBright", "bgLime", "bgLimeBright",
  "teal", "tealBright", "bgTeal", "bgTealBright",
  "cyan", "cyanBright", "bgCyan", "bgCyanBright",
  "blue", "blueBright", "bgBlue", "bgBlueBright",
  "magenta", "magentaBright", "bgMagenta", "bgMagentaBright",
  "purple", "purpleBright", "bgPurple", "bgPurpleBright",
  "pink", "pinkBright", "bgPink", "bgPinkBright",
  "lavender", "lavenderBright", "bgLavender", "bgLavenderBright",
  "indigo", "indigoBright", "bgIndigo", "bgIndigoBright",
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];

const CHAINABLE = new Set<string>(COLOR_NAMES);

/**
 * A formatter you can both call directly (`red("hi")`) and chain off of
 * (`red.bold.bgWhite("hi")`). Every chain step builds a new composed
 * formatter — no shared state between chains.
 */
export type ChainFormatter = Formatter & { readonly [K in ColorName]: ChainFormatter };

export type Colors = {
  readonly isColorSupported: boolean;
  readonly createColors: (enabled?: boolean) => Colors;
} & { readonly [K in ColorName]: ChainFormatter };

const wrapChain = (
  self: Formatter,
  lookup: Record<string, Formatter>,
): ChainFormatter => {
  return new Proxy(self, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && CHAINABLE.has(prop)) {
        const next = lookup[prop];
        // outer formatter wraps the result of the inner — keeps chalk's
        // visible-precedence semantics (later modifiers nest inside earlier
        // ones, so all SGR codes remain active over the visible text).
        const composed: Formatter = (input) => target(next(input));
        return wrapChain(composed, lookup);
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as ChainFormatter;
};

/**
 * Build a fresh colors instance. Pass `false` to force every formatter
 * to be the identity `String` (useful for snapshot tests, file logs, or
 * a `--no-color` mode without bothering with env vars).
 *
 * ```ts
 * const off = createColors(false);
 * off.red("hi");        // "hi"
 * off.red.bold("hi");   // "hi" — chaining still works, just no ANSI
 *
 * const on = createColors(true);
 * on.red.bold("hi");    // "\x1b[31m\x1b[1mhi\x1b[22m\x1b[39m"
 * ```
 */
export const createColors = (enabled: boolean = defaultSupport): Colors => {
  const base: Record<string, Formatter> = {
    // ── Modifiers ─────────────────────────────────────────────────────────
    dim: enabled ? formatter("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m") : String,
    italic: enabled ? formatter("\x1b[3m", "\x1b[23m") : String,
    underline: enabled ? formatter("\x1b[4m", "\x1b[24m") : String,
    bold: enabled ? formatter("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m") : String,
    inverse: enabled ? formatter("\x1b[7m", "\x1b[27m") : String,
    hidden: enabled ? formatter("\x1b[8m", "\x1b[28m") : String,
    strikethrough: enabled ? formatter("\x1b[9m", "\x1b[29m") : String,
    reset: enabled ? ((s) => `\x1b[0m${"" + s}\x1b[0m`) : String,

    // ── Black / white / gray ──────────────────────────────────────────────
    black: enabled ? formatter("\x1b[30m", "\x1b[39m") : String,
    blackBright: enabled ? formatter("\x1b[90m", "\x1b[39m") : String,
    gray: enabled ? formatter("\x1b[90m", "\x1b[39m") : String,
    white: enabled ? formatter("\x1b[37m", "\x1b[39m") : String,
    whiteBright: enabled ? formatter("\x1b[97m", "\x1b[39m") : String,
    bgBlack: enabled ? formatter("\x1b[40m", "\x1b[49m") : String,
    bgBlackBright: enabled ? formatter("\x1b[100m", "\x1b[49m") : String,
    bgWhite: enabled ? formatter("\x1b[47m", "\x1b[49m") : String,
    bgWhiteBright: enabled ? formatter("\x1b[107m", "\x1b[49m") : String,

    // ── Slate ─────────────────────────────────────────────────────────────
    slate: enabled ? formatter("\x1b[38;5;242m", "\x1b[39m") : String,
    slateBright: enabled ? formatter("\x1b[38;5;188m", "\x1b[39m") : String,
    bgSlate: enabled ? formatter("\x1b[48;5;242m", "\x1b[49m") : String,
    bgSlateBright: enabled ? formatter("\x1b[48;5;188m", "\x1b[49m") : String,

    // ── Red ───────────────────────────────────────────────────────────────
    red: enabled ? formatter("\x1b[31m", "\x1b[39m") : String,
    redBright: enabled ? formatter("\x1b[91m", "\x1b[39m") : String,
    bgRed: enabled ? formatter("\x1b[41m", "\x1b[49m") : String,
    bgRedBright: enabled ? formatter("\x1b[101m", "\x1b[49m") : String,

    // ── Orange ────────────────────────────────────────────────────────────
    orange: enabled ? formatter("\x1b[38;5;208m", "\x1b[39m") : String,
    orangeBright: enabled ? formatter("\x1b[38;5;220m", "\x1b[39m") : String,
    bgOrange: enabled ? formatter("\x1b[48;5;208m", "\x1b[49m") : String,
    bgOrangeBright: enabled ? formatter("\x1b[48;5;220m", "\x1b[49m") : String,

    // ── Yellow ────────────────────────────────────────────────────────────
    yellow: enabled ? formatter("\x1b[33m", "\x1b[39m") : String,
    yellowBright: enabled ? formatter("\x1b[93m", "\x1b[39m") : String,
    bgYellow: enabled ? formatter("\x1b[43m", "\x1b[49m") : String,
    bgYellowBright: enabled ? formatter("\x1b[103m", "\x1b[49m") : String,

    // ── Gold ──────────────────────────────────────────────────────────────
    gold: enabled ? formatter("\x1b[38;5;214m", "\x1b[39m") : String,
    goldBright: enabled ? formatter("\x1b[38;5;226m", "\x1b[39m") : String,
    bgGold: enabled ? formatter("\x1b[48;5;214m", "\x1b[49m") : String,
    bgGoldBright: enabled ? formatter("\x1b[48;5;226m", "\x1b[49m") : String,

    // ── Chocolate ─────────────────────────────────────────────────────────
    chocolate: enabled ? formatter("\x1b[38;5;130m", "\x1b[39m") : String,
    chocolateBright: enabled ? formatter("\x1b[38;5;138m", "\x1b[39m") : String,
    bgChocolate: enabled ? formatter("\x1b[48;5;130m", "\x1b[49m") : String,
    bgChocolateBright: enabled ? formatter("\x1b[48;5;138m", "\x1b[49m") : String,

    // ── Brown ─────────────────────────────────────────────────────────────
    brown: enabled ? formatter("\x1b[38;5;94m", "\x1b[39m") : String,
    brownBright: enabled ? formatter("\x1b[38;5;130m", "\x1b[39m") : String,
    bgBrown: enabled ? formatter("\x1b[48;5;94m", "\x1b[49m") : String,
    bgBrownBright: enabled ? formatter("\x1b[48;5;130m", "\x1b[49m") : String,

    // ── Green ─────────────────────────────────────────────────────────────
    green: enabled ? formatter("\x1b[32m", "\x1b[39m") : String,
    greenBright: enabled ? formatter("\x1b[92m", "\x1b[39m") : String,
    bgGreen: enabled ? formatter("\x1b[42m", "\x1b[49m") : String,
    bgGreenBright: enabled ? formatter("\x1b[102m", "\x1b[49m") : String,

    // ── Lime ──────────────────────────────────────────────────────────────
    lime: enabled ? formatter("\x1b[38;5;118m", "\x1b[39m") : String,
    limeBright: enabled ? formatter("\x1b[38;5;154m", "\x1b[39m") : String,
    bgLime: enabled ? formatter("\x1b[48;5;118m", "\x1b[49m") : String,
    bgLimeBright: enabled ? formatter("\x1b[48;5;154m", "\x1b[49m") : String,

    // ── Teal ──────────────────────────────────────────────────────────────
    teal: enabled ? formatter("\x1b[38;5;6m", "\x1b[39m") : String,
    tealBright: enabled ? formatter("\x1b[38;5;45m", "\x1b[39m") : String,
    bgTeal: enabled ? formatter("\x1b[48;5;6m", "\x1b[49m") : String,
    bgTealBright: enabled ? formatter("\x1b[48;5;45m", "\x1b[49m") : String,

    // ── Cyan ──────────────────────────────────────────────────────────────
    cyan: enabled ? formatter("\x1b[36m", "\x1b[39m") : String,
    cyanBright: enabled ? formatter("\x1b[96m", "\x1b[39m") : String,
    bgCyan: enabled ? formatter("\x1b[46m", "\x1b[49m") : String,
    bgCyanBright: enabled ? formatter("\x1b[106m", "\x1b[49m") : String,

    // ── Blue ──────────────────────────────────────────────────────────────
    blue: enabled ? formatter("\x1b[34m", "\x1b[39m") : String,
    blueBright: enabled ? formatter("\x1b[94m", "\x1b[39m") : String,
    bgBlue: enabled ? formatter("\x1b[44m", "\x1b[49m") : String,
    bgBlueBright: enabled ? formatter("\x1b[104m", "\x1b[49m") : String,

    // ── Magenta ───────────────────────────────────────────────────────────
    magenta: enabled ? formatter("\x1b[35m", "\x1b[39m") : String,
    magentaBright: enabled ? formatter("\x1b[95m", "\x1b[39m") : String,
    bgMagenta: enabled ? formatter("\x1b[45m", "\x1b[49m") : String,
    bgMagentaBright: enabled ? formatter("\x1b[105m", "\x1b[49m") : String,

    // ── Purple ────────────────────────────────────────────────────────────
    purple: enabled ? formatter("\x1b[38;5;129m", "\x1b[39m") : String,
    purpleBright: enabled ? formatter("\x1b[38;5;141m", "\x1b[39m") : String,
    bgPurple: enabled ? formatter("\x1b[48;5;129m", "\x1b[49m") : String,
    bgPurpleBright: enabled ? formatter("\x1b[48;5;141m", "\x1b[49m") : String,

    // ── Pink ──────────────────────────────────────────────────────────────
    pink: enabled ? formatter("\x1b[38;5;205m", "\x1b[39m") : String,
    pinkBright: enabled ? formatter("\x1b[38;5;213m", "\x1b[39m") : String,
    bgPink: enabled ? formatter("\x1b[48;5;205m", "\x1b[49m") : String,
    bgPinkBright: enabled ? formatter("\x1b[48;5;213m", "\x1b[49m") : String,

    // ── Lavender ──────────────────────────────────────────────────────────
    lavender: enabled ? formatter("\x1b[38;5;183m", "\x1b[39m") : String,
    lavenderBright: enabled ? formatter("\x1b[38;5;189m", "\x1b[39m") : String,
    bgLavender: enabled ? formatter("\x1b[48;5;183m", "\x1b[49m") : String,
    bgLavenderBright: enabled ? formatter("\x1b[48;5;189m", "\x1b[49m") : String,

    // ── Indigo ────────────────────────────────────────────────────────────
    indigo: enabled ? formatter("\x1b[38;5;54m", "\x1b[39m") : String,
    indigoBright: enabled ? formatter("\x1b[38;5;63m", "\x1b[39m") : String,
    bgIndigo: enabled ? formatter("\x1b[48;5;54m", "\x1b[49m") : String,
    bgIndigoBright: enabled ? formatter("\x1b[48;5;63m", "\x1b[49m") : String,
  };

  // Pass 1: snapshot the raw formatters so each chain step composes from
  // the originals, not from a Proxy-wrapped version of itself.
  const lookup: Record<string, Formatter> = { ...base };

  // Pass 2: wrap each formatter into a chainable Proxy.
  const out: Record<string, unknown> = {};
  for (const name of COLOR_NAMES) {
    out[name] = wrapChain(lookup[name], lookup);
  }
  out.isColorSupported = enabled;
  out.createColors = createColors;
  return out as Colors;
};

export const colors: Colors = createColors();
