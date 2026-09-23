# ROOT_CAUSE_REPORT — production `/admin` 404 (TinaCMS Cloud setup)

Date: 2026-09-17. Method: source reads + executed CLI probes (evidence below).

## Symptom

`https://ukbanglatigers.co.uk/admin` → Astro 404 (also `/admin/index.html`).

## Root cause chain (all verified, ordered)

1. **No admin UI is ever generated.** `@tinacms/astro`'s integration emits
   ONLY `admin/bridge.js` at build:done (installed
   `dist/integration.js:49,163-169`). The admin app (`admin/index.html` +
   bundle) is produced solely by `tinacms build` (Tina CLI).
2. **`tinacms build` never runs.** No repo script, CI job, or dashboard build
   command invokes it (`package.json` scripts + `ci.yml` + DEPLOYMENT-CONTRACT
   build command read; zero hits).
3. **`public/admin/` does not exist** (directory listing verified absent), so
   Astro copies nothing to `dist/client/admin/`, so Workers serves nothing.
4. **CLI could not run from `apps/web`** ("Unable to find Tina folder") —
   config lives at repo root. Fixed by installing `tinacms` + `@tinacms/cli`
   as root devDeps (pnpm install clean, allowlist PASS — names pre-approved).
5. **`tinacms build` requires TinaCloud auth**: presence check
   (`clientId/token`) then a cloud branch check. Dummy token → 403
   "not authorized to access branch". Dashboard confirms branches unindexed
   pending schema configuration ("No branches found").
6. **Env vars absent everywhere**: `.env.example` has zero `TINA_*`; no
   `.env`; CI/cloud env unset (human-owned).

## What is NOT the cause

- Astro/adapter mapping (deploy-mapping gate green; other routes serve).
- `_headers`/redirects (no admin rule; 404 is genuine absence, not policy).
- Wrong Tina package versions (3.14.0/0.7.0/3.0.0 satisfy `>=3.9.3` floor).
- `tina/config.ts` shape (collections valid; local schema compiles —
  `tina/__generated__/_schema.json` + types + frags generated before the
  cloud check failed).

## Blocker (external, human-owned)

Real `TINA_TOKEN` (Content Readonly, from TinaCloud Tokens tab) + branch
indexing. Nothing further can be generated or verified until the CLI can
authenticate. Token must NEVER be committed, pasted into chat, or written
to any repo file.
