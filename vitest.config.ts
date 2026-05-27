import { defineConfig } from "vitest/config";

// `@mongez/copper` has no `@mongez/*` runtime deps, so the sibling-alias
// helper that other packages carry is unnecessary here. Tests live under
// `src/<file>.test.ts` so they sit next to the code they exercise.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
