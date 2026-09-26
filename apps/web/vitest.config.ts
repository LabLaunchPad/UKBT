import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests only. The Playwright specs in tests/visual/ belong to
    // `test:e2e`; vitest's default glob would otherwise collect them and fail
    // (Playwright's `test` API is not vitest's). Mirrors
    // packages/truth/vitest.config.ts.
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
