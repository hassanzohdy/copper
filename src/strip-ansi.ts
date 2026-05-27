// Two-pass strip: first scrub OSC sequences (`ESC ] … BEL` or `ESC ] … ESC \\`)
// — that's where hyperlinks (OSC 8) hide and where the URL would otherwise
// leak into the visible output — then scrub the standard CSI sequences
// (`ESC [ … <letter>`) for color and cursor codes.
const OSC_PATTERN = /\x1B\][\s\S]*?(?:\x1B\\|\x07)/g;
const CSI_PATTERN = /[\x1B\x9B][[\]()#;?]*(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~])/g;

/**
 * Remove every ANSI escape sequence from `input` — colors, modifiers,
 * cursor moves, and OSC-8 hyperlinks.
 *
 * ```ts
 * stripAnsi(colors.red("hi"));                       // "hi"
 * stripAnsi(link("docs", "https://example.com"));    // "docs"
 * ```
 */
export function stripAnsi(input: string | number | null | undefined): string {
  return ("" + input).replace(OSC_PATTERN, "").replace(CSI_PATTERN, "");
}
