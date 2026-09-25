# apps/web — `@ukbt/web`

Local rules for the Astro site. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds app-local detail.

## Scope

Astro 7 site (`output: 'static'`, `astro.config.mjs`), `site ukbanglatigers.co.uk`, `server.host 127.0.0.1` (pinned — don't change). `BaseLayout` owns SEO/CSP/SW/motion; shared UI: `Header`, `Hero`, `SquadGrid`+`SquadCard`, `ClubIntro` slideshow.

## Role

Renders gate-approved content. Every organization-specific claim arrives via typed data modules already validated against `@ukbt/truth` — pages render, they don't decide truth.

## Source of Truth

- Routes: `contracts/ROUTE-CONTRACT.md` (adding/removing a route needs that contract updated, not just a file)
- Content policy: `knowledge/07-CONTENT-TRUTH-POLICY.yaml`; Tina boundary: root `AGENTS.md` § TinaCMS (EDITORIAL vs TRUTH-SENSITIVE)
- SEO authority: `src/lib/seo.ts`; CSP hashes: `scripts/stamp-csp.mjs`; perf budgets: `scripts/check-perf.mjs`

## Structure

- `src/pages/` — 18 `.astro` routes: `index`, `about`, `club-captain`, `coaching`, `community`, `contact`, `faq`, `franchises`, `franchises/uppsala-tigers`, `join`, `membership`, `news`, `news/[slug]`, `offline`, `players`, `services`, `tournaments`, `404` — plus `tina-island/[name].ts` (see below; NOT pure static)
- `src/content/*-data.ts` — 8 typed content modules (not Astro collections), Zod-shaped against `@ukbt/truth` (`about`, `captain`, `franchises`, `homepage`, `navigation`, `players`, `sponsors`, `tournaments`)
- `src/layouts/BaseLayout.astro`, `src/components/` — shared layout/UI
- `src/lib/tina/` (`loaders.ts`, `islands.ts`, `validators.ts`, `data.ts`) — Tina adapter; `content/*/*.json` — Tina editorial content
- `src/styles/` (`base.css`, `fonts.css`); `src/styles/generated/` — generated tokens (see Protected)
- `tests/visual/` — Playwright + axe specs; `public/sw-register.js` — deferred SW registration

## Dependencies

`@ukbt/truth` as `workspace:*` (schemas, gate, tokens). `@astrojs/cloudflare` is a production dependency and the ACTIVE adapter — it moves static output to `dist/client/` and emits the Worker entry; root `wrangler.jsonc` (`main` + `assets.directory`) must mirror that layout (enforced by `scripts/check-deploy-mapping.mjs`). Don't remove the adapter.

## Allowed

- New pages/components following existing data-module → props → render flow
- New Playwright specs in `tests/visual/`
- EDITORIAL Tina fields (headline, CTA, FAQ, nav labels, about copy) via `tina/config.ts` + loaders

## Protected / Generated

- `src/styles/generated/` is `style-dictionary` output from `packages/truth/src/tokens/` — biome-ignored, never hand-edit.
- TRUTH-SENSITIVE content (players, stats, dates, org claims) is code-owned — never CMS-editable.
- `tina-island/[name].ts` has `prerender = false` (on-demand SSR via `experimental_createIslandRoute`) — the site is NOT pure static despite `output: 'static'`.

## Conventions

- Content flow: `src/content/*-data.ts` (Zod + `@ukbt/truth/gate`, fail-closed at build, PROD gated by `isPublishable`) → props → render. Parallel Tina path: `content/*/*.json` → `lib/tina/loaders` (Zod + allowed-urls) → `TinaIsland` → `/tina-island/*` re-render. Tina editorial fields are NOT truth-gated (gated by content-trust/allowed-urls/XSS choke instead).
- Client JS (4 `<script>` roots, no framework, all ClientRouter-proofed): `BaseLayout` logo-intro + single-IntersectionObserver reveal; `Header` delegated drawer/dropdown/focus-trap; `SquadGrid` DOM-derived filters; `ClubIntro` 4s slideshow. Each guards with `window.__ukbt*Wired` and re-inits on `astro:page-load`.
- CSS: tokens-only values; animate `transform`/`opacity` only; two-tier reduced-motion (instant states, soft-fade entrances).
- Perf budgets (`scripts/check-perf.mjs`): HTML 72KB/page, CSS 96KB total, JS 48KB total. CSP: no `unsafe-inline` (hashes via `stamp-csp.mjs`).

## Validation

```bash
pnpm deploy:verify    # full release gate from repo root — never claim a subset as a release pass
pnpm --filter @ukbt/web exec playwright test tests/visual/<file>.spec.ts
```

Single-spec form above; full e2e is `pnpm test:e2e` (Chromium via `playwright install chromium` in CI).

## Failure Modes

- Editing `src/styles/generated/` directly — lost on rebuild; change source tokens in `packages/truth/src/tokens/` and run `tokens:build` (tokens-first).
- `astro dev` blocked on Windows dev machines — Device Guard kills `workerd`/miniflare spawn; use the static preview (`UKBT-Preview` task, `http://127.0.0.1:4321/`, AL-040).
- Playwright "browser not found" locally — sandboxed envs may pre-install Chromium at `/opt/pw-browsers/chromium` (`PLAYWRIGHT_BROWSERS_PATH`); `playwright.config.ts` falls back there except when `CI=true`.
- Route added without updating `contracts/ROUTE-CONTRACT.md` — governance drift; contract first.
- TRUTH-SENSITIVE field exposed to Tina — content-trust violation; keep CMS to EDITORIAL.

## Related

- Root `AGENTS.md` (pipeline, Tina integration, budgets context), `packages/truth/AGENTS.md` (gate/schemas/tokens)
- `contracts/SEO-CONTRACT.md`, `contracts/ACCESSIBILITY-CONTRACT.md`, `contracts/VISUAL-REGRESSION-CONTRACT.md`, `contracts/MOTION-CONTRACT.md`
- `docs/12-roadmap-and-open-items.md` (AL-040 preview, AL-042 ClientRouter rewire)
- Existing `CLAUDE.md` in this directory (command reference)

## Workflow

Edit data/components → `tokens:build` (if tokens changed) → `astro build`/preview → targeted Playwright spec → `deploy:verify` for release.
