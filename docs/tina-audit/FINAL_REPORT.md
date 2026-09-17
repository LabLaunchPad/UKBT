# FINAL_REPORT — TinaCMS Cloud admin enablement

Date: 2026-09-17. Branch: `chore/tinacloud-admin-setup`. Status: READY_FOR_TEST
(awaiting CI + secrets + production verification).

## Root cause (proven, not assumed)

`/admin` 404'd because no pipeline step ever generated the admin UI:
`@tinacms/astro` emits only `admin/bridge.js`; the admin app requires
`tinacms build`, which never ran (plus missing lockfile + env). Full chain in
`docs/tina-audit/ROOT_CAUSE_REPORT.md`.

## Files changed (14 tracked + generated-ignored)

- `package.json` + `pnpm-lock.yaml`: root `tinacms`/`@tinacms/cli` devDeps
  (CLI cannot resolve the Tina package from `apps/web` under pnpm strictness);
  root `build` prepends `tinacms build --skip-cloud-checks --skip-search-index`.
- `apps/web/package.json` build: runs `check-content-trust.mjs` pre-astro
  (fail-fast; CMS-path guards enforced on EVERY build incl. dashboard).
- `tina/tina-lock.json`: NEW, committed (schema/lookup/graphql; verified
  secret-free). Enables TinaCloud branch indexing post-merge.
- `.env.example`: Tina vars (public client ID as example; token EMPTY).
- `.gitignore`: `tina/__generated__/` ignored (lockfile kept).
- `robots.txt`: `Disallow: /admin/`.
- Gate carve-outs (`admin/**` explicit prefix filters, win32-safe):
  `generate-sitemap.mjs`, `check-perf.mjs` (9.6MB bundle separately
  unbounded), `check-seo.mjs`, `check-ui.mjs`, `check-internal-links.mjs`.
  Unchanged (fail-closed on admin output): security (no `.map`, no `http:`),
  motion (source-only), deploy-mapping, control-plane, content-trust.
- `smoke-deploy.mjs` rule 7 (`/admin/` 200 + shell) + fixture pass/fail cases.
- `admin-shell.spec.ts`: login UI loads, same-origin assets healthy (1 test).
- `docs/tina-audit/`: 00-current-state, ROOT_CAUSE_REPORT, CHANGE_PLAN,
  CMS_TRUST_MODEL.

## Tests

- Local: full build green (with operator env), lint/typecheck/unit clean,
  all 13 gates PASS, all 6 injection suites PASS, admin-shell spec PASS,
  live-local `/admin/` 200 + login UI + assets healthy (only expected 401 is
  the pre-login TinaCloud billing check).
- Independent review: READY FOR PR (secrets scan clean, carve-outs narrow,
  bypass analysis negative, negative probes fail closed as designed).

## Rollback plan

Revert PR → `/admin` 404s again (prior state); content JSONs untouched;
TinaCloud project/APIs unaffected; no data loss.

## Residual risks

1. Secrets NOT yet provisioned: GitHub Actions (`PUBLIC_TINA_CLIENT_ID`
   variable + `TINA_TOKEN` secret) and Cloudflare Builds env (human) —
   builds fail CLOSED without them. SET BEFORE MERGE.
2. `--skip-cloud-checks` is staged (branch unindexed); follow-up PR drops it
   after TinaCloud shows the branch indexed.
3. TinaCloud commits land direct-to-branch (HD-002 open): CMS edits skip PR
   checks; build-time gates (loaders/truth/content-trust) still enforce.
4. XFO DENY vs admin preview iframe (P4): owner to verify visual editing.
5. Login completion needs a TinaCloud seat (owner-tested, not automatable).
6. Tokens in chat history: the Content-Readonly/Search values were pasted in
   this session — owner should rotate them after setup completes.

## Production verification (post-merge, required before VERIFIED_WORKING)

`/admin` 200 + login UI; smoke (incl. rule 7) green on main run; TinaCloud
branch indexed; owner login + edit + commit round-trip.
