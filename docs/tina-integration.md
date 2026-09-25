# TinaCMS Cloud Free Integration — Runbook

**Created:** 2026-09-14
**Status:** `TINACMS_FREE_READY_WITH_EXPLICIT_LIMITATIONS`
**Domain:** https://ukbanglatigers.co.uk
**Framework:** Astro 7.x (apps/web/package.json: astro ^7.2.8) + @tinacms/astro v0.7.0

## Architecture

```
TinaCloud Free (Git-backed)
→ Tina-managed structured content + media
→ @ukbt/truth validation (T1-T9 gate)
→ typed application model
→ Astro static pages
→ selective TinaIsland visual-editing regions
→ SEO/UI/A11y/Motion/Security/Performance gates
→ Cloudflare Workers deployment
```

## Files Changed

| File | Change |
|---|---|
| `apps/web/package.json` | Added `@tinacms/astro`, `@tinacms/bridge`, `tinacms`, `@tinacms/cli` |
| `apps/web/astro.config.mjs` | Added `tina()` integration, `tinaAdminDevRedirect()`, `@astrojs/cloudflare` adapter |
| `apps/web/src/components/Hero.astro` | Added headline/CTA props, `data-tina-field` attributes |
| `apps/web/src/components/ClubIntro.astro` | Added `data-tina-field` attribute on lede |
| `apps/web/src/pages/index.astro` | Passes Tina content to Hero component |
| `apps/web/src/lib/tina/islands.ts` | Island registry with real data fetching |
| `apps/web/src/lib/tina/loaders.ts` | Adapter: reads Tina JSON, exports typed objects |
| `apps/web/src/pages/tina-island/[name].ts` | Island route with `prerender = false` |
| `apps/web/content/homepage/homepage.json` | Homepage content (Tina-managed) |
| `apps/web/content/about/about.json` | About page content (Tina-managed) |
| `apps/web/content/faq/faq.json` | FAQ content (Tina-managed) |
| `apps/web/content/site/siteSettings.json` | Site settings (Tina-managed) |
| `tina/config.ts` | TinaCMS project configuration with 4 collections |
| `scripts/dependency-allowlist.json` | Added 4 TinaCMS package entries |
| `.github/workflows/ci.yml` | CI pipeline implementing all 18 required checks |
| `.env.example` | TinaCMS environment variable names |
| `adversarial/cases.yaml` | 12 adversarial test cases (required by scaffold) |
| `wrangler.jsonc` | Added SESSION KV binding for Cloudflare adapter |
| `apps/web/public/_headers` | CSP updated: `frame-ancestors` allows Tina origins |
| `AGENTS.md` | Added TinaCMS integration guidance |
| `docs/tina-client-guide.md` | Client task matrix and usage guide |
| `.gitignore` | Created (was missing) |

## Exact Dependencies Added

- `@tinacms/astro` ^0.7.0 (apps/web dependency)
- `@tinacms/bridge` ^0.3.1 (apps/web dependency)
- `tinacms` ^3.14.0 (apps/web dependency, must be ≥3.9.3 for CVE-2026-55661)
- `@tinacms/cli` ^3.0.0 (apps/web devDependency)
- `@astrojs/cloudflare` ^14.2.5 (already in apps/web)
- `@astrojs/node` ^4.0.0 (removed — incompatible with Astro 7)

## Environment Variables

| Variable | Public? | Where |
|---|---|---|
| `PUBLIC_TINA_CLIENT_ID` | Yes | `.env`, CI |
| `TINA_TOKEN` | **No** | CI secret store / Cloudflare secret |
| `TINA_BRANCH` | Yes | `.env`, CI |
| `PUBLIC_TINA_ADMIN_ORIGIN` | Yes | `.env`, CI |

> **Notes:**
> - `tina/config.ts:8` falls back to `TINA_CLIENT_ID` if `PUBLIC_TINA_CLIENT_ID` is not set — both names refer to the same value.
> - `TINA_SEARCH_TOKEN` is NOT required — search is disabled by design (`tinacms build --skip-search-index`). See `tina/config.ts:23-30` and `docs/tina-audit/CMS_TRUST_MODEL.md`.
> - `TINA_TOKEN` is a **build-time only** secret baked into the admin bundle by `tinacms build`. It is NOT a Workers runtime variable. Do not put it in `wrangler.jsonc` env_vars.

## Human TinaCloud Dashboard Steps

1. Create/select the single TinaCloud project for `LabLaunchPad/UKBT`
2. Connect/authorize the GitHub repository
3. Confirm branch is `main`
4. Confirm Free-plan limits (2 users, 2 roles, 1 project, 100MB per-asset size cap — no total quota published)
5. Configure local (`http://localhost:4321`) and production (`https://ukbanglatigers.co.uk`) URLs
6. Obtain the `PUBLIC_TINA_CLIENT_ID` from the TinaCloud dashboard
7. Store the `TINA_TOKEN` in the appropriate secret store
8. Verify repo-based media sync (100MB per-asset size cap)
9. Inspect the media library
10. Perform one harmless preview/editor change
11. Confirm Git-backed save
12. Confirm CI validates the change
13. Only then treat production integration as ready

## Verification Commands

```bash
pnpm install                    # install
pnpm build                      # tokens + web build + sitemap
pnpm lint                       # biome check
pnpm typecheck                  # tsc --noEmit / astro check
pnpm test:unit                  # vitest run (packages/truth)
pnpm deploy:verify              # FULL release gate
pnpm check:links                # internal links
pnpm check:seo                  # SEO_STATUS
pnpm check:ui                   # UI_STATUS
pnpm check:motion               # MOTION_STATUS
pnpm check:security             # SECURITY_STATUS
pnpm check:perf                 # PERF_STATUS
pnpm check:deps                 # dependency allowlist
pnpm check:governance-scaffold  # scaffold self-test
```

## Content Model

### Editorially Tina-Managed (CMS-safe)
- Homepage headline, subheadline, eyebrow, CTA labels
- About section copy, mission text
- FAQ question/answer pairs
- Navigation labels, order, visibility
- Site settings (tagline, social URLs)

### Code/Truth-Owned (NOT Tina-managed)
- Player rosters (58+ players)
- Tournament data and statistics
- Leadership facts (names, roles)
- All SEO metadata generation
- Routing, CSS, JS, motion
- Service worker, build pipeline
- Security headers, CSP
- Any organization-specific facts

## Free-Plan Boundary

- 2 users max (hard cap)
- 2 roles
- 1 project
- 100MB per-asset size cap (no total quota published)
- No editorial workflow (Team Plus $41/mo)
- No API (Business $249/mo)
- No AI assist, no SSO

## Security Model

- `PUBLIC_TINA_CLIENT_ID` is public
- `TINA_TOKEN` is private — never committed
- CSP ships: `frame-ancestors 'self' https://*.tina.io https://app.tina.io https://*.tinajs.io`
- `isEditMode(request)` for conditional admin rendering
- `/admin` bundle not served to public visitors
- Secret scanning gate in CI

## Deployment Model

- Cloudflare Workers (static assets)
- `wrangler.jsonc` at repo root
- `output: 'static'` preserved for public site
- `_worker.js` handles island routing on-demand
- CI deploys via Cloudflare dashboard integration

## Performance Budgets

Adjusted to accommodate TinaCMS overhead:

| Budget | Before | After | Reason |
|---|---|---|---|
| `htmlPerPage` | 64KB | 72KB | Tina admin + inline schema |
| `cssTotal` | 56KB | 96KB | Tina admin styles |
| `jsTotal` | 32KB | 48KB | Tina bridge (15.5KB) + Cloudflare adapter |

**Rationale**: TinaCMS bridge adds ~15KB JS for visual editing. This is loaded only when editing mode is active, but counted in total budget. Public site without editing remains lean.

## Status: `TINACMS_FREE_READY_WITH_EXPLICIT_LIMITATIONS`

All 18 required checks pass. Public site fully functional. Tina closure merged 2026-09-22/23 (gates PR #96, fixes #97/#99/#100); production Save path proven (headline edit → commit `fbf05f2` → live). Standing blocker: post-deploy smoke FAILS from the GH runner (Cloudflare challenge — owner-action blocker).
