# CLAUDE.md — apps/web

This file provides guidance to Claude Code when working inside `apps/web`
(`@ukbt/web`). It is loaded alongside the root `CLAUDE.md`, which carries the
governance contract (evidence rules, pipeline stages, hard invariants) that
still applies here in full — this file only adds package-local detail.

## Commands

Run from `apps/web/`, or via `pnpm --filter @ukbt/web <script>` from the repo
root.

```bash
pnpm dev                        # astro dev — server.host is 127.0.0.1, see astro.config.mjs
pnpm build                      # tokens:build (@ukbt/truth) then astro build (static output)
pnpm preview                    # astro preview
pnpm typecheck                  # astro check
pnpm test:e2e                   # playwright test
```

Single e2e spec: `pnpm --filter @ukbt/web exec playwright test tests/visual/<file>.spec.ts`.

Local Playwright note: some sandboxed dev environments pre-install Chromium
outside Playwright's managed cache, at `/opt/pw-browsers/chromium`
(`PLAYWRIGHT_BROWSERS_PATH` set accordingly). `playwright.config.ts` falls
back to that path when the installed `@playwright/test` version doesn't
match what's cached there (skipped when `CI=true`, where the workflow runs
`playwright install chromium` normally). If you hit "browser not found"
locally without that path, run `pnpm exec playwright install chromium`.

## Architecture

Astro site, `output: 'static'`, depending on `@ukbt/truth` as
`workspace:*` for schemas and generated design tokens.

- `src/pages/` — one `.astro` file per route: `index`, `about`, `players`,
  `tournaments`, `franchises`, `news` (list) + `news/[slug].astro` (detail),
  `membership`, `join`, `services`, `coaching`, `community`, `club-captain`,
  `contact`, `faq`, `404`. Route set is governed by
  `contracts/ROUTE-CONTRACT.md` — adding/removing a route needs that
  contract updated, not just a new file. (`design-system` was removed
  2026-09-11: internal verification page, must not ship to production.)
- `src/content/*-data.ts` — page content as typed data modules, **not** an
  Astro content collection. Each module is shaped against
  `@ukbt/truth`'s `src/schema/` types, so a change to page content is a
  change to a schema-validated object, not free-form Markdown/frontmatter.
- `src/layouts/`, `src/components/` — shared layout/UI. `src/styles/generated/`
  is `style-dictionary` output from `@ukbt/truth` — biome-ignored, don't
  hand-edit; change the source tokens in `packages/truth/src/tokens/` and
  re-run `pnpm tokens:build` instead.
- `tests/visual/` — Playwright + `@axe-core/playwright` specs covering both
  visual regression and accessibility; see `contracts/VISUAL-REGRESSION-CONTRACT.md`
  and `contracts/ACCESSIBILITY-CONTRACT.md`.
- `@astrojs/cloudflare` is a production dependency and the ACTIVE adapter
  (`adapter: cloudflare()` in `astro.config.mjs`, required for the
  `tina-island/[name].ts` on-demand route). Active since 2026-09-15
  (production-404 recovery): it moves static output to `dist/client/` and
  emits the Worker entry at `dist/server/entry.mjs` — root `wrangler.jsonc`
  (`main` + `assets.directory`) must mirror that generated layout, enforced
  by `scripts/check-deploy-mapping.mjs`. Don't remove the adapter or the
  island route to "simplify" deployment.
- Deployment is Cloudflare Workers (static assets), configured by the
  **root-level** `wrangler.jsonc` (not one inside `apps/web/`) — see the
  comments in that file and in `astro.config.mjs` for the CI failures that
  pinned both that location and the `server: { host: '127.0.0.1' }` setting.
