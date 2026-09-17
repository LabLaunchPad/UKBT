# FINAL_READINESS_REPORT — 2026-09-17

> Base: `8a546d8095424bbdd1bd42e5a4e66c40e85cb67a` (HEAD after Task 6) — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 7 (Phase 6) + `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` + all prior `artifacts/audit/tina-hardening/*.md` + `package.json:42` `deploy:verify` + `scripts/check-*.mjs` outputs captured 2026-09-17 in this task
> Evidence classes: **FACT** (file line exists) / **VERIFIED** (file + command output) / **OBSERVED** (screenshot/dashboard) / **UNKNOWN** (not retrievable — never upgraded to FACT per `knowledge/04-EVIDENCE-POLICY.yaml` + Global Constraints)
> BLUF: **Workers Free 100k req/day, KV 100k reads / 1k writes / 1GB free, no extra cache config beyond `_headers` — sufficient for Tina editorial (sidebar → commit → rebuild → Workers deploy). TinaCloud Free 2 users / 2 roles / 1 project / 100MB assets — sufficient. Remaining blockers are engineering, not pricing.** Sourced from `artifacts/audit/tina-hardening/CHANGE_LOG.md:10-13` §0 + `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md:166-167` + `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md:214-221` §2.5 + `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md:10-15` BLUF — cited, not re-audited here. Do NOT treat pricing as blocker (Global Constraint).

---

## VERIFIED — reproducible with file:line + command output (2026-09-17, worktree `C:\UKBT\ukbt-tina-hardening` at `8a546d8`)

### 1. Validation loop — 7/7 gates PASS when run individually (VERIFIED)

Each gate executed via `pnpm run check:*` at HEAD `8a546d8` with `NODE_OPTIONS=--max-old-space-size=8192` available. Outputs pasted verbatim; exit codes 0.

| Gate | Command | Output (VERIFIED) | Evidence file |
|---|---|---|---|
| check-security | `pnpm run check:security` | `{"SECURITY_STATUS":"PASS","failures":[]} SECURITY_STATUS = PASS` `EXIT:0` | `scripts/check-security.mjs` — uses `allowed-urls.ts` + `faq-answer.ts` REM-001/REM-003 |
| check-content-trust | `pnpm run check:content-trust` | `{"CONTENT_TRUST_STATUS":"PASS","failures":[]} CONTENT_TRUST_STATUS = PASS` `EXIT:0` | `scripts/check-content-trust.mjs` — fail-closed on unclassified `about.*` DORMANT |
| check-deploy-mapping | `pnpm run check:deploy-mapping` | `{"DEPLOY_MAPPING_STATUS":"PASS","failures":[]} DEPLOY_MAPPING_STATUS = PASS` `EXIT:0` | `scripts/check-deploy-mapping.mjs` — validates `wrangler.jsonc:38-40` `main` + `assets.directory` hybrid |
| check-perf | `pnpm run check:perf` | `{"PERF_STATUS":"PASS","failures":[],"warnings":[{"rule":"image-weight","detail":"/brand/uppsala-tigers-crest.jpg: 327.3KB ..."}, {"rule":"page-image-weight","detail":"franchises\\uppsala-tigers\\index.html: 1401.5KB ..."}]} PERF_STATUS = PASS` `EXIT:0` | `scripts/check-perf.mjs` — budgets `htmlPerPage 72KB / cssTotal 60KB / jsTotal 48KB` already adjusted for Tina bridge 15.5KB |
| check-seo | `pnpm run check:seo` | `{"SEO_STATUS":"PASS","failures":[]} SEO_STATUS = PASS` `EXIT:0` | `scripts/check-seo.mjs` — sitemap/RSS/OG vs hardcoded `apps/web/astro.config.mjs:15` `site: https://ukbanglatigers.co.uk` |
| check-ui | `pnpm run check:ui` | `{"UI_STATUS":"PASS","failures":[],"warnings":[{"rule":"current-month-upcoming"...}, {"rule":"focus-leaf","detail":"AboutStory.astro..."}, ...]} UI_STATUS = PASS` `EXIT:0` | `scripts/check-ui.mjs` |
| check-motion | `pnpm run check:motion` | `{"MOTION_STATUS":"PASS","failures":[]} MOTION_STATUS = PASS` `EXIT:0` | `scripts/check-motion.mjs` |

All 7 outputs are **VERIFIED** — command + JSON + exit code captured in this task (see Appendix A). No gate weakening performed; each gate ran with its production script, no `SKIP_*` envs.

### 2. Branch isolation fix — VERIFIED

- **Before:** `tina/config.ts:4` `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main'` — **FACT** (`artifacts/audit/tina-hardening/CURRENT_STATE.md:16` + `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md:14` branch audit) — missing `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` per Workers doc chain `GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"` (Task 2 §1).
- **After:** `tina/config.ts:4` `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main'` — **FACT** (`wrangler.jsonc` read + `tina/config.ts:4` read this task; commit `8322de1455ad60398fc8ee60d0d633d7768b2ce2` `fix(tina): resolve editing branch on Workers Builds previews`).
- **Evidence:** `artifacts/audit/tina-hardening/CHANGE_LOG.md:226-253` Implementation record 01 — `pnpm exec tinacms build --skip-cloud-checks --skip-search-index` PASS + `node scripts/check-deploy-mapping.mjs` PASS + `git diff --stat tina/` only `tina/config.ts` + `tina/tina-lock.json` shape-only — **VERIFIED**.
- **Verdict:** **VERIFIED — REQUIRED fix landed, one concern per commit** (Global Constraint satisfied). Preview branches now resolve via `WORKERS_CI_BRANCH` (Workers Builds) not fallback `main`.

### 3. Runtime `nodejs_compat` fix — VERIFIED

- **Before:** `wrangler.jsonc:36` only `compatibility_date: "2026-09-14"` — no `compatibility_flags` — **VERIFIED** via `Select-String compatibility|kv|SESSION` only `compatibility_date` + `ASSETS` (`artifacts/audit/tina-hardening/CURRENT_STATE.md` appendix C + `WORKERS_TINA_CONFIGURATION_AUDIT.md:76-83` §2.1).
- **After:** `wrangler.jsonc:37` `"compatibility_flags": ["nodejs_compat"]` after `compatibility_date` — **FACT** (`wrangler.jsonc:36-37` read this task; commit `68c672ec99f99d52dcefb2e2c976839bac2b202d` `fix(worker): enable nodejs_compat for tina island route`).
- **Why required:** `apps/web/node_modules/@tinacms/astro/dist/middleware.js:11` + `island-route.js:11` `import { AsyncLocalStorage } from "node:async_hooks"` two stores (`formsStore`, `requestStore`) + `apps/web/src/pages/tina-island/[name].ts:4-5` `prerender=false` + `POST = experimental_createIslandRoute(islands)` — without `nodejs_compat`, island POSTs error — **FACT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md:96-113` §2.3).
- **Evidence:** `artifacts/audit/tina-hardening/CHANGE_LOG.md:255-282` Implementation record 02 — `node scripts/check-deploy-mapping.mjs` PASS — **VERIFIED**.
- **Verdict:** **VERIFIED — REQUIRED fix landed, one concern per commit.**

### 4. Admin origin docs fix — VERIFIED

- **Before:** `.env.example:1-16` only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH` — no `PUBLIC_TINA_ADMIN_ORIGIN` — **VERIFIED** (`Select-String PUBLIC_TINA_ADMIN_ORIGIN` 0 hits, `WORKERS_TINA_CONFIGURATION_AUDIT.md:203-204` §4.1).
- **After:** `.env.example:11-14` added `PUBLIC_TINA_ADMIN_ORIGIN=` with comment referencing `apps/web/node_modules/@tinacms/astro/dist/middleware.js:4` `adminOrigins()` — **FACT** (commit `8b0d77121475f01e69535059fe2a2819a763cdca` `docs(env): document PUBLIC_TINA_ADMIN_ORIGIN for tina bridge`).
- **Evidence:** `artifacts/audit/tina-hardening/CHANGE_LOG.md:125-162` CHANGE_PROPOSAL 04 + `CHANGE_LOG.md:297-325` Implementation record 04 — `node scripts/check-deploy-mapping.mjs` PASS — **VERIFIED**.
- **Verdict:** **VERIFIED — DOCUMENTATION_GAP closed, docs-only, no invented domain, empty value ships** (`PUBLIC_TINA_ADMIN_ORIGIN=` — per-environment value set by human when preview/production origins differ).

### 5. Deployment mapping — VERIFIED

- `wrangler.jsonc:37-42` `main: "./apps/web/dist/server/entry.mjs"` + `assets.directory: "./apps/web/dist/client"` + `assets.binding: "ASSETS"` + `not_found_handling: "404-page"` — **FACT** (`wrangler.jsonc` read this task) — mirrors `apps/web/astro.config.mjs:13,28` `output: static` + `cloudflare()` adapter hybrid — **FACT**.
- `node scripts/check-deploy-mapping.mjs` **PASS** `{"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}` — **VERIFIED** (this task §1).
- **Invariant retained:** `output: static` + one on-demand `tina-island/[name].ts` `prerender=false` — static+island hybrid retained, no CONTEXT toggle — **VERIFIED** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:202-207` §2.3 + `WORKERS_TINA_CONFIGURATION_AUDIT.md:127-129` §2.4).

### 6. Content-trust & truth gate — VERIFIED

- `scripts/check-content-trust.mjs` **PASS** — **VERIFIED** (this task).
- `scripts/check-security.mjs` **PASS** — **VERIFIED** (this task).
- `apps/web/src/lib/content-trust.ts:80-111` all 7 `about.*` fields `DORMANT` (`No sink; about.astro uses gated about-data`) — **FACT** (`ABOUT_COLLECTION_DECISION.md:68-83` §1.4).
- `apps/web/src/lib/faq-answer.ts:39-53` `renderFaqAnswer` `escapeHtml` + `<p>` only — **FACT** (`CURRENT_STATE.md:15`).
- `apps/web/src/lib/tina/loaders.ts:9-17,26-35,56-69` `isSiteRelativeUrl` allowlist (REM-003) — **FACT** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:232-234`).
- `contracts/TRUTH-CONTRACT.md` frozen + `@ukbt/truth` editorial vs truth-sensitive classification intact — **FACT** (`ABOUT_COLLECTION_DECISION.md:85-94`).
- **Verdict:** **Truth gate intact — no gate weakening** (Global Constraint). Tina remains editorial-only.

### 7. Gap analysis (visual editing) — VERIFIED record exists

- `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` (commit `8642ab57c6d70154a4291fe22c5a5cb55f928f36`) — **FACT** (file exists, 3 verifiers).
- Capability matrix **VERIFIED** via `grep` at `0d2a91f`: `requestWithMetadata` 0 hits, `TinaIsland` 0 hits in `apps/web/src`, `tinaField()` import 0 hits — only prop-alias `data-tina-field` literals — **VERIFIED** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:44-55` §1.1).
- Required React-free path documented: `tina/__generated__/client.ts` → `requestWithMetadata(..., {priority:'primary'})` → `islands.ts` → `tina-island/[name].ts` (`prerender=false`) → `<TinaIsland>` + `tinaField()` — **FACT** (docs `/contextual-editing/astro` + `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:124-200` §2).
- Rejected flawed patterns F1-F4 (CONTEXT toggle, wrong `configPath`, `root: ./apps/web`, custom `validateEditorialData` POST) — **FACT** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:324-334` §5).
- Verdict: gap analysis delivered — **no code mutated** (per plan).

### 8. About collection decision — VERIFIED record exists

- `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` (commit `c83169c5e4e624531e738922784915ce24353ac6`) — **FACT**.
- Audit: `tina/config.ts:161-223` `about` collection 7 fields — **FACT**; `apps/web/content/about/about.json` single document `Length 1578` — **VERIFIED** (`Get-ChildItem`); zero `tinaAbout` refs in `apps/web/src` — **VERIFIED** (`Select-String` 0 hits); `loaders.ts:1-82` no About export — **VERIFIED**; `apps/web/src/pages/about.astro:28` consumes truth-owned `about-data.ts` gated via `evaluate(rec, gateOptions)` throw — **FACT** (`ABOUT_COLLECTION_DECISION.md:14-67` §§1.1-1.3).
- Decision: **C. Keep intentionally unused (RECOMMENDED)** — no deletion, reversible, `DORMANT` classification retained, truth-owned `about-data.ts` canonical — **FACT** (`ABOUT_COLLECTION_DECISION.md:130-149` §2.C).
- Verdict: decision delivered — **no code mutated**, Global Constraint "do not delete" satisfied.

### 9. Change log & one-concern-per-commit — VERIFIED

- `artifacts/audit/tina-hardening/CHANGE_LOG.md` (commit `0d2a91f`) — append-only log with CHANGE_PROPOSAL blocks per REQUIRED verdict + Implementation records per fix — **FACT**.
- Git log `--oneline -3` after Task 3: `8b0d771 docs(env)`, `68c672e fix(worker)`, `8322de1 fix(tina)` — **VERIFIED** (`CHANGE_LOG.md:361` + `git log` in this task).
- Each fix touches one file only — **VERIFIED** via `git diff --stat` + `git status --porcelain` per record.
- No fabricated SESSION id — **VERIFIED** (record 03 `BLOCKED/UNKNOWN` explicitly not committed).

### 10. Pre-build artifacts — FACT

- `tina/config.ts`, `tina/tina-lock.json` tracked (`git ls-files tina/` 2 files) — **VERIFIED** (`CURRENT_STATE.md` appendix A).
- `tina/__generated__/` + `apps/web/public/admin/` gitignored (`.gitignore:7-12`) — **FACT**.
- `package.json:18` `build` prepends `tinacms build --skip-cloud-checks` — **FACT**; `package.json:42` `deploy:verify` full release order — **FACT**.

---

## OBSERVED — dashboard / screenshot (not locally re-verified, never upgraded to VERIFIED)

These are claims cited from prior plan or dashboard screenshots — kept as **OBSERVED** (or INFERENCE) per evidence policy, not re-verified in this local task.

- **TinaCloud dashboard 3/4 checklist — OBSERVED:** Fixing plan `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` cites dashboard screenshot 3/4 complete, step 4 (save→commit→deploy proof) unchecked — **OBSERVED** (`CURRENT_STATE.md:29` P0-2). This task did **not** re-fetch the dashboard — stays OBSERVED, not VERIFIED.
- **Admin login works — OBSERVED:** `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` not found on disk at `67ba0988` / `c83169c` — **UNKNOWN locally** (`CURRENT_STATE.md:12` + `CURRENT_STATE.md:53` Stop condition). Fixing plan cites human login works — kept **OBSERVED** until HITL captures headed proof.
- **TinaCloud Site URL pattern — OBSERVED:** Task 6 prompt + `TINA_HITL_RUNBOOK.md:31` cite preview pattern `https://chore-tinacloud-admin-setup-ukbt-...workers.dev` + 4 Site URLs in dashboard — **OBSERVED** (fixing plan), live value **UNKNOWN** without headed capture (see UNKNOWN §).
- **Workers Free / KV Free pricing — INFERENCE documented as FACT-sourced:** Workers Free 100k req/day + KV free 100k reads / 1k writes / 1GB — cited from Cloudflare free-tier docs — **INFERENCE** per `CHANGE_LOG.md:11-12` §0 classification (not a pricing audit, but engineering sufficiency). Not re-audited; explicitly noted as **not a blocker**.

---

## UNKNOWN — not established, never upgraded (per Global Constraint + `knowledge/04-EVIDENCE-POLICY.yaml`)

**Every UNKNOWN below stays UNKNOWN. Do NOT claim PASS for deploy:verify or HITL proof if blocked — record UNKNOWN with reason.**

### U1. SESSION KV `SESSION` binding `id` — UNKNOWN / BLOCKED (P0)

- **Current:** `wrangler.jsonc:1-71` has **no `kv_namespaces` key** — **VERIFIED** negative grep (`WORKERS_TINA_CONFIGURATION_AUDIT.md:266` + `CHANGE_LOG.md:283-289` + re-verified this task via `wrangler.jsonc` read 1-71 — no `kv_namespaces` present).
- **Required per Workers doc § Pin the SESSION KV:** `@astrojs/cloudflare` adapter auto-injects `SESSION` KV even though this site does not use `Astro.session`; first git-based deploy auto-creates the namespace but does **not** write its `id` back to the repo; second git-based deploy fails `10014` duplicate-namespace unless `kv_namespaces: [{ binding: "SESSION", id: "<real-id>" }]` is pinned in `wrangler.jsonc` — **FACT** (Workers doc fetched 2026-09-17, `WORKERS_TINA_CONFIGURATION_AUDIT.md:146-160` §3).
- **Dashboard/KV `id` retrieval:** Not executed — no `npx wrangler kv namespace list --json` output, no `Workers & Pages | KV → Copy ID` capture, no Worker `Settings | Bindings → SESSION` capture — **UNKNOWN** (`WORKERS_TINA_CONFIGURATION_AUDIT.md:298-300` Evidence inventory + `CHANGE_LOG.md:283-289` Implementation record 03).
- **Expected sentinel:** Workers error `10014` on second git-based deploy / second editorial Save (editor saves trigger redeploy per Workers doc: "you would hit this on your second save") — **INFERENCE** per hardening plan, not yet VERIFIED by deploy log.
- **Pricing note:** KV free-tier sufficient (100k reads / 1k writes) — **INFERENCE** per `CHANGE_LOG.md:13` §0 BLUF — **not** a pricing blocker; blocker is **missing real ID** — `CHANGE_LOG.md:92-93` §3. No invention allowed — fabricating an `id` would break `wrangler deploy` more thoroughly than missing binding (`CHANGE_LOG.md:104-112`).
- **Status:** **UNKNOWN — BLOCKED.** No `kv_namespaces` entry written in this loop. Retrieval via `npx wrangler kv namespace create SESSION` or dashboard copy required before HITL second-save proof can succeed.

### U2. Human edit→save→commit→deploy proof (HITL) — UNKNOWN / BLOCKED (P0)

- **Checklist step 4 unchecked:** Fixing plan screenshot 3/4 — checklist step 4 (editorial commit proof) unchecked — **OBSERVED** (`CURRENT_STATE.md:29` P0-2) — locally **UNKNOWN** (`CURRENT_STATE.md:29` + `TINA_HITL_RUNBOOK.md:124` Evidence).
- **HITL not executed:** `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md` (commit `8a546d8`) is **runbook only — no browser execution** per Task 6 (`TINA_HITL_RUNBOOK.md:6` Scope, `§6` Execution note). No headed session run in this hardening loop — **UNKNOWN**.
- **Required proof:** Human navigates headed browser to `<site>/admin` (`playwright_* = ask`), logs in manually (agent never sees credentials), verifies 4 collections load + sidebar form renders, edits safe field `Site settings → footerTagline` append ` (edited via TinaCloud <date>)` (`tina/config.ts:284`), human clicks Save → AI records GitHub `main` commit SHA + Cloudflare redeploy `DEPLOY_STATUS` + `check-content-trust` && `check-seo` PASS + redeployed sentinel visible — **FACT** for runbook steps (`TINA_HITL_RUNBOOK.md:73-145` Flow Steps 1-5), **UNKNOWN** for execution result.
- **Evidence still UNKNOWN:** GitHub `main` commit SHA (short + 40-char), `git diff HEAD~1 -- apps/web/content/site/siteSettings.json` diff, Cloudflare `Workers & Pages → ukbt-uk-bangla-tigers → Deployments` log excerpt + status (`SUCCESS | FAILED | 10014`), `check-content-trust` + `check-seo` outputs after save, production sentinel screenshot + `cf-ray`, TinaCloud checklist 4/4 screenshot — all **UNKNOWN** per `TINA_HITL_RUNBOOK.md:161-176` Evidence checklist (every field must be `UNKNOWN — not retrievable this session` until headed session fills it).
- **Blocker dependency:** Second-save `10014` will surface if SESSION `id` (U1) still unpinned — `TINA_HITL_RUNBOOK.md:124-127` Step 4 note + `TINA_HITL_RUNBOOK.md:209-211` Caveat 1. `TINA_HITL_RUNBOOK.md` records this as the single-save-vs-second-save sentinel.
- **Status:** **UNKNOWN — BLOCKED.** Do NOT claim deploy PASS or 4/4 checklist before headed capture. See `TINA_HITL_RUNBOOK.md` for execution order (`TINA_HITL_RUNBOOK.md:73-145`).

### U3. Visual-editing click-edit / preview overlay — UNKNOWN by design (NOT CONNECTED, deferred)

- **Current:** Zero `requestWithMetadata`, zero `TinaIsland`, zero `tinaField()` import in `apps/web/src` — **VERIFIED** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:36-43` §1.1 grep 0 hits). Hand-stamped `data-tina-field="…"` literals are inert — **VERIFIED** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:68-88` §1.2). `apps/web/src/pages/tina-island/[name].ts:4-5` scaffolding present but idle — **FACT**.
- **Required wiring:** `tina/__generated__/client.ts` → `requestWithMetadata(..., {priority:'primary'})` → `islands.ts` refactored fetchers → `<TinaIsland name wrapper primary>` + `tinaField()` per page — **FACT** for docs-prescribed React-free path (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:124-200` §2). `TinaIsland.astro:10` "SSR pages don't need this — the first requestWithMetadata() injects …" — **FACT**.
- **Status:** **UNKNOWN until wiring plan executes — intentionally NOT CONNECTED** in this hardening loop per `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Architecture ("No requestWithMetadata/TinaIsland implementation in this loop — those are deferred to gap analysis"). Recommendation: defer to post-hardening wiring plan (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:306-321` §4.3). Do NOT treat as production blocker — sidebar editing (Git-backed) is the evidence-first flow; visual overlay is velocity (see Remaining blockers §).
- **Static+island hybrid retained:** `apps/web/astro.config.mjs:13` `output: static` + single on-demand island route — **FACT**; rejected CONTEXT toggle (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:324` F1).

### U4. `pnpm deploy:verify` full release gate — UNKNOWN (env OOM, not a code failure)

- **Ordered gate per `package.json:42`:** `check:governance-scaffold → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → check:release-path → check:content-trust → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf` — **FACT** (`package.json:42` + `AGENTS.md` Verification order).
- **Attempt this task:** `NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify` executed 2026-09-17 — **timed out 120s** (first attempt) then **exit 134** on 240s capture: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` in `apps/web typecheck: astro check` at ~198s (`[24000:...] JavaScript heap out of memory` + `ELIFECYCLE Command failed with exit code 134`) — **VERIFIED** via tool output `tool_0b069140d001pK75hhv46z7j9Y` (astro check OOM, 8072 MB heap, `Scavenge allocation failure`, `Exit status 134`). This reproduces the OOM noted in `artifacts/audit/tina-hardening/CHANGE_LOG.md:353-357` Task 3 deferred minor ("typecheck OOM requires NODE_OPTIONS") — **VERIFIED** (same OOM even with `8192` MB).
- **Subset gates that did run individually:** 7 gates above (`check:security`, `check:content-trust`, `check:deploy-mapping`, `check:perf`, `check:seo`, `check:ui`, `check:motion`) all **PASS** — **VERIFIED** (Appendix A). `check:deploy-mapping` PASS proves hybrid mapping; `check:security`/`check:content-trust` PASS prove truth gate.
- **Why UNKNOWN not FAIL:** Failure is an **environment heap limit**, not a code gate failure. Individual gates that cover the release-critical services (`deploy-mapping`, `content-trust`, `security`, `seo`, `perf`, `ui`, `motion`) each PASS independently. The OOM path is `pnpm typecheck` → `astro check` on `public/admin/assets/...mjs` (bundled admin JS `mermaid`) which allocates >8 GB before GC — **INFERENCE** from stack trace (`public/admin/assets/cynefinDiagram...js:1:3477 warning ts(6133)` repeated, then `Scavenge 8072 MB`).
- **Status:** **UNKNOWN — deploy:verify not yet VERIFIED as full run.** Do NOT claim release PASS. Record as **env limitation** per Task 7 instruction ("for OOM typecheck, use NODE_OPTIONS=--max-old-space-size=8192 or note env limitation (Task3 noted OOM)"). Workaround: gate can be re-attempted on a higher-memory CI runner or via `pnpm run check:deploy-mapping && check:*` subset that already PASS; local OOM does not block the SESSION/HITL editorial proof.

### U5. Additional UNKNOWNs retained per evidence policy (never upgraded)

- **TinaCloud live Site URL value for HITL test:** Pattern `https://chore-tinacloud-admin-setup-ukbt-...workers.dev` cited — **OBSERVED** — live full hostname **UNKNOWN** (`TINA_HITL_RUNBOOK.md:31` Preconditions §2).
- **`PUBLIC_TINA_ADMIN_ORIGIN` runtime value:** Empty ships in `.env.example:11-14` — **FACT** — per-environment real origin list (e.g., `https://app.tina.io,https://ukbanglatigers.co.uk`) **UNKNOWN** locally (needs dashboard + site URL) — `WORKERS_TINA_CONFIGURATION_AUDIT.md:209` Caveat + `TINA_HITL_RUNBOOK.md:40` §3.
- **Cloudflare dashboard live SESSION id / `Workers & Pages | KV` listing:** Not fetched — **UNKNOWN** (`WORKERS_TINA_CONFIGURATION_AUDIT.md:298-300`).
- **Whether `storyBody` / `heroSubline` will be CMS-editable:** **UNKNOWN** until product decision — intentionally `DORMANT` (`ABOUT_COLLECTION_DECISION.md:172-176`).
- **TinaCloud checklist 4/4 screenshot after save:** **UNKNOWN** until HITL — `TINA_HITL_RUNBOOK.md:175` Evidence.
- **Visual wiring future scope (About `storyBody` rich-text renderer):** **UNKNOWN** — would require REM-001-class escaper (`ABOUT_COLLECTION_DECISION.md:104`).

---

## Remaining blockers (P0 / P1) — evidence-linked

### P0 — Production risk (must clear before claiming VERIFIED_PRODUCTION_READY)

| # | Blocker | Class | Evidence | Unblock step |
|---|---|---|---|---|
| **P0-1** | **SESSION KV `SESSION` `id` not pinned — second git-based deploy will fail `10014`** | **UNKNOWN / BLOCKED** | `wrangler.jsonc:1-71` no `kv_namespaces` — **VERIFIED** (this task + `WORKERS_TINA_CONFIGURATION_AUDIT.md:140-176` §3 + `CHANGE_LOG.md:283-295` record 03). Workers doc § Pin SESSION KV "second save → 10014" — **FACT**. KV free-tier sufficient — not pricing — `CHANGE_LOG.md:10-13` §0 BLUF. | `npx wrangler kv namespace list --json` or dashboard `Workers & Pages → KV → SESSION → Copy ID` or `npx wrangler kv namespace create SESSION` → pin `kv_namespaces: [{ binding:"SESSION", id:"<real-id>" }]` in `wrangler.jsonc` (starter template after `compatibility_flags`) → `node scripts/check-deploy-mapping.mjs` PASS → record CLI output in `CHANGE_LOG.md` (no invented id). One concern per commit (`fix(worker): pin SESSION KV`). |
| **P0-2** | **Human edit→save→commit→deploy proof missing — checklist step 4 unchecked, HITL not executed** | **UNKNOWN / BLOCKED** | Fixing plan screenshot 3/4 — **OBSERVED** (`CURRENT_STATE.md:29` P0-2). `TINA_HITL_RUNBOOK.md` runbook exists but execution **not run** — **UNKNOWN** (`TINA_HITL_RUNBOOK.md:241-243` Execution note). Depends on P0-1 (second save `10014`). | Execute `TINA_HITL_RUNBOOK.md` Flow Steps 1-5 headed (`playwright_* = ask`, human logs in) → capture Evidence checklist: `TinaCloud Site URL (test): <url>`, before/after snapshots, ` (edited via TinaCloud <date>)` sentinel, GitHub `main` SHA + `git diff`, Cloudflare deploy `10014` vs `SUCCESS` log, `node scripts/check-content-trust.mjs && pnpm run check-seo` PASS, production sentinel visible, checklist 4/4 screenshot. Commit evidence as `artifacts/receipts/<date>-hitl-evidence.md` or appendix to this report. |
| **P0-3** | **`pnpm deploy:verify` full release gate not yet VERIFIED locally (env OOM on `astro check`)** | **UNKNOWN (env limitation)** | `NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify` **exit 134** `FATAL ERROR: JavaScript heap out of memory` at `astro check` 8072 MB — **VERIFIED** (tool `tool_0b069140d001pK75hhv46z7j9Y`). Prior Task 3 also noted OOM — `CHANGE_LOG.md:353-357` + `progress.md:38-42` deferred minor. Subset 7 gates PASS individually — **VERIFIED** (Appendix A). | Re-attempt on higher-memory runner (CI `compatibility_date: 2026-09-14` + `wrangler@4.126.0` already OK) or run gate in stages (`pnpm run tokens:build && pnpm typecheck --filter` sharded) — note env limitation per Task 7. Do NOT weaken gate. Local subset PASS is sufficient to clear engineering blockers; full gate should PASS in CI before production release (`deploy:verify` is release authority — `AGENTS.md`). |

**Global constraint:** `deploy:verify` is release authority — never claim a subset PASS equals a release PASS. The 7 gates above are evidence that the hardening fixes did not regress invariants, but the full ordered gate must be captured **PASS** (exit 0) before merging to `main` for production.

### P1 — Functional completeness (not production-blocking, correctly deferred)

| # | Blocker | Class | Evidence | Next plan |
|---|---|---|---|---|
| **P1-1** | **Visual-editing click-edit / preview overlay NOT CONNECTED** — zero `requestWithMetadata`/`TinaIsland`/`tinaField()` in `apps/web/src` | **VERIFIED as NOT CONNECTED** (status) / **UNKNOWN** for future wiring result | `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:19-20` Capability matrix + `§1.1` grep 0 hits — **VERIFIED**. `TinaIsland`/`requestWithMetadata` are the docs-prescribed React-free path — **FACT** (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:124-200` §2). Only hand-stamped `data-tina-field` literals present — **VERIFIED** (§1.2). Static+island hybrid retained (`astro.config.mjs:13` `output: static`) — **FACT**. | **Deferred** — queue as fixing plan **Tasks 8-9 visual-editing implementation** (separate plan, per this report's Recommended step). Effort Small→Medium (1-2 sessions, 5-8 files: `loaders.ts` keep Zod gate, `islands.ts` refactor fetchers to `client.queries.*`, pages `index.astro`→`faq.astro` add `requestWithMetadata`+`<TinaIsland>`+`tinaField()`) — `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:288-321` §§4.1-4.3. Must preserve REM-001/REM-003/REM-004 + content-trust PASS + `check-perf` budgets + no CONTEXT toggle/custom validator — `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:324-334` rejected F1-F4. |
| **P1-2** | **About collection (`tina/config.ts:161-223`) intentionally unused — no `tinaAbout` consumer** | **VERIFIED orphan** / decision **VERIFIED** | `apps/web/content/about/about.json` single doc `Length 1578` — **VERIFIED**; zero `tinaAbout` hits in `apps/web/src` — **VERIFIED**; `loaders.ts:1-82` no About schema — **VERIFIED**; `about.astro:28` consumes `about-data.ts` gated — **FACT** (`ABOUT_COLLECTION_DECISION.md:14-67`). `content-trust.ts:80-111` all `about.*` `DORMANT` — **FACT**. | **Decision C: keep intentionally unused** — `ABOUT_COLLECTION_DECISION.md:130-149` §2.C — no deletion per Global Constraint. Any future Option A (connect) must add `REM-001`-class renderer for `storyBody` rich-text AST before `set:html`, reclassify `content-trust.ts`, and keep `@ukbt/truth` gate — `ABOUT_COLLECTION_DECISION.md:99-115` §2.A. Not a hardening-loop fix. |
| **P1-3** | **`tinaAdminDevRedirect()` Vite plugin — `apps/web/astro.config.mjs` missing (dev-only convenience)** | **NOT_REQUIRED** | `apps/web/node_modules/@tinacms/astro/dist/vite.js:1-24` exports `tinaAdminDevRedirect()` `apply: "serve"` — **FACT**; `apps/web/astro.config.mjs:1-30` has no `vite` key — **FACT** (`CHANGE_LOG.md:166-209` CHANGE_PROPOSAL 05). `WORKERS_TINA_CONFIGURATION_AUDIT.md` Summary — no REQUIRED verdict for this plugin. | **Deferred — NOT_REQUIRED.** Dev-only redirect `/admin` → `/admin/index.html`; zero production/deploy impact. If later desired, one-concern commit `vite: { plugins: [tinaAdminDevRedirect()] }` + `pnpm --filter @ukbt/web typecheck` PASS. |

### Non-blockers (reconciled, correctly not treated as blockers)

- **Workers Free 100k req/day + KV Free 100k reads/1k writes/1GB + TinaCloud Free 2 users/2 roles/1 project/100MB — pricing not a blocker** — **INFERENCE** per `CHANGE_LOG.md:10-13` §0 BLUF — engineering gaps (branch chain ✅, `nodejs_compat` ✅, SESSION pin ❌) are the blockers.
- **`_headers` CSP `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `connect-src` + `X-Frame-Options: DENY` precedence** — **PRESENT** (`apps/web/public/_headers:9` — `WORKERS_TINA_CONFIGURATION_AUDIT.md:216-237` §4.2) — no change required.
- **Site URL hardcoded `apps/web/astro.config.mjs:15` `https://ukbanglatigers.co.uk` — Workers `SITE_URL` env N/A** — **FACT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md:239-243` §4.3) — reconciled non-issue.
- **`tina-lock.json` committed + `tina/__generated__/` + `apps/web/public/admin/` gitignored** — reconciled non-issues per `CURRENT_STATE.md:8-14` Completed table.

---

## Recommended next execution step

> **Stop before major Tina architecture changes if UNKNOWN remains, else queue visual-editing implementation (Tasks 8-9 of `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md`) as a separate plan.**

### Decision: STOP before visual-editing wiring — UNKNOWN remains (P0-1 + P0-2 + P0-3)

`docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Global Constraints + Task 7 §2 require that the final report **stop before major Tina architecture changes if UNKNOWN remains**. This report records **three P0 UNKNOWNs** (SESSION pin `10014` blocker, HITL proof not executed, `deploy:verify` env OOM without full PASS). Therefore **do NOT start visual-editing wiring** (`requestWithMetadata` → `TinaIsland` → `tinaField`) in this loop — queue it as a **separate plan**.

### Sequencing (evidence-first loop mandates this order)

1. **Immediate — clear P0-1 (SESSION `10014` blocker) — single turn, no HITL:**
   - Run `npx wrangler kv namespace list --json` (or dashboard `Workers & Pages | KV` → copy ID / `npx wrangler kv namespace create SESSION`) to obtain the real `SESSION` `id` — **do NOT invent**.
   - Pin `wrangler.jsonc` `kv_namespaces: [{ binding: "SESSION", id: "<real-id>" }]` — one file, one concern — `CHANGE_LOG.md:105-112` required diff + `WORKERS_TINA_CONFIGURATION_AUDIT.md:153-160` pattern.
   - Validate `node scripts/check-deploy-mapping.mjs` **PASS** (also proves `compatibility_flags: ["nodejs_compat"]` still parses) + `git status --porcelain` only `wrangler.jsonc` + `git diff` shows the single `id`.
   - Commit `fix(worker): pin SESSION KV binding` — then append the CLI `id` output + gate PASS to `artifacts/audit/tina-hardening/CHANGE_LOG.md` (append-only).

2. **Next — clear P0-2 (HITL proof) — headed session (`playwright_* = ask`):**
   - Execute `TINA_HITL_RUNBOOK.md` Flow Steps 1-5 exactly (`TINA_HITL_RUNBOOK.md:73-145`) with the human performing TinaCloud login (agent never sees credentials). Use safe probe `Site settings → footerTagline` sentinel ` (edited via TinaCloud <YYYY-MM-DD>)` (`tina/config.ts:284` — editorial-only, not truth-sensitive).
   - Capture the **10-item Evidence checklist** (`TINA_HITL_RUNBOOK.md:161-176`): pre-session SHA, TinaCloud Site URL (test), before/after snapshots, human Save timestamp, GitHub `main` SHA + `git log --oneline -3` + `git diff HEAD~1 -- apps/web/content/site/siteSettings.json`, Cloudflare deploy log + status (record `10014` sentinel if it still surfaces on second save vs `SUCCESS`), `node scripts/check-content-trust.mjs && pnpm run check-seo` outputs, redeployed sentinel visible (`/` footer), checklist 4/4 screenshot, session meta (`playwright 0.0.81`, `1440x900`, `ask` log).
   - Commit as `artifacts/receipts/<YYYY-MM-DD>-hitl-evidence.md` (do NOT store credentials/tokens) or as an appendix to this report for `FINAL_READINESS_REPORT.md` to reference as **VERIFIED** post-HITL.

3. **Next — clear P0-3 (`deploy:verify` gate):**
   - Re-attempt full `NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify` on CI or a higher-memory machine (CI has the frozen lockfile `pnpm@10.33.0` + `node@22.23.2` — `package.json:6-10` engines — **FACT**). The 7 subset gates already PASS — **VERIFIED** — so the remaining risk is only the `astro check` heap on bundled admin artifacts; sharding `pnpm --filter @ukbt/truth typecheck` vs `astro check` or pruning `public/admin/` from `tsconfig` `include` locally are options, but **no gate weakening** allowed.

4. **Only after P0-1 + P0-2 + P0-3 are VERIFIED (full gate PASS + 4/4 checklist + pinned SESSION):**
   - Queue **visual-editing implementation as a separate plan** — Tasks 8-9 of `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` (or a successor wiring plan):
     - Size: **Small → Medium** (1-2 focused sessions, 5-8 files) — `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:288-298` §4.1.
     - Order per page opt-in (byte-identical fallback): `index.astro` hero+clubIntro (`TinaIsland hero` + `aboutSection`) → `faq.astro` list → `about.astro` only if Phase 4 decision later chooses connect (`ABOUT_COLLECTION_DECISION.md` Option A requires `REM-001`-class renderer for `storyBody` AST).
     - Invariants that must hold per wiring commit: `output: static` + `cloudflare()` adapter + `check-deploy-mapping` PASS + `check-content-trust`/`check-security` PASS + `check-perf` budgets (`htmlPerPage 72KB / js 48KB`) + zero-React (no `useTina`/`useEditState`) + rejected F1-F4 (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md:324-334`).
     - Each page's wiring is independently reversible (`git revert` one `<TinaIsland>` page leaves others intact) — `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:320` sequencing note.
   - This separate plan must cite this `FINAL_READINESS_REPORT.md` as the **hardening exit gate** and `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` as the **technical spec** — do NOT redesign architecture before that gate is VERIFIED.

### Stop condition quote (from hardening plan Global Constraints)

> "No irreversible ops without ask" + "One concern per PR" + "Evidence classes: FACT / VERIFIED / OBSERVED / INFERENCE / UNKNOWN; never upgrade UNKNOWN to FACT" + "`deploy:verify` is release authority; no gate weakening for PASS."

This report keeps **UNKNOWN as UNKNOWN** — SESSION 10014, HITL proof, and full `deploy:verify` PASS are not upgraded. The next execution step **respects the stop condition** and queues wiring only after those three P0s become VERIFIED.

---

## Appendix A — VERIFIED command outputs (2026-09-17, worktree `C:\UKBT\ukbt-tina-hardening` at `8a546d8`, `node v22.23.2`, `pnpm v10.33.0`)

### A1. `pnpm run check:security`

```
> ukbt-uk-bangla-tigers@0.0.0 check:security
> node scripts/check-security.mjs

{
  "SECURITY_STATUS": "PASS",
  "failures": []
}
SECURITY_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-security.mjs` exercises `allowed-urls.ts` allowlist + `faq-answer.ts` REM-001 escaper. No SECURITY_SENSITIVE regressions after Phase 2 fixes.

### A2. `pnpm run check:content-trust`

```
> ukbt-uk-bangla-tigers@0.0.0 check:content-trust
> node scripts/check-content-trust.mjs

{"CONTENT_TRUST_STATUS":"PASS","failures":[]}
CONTENT_TRUST_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-content-trust.mjs` fail-closed gate reads `apps/web/src/lib/content-trust.ts` — all `about.*` `DORMANT` (no sink) → PASS. About decision C intact.

### A3. `pnpm run check:deploy-mapping`

```
> ukbt-uk-bangla-tigers@0.0.0 check:deploy-mapping
> node scripts/check-deploy-mapping.mjs

{"DEPLOY_MAPPING_STATUS":"PASS","failures":[]}
DEPLOY_MAPPING_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-deploy-mapping.mjs` `parseJsonc` validates `wrangler.jsonc:36-42` `compatibility_date` + `compatibility_flags: ["nodejs_compat"]` + `main: ./apps/web/dist/server/entry.mjs` + `assets.directory: ./apps/web/dist/client` hybrid is structurally sound. This is the `check-deploy-mapping` gate that `WORKERS_TINA_CONFIGURATION_AUDIT.md:129` notes is enforced by `ci.yml:147-159`.

### A4. `pnpm run check:perf`

```
> ukbt-uk-bangla-tigers@0.0.0 check:perf
> node scripts/check-perf.mjs

{
  "PERF_STATUS": "PASS",
  "failures": [],
  "warnings": [
    { "rule": "image-weight", "detail": "/brand/uppsala-tigers-crest.jpg: 327.3KB over 300KB (recompress candidate)" },
    { "rule": "page-image-weight", "detail": "franchises\\uppsala-tigers\\index.html: 1401.5KB over 1200KB" }
  ]
}
PERF_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-perf.mjs` budgets `htmlPerPage 72KB` + `cssTotal 60KB` + `jsTotal 48KB` already accommodate Tina bridge 15.5KB + adapter overhead (`APPS/WEB/CLAUDE.md` Tina note + `TINA_VISUAL_EDITING_GAP_ANALYSIS.md:263-266`). Warnings are recompress candidates, not failures.

### A5. `pnpm run check:seo`

```
> ukbt-uk-bangla-tigers@0.0.0 check:seo
> node scripts/check-seo.mjs

{
  "SEO_STATUS": "PASS",
  "failures": []
}
SEO_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-seo.mjs` validates sitemap/RSS/OG vs hardcoded `apps/web/astro.config.mjs:15` `site: https://ukbanglatigers.co.uk` (Global Constraint N/A for Workers `SITE_URL`).

### A6. `pnpm run check:ui`

```
> ukbt-uk-bangla-tigers@0.0.0 check:ui
> node scripts/check-ui.mjs

{
  "UI_STATUS": "PASS",
  "failures": [],
  "warnings": [
    { "rule": "current-month-upcoming", "detail": "September 2026 is Upcoming during its month (day unknown — confirm with club)" },
    { "rule": "focus-leaf", "detail": "AboutStory.astro: dark non-interactive leaf without ring token" },
    { "rule": "focus-leaf", "detail": "FounderSpotlight.astro: dark non-interactive leaf without ring token" },
    { "rule": "focus-leaf", "detail": "SubHeading.astro: dark non-interactive leaf without ring token" },
    { "rule": "focus-leaf", "detail": "TournamentCard.astro: dark non-interactive leaf without ring token" },
    { "rule": "cta-duplication", "detail": "index.html: \"Join the Club\" appears 2x (header + hero)" }
  ]
}
UI_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-ui.mjs` PASS; warnings are a11y/UX notes, not failures.

### A7. `pnpm run check:motion`

```
> ukbt-uk-bangla-tigers@0.0.0 check:motion
> node scripts/check-motion.mjs

{
  "MOTION_STATUS": "PASS",
  "failures": []
}
MOTION_STATUS = PASS
EXIT:0
```

Classification: **VERIFIED** — `scripts/check-motion.mjs` PASS.

### A8. `NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify` — env OOM

```
$ NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify

# ... early phases (scaffold-self-test → check:control-plane → check:deps → lint → tokens:build) proceed ...

apps/web typecheck: astro check
apps/web typecheck: public/admin/assets/cynefinDiagram-5FMLGOSQ-CYJZyQ3B.js:1:3477 - warning ts(6133): 'n' is declared but its value is never read.
apps/web typecheck: public/admin/assets/cynefinDiagram-5FMLGOSQ-CYJZyQ3B.js:1:3473 - warning ts(6133): 't' is declared but its value is never read.
apps/web typecheck: <--- Last few GCs --->
apps/web typecheck: [24000:000001458BD15000] 197092 ms: Scavenge ... 8072.3 (8221.1) -> 8070.2 (8222.3) MB, allocation failure;
apps/web typecheck: [24000:000001458BD15000] 198091 ms: Scavenge ... 8073.5 (8222.3) -> 8072.1 (8242.8) MB, 959.54 ms allocation failure;
apps/web typecheck: FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
apps/web typecheck: ----- Native stack trace -----
...
apps/web:  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @ukbt/web@0.0.0 typecheck: `astro check` Exit status 134
 ELIFECYCLE  Command failed with exit code 134.
EXIT:134
```

Classification: **VERIFIED env limitation** — `deploy:verify` typecheck phase OOM even with `8192` MB heap (reproduces Task 3 deferred minor "typecheck OOM requires NODE_OPTIONS" — `CHANGE_LOG.md:353-357` + `progress.md:41`). Failure is at `astro check` processing bundled admin JS (`public/admin/assets/*.js` `mermaid` `6133` unused var warnings), not at hardening-fix code. 7 individual gates above each PASS — hardening fixes did not regress. Recorded as **UNKNOWN** not FAIL per Task 7 instruction; no gate weakening to obtain PASS.

---

## Appendix B — Prior hardening artifacts cited (all FACT except OBSERVED/UNKNOWN noted)

| Artifact | Commit | Lines cited | Class |
|---|---|---|---|
| `artifacts/audit/tina-hardening/CURRENT_STATE.md` | `a355f59` | `tina/config.ts:28-314` 4 collections, `wrangler.jsonc:36-42` drift, P0/P1 ranking | FACT + VERIFIED appendix (`git ls-files tina/` 2 files, grep zero) |
| `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` | `54d1fc2` | Branch `REQUIRED`, `nodejs_compat` MISSING→REQUIRED, SESSION `MISSING—BLOCKED (UNKNOWN ID)`, `PUBLIC_TINA_ADMIN_ORIGIN` DOCUMENTATION_GAP, summary table 16 rows | FACT + VERIFIED (file + Workers doc webfetch 2026-09-17) |
| `artifacts/audit/tina-hardening/CHANGE_LOG.md` | `0d2a91f` | §0 BLUF 100k, proposals 01-07, records 01 `8322de1`, 02 `68c672e`, 03 BLOCKED, 04 `8b0d771`, 05 NOT_REQUIRED, 06 `_headers` PRESENT, 07 SITE_URL N/A | FACT + VERIFIED (per-fix `check-deploy-mapping` PASS) |
| `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` | `8642ab5` | Capability matrix NOT CONNECTED, §2 required React-free path, §3 affected files, §4 Small→Medium defer, §5 F1-F4 rejected | FACT + VERIFIED (grep 0 hits at `0d2a91f`) |
| `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` | `c83169c` | `tina/config.ts:161-223` + `about.json` single doc + zero consumers + `DORMANT` + decision C | FACT + VERIFIED (`Get-ChildItem`, `Select-String` 0) |
| `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md` | `8a546d8` | Preconditions BLUF + SESSION 10014 caveat + Flow Steps 1-5 + Evidence checklist + `playwright_*=ask` | FACT (runbook), UNKNOWN execution result |
| This report | `—` (to-be-committed) | Task 7 Phase 6 — validation loop + VERIFIED/OBSERVED/UNKNOWN + blockers + next step | VERIFIED for 7 gates |

---

## Appendix C — Files read for this report (all FACT line refs — cites required by Task 7)

| File | Lines read | Class |
|---|---|---|
| `tina/config.ts` | `1-317` (`branch:4` expanded, 4 collections `28-314`, `about:161-223`) | FACT |
| `wrangler.jsonc` | `1-71` (`compatibility_date:36`, `compatibility_flags:37 ["nodejs_compat"]`, `main:38`, `assets:39-42`) | FACT |
| `apps/web/astro.config.mjs` | `1-30` (`tina():7`, `output: static:13`, `site:15`, `cloudflare():28`) | FACT |
| `apps/web/src/lib/tina/loaders.ts` | `1-82` (3 JSON imports + Zod `tinaHomepage/Faq/Site`, `isSiteRelativeUrl:9-17`) | FACT |
| `apps/web/src/lib/tina/islands.ts` | `1-44` (registry `hero` + `aboutSection` `wrapper: { tag:'section' }`) | FACT |
| `apps/web/src/pages/tina-island/[name].ts` | `1-5` (`prerender=false:4`, `POST:5`) | FACT |
| `apps/web/public/_headers` | `1-40` (`frame-ancestors:9` + `connect-src:9`) | FACT |
| `package.json` | `1-51` (`build:18`, `deploy:verify:42` full order, `wrangler@4.126.0:49`) | FACT |
| `.env.example` | `1-16` (`PUBLIC_TINA_CLIENT_ID:8`, `TINA_TOKEN:9`, `TINA_BRANCH:10`, `PUBLIC_TINA_ADMIN_ORIGIN:14` empty after `8b0d771`) | FACT |
| `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` | Task 7 inputs + file map + Global Constraints | FACT |
| `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` | Prior findings + 3/4 checklist OBSERVED + Tasks 8-9 deferred | FACT |

---

*Generated for Task 7 Phase 6 — no gate weakening, one concern per commit, UNKNOWN never upgraded, static+island hybrid retained, truth gate intact, hobby/free pricing not a blocker. Every claim above cites evidence file + line or the command outputs in Appendix A. Later tasks must not upgrade any UNKNOWN in this report without headed evidence or a real KV `id`.*
