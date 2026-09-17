# UKBT TinaCMS Production Hardening — Evidence First Execution Loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move TinaCMS from READY_FOR_TEST to VERIFIED_PRODUCTION_READY by validating evidence, fixing only proven blockers with minimal diffs, and producing auditable hardening artifacts before any visual-editing architecture change.

**Architecture:** Evidence-first loop on the existing Git-backed editorial flow (sidebar editing → commit → rebuild → Workers deploy). No `requestWithMetadata`/`TinaIsland` implementation in this loop — those are deferred to gap analysis. Workers config is audited against `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` and the installed `@tinacms/astro@0.7.0` middleware.

**Tech Stack:** TinaCMS 3.14, `@tinacms/astro` 0.7.0, Astro 7.2, `@astrojs/cloudflare` 14.2, Cloudflare Workers (static assets, `output: static` + one on-demand `tina-island/[name].ts`), pnpm 10.33, Node 22.23.

**Spec:** `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` (prior findings) + Grounding Truth phases 0-6 (this plan's authority) + TinaCloud dashboard screenshot 3/4 checklist + Workers deployment doc (Workers doc) + repo truth at `67ba098` (`tina/config.ts`, `wrangler.jsonc`, `apps/web/astro.config.mjs`, `apps/web/src/lib/tina/*`, `.github/workflows/ci.yml`, `package.json:42` `deploy:verify`).

## Global Constraints

- Node ≥22, pnpm ≥10 (`package.json:6-10`).
- Biome: single quotes, semicolons, 2-space indent.
- TinaCMS is editorial-only; never bypass `@ukbt/truth`, provenance gate, SEO/a11y/perf/security/deployment contracts.
- `TINA_TOKEN` is secret: `.env` + CI/Cloudflare secret stores only; never chat/docs/commits.
- Human owns TinaCloud login; agent never automates credentials (HITL).
- Evidence classes: FACT / VERIFIED / OBSERVED / INFERENCE / UNKNOWN; never upgrade UNKNOWN to FACT.
- `deploy:verify` is release authority; no gate weakening for PASS.
- One concern per PR; no merges without re-approval; no irreversible ops without ask.
- Site URL is hardcoded at `apps/web/astro.config.mjs:15` (`https://ukbanglatigers.co.uk`); Workers `SITE_URL` env is N/A for this stack (reconciled non-issue).
- `tina-lock.json` is committed; `tina/__generated__/` and `apps/web/public/admin/` are gitignored build artifacts (reconciled non-issues).

---

## File map

| File | Role in this loop |
|---|---|
| `artifacts/audit/tina-hardening/CURRENT_STATE.md` | Phase 0 output: reproducible state |
| `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` | Phase 1 output: Workers config audit |
| `artifacts/audit/tina-hardening/CHANGE_LOG.md` | Phase 2 log: proposals + minimal fixes |
| `tina/config.ts` | Phase 2 candidate: branch chain (only if proven) |
| `wrangler.jsonc` | Phase 2 candidate: `nodejs_compat` + SESSION KV (only if proven) |
| `.env.example` | Phase 2 candidate: `PUBLIC_TINA_ADMIN_ORIGIN` docs (only if proven) |
| `apps/web/astro.config.mjs` | Phase 2 candidate: `tinaAdminDevRedirect()` (only if proven) |
| `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` | Phase 3 output: gap analysis, no impl |
| `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` | Phase 4 output: decision record |
| `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md` | Phase 5 output: human-in-the-loop runbook |
| `artifacts/audit/tina-hardening/FINAL_READINESS_REPORT.md` | Phase 6 output: VERIFIED/OBSERVED/UNKNOWN + blockers |
| `artifacts/audit/tina-hardening/*` | All seven deliverables; no other files created |

---

### Task 1: Phase 0 — Reconstruct Current Tina State

**Files:**
- Create: `artifacts/audit/tina-hardening/CURRENT_STATE.md`
- Read: `tina/config.ts`, `tina/tina-lock.json`, `wrangler.jsonc`, `apps/web/astro.config.mjs`, `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/lib/tina/islands.ts`, `apps/web/src/pages/tina-island/[name].ts`, `apps/web/src/components/Hero.astro`, `.env.example`, `.github/workflows/ci.yml`, `package.json`, `apps/web/package.json`, `apps/web/public/_headers`, `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md`, `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`

**Interfaces:**
- Consumes: prior plan's reconciled non-issues and verified completed table.
- Produces: `CURRENT_STATE.md` that every later task cites (evidence links, risk ranking).

- [ ] **Step 1: Read all inputs and classify.** Open each file above and record header + line refs. For every claim use classes FACT (file line exists), VERIFIED (file + command output), OBSERVED (screenshot/dashboard), INFERENCE (deduced), UNKNOWN (not retrievable). Copy nothing stale from `docs/tina-audit/*`.
- [ ] **Step 2: Write the file.** Create `artifacts/audit/tina-hardening/CURRENT_STATE.md` with sections:

```md
# CURRENT_STATE — 2026-09-17

## Completed (with evidence links)
| Area | Status | Evidence |
|---|---|---|
| Tina lockfile | DONE | `tina/tina-lock.json` committed — `git -C . ls-files tina/` shows it |
| Tina schema | DONE | `tina/config.ts:28-314` 4 collections, builds via `tinacms build --skip-cloud-checks` (`package.json:18`) |
| Tina admin login | VERIFIED | human login works (dashboard 3/4 screenshot, `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`) |
| Tina build integration | VERIFIED | root build + `ci.yml:271` regenerate admin |
| Generated artifacts | OK | `tina/__generated__/` + `apps/web/public/admin/` gitignored (`.gitignore`) |
| FAQ security path | OK | `apps/web/src/lib/faq-answer.ts:39-53` escapes Tina AST |

## Unresolved (risk-ranked)
### P0 / Production risk
1. Workers config drift — `wrangler.jsonc:36-42` missing `nodejs_compat` + SESSION KV pin, `tina/config.ts:4` missing `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` — cite `wrangler.jsonc:1-71`, `tina/config.ts:4`.
2. Human edit→save→commit→deploy proof missing — checklist step 4 unchecked in screenshot.

### P1 / Functional completeness
3. Visual editing incomplete — `grep` shows zero `requestWithMetadata`/`TinaIsland`/`tinaField` in `apps/web/src` except hand-stamped `data-tina-field` strings.
4. About collection orphan — `apps/web/content/about/about.json` exists, zero `tinaAbout` refs.

## Evidence links
- plan: `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md`
- config: `tina/config.ts:4`, `wrangler.jsonc`, `apps/web/astro.config.mjs:7,28`, `apps/web/src/lib/tina/loaders.ts:1-82`
- deploy: `package.json:18,42`, `.github/workflows/ci.yml:26,271`
- security: `apps/web/src/lib/faq-answer.ts`, `apps/web/public/_headers`

## Stop condition
If any prior assumption not reproducible, mark UNKNOWN and stop — do not infer.
```

Keep the table factual; do not claim fixes applied.
- [ ] **Step 3: Validate.** Run: `git -C . ls-files tina/ | cat` and `grep -r "requestWithMetadata\|TinaIsland\|tinaField" apps/web/src 2>/dev/null | cat` and paste outputs into the file's appendix as VERIFIED evidence (or note OBSERVED screenshot refs).
- [ ] **Step 4: Commit.**

```bash
git add artifacts/audit/tina-hardening/CURRENT_STATE.md
git commit -m "docs(tina): phase 0 current state — evidence-ranked"
```

### Task 2: Phase 1 — Workers Configuration Audit

**Files:**
- Create: `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md`
- Read: `wrangler.jsonc`, `tina/config.ts`, `apps/web/astro.config.mjs`, `apps/web/src/pages/tina-island/[name].ts`, `apps/web/node_modules/@tinacms/astro/dist/middleware.js`, `.github/workflows/ci.yml`, `package.json`, Workers doc (`https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers`)

**Interfaces:**
- Consumes: `CURRENT_STATE.md` P0 item 1.
- Produces: audit with verdicts per sub-area (no config edits yet).

- [ ] **Step 1: Branch isolation audit.** Read `tina/config.ts:4` and compare to Workers doc chain `GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"`. Answer: does any preview/edit path target `main` when it should target the preview branch? Inspect `ci.yml` for branch env propagation. Verdict: REQUIRED / NOT_REQUIRED with evidence lines.
- [ ] **Step 2: Runtime compat audit.** Read `wrangler.jsonc` for `compatibility_date`, `compatibility_flags`, `kv_namespaces`, `main`, `assets`. Compare to Workers doc requirements: `nodejs_compat` for `tina-island` (`node:async_hooks`), SESSION KV auto-creation vs pin. Check `apps/web/src/pages/tina-island/[name].ts:4-5` (`prerender=false`, island POST). Verdict per flag/namespace: MISSING / PRESENT / UNNEEDED with citations.
- [ ] **Step 3: Admin origin / headers audit.** Read `.env.example`, `apps/web/public/_headers` (`frame-ancestors`, `connect-src`), and `middleware.js:4` (`PUBLIC_TINA_ADMIN_ORIGIN`). Note that `SITE_URL` is N/A (hardcoded site). Verdict: DOCUMENTATION_GAP vs CONFIG_GAP.
- [ ] **Step 4: Write the file.** Structure:

```md
# WORKERS_TINA_CONFIGURATION_AUDIT — 2026-09-17

## Branch isolation
- Current: `tina/config.ts:4` = `TINA_BRANCH || GITHUB_BRANCH || 'main'`
- Required chain per Workers doc: `... || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || ...`
- Verdict: ...
- Evidence: ...

## Runtime compatibility
- `wrangler.jsonc` current flags/namespaces: ...
- `nodejs_compat` needed because: island route uses `node:async_hooks` (doc + adapter)
- SESSION KV: auto-created on first deploy but second git-based deploy fails `10014` if unpinned (doc)
- Verdict: ...

## Session KV binding
- Current binding: ...
- Production vs preview isolation: ...

## Admin origin
- `PUBLIC_TINA_ADMIN_ORIGIN` honored by `middleware.js:4`, absent from `.env.example`
- `_headers` `frame-ancestors` precedence over `X-Frame-Options: DENY`

## Summary table
| Item | Current | Required | Verdict |
|---|---|---|---|
```

Stop if evidence insufficient → mark UNKNOWN, do not propose fix.
- [ ] **Step 5: Commit.**

```bash
git add artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md
git commit -m "docs(tina): phase 1 workers configuration audit"
```

### Task 3: Phase 2 — Fix Only Proven Blockers (minimal diffs)

**Files:**
- Create: `artifacts/audit/tina-hardening/CHANGE_LOG.md` (append-only log)
- Modify (only if Task 2 verdict is REQUIRED): `tina/config.ts`, `wrangler.jsonc`, `.env.example`, `apps/web/astro.config.mjs` — each change is a separate commit, one concern per PR rule mirrored as one concern per commit.

**Interfaces:**
- Consumes: `WORKERS_TINA_CONFIGURATION_AUDIT.md` verdicts.
- Produces: `CHANGE_LOG.md` entries + minimal diffs + validation commands.

- [ ] **Step 1: Draft CHANGE_PROPOSAL entries in CHANGE_LOG.md.** For each REQUIRED verdict, write a block:

```md
## YYYY-MM-DD — <title>
**Problem:** ...
**Evidence:** `file:line` + command output
**Risk:** low/medium — scope ...
**Minimal fix:** exact diff (one file, one concern)
**Validation:** `node scripts/check-deploy-mapping.mjs`, `pnpm --filter @ukbt/web typecheck`, `git diff tina/tina-lock.json` shape-only
**Rollback:** `git revert <sha>` or delete line
```

Do NOT implement yet; get the proposals reviewed in-file first. If verdict is NOT_REQUIRED or UNKNOWN, write that and implement nothing.
- [ ] **Step 2: Implement only if reproducible + required + low regression risk.** Candidates in priority order:
  1. `tina/config.ts:4` add `|| process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH` — then regenerate lockfile (`pnpm exec tinacms dev -c "echo lockfile-check"` or `pnpm run build`), verify `git diff --stat tina/` touches only `tina-lock.json`.
  2. `wrangler.jsonc` add `"compatibility_flags": ["nodejs_compat"]` after `compatibility_date`; pin `kv_namespaces` only with a real ID from dashboard/CLI (`npx wrangler kv namespace create SESSION` or copy existing); never invent ID — if ID UNKNOWN, document it as blocking the save→redeploy proof instead of fabricating.
  3. `.env.example` add `PUBLIC_TINA_ADMIN_ORIGIN=` with comment referencing `middleware.js:4`.
  4. `apps/web/astro.config.mjs` add `import { tinaAdminDevRedirect } from '@tinacms/astro/vite'` + `vite: { plugins: [tinaAdminDevRedirect()] }` after verifying `node -e "import.meta.resolve('@tinacms/astro/vite')"` in `apps/web`.
- [ ] **Step 3: Validate each fix immediately.** Run: `node scripts/check-deploy-mapping.mjs` (must PASS), `pnpm --filter @ukbt/web typecheck` (if astro config touched), `git status --porcelain` shows only intended files. Record outputs in CHANGE_LOG.md.
- [ ] **Step 4: Commit per fix.** One commit per file/concern, e.g. `fix(tina): resolve editing branch on Workers Builds previews`.
- [ ] **Step 5: Finalize CHANGE_LOG.md commit.** `git add artifacts/audit/tina-hardening/CHANGE_LOG.md` and commit `docs(tina): phase 2 change log`.

### Task 4: Phase 3 — Tina Visual Editing Gap Analysis (no implementation)

**Files:**
- Create: `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md`
- Read: `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/lib/tina/islands.ts`, `apps/web/src/pages/tina-island/[name].ts`, `apps/web/src/pages/index.astro`, `apps/web/src/pages/about.astro`, `apps/web/src/pages/faq.astro`, `apps/web/src/components/Hero.astro`, `apps/web/src/components/ClubIntro.astro`, `apps/web/src/components/AboutStory.astro`, `apps/web/src/components/PageBanner.astro`, `apps/web/src/components/LeadershipGrid.astro`, `tina/__generated__/client.ts` (gitignored, read if present), `@tinacms/astro` docs (`/contextual-editing/astro`, `/migrations/astro-react-free-visual-editing`)

**Interfaces:**
- Consumes: `CURRENT_STATE.md` P1 item 3.
- Produces: gap analysis with capability matrix, no code changes.

- [ ] **Step 1: Build capability matrix.** Fill:

```md
| Capability | Status | Evidence |
|---|---|---|
| Login | VERIFIED | dashboard + `SETUP_AND_HITL_RUNBOOK.md` |
| Sidebar edit | OBSERVED/VERIFIED | `tina/config.ts` collections exist, `islands.ts:9-43` fetches `tinaHomepage` |
| Click edit | NOT CONNECTED | zero `TinaIsland`/`tinaField`/`requestWithMetadata` in `apps/web/src` |
| Preview (overlay) | NOT CONNECTED | loaders `loaders.ts:80-82` parse JSON directly, not via `requestWithMetadata` |
| Save | UNKNOWN until HITL | requires human proof |
| Commit | UNKNOWN until HITL | requires human proof |
```

Verify each cell with `grep` outputs and line refs.
- [ ] **Step 2: Required architecture.** Document docs-prescribed path: generated client → `requestWithMetadata(..., {priority:'primary'})` → island registry (`islands.ts`) → `src/pages/tina-island/[name].ts` (`prerender=false`, `experimental_createIslandRoute`) → `<TinaIsland name wrapper primary>` → `tinaField()`. Explain why middleware injection + bridge bootstrap (`/admin/bridge.js`) needs `tina()` integration (already present) and SSR adapter (already `cloudflare()`).
- [ ] **Step 3: Affected files + security impact.** List `loaders.ts` (Zod gate must stay), `islands.ts` (fetchers), page wrappers, component markers, and note REM-001 (`faq-answer.ts`) and REM-003 (`allowed-urls.ts`) unchanged. Note static-output trade-off: pages with `<TinaIsland>` gain one-line bootstrap; pages without stay byte-identical.
- [ ] **Step 4: Complexity estimate + recommendation.** Size as Small/Medium/Large, dependencies on Phase 2 fixes, and recommendation to defer implementation until after HITL proof (Phase 5) and final report.
- [ ] **Step 5: Commit.**

```bash
git add artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md
git commit -m "docs(tina): phase 3 visual editing gap analysis"
```

### Task 5: Phase 4 — About Collection Decision

**Files:**
- Create: `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md`
- Read: `tina/config.ts:161-223` (about collection), `apps/web/content/about/about.json`, `apps/web/src/content/about-data.ts`, `apps/web/src/pages/about.astro`, `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/lib/content-trust.ts`, `contracts/CONTENT-TRUST-CONTRACT.md` (if present)

**Interfaces:**
- Consumes: `CURRENT_STATE.md` P1 item 4.
- Produces: decision record A/B/C with no deletions (rule: do not delete).

- [ ] **Step 1: Audit schema/content/consumers.** Record: collection exists, 3 JSON files? Actually `about/about.json` single doc; `grep -r tinaAbout apps/web/src` zero hits; `about.astro:28` consumes code-owned `about` data; `content-trust.ts` note about org facts.
- [ ] **Step 2: Evaluate options.**

```md
## Options
### A. Connect About collection
- Connects Tina copy behind truth gate; requires Zod `tinaAbout` + escaper for `storyBody` (REM-001 pattern)
- Risk: org facts become CMS-editable unless gated

### B. Remove unused collection
- Defer per Global Constraints (no deletions in this loop)

### C. Keep intentionally unused (RECOMMENDED)
- Keep schema+content, mark in config comment as "intentionally unused — truth-owned copy at `src/content/about-data.ts`"
- No consumer, no risk, reversible
```

Recommend C for this hardening loop.
- [ ] **Step 3: Commit.**

```bash
git add artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md
git commit -m "docs(tina): phase 4 about collection decision"
```

### Task 6: Phase 5 — Human-In-The-Loop Production Test Runbook

**Files:**
- Create: `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md`
- Read: `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`, TinaCloud dashboard screenshot URLs, `apps/web/public/_headers`, `tina/config.ts` Site URLs

**Interfaces:**
- Consumes: Phases 0-2 evidence; Playwright MCP `opencode.json:playwright` (headed, `ask` permissions).
- Produces: step-by-step runbook the AI/human execute together.

- [ ] **Step 1: Write runbook.** Structure:

```md
# TINA_HITL_RUNBOOK — 2026-09-17

## Preconditions (human checks)
- TinaCloud Site URL for this test: <workers.dev preview or prod> (from screenshot: `https://chore-tinacloud-admin-setup-ukbt-...workers.dev`)
- Cloudflare redeploy trigger verified (no SESSION 10014 blocker — see `WORKERS_TINA_CONFIGURATION_AUDIT.md`)

## Flow
1. AI navigates headed browser to `<site>/admin` (via `playwright_*` — human approves)
2. Human logs in manually (agent never sees credentials)
3. AI verifies: collections load (Homepage/About/FAQ/Site settings), sidebar form renders, edit field works (e.g., `Site settings → Footer tagline` append ` (edited via TinaCloud <date>)`)
4. Human clicks Save → AI records GitHub `main` commit SHA + Cloudflare redeploy status
5. AI verifies production result: `node scripts/check-content-trust.mjs && pnpm run check-seo` PASS, redeployed content visible

## Non-goals
- Never capture credentials, automate login, or store tokens.

## Evidence to capture
- Commit SHA, redeploy log, before/after content diff, `TinaCloud checklist 4/4` screenshot ref.
```

Include `playwright_* = ask` reminder and `frame-ancestors` note.
- [ ] **Step 2: Commit.**

```bash
git add artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md
git commit -m "docs(tina): phase 5 HITL runbook"
```

### Task 7: Phase 6 — Validation Loop + Final Readiness Report

**Files:**
- Create: `artifacts/audit/tina-hardening/FINAL_READINESS_REPORT.md`
- Read: all prior `artifacts/audit/tina-hardening/*.md`, plus `scripts/check-*` outputs, `package.json:42` `deploy:verify` definition

**Interfaces:**
- Consumes: tasks 1-6.
- Produces: `FINAL_READINESS_REPORT.md` with VERIFIED/OBSERVED/UNKNOWN, blockers, next step.

- [ ] **Step 1: Run validation loop (or record UNKNOWN if blocked).** Attempt:

```bash
pnpm check-security
pnpm check-content-trust
pnpm check-deploy-mapping
pnpm check-perf
pnpm check-seo
pnpm check-ui
pnpm check-motion
```

If any requires secrets/network, record UNKNOWN with reason. Then attempt `pnpm deploy:verify`; if blocked, record UNKNOWN, do not claim success.
- [ ] **Step 2: Write final report.** Sections:

```md
# FINAL_READINESS_REPORT — 2026-09-17

## VERIFIED
## OBSERVED
## UNKNOWN
## Remaining blockers (P0/P1)
## Recommended next execution step
- Stop before major Tina architecture changes if UNKNOWN remains, else queue visual-editing implementation (Tasks 8-9 of `2026-09-17-tinacms-fixing-plan.md`) as separate plan.
```

Every claim cites evidence file + line or command output.
- [ ] **Step 3: Commit.**

```bash
git add artifacts/audit/tina-hardening/FINAL_READINESS_REPORT.md
git commit -m "docs(tina): phase 6 final readiness report"
```

---

## Self-review

1. **Spec coverage:** Phases 0-6 each map to a task; deliverables `CURRENT_STATE.md` through `FINAL_READINESS_REPORT.md` (7 files) match spec's `artifacts/audit/tina-hardening/` list (which names `CHANGE_LOG.md` + 6 others). Prior fixing plan Tasks 8-9 (visual editing impl) correctly deferred to gap analysis + future plan. ✅
2. **Placeholder scan:** No TBD/TODO/placeholder code blocks; every fix lists exact line numbers (`tina/config.ts:4`, `wrangler.jsonc:36-42`, `middleware.js:4`, `apps/web/astro.config.mjs:7`). ✅
3. **Type consistency:** File paths match repo truth (`tina/config.ts`, `wrangler.jsonc`, `apps/web/src/lib/tina/*`, `artifacts/audit/tina-hardening/*`); evidence classes consistent; no new types introduced. ✅

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
