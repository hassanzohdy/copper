import { colors, ColorName } from "./colors";
import { stripAnsi } from "./strip-ansi";

export type BoxStyle = "single" | "double" | "round" | "bold" | "ascii";

export type BoxOptions = {
  padding?: number;
  margin?: number;
  borderStyle?: BoxStyle;
  borderColor?: ColorName;
  align?: "left" | "center" | "right";
};

const STYLES: Record<BoxStyle, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  round: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  bold: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
  ascii: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
};

const visibleLength = (line: string): number => stripAnsi(line).length;

const padRight = (line: string, width: number): string =>
  line + " ".repeat(Math.max(0, width - visibleLength(line)));

const center = (line: string, width: number): string => {
  const space = Math.max(0, width - visibleLength(line));
  const left = Math.floor(space / 2);
  const right = space - left;
  return " ".repeat(left) + line + " ".repeat(right);
};

const padRightAlign = (line: string, width: number): string => {
  const space = Math.max(0, width - visibleLength(line));
  return " ".repeat(space) + line;
};

/**
 * Wrap `text` in a Unicode (or ASCII) box. Multi-line strings split on
 * `\n` and each line is padded individually so colored ANSI runs do not
 * skew the border alignment.
 *
 * ```ts
 * console.log(box("Deploy successful", {
 *   borderColor: "green",
 *   borderStyle: "round",
 *   padding: 1,
 * }));
 * ```
 */
export function box(text: string, options: BoxOptions = {}): string {
  const {
    padding = 1,
    margin = 0,
    borderStyle = "round",
    borderColor,
    align = "left",
  } = options;
  const style = STYLES[borderStyle];
  const lines = text.split("\n");
  const innerWidth = Math.max(...lines.map(visibleLength));

  const pad = " ".repeat(padding);
  const blank = " ".repeat(innerWidth + padding * 2);

  const aligner = align === "center" ? center : align === "right" ? padRightAlign : padRight;

  const colorize = borderColor ? colors[borderColor] : (s: string) => s;

  const top = colorize(style.tl + style.h.repeat(innerWidth + padding * 2) + style.tr);
  const bottom = colorize(style.bl + style.h.repeat(innerWidth + padding * 2) + style.br);
  const v = colorize(style.v);

  const body: string[] = [];
  for (let i = 0; i < padding; i++) body.push(v + blank + v);
  for (const line of lines) body.push(v + pad + aligner(line, innerWidth) + pad + v);
  for (let i = 0; i < padding; i++) body.push(v + blank + v);

  const marginLine = "\n".repeat(margin);
  return marginLine + [top, ...body, bottom].join("\n") + marginLine;
}
