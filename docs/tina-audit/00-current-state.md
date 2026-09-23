# TinaCMS Cloud — Phase 0: repository truth (AUDIT-adjacent, read-only findings)

Date: 2026-09-17. Target: LabLaunchPad/UKBT @ main (post-REM-004).

## 1. Versions (FACT, package.json reads)

- `tinacms ^3.14.0`, `@tinacms/astro ^0.7.0`, `@tinacms/bridge ^0.3.1`
  (apps/web prod deps), `@tinacms/cli ^3.0.0` (dev).
- `astro ^7.2.8`, `@astrojs/cloudflare ^14.2.5`, static output.

## 2. Framework integration (FACT, source reads)

- `apps/web/astro.config.mjs`: `tina()` integration active + `tina-island/[name].ts`
  on-demand POST route (REM-002 smoke-covered).
- `@tinacms/astro` integration at build:done emits ONLY `admin/bridge.js`
  (visual-editing bridge) into the client dir — verified in installed
  `dist/integration.js:49,163-169`. It does NOT generate the admin UI.

## 3. Existing Tina configuration (FACT)

- `tina/config.ts` (root): 4 collections (homepage/about/faq/siteSettings),
  `branch/clientId/token` all env-driven with null fallback, `build.outputFolder:
  'admin'`, `publicFolder: 'apps/web/public'`.
- `apps/web/content/*/*.json`: 4 content files. `apps/web/src/lib/tina/`:
  loaders (Zod) + islands. No `TinaAdmin`, no `/admin` route in `src/`.
- `public/admin/`: ABSENT. `tina/tina-lock.json`: ABSENT.

## 4. Expected admin route

- Production `/admin` → Astro 404 (nothing generates `admin/index.html`).
- TinaCloud dashboard expects `<site>/admin` + committed `tina-lock.json`.

## 5. Build pipeline (FACT)

- `apps/web build` = tokens + `astro build` + sitemap + build-sw. No
  `tinacms build` step anywhere (package.json scripts, ci.yml).
- Deploys: Cloudflare Workers Builds from main merge (dashboard-owned).

## 6. Environment variables (FACT)

- `.env.example`: Sentry/Astro/reference only — zero `TINA_*`.
- TinaCloud project (USER_PROVIDED screenshots): client ID
  `fe5da197-…` (public identifier), site URLs (prod + 127.0.0.1:4321 +
  localhost:4321), tokens exist (read-only + search; values NOT recorded
  here), editorial workflow unavailable on Free (confirms zero-SoD),
  branches unindexed pending schema, separate content repo DISABLED.

## 7. Missing requirements

1. `tinacms build` step (generates `public/admin/` + `tina-lock.json`).
2. `PUBLIC_TINA_CLIENT_ID` in build environments (public value; human sets
   Cloudflare/CI/local — never the secret token).
3. `TINA_TOKEN` server-side only (human-provisioned; never committed).
4. Gate-scope carve-outs for generated `admin/**` (seo/ui/links/perf/sitemap/
   specs) — Tina-owned app shell, not site content; each carve-out reviewed.
5. `tina-lock.json` committed (generated, not hand-written).

## 8. Security risks (carried from audit, unchanged severity)

- CMS trust boundary (CORR-W1-02 family, REM-004 governed): admin UI makes
  CMS editing operational — HD-001/002/003 stay OPEN (seats, App commit path,
  dashboard membership). TinaCloud "commits directly to GitHub" per vendor
  docs → App-path answer likely "direct-to-branch" (to be confirmed by
  observed commit, not assumed).
- XFO DENY vs Tina framing (P4): admin preview iframe may break on XFO-
  respecting clients — verify during testing, do not weaken headers blindly.
- `.map`/bundle leakage: verify admin output against check-security rules.
- Perf budgets: admin bundle must be scoped out of site transfer budgets
  with explicit rationale (it is an authenticated app, not public content).
