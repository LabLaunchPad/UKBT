import { defineConfig, devices } from '@playwright/test';

/**
 * Foundation-stage Playwright config. Per contracts/VISUAL-REGRESSION-CONTRACT.md:
 * comparisons are meant to run CI-vs-CI only, on a pinned runner image —
 * that pinning happens in the CI workflow (.github/workflows/ci.yml), not
 * here. This config fixes the local/CI-shared mechanics: browser project,
 * base URL, and the webServer that serves the actual production build
 * (never `astro dev`) so what is tested matches what ships.
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // `pnpm run build` here only runs this package's own "build" script
    // (`astro build`) — it does NOT chain packages/truth's tokens:build
    // first the way the root "build" script does. Without an explicit
    // tokens:build first, `astro build`/`astro preview` fails outright:
    // BaseLayout.astro imports the generated tokens.css, which does not
    // exist until Style Dictionary runs (contracts/CSS-CONTRACT.md). This
    // was caught by a real CI failure, not anticipated in advance —
    // `pnpm --filter` resolves against the workspace root regardless of
    // the invoking cwd, so this works whether Playwright is invoked from
    // the repo root or from apps/web directly.
    //
    // Uses a plain Node.js static file server (tests/serve-static.mjs)
    // instead of `astro preview` because the Cloudflare adapter's
    // preview server runs through Miniflare/Wrangler, which does not
    // support service worker registration. The static server serves
    // dist/client/ directly so SW tests work normally.
    command:
      'pnpm --filter @ukbt/truth tokens:build && pnpm run build && node tests/serve-static.mjs',
    env: {
      PORT: '4321',
    },
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Local sandbox environments pre-install Chromium outside
        // Playwright's own cache and expect it referenced by path (see
        // apps/web/README.md). CI runs a real `playwright install
        // chromium` instead (.github/workflows/ci.yml) and must not use
        // this override, since /opt/pw-browsers doesn't exist there.
        launchOptions: process.env.CI
          ? {}
          : { executablePath: '/opt/pw-browsers/chromium' },
      },
    },
  ],
});
