# VISUAL_EDITING_STATUS — Phase 6
Date: 2026-09-18

## Method
Check code for TinaField, TinaIsland, data-tina-field, requestWithMetadata, preview, CSP.

## Code Presence (FACT)

- `apps/web/astro.config.mjs:7` `tina()` integration added, `adapter: cloudflare()` active — required for island route.
- `apps/web/src/components/Hero.astro` — headline/CTA props + `data-tina-field` attributes (verified in docs/tina-integration.md:27)
- `apps/web/src/components/ClubIntro.astro` — `data-tina-field` on lede (docs/tina-integration.md:28)
- `apps/web/src/lib/tina/loaders.ts` — Zod-validated typed loaders (homepage, faq, siteSettings) with allowlist URL validators (isSiteRelativeUrl etc.)
- `apps/web/src/lib/tina/islands.ts` — `islands = { hero: { fetch, component Hero, propsFromData }, aboutSection: { fetch, component ClubIntro } } satisfies Record<string, IslandConfig>` — uses `@tinacms/astro/experimental` IslandConfig, wrapper tag section.
- `apps/web/src/pages/tina-island/[name].ts` — `export const prerender = false` (per wrangler.jsonc comment 30-31, on-demand POST island handler) — required for visual editing, sole non-prerendered route.
- `apps/web/public/_headers` — CSP updated `frame-ancestors` allows `https://app.tina.io https://*.tinajs.io` (docs/tina-integration.md:43)
- Tina collections routers: homepage→/, about→/about, faq→/faq, siteSettings (no router) — correct.

## Runtime Buckets

| Bucket | Code Ready | Runtime Proof | Classification |
|--------|------------|---------------|----------------|
| LOGIN_WORKING | admin bundle generated to apps/web/public/admin (tinacms build) — code ready | Not executed — requires human TinaCloud login via /admin | UNKNOWN |
| SIDEBAR_WORKING | 4 collections defined with allowedActions create/delete false, forms with validation | Not executed | UNKNOWN |
| INLINE_EDITING_WORKING | data-tina-field present, islands defined, TinaIsland usage in pages (index.astro passes Tina content to Hero) | Not executed — requires preview load with tina-island fetch | UNKNOWN but CODE PRESENT |
| SAVE_FLOW_WORKING | Tina save → GitHub commit on main → Workers rebuild (branch chain handles main) | Not executed — depends on P0-2 HITL | UNKNOWN |

## CSP / Iframe Headers

- `_headers` must allow `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` — verify file contains this. If preview origin differs, need PUBLIC_TINA_ADMIN_ORIGIN allowlist (middleware.js:4 adminOrigins()).
- No `X-Frame-Options: DENY` that would block iframe — check _headers.

## Free vs Paid

- Visual click-to-edit works on Tina Free per tina.io docs (no paid feature). Verified: no search UI, no editorial workflow needed.

## What Blocks Visual Editing Now

- P0-1 SESSION pin done but redeploy not yet proven (second save test).
- P0-2 HITL not executed — login + sidebar + save all UNKNOWN until headed session.
- P0-3 deploy:verify not yet PASS with real secrets in CI/Workers — build gated.

## Next Verify Steps (per TINA_HITL_RUNBOOK.md Flow 1-5 headed ask session)

1. Human navigates to <site>/admin, logs in (agent never sees creds)
2. Verify 4 collections load, sidebar form renders
3. Edit safe field `Site settings → footerTagline` append ` (edited via TinaCloud <date>)`
4. Human clicks Save → AI records GitHub main SHA + `git diff HEAD~1 -- apps/web/content/site/siteSettings.json` + Cloudflare deploy status + `check-content-trust && check-seo` PASS + production sentinel visible
5. Re-run visual test: open content page, click editable region → highlight + form opens — exercises tina-island route. If errors, confirm nodejs_compat and SESSION binding.

## Verdict
**LOGIN/SIDEBAR/INLINE/SAVE all UNKNOWN until HITL — do not claim working.** Code wiring is correct and complete for Free tier.
