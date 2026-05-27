import { colors } from "./colors";
import { symbols } from "./symbols";

export type LogLevel = "debug" | "info" | "success" | "warn" | "error";

export type LoggerOptions = {
  /**
   * Override the symbol/label/color triplet for one or more levels. Useful
   * when integrating with an existing brand or theme.
   */
  levels?: Partial<Record<LogLevel, { symbol: string; label: string; color: (s: string) => string }>>;
  /**
   * Stream to write to. Defaults to `process.stdout`; switch to `stderr`
   * if you want warnings/errors visible under shells that pipe stdout.
   */
  stream?: NodeJS.WritableStream;
  /**
   * Suppress lower levels. Order: debug < info < success < warn < error.
   */
  level?: LogLevel;
};

const ORDER: LogLevel[] = ["debug", "info", "success", "warn", "error"];

const DEFAULTS: Record<LogLevel, { symbol: string; label: string; color: (s: string) => string }> = {
  debug: { symbol: symbols.bullet, label: "DEBUG", color: colors.gray },
  info: { symbol: symbols.info, label: "INFO", color: colors.cyan },
  success: { symbol: symbols.tick, label: "SUCCESS", color: colors.green },
  warn: { symbol: symbols.warning, label: "WARN", color: colors.yellow },
  error: { symbol: symbols.cross, label: "ERROR", color: colors.red },
};

const format = (
  level: LogLevel,
  args: unknown[],
  config: Required<Pick<LoggerOptions, "levels">>["levels"],
): string => {
  const { symbol, color } = config[level] ?? DEFAULTS[level];
  const head = color(symbol);
  const body = args
    .map((a) => (typeof a === "string" ? a : a instanceof Error ? a.stack ?? a.message : JSON.stringify(a)))
    .join(" ");
  return `${head} ${body}\n`;
};

/**
 * Build a small, themed logger. Every method writes to a stream (default
 * `process.stdout`) with a colored symbol prefix. Cheap and zero-dep.
 *
 * ```ts
 * const log = createLogger();
 * log.info("Starting server on", 4000);
 * log.success("Build done");
 * log.warn("Cache miss");
 * log.error(new Error("Oh no"));
 * ```
 *
 * Pass `level: "warn"` to silence info/debug/success messages — useful in
 * `--quiet` modes for CLI tools.
 */
export function createLogger(options: LoggerOptions = {}) {
  const stream = options.stream ?? (typeof process !== "undefined" ? process.stdout : undefined);
  const minLevel = options.level ?? "debug";
  const minIndex = ORDER.indexOf(minLevel);
  const merged = { ...DEFAULTS, ...options.levels };

  const write = (level: LogLevel, args: unknown[]) => {
    if (ORDER.indexOf(level) < minIndex) return;
    const line = format(level, args, merged);
    if (stream && typeof (stream as NodeJS.WritableStream).write === "function") {
      stream.write(line);
    }
  };

  return {
    debug: (...args: unknown[]) => write("debug", args),
    info: (...args: unknown[]) => write("info", args),
    success: (...args: unknown[]) => write("success", args),
    warn: (...args: unknown[]) => write("warn", args),
    error: (...args: unknown[]) => write("error", args),
  };
}

export type Logger = ReturnType<typeof createLogger>;

/** Default singleton logger writing to `process.stdout` with every level enabled. */
export const log: Logger = createLogger();
