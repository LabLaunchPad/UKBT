# CHANGE_LOG — Phase 2 Fix Only Proven Blockers (minimal diffs) — 2026-09-17

> Base: `54d1fc211ce7c08b4074c6cbfc81b3de08efadee` (HEAD after Task 2) — worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` (Task 2 verdicts) + `artifacts/audit/tina-hardening/CURRENT_STATE.md` + Workers doc `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` + installed `@tinacms/astro@0.7.0` (`middleware.js`, `vite.js`, `island-route.js`)
> Evidence classes: FACT / VERIFIED / OBSERVED / INFERENCE / UNKNOWN — never upgrade UNKNOWN→FACT
> Constraints: one concern per commit, one file per fix, no fabricating SESSION id, free-tier sufficient (see §0), deploy:verify not run here (Task 7)

---

## §0 Free-tier BLUF (hobby/free stack CAN support Tina visual editing)

**INFERENCE documented as FACT-sourced:** Workers Free 100k req/day, KV 100k reads / 1k writes / 1GB free, no cache config needed beyond `_headers`, sufficient for Tina visual editing (editorial sidebar → commit → rebuild → Workers deploy). Remaining blockers are engineering (branch chain, `nodejs_compat`, SESSION pin, origin allowlist), **not pricing**. Do NOT treat pricing as blocker. Cited: Cloudflare Workers/KV free-tier docs + `apps/web/public/_headers` cache matrix + `wrangler.jsonc` assets mapping; no billing gate in `deploy:verify`.

---

## CHANGE_PROPOSAL 2026-09-17 — 01 Branch isolation (`tina/config.ts:4`) — REQUIRED

**Problem:** Preview/Workers Builds edits target `main` instead of the preview branch. `tina/config.ts:4` resolves `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main'` — missing `WORKERS_CI_BRANCH` (Workers Builds) and `CF_PAGES_BRANCH` (Pages). Workers doc § Editing branch: "Without them the branch falls back to `main`, so a preview or non-`main` deploy would edit `main` while the site builds from your branch."

**Evidence:**
- `tina/config.ts:4` FACT: `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main',` (read 2026-09-17, also cited `WORKERS_TINA_CONFIGURATION_AUDIT.md §1` + `CURRENT_STATE.md P0-1`)
- `Select-String -Path tina/config.ts -Pattern "WORKERS_CI_BRANCH|CF_PAGES_BRANCH"` → 0 hits — VERIFIED
- `.github/workflows/ci.yml:21-31` env only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` — no branch forwarding — FACT
- `.env.example:10` `TINA_BRANCH=main` only — FACT
- `WORKERS_TINA_CONFIGURATION_AUDIT.md §1` Verdict: **MISSING — REQUIRED** for `WORKERS_CI_BRANCH` + `CF_PAGES_BRANCH` (Workers doc chain `GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"`)

**Risk:** low — scope single expression in `tina/config.ts:4`; no runtime behavior change on `main` (fallback still `main`); preview branches gain correct isolation. Reversible via `git revert`. Lockfile side-effect is shape-only (touches `tina/tina-lock.json` only).

**Minimal fix:** exact diff, one file one concern
```diff
diff --git a/tina/config.ts b/tina/config.ts
--- a/tina/config.ts
+++ b/tina/config.ts
@@ -1,4 +1,4 @@
 import { defineConfig } from 'tinacms';
 
 export default defineConfig({
-  branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main',
+  branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main',
   // PUBLIC_TINA_CLIENT_ID is the Astro-convention name; TINA_CLIENT_ID is
```
Optional portability tokens `VERCEL_GIT_COMMIT_REF`/`HEAD` deferred — Cloudflare host is Workers Builds (`wrangler.jsonc:35` `ukbt-uk-bangla-tigers`), not Vercel.

**Validation:**
- `node scripts/check-deploy-mapping.mjs` must PASS (post-build; pre-build FAIL is `assets-directory-absent`/`worker-entry-absent` due to missing `dist/` — not related to branch fix)
- `pnpm --filter @ukbt/web typecheck` — N/A (no `.astro` change), but run for completeness if touched
- `pnpm exec tinacms build --skip-cloud-checks --skip-search-index` or `pnpm run build` then `git diff --stat tina/` touches only `tina/tina-lock.json` — shape-only verified, `git status --porcelain` shows only `tina/config.ts` + `tina/tina-lock.json`
- Command outputs to be pasted after implementation in § Implementation record 01

**Rollback:** `git revert <sha>` where `<sha>` is the `fix(tina): resolve editing branch on Workers Builds previews` commit, or delete ` || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH` segment.

---

## CHANGE_PROPOSAL 2026-09-17 — 02 Runtime compat `nodejs_compat` (`wrangler.jsonc`) — REQUIRED

**Problem:** `wrangler.jsonc` missing `compatibility_flags: ["nodejs_compat"]` required for `node:async_hooks` used by Tina visual-editing island route + middleware. Without it, `tina-island/[name].ts` POSTs error at runtime.

**Evidence:**
- `wrangler.jsonc:1-71` FACT — `compatibility_date: "2026-09-14"` present (`wrangler.jsonc:36`), no `compatibility_flags`, no `kv_namespaces` — VERIFIED via `Select-String -Path wrangler.jsonc -Pattern "compatibility|kv|SESSION"` → only `compatibility_date:36` + `binding: ASSETS:39` (`WORKERS_TINA_CONFIGURATION_AUDIT.md §2.1` + `CURRENT_STATE.md Appx C`)
- Workers doc § Configure for Cloudflare: "Add a root `wrangler.jsonc` that turns on `nodejs_compat`, which the visual-editing route needs for `node:async_hooks`:" — FACT (webfetch 2026-09-17)
- `apps/web/node_modules/@tinacms/astro/dist/middleware.js:11` FACT: `import { AsyncLocalStorage } from "node:async_hooks";` + `island-route.js:11` same — two `AsyncLocalStorage` stores (`formsStore`, `requestStore`) — FACT (`WORKERS_TINA_CONFIGURATION_AUDIT.md §2.3`)
- `apps/web/src/pages/tina-island/[name].ts:4-5` FACT: `export const prerender = false; export const POST = experimental_createIslandRoute(islands);` — on-demand route requires Worker entry (`wrangler.jsonc:37` `main` already PRESENT)
- `WORKERS_TINA_CONFIGURATION_AUDIT.md §2.3` Verdict: **MISSING — REQUIRED**

**Risk:** low — single JSONC key insertion after `compatibility_date`; matches `tina-astro-starter` template; reversible; `wrangler@4.126.0` supports `nodejs_compat` on `2026-09-14` date (`package.json:49`).

**Minimal fix:** exact diff, one file one concern
```diff
diff --git a/wrangler.jsonc b/wrangler.jsonc
--- a/wrangler.jsonc
+++ b/wrangler.jsonc
@@ -33,6 +33,7 @@
   // dashboard Worker's exact name (`ukbt-uk-bangla-tigers`); the adapter-
   // generated `ukbt-web` name must NOT be adopted.
   "name": "ukbt-uk-bangla-tigers",
   "compatibility_date": "2026-09-14",
+  "compatibility_flags": ["nodejs_compat"],
   "main": "./apps/web/dist/server/entry.mjs",
   "assets": {
     "binding": "ASSETS",
```

**Validation:**
- `node scripts/check-deploy-mapping.mjs` must PASS (structural — `nodejs_compat` flag does not alter assets/main checks but proves `wrangler.jsonc` still parses; `parseJsonc` is the gate's parser)
- `pnpm --filter @ukbt/web typecheck` not required (no TS change) but `pnpm run build` or `npx wrangler deploy --dry-run` should accept the new flag without parse error
- `git status --porcelain` shows only `wrangler.jsonc`
- Pasted after implementation in § Implementation record 02

**Rollback:** `git revert <sha>` where `<sha>` is `fix(worker): enable nodejs_compat for tina island route` or delete the `"compatibility_flags"` line.

---

## CHANGE_PROPOSAL 2026-09-17 — 03 Session KV `kv_namespaces` (`wrangler.jsonc`) — REQUIRED but BLOCKED/UNKNOWN

**Problem:** `wrangler.jsonc` has no `kv_namespaces` SESSION pin. Adapter `@astrojs/cloudflare` injects a `SESSION` KV even when the site doesn't use sessions. Workers doc § Pin the SESSION KV: "Your first deploy creates the namespace automatically, but Cloudflare doesn't write its ID back to your repo, so the next git-based deploy tries to create it again and fails: [10014]. Editor saves trigger a redeploy, so you would hit this on your second save."

**Evidence:**
- `wrangler.jsonc:1-71` no `kv_namespaces`/`SESSION` — VERIFIED negative grep (`WORKERS_TINA_CONFIGURATION_AUDIT.md §3` + `CURRENT_STATE.md Appx C`)
- Workers doc § Pin the SESSION KV (fetched markdown) — FACT
- `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` Verdict table: structural `kv_namespaces` key **MISSING — REQUIRED**, but binding `id` **MISSING — BLOCKED (UNKNOWN ID)** — no valid `id` retrievable in this audit; dashboard `Workers & Pages | KV` + `npx wrangler kv namespace list --json` not captured; no `Astro.session` usage in `apps/web/src` (UNNEEDED at app level, REQUIRED at deploy level)
- Free-tier note: KV free tier 1GB storage / 100k reads / 1k writes per day — pricing not a blocker; blocker is missing ID (see §0)

**Risk:** medium if fabricated (inventing an `id` breaks `wrangler deploy` more thoroughly than missing binding). Low if pinned with a real ID retrieved from dashboard/CLI.

**Minimal fix:** **NO FIX COMMITTED IN THIS TASK — BLOCKED.** Required diff (when unblocked) is exactly:
```jsonc
  "kv_namespaces": [
    { "binding": "SESSION", "id": "<real-id-from-dashboard-or-npx-wrangler-kv-namespace-create-SESSION>" }
  ],
```
placed before or after `assets` per `wrangler` schema (starter template places it after `compatibility_flags`). The `<real-id>` MUST come from `npx wrangler kv namespace create SESSION --preview false` or copy of the auto-created ID from **Workers & Pages | KV** / Worker **Settings | Bindings**. **Never invent an ID.** Until an ID is retrieved (HITL proof via MCP/browser or `npx wrangler kv namespace list --json`), this remains a blocking HITL item.

**Validation (when unblocked):**
- `node scripts/check-deploy-mapping.mjs` PASS (gate does not validate KV IDs, but deploy would fail 10014 without pin on 2nd git-based deploy)
- `npx wrangler kv namespace list --json` shows the SESSION namespace with the pinned `id`
- `git status --porcelain` would show only `wrangler.jsonc`
- Record CLI output in CHANGE_LOG.md when implemented

**Rollback:** `git revert <sha>` of the future pin commit, or delete the `kv_namespaces` array. Until pinned, HITL runbook must note that save→redeploy proof will hit 10014 on second save and is therefore blocked — see `TINA_HITL_RUNBOOK.md`.

**Action in this task:** Document blocker as above; implement nothing; leave `wrangler.jsonc` without `kv_namespaces` to avoid fabricating an ID. This satisfies "do NOT fabricate id, record blocker" and "never upgrade UNKNOWN."

---

## CHANGE_PROPOSAL 2026-09-17 — 04 Admin origin allowlist (` .env.example`) — DOCUMENTATION_GAP REQUIRED

**Problem:** `PUBLIC_TINA_ADMIN_ORIGIN` is honored by `@tinacms/astro` middleware but absent from `.env.example`, so local dev + Workers Builds lack explicit origin contract. `middleware.js:4` reads `env?.PUBLIC_TINA_ADMIN_ORIGIN` and `bridgeScript()` propagates `init({adminOrigin: [...]})`.

**Evidence:**
- `apps/web/node_modules/@tinacms/astro/dist/middleware.js:2-8` FACT — `function adminOrigins() { const env = import.meta.env; const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN; ... }` + `middleware.js:116-118` `const origins = adminOrigins(); const initArg = origins ? `{adminOrigin:${JSON.stringify(origins)}}` : "";` — FACT (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.1`)
- `.env.example:1-16` FACT — only `PUBLIC_TINA_CLIENT_ID:8`, `TINA_TOKEN:9`, `TINA_BRANCH:10`; `Select-String PUBLIC_TINA_ADMIN_ORIGIN` → 0 hits — VERIFIED
- `apps/web/public/_headers:9` CSP includes `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `connect-src 'self' https://*.ingest.sentry.io https://app.tina.io https://*.tinajs.io` — PRESENT — `_headers` correctly scoped (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`)
- `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.1` Verdict: **MISSING — DOCUMENTATION_GAP (REQUIRED)** — var name + comment required, value UNKNOWN (no invented domain)
- Workers doc does not list `PUBLIC_TINA_ADMIN_ORIGIN` in § Environment variables — installed adapter behavior, not doc-mandated, but task rubric requires it

**Risk:** low — docs-only, no runtime change; adds a commented empty var to `.env.example` so humans set it per-environment. Empty value ships (`PUBLIC_TINA_ADMIN_ORIGIN=`) with comment referencing `middleware.js:4`.

**Minimal fix:** exact diff, one file one concern
```diff
diff --git a/.env.example b/.env.example
--- a/.env.example
+++ b/.env.example
@@ -7,6 +7,11 @@
 # Never commit TINA_TOKEN or paste it into chat/docs/issues.
 PUBLIC_TINA_CLIENT_ID=fe5da197-2c26-4071-9d72-e8216d5b53d6
 TINA_TOKEN=
 TINA_BRANCH=main
+# Tina admin origin allowlist (see apps/web/node_modules/@tinacms/astro/dist/middleware.js:4 adminOrigins()).
+# Comma-separated origins allowed to embed /admin. Leave empty for same-origin; set when preview/production origins differ.
+# Example: PUBLIC_TINA_ADMIN_ORIGIN=https://app.tina.io,https://ukbanglatigers.co.uk
+PUBLIC_TINA_ADMIN_ORIGIN=
 
 # Astro preview background (required for Astro 7)
 ASTRO_PREVIEW_BACKGROUND=false
```

**Validation:**
- `node scripts/check-deploy-mapping.mjs` PASS
- `git status --porcelain` shows only `.env.example`
- No typecheck needed; docs-only

**Rollback:** `git revert <sha>` of `docs(env): document PUBLIC_TINA_ADMIN_ORIGIN for tina bridge` or delete the 4-line block.

---

## CHANGE_PROPOSAL 2026-09-17 — 05 Tina admin dev redirect (`apps/web/astro.config.mjs`) — NOT_REQUIRED (deferred)

**Problem considered:** `apps/web/astro.config.mjs` lacks `tinaAdminDevRedirect()` Vite plugin that redirects `/admin` → `/admin/index.html` in `astro dev`. `@tinacms/astro/dist/vite.js:2-24` FACT — exports `tinaAdminDevRedirect()` (`vite.js` read above). Task 3 priority order candidate 4 proposes `import { tinaAdminDevRedirect } from '@tinacms/astro/vite'` + `vite: { plugins: [tinaAdminDevRedirect()] }`.

**Evidence:**
- `apps/web/node_modules/@tinacms/astro/dist/vite.js:1-24` FACT — `function tinaAdminDevRedirect()` with `apply: "serve"`, `configureServer` redirect for `path === "/admin" || "/admin/"` — FACT
- `apps/web/astro.config.mjs:1-30` FACT — currently `import tina from '@tinacms/astro/integration'` + `cloudflare()` adapter, `output: 'static'`, `site: 'https://ukbanglatigers.co.uk'`; no `vite` key, no `tinaAdminDevRedirect` import — FACT
- `node_modules/.pnpm/.../@tinacms/astro/dist/vite.js` resolves via `require.resolve('@tinacms/astro/vite', {paths:['apps/web']})` → `.../dist/vite.js` — VERIFIED (`require.resolve` output pasted above: `C:\UKBT\ukbt-tina-hardening\node_modules\.pnpm\@tinacms+astro@0.7.0_astro@_437368a50139912c98f4887d79e778e7\node_modules\@tinacms\astro\dist\vite.js`)
- `WORKERS_TINA_CONFIGURATION_AUDIT.md` Summary table — no verdict for `tinaAdminDevRedirect`; not listed as REQUIRED in audit §2-§4. Audit §4.4 notes adapter/tina integration present; vite plugin not assessed as REQUIRED for Workers deploy (it is `apply: "serve"` dev-only, not production).
- Workers doc does not mention `tinaAdminDevRedirect` — dev-ergonomic only.

**Verdict:** **NOT_REQUIRED** for hardening evidence-first loop. `apply: "serve"` means the plugin only runs in `astro dev`, not in `astro build` / Workers production — zero deployment impact. Implementing it would add a local-dev convenience but is not a proven production blocker per `WORKERS_TINA_CONFIGURATION_AUDIT.md` and `CURRENT_STATE.md`. Per Task 3 rule "If verdict NOT_REQUIRED/UNKNOWN write that and implement nothing," **no code change is made in this task**.

**Risk if later implemented:** low — single Vite plugin in `astro.config.mjs`; would require `pnpm --filter @ukbt/web typecheck` + `pnpm --filter @ukbt/web dev` smoke.

**Minimal fix (deferred, NOT applied):**
```diff
diff --git a/apps/web/astro.config.mjs b/apps/web/astro.config.mjs
--- a/apps/web/astro.config.mjs
+++ b/apps/web/astro.config.mjs
@@ -1,6 +1,7 @@
 import { defineConfig } from 'astro/config';
 import sentry from '@sentry/astro';
 import spotlightjs from '@spotlightjs/astro';
 import tina from '@tinacms/astro/integration';
+import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
 import cloudflare from '@astrojs/cloudflare';
 
@@ -26,4 +27,7 @@
   server: { host: '127.0.0.1' },
   adapter: cloudflare(),
   integrations,
+  vite: {
+    plugins: [tinaAdminDevRedirect()],
+  },
 });
```

**Validation (if later applied):** `pnpm --filter @ukbt/web typecheck` PASS + `node -e "import('@tinacms/astro/vite')"` resolves + `git status` shows only `apps/web/astro.config.mjs`.

**Rollback:** `git revert <sha>` or remove the import + `vite` key.

**Action in this task:** implement nothing.

---

## CHANGE_PROPOSAL 2026-09-17 — 06 `_headers` PRESENT — NOT_REQUIRED

**Verdict:** **PRESENT — no change required.** `apps/web/public/_headers:1-40` FACT — CSP `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `connect-src 'self' https://*.ingest.sentry.io https://app.tina.io https://*.tinajs.io` covers Tina admin iframe + bridge. `X-Frame-Options: DENY` co-exists but is overridden by `frame-ancestors` precedence (CSP takes precedence). No `_headers` edit proposed. Evidence: `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2` table PRESENT.

---

## CHANGE_PROPOSAL 2026-09-17 — 07 `SITE_URL` env — N/A (NOT_REQUIRED)

**Verdict:** **UNNEEDED — N/A for this stack.** `apps/web/astro.config.mjs:15` hardcoded `site: 'https://ukbanglatigers.co.uk'` — FACT (global constraint). Workers `SITE_URL` env is N/A (reconciled non-issue per `CURRENT_STATE.md` § Global Constraints + `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.3`). Do not add `SITE_URL` to `.env.example`. No fix proposed.

---

## Implementation records (post-validation, one concern per commit)

### Implementation record 01 — Branch isolation (`tina/config.ts:4`) — IMPLEMENTED

- Date: 2026-09-17 22:58 UTC
- Commit: `8322de1455ad60398fc8ee60d0d633d7768b2ce2` `fix(tina): resolve editing branch on Workers Builds previews`
- Diff: `tina/config.ts:4` `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main'` → `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main'` — one file, one concern
- Commands + outputs (VERIFIED):
  ```
  $ pnpm exec tinacms build --skip-cloud-checks --skip-search-index (with PUBLIC_TINA_CLIENT_ID fe5da197… + dummy TINA_TOKEN)
  Starting Tina build
  ○ Tina build complete — GraphQL Client: tina/__generated__/client.ts
  $ git diff --stat tina/
   tina/config.ts | 2 +-
   1 file changed, 1 insertion(+), 1 deletion(-)
  $ git diff --stat tina/tina-lock.json — no diff (branch not in lockfile shape — shape-only verified, lockfile untouched)
  $ git status --porcelain (pre-commit)
   M tina/config.ts
   ?? artifacts/audit/tina-hardening/CHANGE_LOG.md (proposal draft)
   ?? docs/superpowers/ (plan files, untracked — not part of fix)
   ?? apps/web/public/admin/ (build artifact, gitignored in future but currently untracked — not committed)
  $ pnpm run build (full: tinacms build + tokens:build + astro build + sitemap) — PASS
  $ node scripts/check-deploy-mapping.mjs
  {"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}
  DEPLOY_MAPPING_STATUS = PASS
  ```
- `pnpm --filter @ukbt/web typecheck` — not required (no `.astro` change); `tina/config.ts` is not Astro-typed
- `git log --oneline` shows only `tina/config.ts` touched in this commit — one concern satisfied
- Status: IMPLEMENTED and validated
- Rollback: `git revert 8322de1455ad60398fc8ee60d0d633d7768b2ce2`

### Implementation record 02 — `nodejs_compat` (`wrangler.jsonc`) — IMPLEMENTED

- Date: 2026-09-17 22:59 UTC
- Commit: `68c672ec99f99d52dcefb2e2c976839bac2b202d` `fix(worker): enable nodejs_compat for tina island route`
- Diff: `wrangler.jsonc:36-37` inserted `"compatibility_flags": ["nodejs_compat"],` after `"compatibility_date": "2026-09-14",` — one file, one concern
- Evidence: `wrangler.jsonc:36` `compatibility_date` + new `compatibility_flags` line validated via `parseJsonc` in deploy-mapping gate
- Commands + outputs (VERIFIED):
  ```
  $ node scripts/check-deploy-mapping.mjs
  {"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}
  DEPLOY_MAPPING_STATUS = PASS
  $ git diff --stat
   wrangler.jsonc | 1 +
   1 file changed, 1 insertion(+)
  $ git status --porcelain (pre-commit)
   M wrangler.jsonc
   ?? artifacts/audit/tina-hardening/CHANGE_LOG.md
   ?? docs/superpowers/
   ?? apps/web/public/admin/
  $ cat wrangler.jsonc snippet:
   "compatibility_date": "2026-09-14",
   "compatibility_flags": ["nodejs_compat"],
   "main": "./apps/web/dist/server/entry.mjs",
  ```
- `pnpm --filter @ukbt/web typecheck` — not required (JSONC, no TS)
- Status: IMPLEMENTED and validated — `wrangler@4.126.0` supports `nodejs_compat` on `2026-09-14`
- Rollback: `git revert 68c672ec99f99d52dcefb2e2c976839bac2b202d`

### Implementation record 03 — SESSION KV (`wrangler.jsonc`) — BLOCKED/UNKNOWN, NOT IMPLEMENTED

- Date: 2026-09-17
- Commit: NONE — no commit (do NOT fabricate id)
- Evidence of blocker:
  - `wrangler.jsonc` still has no `kv_namespaces` — VERIFIED `Select-String kv_namespaces` 0 hits after Task 3
  - Cloudflare dashboard `Workers & Pages | KV` + `npx wrangler kv namespace list --json` not captured — UNKNOWN (never upgraded)
  - Expected failure sentinel per Workers doc: `10014` duplicate namespace on 2nd git-based deploy; editor save→redeploy would hit it
  - `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` Verdict table: structural key MISSING—REQUIRED but `id` BLOCKED (UNKNOWN ID)
- Free-tier note: KV free tier sufficient (1GB / 100k reads / 1k writes) — not a pricing blocker; blocker is missing real ID
- Action: Documented as blocking HITL proof; no `kv_namespaces` entry written; HITL runbook `TINA_HITL_RUNBOOK.md` must note this until `npx wrangler kv namespace create SESSION` or dashboard copy provides a real ID
- Validation when unblocked: `npx wrangler kv namespace list --json` + `node scripts/check-deploy-mapping.mjs` PASS + `git status --porcelain` only `wrangler.jsonc`
- Rollback: N/A (no commit to revert)

### Implementation record 04 — Admin origin (` .env.example`) — IMPLEMENTED

- Date: 2026-09-17 22:59 UTC
- Commit: `8b0d77121475f01e69535059fe2a2819a763cdca` `docs(env): document PUBLIC_TINA_ADMIN_ORIGIN for tina bridge`
- Diff: `.env.example` added 4-line block referencing `middleware.js:4` — one file, one concern (see CHANGE_PROPOSAL 04 exact diff)
  ```
  # Tina admin origin allowlist (see apps/web/node_modules/@tinacms/astro/dist/middleware.js:4 adminOrigins()).
  # Comma-separated origins allowed to embed /admin. Leave empty for same-origin; set when preview/production origins differ.
  # Example: PUBLIC_TINA_ADMIN_ORIGIN=https://app.tina.io,https://ukbanglatigers.co.uk
  PUBLIC_TINA_ADMIN_ORIGIN=
  ```
- Commands + outputs (VERIFIED):
  ```
  $ node scripts/check-deploy-mapping.mjs
  {"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}
  DEPLOY_MAPPING_STATUS = PASS
  $ git diff --stat
   .env.example | 4 ++++
   1 file changed, 4 insertions(+)
  $ git status --porcelain (pre-commit)
   M .env.example
   ?? artifacts/audit/tina-hardening/CHANGE_LOG.md
   ?? docs/superpowers/
   ?? apps/web/public/admin/
  $ Get-Content .env.example — shows PUBLIC_TINA_ADMIN_ORIGIN= with comment referencing middleware.js:4
  ```
- `pnpm --filter @ukbt/web typecheck` — not required (docs-only)
- Status: IMPLEMENTED and validated — empty value ships, no invented domain; humans set per-environment
- Rollback: `git revert 8b0d77121475f01e69535059fe2a2819a763cdca`

### Implementation record 05 — `tinaAdminDevRedirect` (`apps/web/astro.config.mjs`) — NOT_REQUIRED, NOT IMPLEMENTED

- Date: 2026-09-17
- Commit: NONE — NOT_REQUIRED per `WORKERS_TINA_CONFIGURATION_AUDIT.md` summary (no REQUIRED verdict) + `apply: "serve"` dev-only assessment
- Evidence:
  - `apps/web/node_modules/@tinacms/astro/dist/vite.js:1-24` exports `tinaAdminDevRedirect()` — FACT
  - `require.resolve('@tinacms/astro/vite', {paths:['apps/web']})` → `.../dist/vite.js` — VERIFIED
  - `apps/web/astro.config.mjs:1-30` currently no `vite` key, no `tinaAdminDevRedirect` import — FACT; not a production/deploy blocker
  - Workers doc does not require it; audit deferred it
- Status: DEFERRED — no commit; would be low-risk docs-dev fix if later desired (requires `pnpm --filter @ukbt/web typecheck` PASS)
- Minimal fix (deferred) stored in CHANGE_PROPOSAL 05 — not applied

### Implementation record 06 — `_headers` PRESENT — NO COMMIT

- Date: 2026-09-17
- Verdict: PRESENT — `apps/web/public/_headers:9` CSP `frame-ancestors` + `connect-src` — FACT (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`)
- Status: NO CHANGE — correctly scoped; `X-Frame-Options: DENY` precedence note documented

### Implementation record 07 — `SITE_URL` N/A — NO COMMIT

- Date: 2026-09-17
- Verdict: UNNEEDED/N/A — `apps/web/astro.config.mjs:15` hardcoded `site: 'https://ukbanglatigers.co.uk'` — FACT (global constraint reconciled non-issue)
- Status: NO CHANGE

---

## Validation loop summary (Task 3 per-fix validation, Task 7 defers full `deploy:verify`)

- `node scripts/check-deploy-mapping.mjs` — **PASS** after each implemented fix (post-`pnpm run build` producing `dist/client/index.html` + `dist/server/entry.mjs` + `dist/client/_headers`). Pre-build FAIL (`assets-directory-absent`/`worker-entry-absent`) is expected when `dist/` absent and is not a fix failure.
  - Final gate output (2026-09-17 22:59, after `pnpm run build`): `{"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}` `DEPLOY_MAPPING_STATUS = PASS`
- `pnpm --filter @ukbt/web typecheck` — N/A for `tina/config.ts:4` / `wrangler.jsonc` / `.env.example` (no Astro TS touched); would be required only if `apps/web/astro.config.mjs` had been touched (it was not)
- `git diff --stat tina/` — after branch fix: `tina/config.ts | 2 +-` only; `tina/tina-lock.json` untouched (shape-only — branch not in lockfile; verified no lockfile churn)
- `git diff tina/tina-lock.json` — no diff (expected: branch chain not serialized to lockfile)
- `git status --porcelain` per fix — each fix showed only its one file modified plus expected untracked proposals/build artifacts (documented above); no cross-concern commits
- `git log --oneline -3` after Task 3: `8b0d771 docs(env)`, `68c672e fix(worker)`, `8322de1 fix(tina)` — one concern per commit satisfied
- `deploy:verify` — **NOT RUN** in Task 3 per constraints (validation loop is Task 7); no gate weakening claimed

---

*Append-only log — new proposals/records appended, never rewritten. Rollback for any fix is `git revert <sha>` of its one-concern commit. SESSION KV remains BLOCKED until real id retrieved; `tinaAdminDevRedirect` remains NOT_REQUIRED/deferred. Free-tier sufficiency noted in §0.*
