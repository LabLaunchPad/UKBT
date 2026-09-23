# CHANGE_PLAN — TinaCMS Cloud admin (proposed, NOT YET IMPLEMENTED)

Precondition (human): OS-level env vars `PUBLIC_TINA_CLIENT_ID` (public ID
from dashboard) and `TINA_TOKEN` (Content Readonly token) set in the
operator's environment. Never committed, never pasted into chat/docs.

## Step 1 — generate (operator env, local)

`pnpm exec tinacms build` from repo root. Expected: `public/admin/`
(admin UI), `tina-lock.json`, refreshed `tina/__generated__/`.
If 403 persists with a REAL token → branch-indexing chicken-and-egg:
escalate (likely `tinacms dev` schema sync, then rebuild).

## Step 2 — measure gate impact (before wiring anything)

- `check-security`: `.map` files / `http://` in admin output?
- `check-seo` / `check-ui` / `check-links`: admin/index.html shape?
- `check-perf`: admin bundle weight vs 48KB jsTotal / 72KB html?
- sitemap generator: admin URL inclusion?
- Playwright route enumeration: admin/ picked up?
- SW/headers behavior for /admin/*.

## Step 3 — minimal wiring (single PR, 18 checks)

1. `.env.example`: `PUBLIC_TINA_CLIENT_ID` (+ real public value as example),
   `TINA_TOKEN=` empty placeholder, `TINA_BRANCH=main`. Token NEVER committed.
2. Build pipeline: `tinacms build --skip-cloud-checks --skip-search-index`
   before `astro build` (root `build` script; runs in CI + Workers Builds from
   committed lockfile). Staged choice: full cloud checks currently fail with
   `ERR_CLOUD_CHECK_FAILED` (branch unindexed — chicken-and-egg, since
   indexing requires the lockfile on main). FOLLOW-UP (separate PR after
   branch is indexed): drop `--skip-cloud-checks` so CI validates branch +
   token every build. `--skip-search-index` stays (no search UI; avoids a
   third secret).
3. `.gitignore`: generated `tina/__generated__/` ignored; `public/admin/`
   generated-at-build (ignored) vs committed `tina-lock.json` (required).
4. Gate-scope carve-outs for generated `admin/**`, each with rationale
   (Tina-owned authenticated app, not public site content): seo, ui, links,
   perf sums, sitemap, Playwright enumeration. Each carve-out reviewed +
   covered by a negative test (admin file tripping the UNCARVED rule fails).
5. CI secrets: `PUBLIC_TINA_CLIENT_ID` (+ `TINA_TOKEN` if build needs it)
   as GitHub Actions variables/secrets (human sets in dashboard).
6. Cloudflare: same env vars in Workers Builds environment (human sets).

## Step 4 — verify

Local: `pnpm build` → `dist/client/admin/index.html` exists → serve →
`/admin` shows Tina login (no login completion without seats — owner tests).
CI: 18/18 on PR. Production post-merge: `/admin` 200 + login UI; smoke suite
extended with admin-doc check (not auth).

## Rollback

Revert PR → admin route 404s again (previous state); no data loss (content
JSONs untouched; TinaCloud edits impossible while admin absent).

## Residual risks

- TinaCloud commits land direct-to-branch (vendor-documented Free behavior)
  → HD-002 stays OPEN; gates that run only in CI do not see CMS commits
  (REM-004 residual, unchanged).
- XFO DENY vs admin preview iframe (P4): verify, do not weaken headers.
- Admin bundle weight + cache behavior under SW (measure in Step 2).
- 2-seat limit + no workflow (plan-structural; REM-009/010 territory).
