// Symbol set with Windows console fallbacks. Modern Windows Terminal /
// PowerShell renders the Unicode glyphs fine, but classic `cmd.exe` and
// some CI matrices on Windows fall back to ASCII look-alikes. We pick the
// fallback based on `process.platform`, not on TTY support — color and
// glyph capabilities are independent.
const fancy = {
  tick: "✔",
  cross: "✖",
  info: "ℹ",
  warning: "⚠",
  arrow: "→",
  pointer: "❯",
  ellipsis: "…",
  bullet: "•",
  line: "─",
  spinner: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
};

const ascii = {
  tick: "√",
  cross: "×",
  info: "i",
  warning: "‼",
  arrow: "->",
  pointer: ">",
  ellipsis: "...",
  bullet: "*",
  line: "-",
  spinner: ["-", "\\", "|", "/"],
};

const useAscii =
  typeof process !== "undefined" &&
  process.platform === "win32" &&
  !process.env.WT_SESSION &&
  !process.env.TERM_PROGRAM &&
  process.env.TERM !== "xterm-256color";

export const symbols = useAscii ? ascii : fancy;

export type SymbolName = keyof typeof fancy;
