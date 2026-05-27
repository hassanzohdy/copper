import { isColorSupported } from "./support";

/**
 * Build a clickable terminal hyperlink using the OSC-8 escape sequence
 * (`ESC ] 8 ; ; URL ESC \  text  ESC ] 8 ; ; ESC \`). Modern terminals
 * (iTerm 2, Windows Terminal, GNOME Terminal, Kitty, Wezterm, VSCode's
 * integrated terminal) render this as a real clickable link. Anywhere
 * that doesn't, we degrade to `text (url)` so the URL stays visible.
 *
 * Pass `{ fallback: "text-only" }` to suppress the trailing `(url)` in
 * unsupported terminals.
 *
 * ```ts
 * console.log(link("repo", "https://github.com/hassanzohdy/copper"));
 * ```
 */
export function link(
  text: string,
  url: string,
  options: { fallback?: "text-and-url" | "text-only" } = {},
): string {
  const { fallback = "text-and-url" } = options;
  if (!isColorSupported) {
    return fallback === "text-only" ? text : `${text} (${url})`;
  }
  return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}
