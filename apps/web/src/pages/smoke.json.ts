import type { APIRoute } from 'astro';

// Build-attested smoke identity (repo-sync Task 7, Shape A).
// Prerendered static endpoint: `smoke.json.ts` builds `/smoke.json` at
// build time (Astro endpoints convention — the `.json` in the filename
// becomes the output extension).
// The SHA is NOT baked here: prerendered endpoints execute in the
// adapter's runtime shim, where `node:child_process` is stubbed
// (`execSync ... is not implemented` — observed 2026-09-25). Instead
// GET emits the `__UKBT_BUILD_ID__` placeholder and
// `scripts/build-smoke.mjs` (wired into the `build` chain in
// `apps/web/package.json`) replaces it post-build with
// `git rev-parse --short HEAD` — the exact mechanism `scripts/build-sw.mjs`
// uses to stamp `dist/.../sw.js`, which runs in real Node with git.
// Named without a leading underscore on purpose: Astro excludes
// `_`-prefixed `src/pages` files from the router and `dist/`
// (routing docs "Excluding pages"), so `/__smoke.json` is un-buildable
// as a file route. Request-time headers cannot persist on static
// output — cache/no-sniff policy lives in
// `apps/web/public/_headers` (`/smoke.json` rule; `nosniff` already
// global under `/*`).
// Excluded from sitemap and every gate by construction: sitemap,
// seo/ui/security/internal-links crawl `**/*.html`, perf budgets
// `**/*.html|css|js` — a `.json` output is invisible to all of them.
export const GET: APIRoute = async () => {
  const body = JSON.stringify({ ok: true, buildId: '__UKBT_BUILD_ID__' });
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
