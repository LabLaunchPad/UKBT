# TINA_HITL_RUNBOOK — 2026-09-17

> Base: `c83169c5e4e624531e738922784915ce24353ac6` (HEAD after Task 5) — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: `artifacts/audit/tina-hardening/CURRENT_STATE.md` + `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` + `artifacts/audit/tina-hardening/CHANGE_LOG.md` (Phase 2 fixes + §0 BLUF + §3 SESSION blocker) + `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` (Phase 3 — zero-React, React-free visual editing, no code) + `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` (Phase 4 — C keep intentionally unused) + `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` (HITL Browser MCP setup — UNKNOWN locally, see Preconditions) + `apps/web/public/_headers:9` (`frame-ancestors`) + `tina/config.ts:4` (branch chain) + `wrangler.jsonc:37` (`nodejs_compat`) + `apps/web/astro.config.mjs:15` (`site: https://ukbanglatigers.co.uk`) + TinaCloud dashboard screenshots (OBSERVED 3/4 in fixing plan, UNKNOWN live — never upgraded).
> Evidence classes: **FACT** (file line exists) / **VERIFIED** (file + command output) / **OBSERVED** (screenshot/dashboard) / **INFERENCE** (deduced) / **UNKNOWN** (not retrievable — never upgraded to FACT per `knowledge/04-EVIDENCE-POLICY.yaml` + Global Constraints).
> Scope: **runbook only — no browser execution in this task** (per Task 6 requirement: "Do NOT actually run browser now — just create runbook"). No file outside this `*.md` was modified.

---

## BLUF — Hobby/Free stack CAN support visual editing after wiring (no pricing blocker)

> Sourced from `CHANGE_LOG.md §0` + `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` + `TINA_VISUAL_EDITING_GAP_ANALYSIS.md §2.5` — cited, not re-audited here.

**FACT-sourced, INFERENCE-classified:** Cloudflare Workers Free 100k req/day, KV 100k reads / 1k writes / 1 GB free, no extra cache config beyond `apps/web/public/_headers` cache matrix — sufficient for Tina editorial (sidebar → commit → rebuild → Workers deploy). TinaCloud Free 2 users / 2 roles / 1 project / 100 MB assets, no editorial workflow — sufficient for this hardening loop.

**Meanings for this runbook:**

- Remaining HITL blockers are **engineering** (branch chain, `nodejs_compat`, SESSION pin, origin allowlist, visual wiring) — **not pricing**. Do NOT file a billing upgrade as a blocker for visual-editing proof.
- Pricing sufficiency is a **precondition that infrastructure is sufficient** — listed explicitly in Preconditions §1. Do NOT treat free-tier limits as a reason to skip the save→commit→deploy proof.

---

## Preconditions (human checks — verify before starting HITL session)

### 1. Infrastructure sufficient (BLUF precondition)

- Workers Free + KV Free + TinaCloud Free limits above are sufficient — **FACT** (`CHANGE_LOG.md §0` free-tier BLUF, `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` KV free note, `TINA_VISUAL_EDITING_GAP_ANALYSIS.md §2.5`). **No pricing blocker** — proceed with engineering checks below.

### 2. TinaCloud Site URL for this test

- **Required:** One concrete Site URL to exercise `/admin` against — either a **Workers preview** (`https://chore-tinacloud-admin-setup-ukbt-…workers.dev`) or **production** (`https://ukbanglatigers.co.uk` per `apps/web/astro.config.mjs:15` `site` — **FACT**). The fixing plan and Task 6 prompt cite the preview pattern `https://chore-tinacloud-admin-setup-ukbt-...workers.dev` as the TinaCloud dashboard's **Site URL** for this project (4 Site URLs referenced in dashboard screenshots). **Live value: UNKNOWN** — dashboard Site URL was **not retrievable** without a headed browser HITL capture (no `playwright_*` run in this task; `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` not found on disk at `c83169c` — see §6.1). Keep **UNKNOWN**; do NOT invent the full hostname. The human operator must copy the URL from the TinaCloud dashboard's **Site** configuration pane at session start and paste it verbatim into the HITL log (see Evidence §5).
- **Record in log:** Write the chosen Site URL as `TinaCloud Site URL (test): <url>` at the top of the session evidence record before Step 1.

### 3. Cloudflare redeploy trigger — verified vs SESSION 10014 caveat

- **Branch chain — FIXED (VERIFIED):** `tina/config.ts:4` now reads `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main'` — **FACT** (`CHANGE_LOG.md Implementation record 01`, commit `8322de1` `fix(tina): resolve editing branch on Workers Builds previews`). Preview branches will now edit their own branch, not `main` (`WORKERS_TINA_CONFIGURATION_AUDIT.md §1` REQUIRED verdict).

- **Runtime compat — FIXED (VERIFIED):** `wrangler.jsonc:37` now `compatibility_flags: ["nodejs_compat"]` — **FACT** (`CHANGE_LOG.md Implementation record 02`, commit `68c672e` `fix(worker): enable nodejs_compat for tina island route`). Required for `tina-island/[name].ts` `node:async_hooks` (`WORKERS_TINA_CONFIGURATION_AUDIT.md §2.3`).

- **Admin origin — DOCUMENTED (VERIFIED):** `.env.example:11-14` now documents `PUBLIC_TINA_ADMIN_ORIGIN=` with comment referencing `middleware.js:4` `adminOrigins()` — **FACT** (`CHANGE_LOG.md Implementation record 04`, commit `8b0d771`). Runtime value is empty until human sets per-environment origin; `frame-ancestors` precedence handles the header side (see §6.2). This is docs-only and does not block HITL.

- **SESSION KV pin — STILL BLOCKED/UNKNOWN (caveat):** `wrangler.jsonc` still has **no `kv_namespaces`** — **VERIFIED** (`CHANGE_LOG.md §3` Implementation record 03 BLOCKED/UNKNOWN, `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` Verdict table: structural key MISSING—REQUIRED but `id` BLOCKED (UNKNOWN ID)). Workers doc § **Pin the SESSION KV namespace**: "Your first deploy creates the namespace automatically, but Cloudflare doesn't write its ID back to your repo, so the next git-based deploy tries to create it again and fails [10014]. Editor saves trigger a redeploy, so you would hit this on your second save." **Expected sentinel: Workers error `10014` duplicate-namespace on the second git-based deploy.** Until a real `id` is retrieved via `npx wrangler kv namespace list --json` or dashboard `Workers & Pages | KV → Copy ID` / Worker `Settings | Bindings → SESSION`, **HITL save→redeploy proof WILL hit `10014` on the second save**. This is not a pricing issue (see BLUF) — it is a missing-ID blocker.

  - **For this HITL runbook:** Treat the first editorial save as the proof-of-wiring probe; expect the **second** save (or the redeploy triggered by it) to surface `10014` if the pin is still absent. The human operator must record which save triggered `10014` vs which succeeded, and file the ID retrieval as the unblocking next step (see Flow Step 4 note + Evidence §5). Do NOT invent an `id` to paper over this — `CHANGE_LOG.md §3` forbids fabricating the ID per evidence-class constraint.

### 4. Browser MCP HITL harness — ready but not executed

- `opencode.json` `mcp.playwright` = local stdio `npx -y @playwright/mcp@0.0.81`, chromium, persistent profile `./.pw-mcp-profile`, viewport `1440x900`, `permission.playwright_* = ask` — **FACT** when `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` exists; **UNKNOWN LOCALLY** at `c83169c` because `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` is not on disk in this worktree (file not found — **VERIFIED** via `Test-Path` in `CURRENT_STATE.md` Appendix D / Task 1). The sibling checkout `C:\UKBT\UKBT-main\artifacts\audit\browser-mcp\SETUP_AND_HITL_RUNBOOK.md` does contain the canonical Browser MCP setup (headed, persistent profile, `ask` enforcement — read 2026-09-17, 30 lines). **Live state is kept as UNKNOWN** — do NOT claim tools are discovered in this task's session. The human must verify `playwright_*` tools are listed at opencode startup before running Flow Step 1.

- **Reminder:** `playwright_* = ask` — every browser tool call needs human approval. This IS the HITL enforcement at the agent layer (`SETUP_AND_HITL_RUNBOOK.md:5` — **FACT** in that file). Do not bypass with `--headless`, `--isolated`, or `--save-session`.

### 5. Security / headers precondition

- `apps/web/public/_headers:9` **PRESENT** — `Content-Security-Policy: … frame-ancestors 'self' https://app.tina.io https://*.tinajs.io …; connect-src 'self' https://*.ingest.sentry.io https://app.tina.io https://*.tinajs.io` — **FACT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2` table, `CURRENT_STATE.md:21`). `X-Frame-Options: DENY` at `_headers:4` co-exists but is **overridden by `frame-ancestors` precedence per CSP spec** — `frame-ancestors` is the effective allowlist for TinaCloud admin iframe embedding (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`). No header change needed before HITL.

- Site URL for SEO/OG/sitemap is hardcoded at `apps/web/astro.config.mjs:15` `site: 'https://ukbanglatigers.co.uk'` — **FACT** (Global Constraint reconciled non-issue; Workers `SITE_URL` env is N/A — `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.3`). Do not set `SITE_URL` as a deploy var for this stack.

---

## Invariants (must hold during HITL — zero-React / editorial-layer-only / truth gate)

> Sourced from `TINA_VISUAL_EDITING_GAP_ANALYSIS.md §§2-3` + `ABOUT_COLLECTION_DECISION.md §1.5` + `CURRENT_STATE.md` — not re-audited here.

1. **Zero-React / Astro React-free visual editing:** No `useTina()`, no `useEditState()`, no `react`/`react-dom` import anywhere in `apps/web/src`. The only docs-prescribed APIs are `requestWithMetadata` + `TinaIsland` + `tinaField()` bridge + `experimental_createIslandRoute` (already scaffolded at `apps/web/src/pages/tina-island/[name].ts:4-5` — **FACT**). This HITL runbook exercises the **sidebar editing** (Git-backed) path that already ships; future visual-overlay wiring remains React-free per `TINA_VISUAL_EDITING_GAP_ANALYSIS.md §5` rejected patterns — do NOT add React to fix editing.

2. **TinaCMS is editorial-only — never bypasses `@ukbt/truth` / provenance gate:** Content classification editorial (headline, CTA, FAQ, nav labels, About copy) vs truth-sensitive (players, stats, dates, org claims) stays enforced by `apps/web/src/lib/tina/loaders.ts` Zod gate + `apps/web/src/lib/content-trust.ts` + `contracts/TRUTH-CONTRACT.md`. `apps/web/src/lib/faq-answer.ts:39-53` (`renderFaqAnswer` → `escapeHtml` + `<p>` only) stays the `set:html` sink for `faq.astro:35`. No HITL edit may promote a truth-sensitive fact to CMS-editable without a plan amendment.

3. **About collection stays `DORMANT` unless a post-hardening plan re-gates it:** `tina/config.ts:161-223` About collection + `apps/web/content/about/about.json` single document are **intentionally unused** (`ABOUT_COLLECTION_DECISION.md` §2.C RECOMMENDED) — `apps/web/src/pages/about.astro:28` consumes truth-owned `src/content/about-data.ts` (`DORMANT` classification at `content-trust.ts:80-111`). Do NOT wire `storyBody` rich-text through a new `set:html` sink without the `REM-001`-class renderer noted in that decision — no HITL step below should edit About org facts as CMS text until that renderer exists.

---

## Flow (human + AI execute together — headed browser, `ask` per step)

> This is the execution order to perform in a single headed session. The AI never sees credentials; the human performs login in the visible browser. Steps use `playwright_*` tools only when the human has approved via `ask`.

### Step 1 — AI navigates (headed, human approves)

1. Human starts the app under test (local `pnpm dev` or `pnpm preview` after `pnpm run build`, or the deployed preview/prod URL chosen in Preconditions §2) and copies the TinaCloud Site URL for this test into the HITL log (`TinaCloud Site URL (test): <url>`).
2. AI calls `playwright_navigate` to `<site>/admin` (or `<preview-workers.dev>/admin` if testing the TinaCloud Site preview) — **human approves via `ask`** (`SETUP_AND_HITL_RUNBOOK.md` — `permission.playwright_* = ask`, headed default, no `--headless` — **FACT** in that file, **UNKNOWN live** per Preconditions §4).
3. AI records: navigation URL, timestamp, viewport `1440x900` (the frozen CI viewport from `SETUP_AND_HITL_RUNBOOK.md:4` — **FACT** in that file), `opencode.json` `mcp.playwright` version `0.0.81` + `HEAD` SHA `c83169c`.

**Do NOT run this step in this task** — this file is the runbook. Execution belongs to the headed session after this commit.

### Step 2 — Human logs in manually (agent never sees credentials)

1. Human completes TinaCloud login **in the visible headed browser** (`SETUP_AND_HITL_RUNBOOK.md:21` — "human completes TinaCloud login IN THE VISIBLE BROWSER. Agent waits — it must not ask for, receive, or store credentials." — **FACT** in that file).
2. AI **waits** — does not prompt for, receive, capture, or store credentials, tokens, or `TINA_TOKEN` (Global Constraint: `TINA_TOKEN` is secret — `.env` + CI/Cloudflare secret stores only; never chat/docs/commits). AI does not call `playwright_fill`/`playwright_click` on the login form; human performs all auth interactions.
3. AI records: `login: human-performed, agent-did-not-handle-credentials` + timestamp.

**Security invariant:** Never capture credentials, automate login, or store tokens — see Non-goals §4.

### Step 3 — AI verifies collections load, sidebar form renders, edit field works (human approves each `playwright_*` call)

1. AI calls `playwright_snapshot` / `playwright_screenshot` (each approved via `ask`) to verify:
   - **Admin shell loads** at `/admin`.
   - **Collections list renders** — 4 collections per `tina/config.ts:28-314` — **FACT** (schema defines `homepage`, `about`, `faq`, `siteSettings`):
     - `Homepage` (label `Homepage` — `tina/config.ts:31`)
     - `About page` (label `About page` — `tina/config.ts:163` — intentionally unused but must appear in sidebar; `ABOUT_COLLECTION_DECISION.md` §2.C)
     - `FAQ` (label `FAQ` — `tina/config.ts:227`)
     - `Site settings` (label `Site settings` — `tina/config.ts:278`)
   - **Sidebar form renders** for the selected collection (fields per `tina/config.ts` field lists — **FACT**).
2. AI performs a safe-field edit probe (one of these, in priority order — all are **editorial-only**, never truth-sensitive):

   **Primary probe (recommended, least risk):**
   - Navigate to **`Site settings → Footer tagline`** (`tina/config.ts:284` `footerTagline` — `string`, `required: false` — **FACT**). Content file: `apps/web/content/site/siteSettings.json` — **FACT** (`Get-ChildItem apps/web/content` 4 files — `CURRENT_STATE.md` appendix). Append the edit sentinel **` (edited via TinaCloud <YYYY-MM-DD>)`** where `<YYYY-MM-DD>` is the HITL session date (e.g. `2026-09-17`). This matches the Task 6 prompt's prescribed sentinel verbatim.

   **Alternative probes (if footerTagline probe is unavailable — use one):**
   - `Homepage → Supporting text` (`tina/config.ts:64` `tagline` — **FACT**) — append same sentinel.
   - `FAQ → Page heading` (`tina/config.ts:233` `pageHeading` — **FACT**) — append same sentinel.
   - Do NOT edit `homepage.primaryCtaLink` / `secondaryCtaLink` (must stay `isSiteRelativeUrl` — `loaders.ts:9-17,26-35` — **FACT**) beyond pre-validated safe values, and do NOT edit `site.contact` / `social` URL fields beyond `https://` allowlist unless the value is known-good per `allowed-urls.ts`.

3. AI records: before-value (screen text + snapshot), after-value (edited form value before save), timestamp, and which collection/field was used. **Do not click Save in this step** — saving is the human's action in Step 4.

**Notes:**

- `playwright_* = ask` reminder: every `playwright_navigate` / `playwright_snapshot` / `playwright_screenshot` / `playwright_evaluate` call requires human approval before execution (`SETUP_AND_HITL_RUNBOOK.md:5` + §3 above). If the agent requests a tool call, the human must approve or deny in the UI — `ask` is the HITL enforcement boundary.
- `frame-ancestors` note: `_headers:9` already allow-lists `https://app.tina.io https://*.tinajs.io` for `frame-ancestors` + `connect-src` — **FACT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`). If the admin shell fails to iframe (CSP frame-ancestors violation), the evidence to capture is the browser console error + the header value from `dist/client/_headers` / network panel — do NOT weaken `frame-ancestors` in the runbook; file a blocker instead.
- **Zero-React invariant note:** If the Tina admin or bridge injects React, that is inside `/admin` (Tina's own UI) — not in `apps/web/src`. The site itself must stay React-free (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md` zero-React invariant).

### Step 4 — Human clicks Save → AI records GitHub `main` commit SHA + Cloudflare redeploy status

1. **Human clicks Save** in the TinaCloud admin sidebar (agent does not automate this click — use `playwright_*` only to *observe* before/after, not to *drive* the save, unless the human explicitly approves an AI click as their agent and is watching the headed window).
2. **AI records immediately after save (human approves snapshot/screenshot):**
   - GitHub `main` commit SHA produced by the TinaCloud commit (visible in the TinaCloud dashboard's **History** or in GitHub `https://github.com/<org>/<repo>/commits/main` — not invented; record the short SHA `abc1234` + full 40-char SHA + timestamp). **Until HITL it is UNKNOWN** (`CURRENT_STATE.md` P0-2 "Human edit→save→commit→deploy proof missing — checklist step 4 unchecked" — **OBSERVED 3/4** per fixing plan, **UNKNOWN live**). After save, fill in the commit SHA — do NOT upgrade UNKNOWN before this step executes.
   - Cloudflare Workers Builds redeploy status: navigate to Cloudflare dashboard `Workers & Pages → ukbt-uk-bangla-tigers → Deployments` (or the Workers Builds deployment log) and record `DEPLOY_STATUS` (e.g. `BUILDING | SUCCESS | FAILED | 10014`) + build log excerpt. **SESSION 10014 caveat applies here** — if `wrangler.jsonc` still lacks `kv_namespaces` (it does at `c83169c` — **VERIFIED** `CHANGE_LOG.md §3`), the **second** git-based deploy (i.e., second editorial save) is expected to fail `10014` duplicate-namespace (`WORKERS_TINA_CONFIGURATION_AUDIT.md §3` + Workers doc § Pin SESSION KV). Record which save number triggered `10014` vs `PASS`.
   - `git log --oneline -3` output (captured from the repo after pulling `main`) showing the new content commit message (typically `tina: update …` or Tina's generated message) — paste verbatim.
3. **STOP condition for this step:** If the redeploy log shows `10014` (or `kv_namespaces`/`SESSION` namespace-create failure), **stop the visual-editing proof** at evidence capture — do NOT retry with a fabricated `kv_namespaces.id`. File the blocker as `SESSION KV id still UNKNOWN — retrieval via npx wrangler kv namespace list --json or dashboard copy required` (`CHANGE_LOG.md §3` + `WORKERS_TINA_CONFIGURATION_AUDIT.md §3`). The single save that did land still counts as commit-proof; the second-save failure is the sentinel that the pin is required.

### Step 5 — AI verifies production result: `check-content-trust` + `check-seo` PASS, redeployed content visible

1. After Cloudflare reports `DEPLOY_STATUS = SUCCESS` (or `BUILDING` → poll until `SUCCESS` / `FAILED`), perform two verification branches:

   **A. Gate verification (local or CI):**
   ```bash
   node scripts/check-content-trust.mjs && pnpm run check-seo
   ```
   Must both show `PASS` (`package.json:42` `deploy:verify` gate is release authority — this pair is the editorial-truth subset of it; `check-content-trust` exercises `content-trust.ts:80-111` `DORMANT` classification — **FACT**; `check-seo` validates sitemap/RSS/OG against hardcoded `site: https://ukbanglatigers.co.uk` — **FACT** `apps/web/astro.config.mjs:15`). Record exit codes + stdout. If either fails, abort the proof — do NOT weaken the gate to obtain PASS (Global Constraint: `deploy:verify` is release authority; no gate weakening for PASS).

   **B. Production-content verification (headed browser, human approves):**
   - AI navigates (headed, `ask`) to the production URL for the edited field to confirm the sentinel is visible:
     - If `Site settings → Footer tagline` was edited → navigate to `/` and inspect footer tagline text contains ` (edited via TinaCloud <date>)`.
     - If `Homepage → Supporting text` was edited → navigate to `/` and inspect tagline region.
     - If `FAQ → Page heading` was edited → navigate to `/faq` and inspect `pageHeading`.
   - Record `playwright_snapshot` / `playwright_screenshot` + the page's visible text (copy-paste) + timestamp + the deployed Worker's `x-deployment-id` or `cf-ray` if available.

2. **If both A and B PASS**, the HITL proof is **VERIFIED** for this editorial commit. Proceed to Evidence §5 roll-up.
3. **If `check-content-trust` FAILS**, the edit violated `DORMANT` / trust classification (`ABOUT_COLLECTION_DECISION.md §1.4` — fail-closed). Revert the edit in Tina (human re-edits to remove sentinel or restores prior value) and record the `check-content-trust` failure log as evidence that the gate correctly rejected the content.

---

## Non-goals (must NOT do in this runbook)

- **Never capture credentials, automate login, or store tokens.** The human performs TinaCloud login personally in the headed browser; the agent never handles, asks for, receives, or logs `TINA_TOKEN` / passwords / session cookies / `TinaCloud` bearer tokens. No `--storage-state` committed, no `TINA_TOKEN` in chat/docs/commits (Global Constraints — `TINA_TOKEN` is secret: `.env` + CI/Cloudflare secret stores only). Login state lives in the machine-local `./.pw-mcp-profile/` (gitignored — `SETUP_AND_HITL_RUNBOOK.md:6` — **FACT** in that file).
- **Never bypass the editorial-vs-truth boundary.** Do not promote `org.*` / player / stat / date fields to CMS-editable as part of this HITL probe; keep edits to `Site settings → Footer tagline` / `Homepage → tagline` / `FAQ → pageHeading` — all editorial-safe per `content-trust.ts` + `@ukbt/truth` governance.
- **Never invent a `kv_namespaces` `id` or upgrade UNKNOWN to FACT.** If the SESSION pin is still absent, record `10014` as the sentinel and retrieve a real ID via `npx wrangler kv namespace create SESSION` / dashboard copy — do not fabricate a UUID to make `wrangler deploy` pass.
- **Never run `deploy:verify` gate-weakening shims** (e.g., `SKIP_*` envs) to obtain PASS. `deploy:verify` order is `scaffold-self-test → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf` (AGENTS.md Verification order — **FACT**). No subset PASS equals a release PASS.
- **Never claim a check PASS unless it was actually executed and the receipt records its exit status** (Hard Invariants).

---

## Evidence to capture (fill this checklist during the headed session)

> Every field below must be filled with a concrete value or `UNKNOWN — not retrievable this session` — never left blank, never inferred. Dashboard live state that was not captured stays **UNKNOWN** per evidence policy.

- [ ] **Pre-session SHA:** `git rev-parse HEAD` before HITL — recorded as `c83169c5e4e624531e738922784915ce24353ac6` at runbook creation; update to live HEAD at session start.
- [ ] **TinaCloud Site URL (test):** `<workers.dev preview or prod>` — copied verbatim from dashboard Site URL pane — **UNKNOWN until HITL** (Task 6 prompt cites pattern `https://chore-tinacloud-admin-setup-ukbt-...workers.dev`; do not invent the full host — **UNKNOWN** kept until screenshot ref captured).
- [ ] **Before-value snapshot:** screen text + `playwright_snapshot` of the field before edit (e.g., `Site settings → Footer tagline` current value) — paste/screenshot ref.
- [ ] **After-value (pre-save):** edited form value with sentinel ` (edited via TinaCloud <YYYY-MM-DD>)` — paste/screenshot ref + timestamp.
- [ ] **Human Save timestamp:** `YYYY-MM-DDTHH:mm:ssZ` — when human clicked Save.
- [ ] **GitHub `main` commit SHA:** short + full 40-char SHA from GitHub commits log — **UNKNOWN until HITL** (`CURRENT_STATE.md` P0-2 step 4 unchecked — **OBSERVED 3/4**, not 4/4). After save, paste `git log --oneline -3` output verbatim.
- [ ] **Before/after content diff:** `git -C . diff HEAD~1 -- apps/web/content/site/siteSettings.json` (or whichever collection file was edited) — paste verbatim or attach artifact; shows exactly what JSON key changed and the sentinel insertion.
- [ ] **Cloudflare redeploy log:** Workers Builds deployment ID + status `SUCCESS | FAILED | 10014` + build log excerpt (first 50 lines + last 50 lines) — paste or link to dashboard log — **UNKNOWN until HITL**; if `10014` on second save, record `SESSION KV blocker — id still UNKNOWN` per `CHANGE_LOG.md §3`.
- [ ] **`check-content-trust` + `check-seo` outputs:** `node scripts/check-content-trust.mjs` (exit code, PASS/FAIL, stdout) + `pnpm run check-seo` (exit code) — must both be **PASS** for VERIFIED proof — paste verbatim. If either FAIL, record failure log and abort.
- [ ] **Redeployed content visible (production proof):** headed `playwright_snapshot`/`playwright_screenshot` of the production page showing the sentinel (e.g., footer tagline on `/` or heading on `/faq`) + visible text copy-paste + `cf-ray` / `x-deployment-id` if available + timestamp.
- [ ] **TinaCloud checklist 4/4 screenshot ref:** dashboard checklist after save — the fixing plan's prior screenshot showed **3/4**; after this HITL Save the checklist should show **4/4** (step 4 checked). Record the screenshot file path under `artifacts/audit/tina-hardening/` or the dashboard URL + timestamp. Until captured, keep as **UNKNOWN — not retrievable without HITL** (file `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` not found locally — Preconditions §4; do NOT claim 4/4 before screenshot exists).
- [ ] **Session meta:** `playwright_* = ask` approvals log (one entry per tool call), viewport `1440x900`, `opencode.json` `mcp.playwright` `0.0.81`, `./.pw-mcp-profile` local-only (gitignored), operator name (human), date.

**Storage:** Commit the filled evidence record as an appendix to `FINAL_READINESS_REPORT.md` (Task 7) or as a standalone `artifacts/receipts/<date>-hitl-evidence.md` (not created in this task). Do NOT store credentials, tokens, or `TinaCloud` session cookies in the record.

---

## Reminders / Operational notes

### `playwright_* = ask` reminder (read before every headed step)

> Per `SETUP_AND_HITL_RUNBOOK.md:5` — **FACT** in that file — `permission.playwright_* = ask` means **every** browser tool call (`playwright_navigate`, `playwright_snapshot`, `playwright_screenshot`, `playwright_evaluate`, `playwright_click`, `playwright_fill`, `playwright_select`, `playwright_hover`) **requires human approval** in the agent UI. If the agent requests a tool call, the human must click **Approve** or **Deny** — this is the agent-layer HITL enforcement.

- **No `--headless`:** Headed by default — the human MUST see the browser to perform TinaCloud login personally (`SETUP_AND_HITL_RUNBOOK.md:10` — headed by default, no `--headless` — **FACT**).
- **No `--isolated`:** Persistent profile `./.pw-mcp-profile` survives across sessions (`SETUP_AND_HITL_RUNBOOK.md:11` — **FACT**); `--isolated` would wipe login every close.
- **No `--allowed-origins/--blocked-origins` as security boundary:** Upstream docs state they are NOT a security boundary — real containment is `ask` + headed-visible (`SETUP_AND_HITL_RUNBOOK.md:12` — **FACT**).
- **No `--save-session`:** Would persist storage state incl. auth tokens to disk output (`SETUP_AND_HITL_RUNBOOK.md:13` — **FACT**).
- **Restart requirement:** After editing `opencode.json` `mcp.playwright`, quit and restart opencode — config loads once at startup (`SETUP_AND_HITL_RUNBOOK.md:16-17` — **FACT**).
- **The agent never drives login:** `SETUP_AND_HITL_RUNBOOK.md:21` — "Agent navigates (headed window opens, human watches) to `/admin`; human completes TinaCloud login IN THE VISIBLE BROWSER. Agent waits." — **FACT** in that file.

### `frame-ancestors` note (`apps/web/public/_headers:9`)

> `apps/web/public/_headers:9` — **FACT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`):

```
Content-Security-Policy: … frame-ancestors 'self' https://app.tina.io https://*.tinajs.io; …
```

- This is the **effective allowlist** for embedding `/admin` in the TinaCloud iframe. `X-Frame-Options: DENY` at `_headers:4` co-exists but is **overridden by CSP `frame-ancestors` precedence** (CSP takes precedence per spec; `DENY` acts only as a legacy fallback for non-CSP browsers — `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2` — **FACT**).
- `_headers` is served from `apps/web/public/_headers` → adapter copies to `dist/client/_headers` → Cloudflare static assets serve it (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2` — **FACT**). No Workers-side header mutation needed.
- If the HITL session shows a `Refused to display ... in a frame because it set 'X-Frame-Options' to 'deny'` console error but the page *does* render inside Tina, that is the `frame-ancestors` precedence working correctly — record the CSP header from the network panel and note the X-Frame-Options co-existence as intentional.

---

## Caveats / Blockers carried into this runbook (from earlier tasks — do not paper over)

1. **SESSION KV `id` still BLOCKED/UNKNOWN — will hit `10014` on second save.** `wrangler.jsonc` has no `kv_namespaces` at `c83169c` (**VERIFIED** `WORKERS_TINA_CONFIGURATION_AUDIT.md §3` + `CHANGE_LOG.md §3` Verdict: structural key MISSING—REQUIRED but `id` BLOCKED (UNKNOWN ID)). Workers doc § **Pin the SESSION KV namespace** sentinel `10014` is the expected failure on the second git-based deploy. **Action before or during HITL:** Retrieve a real `id` via `npx wrangler kv namespace list --json` or dashboard `Workers & Pages | KV → SESSION → Copy ID` or `npx wrangler kv namespace create SESSION` — then pin it in `wrangler.jsonc` before the second editorial save. Until then, the runbook's Flow Step 4 must record `10014` as the sentinel and the evidence record must keep the pin as `UNKNOWN`.

2. **TinaCloud dashboard live state stays UNKNOWN until a headed session captures it.** `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` is `UNKNOWN` locally at this commit (not found on disk — `CURRENT_STATE.md` appendix D / `Test-Path` false — **VERIFIED**), and the 4 Site URLs + checklist 4/4 screenshot ref are `UNKNOWN` (the fixing plan's prior screenshot showed 3/4 — **OBSERVED**, not 4/4; the live dashboard was not fetched in any task — kept `UNKNOWN` per Global Constraints "never upgrade UNKNOWN→FACT").

3. **Visual-editing overlay is NOT CONNECTED — this HITL proves sidebar → commit → deploy, not click-to-edit.** `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §§1-2 (**VERIFIED** zero `requestWithMetadata`/`TinaIsland`/`tinaField()` hits in `apps/web/src`) establishes that visual click-to-edit is **NOT CONNECTED**; this runbook's success criterion is the Git-backed editorial flow (sidebar editing → commit → rebuild → Workers deploy) that the architecture's evidence-first loop targets (hardening plan Architecture — **FACT**). Visual-overlay wiring is deferred to a post-hardening plan (`TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §4.3 Recommendation: defer until after HITL proof + `FINAL_READINESS_REPORT.md`).

---

## References (all prior hardening artifacts — cite, do not re-audit)

- `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` — hardening plan (Global Constraints, Tasks 1-7, file map, phases 0-6)
- `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` — prior fixing plan (3/4 checklist OBSERVED, reconciled non-issues table)
- `artifacts/audit/tina-hardening/CURRENT_STATE.md` — Phase 0 current state (appendix VERIFIED `git ls-files tina/`, `grep requestWithMetadata` zero, P0/P1 risk ranking)
- `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` — Phase 1 audit (§1 branch isolation REQUIRED, §2.3 `nodejs_compat` MISSING→REQUIRED, §3 SESSION `MISSING—BLOCKED`, §4.1 `PUBLIC_TINA_ADMIN_ORIGIN` DOCUMENTATION_GAP, §4.2 `_headers:9` `frame-ancestors` PRESENT)
- `artifacts/audit/tina-hardening/CHANGE_LOG.md` — Phase 2 log (§0 BLUF free-tier sufficient; Implementation records 01 `8322de1` branch, 02 `68c672e` `nodejs_compat`, 03 SESSION BLOCKED, 04 `8b0d771` `PUBLIC_TINA_ADMIN_ORIGIN=` docs)
- `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` — Phase 3 gap analysis (capability matrix NOT CONNECTED, React-free path `requestWithMetadata → TinaIsland → tinaField`, rejected CONTEXT toggle + custom validator endpoint, free-tier §2.5 BLUF)
- `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` — Phase 4 decision (C keep intentionally unused, `content-trust.ts:80-111` `DORMANT`, `storyBody` needs `REM-001`-class renderer)
- `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` — Browser MCP + HITL setup (headed, `ask`, `.pw-mcp-profile` gitignored, HITL flow `/admin` → login → verify → save) — **UNKNOWN locally** at `c83169c` (not found on disk in this worktree; sibling `C:\UKBT\UKBT-main\artifacts\audit\browser-mcp\SETUP_AND_HITL_RUNBOOK.md` read as fallback 2026-09-17, 30 lines — **FACT** there, but live retrieval stays **UNKNOWN** per evidence policy)
- `tina/config.ts:4` — branch chain `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'` (post-Task 3) — **FACT**
- `wrangler.jsonc:37` — `compatibility_flags: ["nodejs_compat"]` (post-Task 3) — **FACT** (`wrangler.jsonc:36` `compatibility_date: "2026-09-14"`)
- `apps/web/public/_headers:4,9` — `X-Frame-Options: DENY` + `Content-Security-Policy: … frame-ancestors …` — **FACT**
- `apps/web/astro.config.mjs:7,13,15,28` — `tina():7`, `output: 'static':13`, `site: https://ukbanglatigers.co.uk:15`, `cloudflare():28` — **FACT**
- `apps/web/src/pages/tina-island/[name].ts:4-5` — `prerender = false` + `POST = experimental_createIslandRoute(islands)` — **FACT**
- `apps/web/node_modules/@tinacms/astro/dist/middleware.js:2-8,11,116-117` — `adminOrigins()` + `node:async_hooks` + `bridgeScript()` — **FACT** (audited in `WORKERS_TINA_CONFIGURATION_AUDIT.md`)
- Workers doc `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` — Editing branch / `nodejs_compat` / Pin SESSION KV (§ Editing branch / Configure for Cloudflare / Pin the SESSION KV) — fetched 2026-09-17 — **FACT** (webfetch)
- `package.json:42` `deploy:verify` — release authority gate order — **FACT**

---

## Execution note

**No headed browser was run in this task.** This file was authored as the Phase 5 HITL runbook per `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 6. Execution of the Flow (Steps 1-5) belongs to a future headed session with `playwright_*` `ask` approvals, human-performed TinaCloud login, and evidence capture per §5. The runbook is ready for that session without further edits — `git add` + `commit -m "docs(tina): phase 5 HITL runbook"` is the only operation performed here beyond writing this file.

*Generated for Task 6 Phase 5 — human-in-the-loop production test runbook. Cites `CURRENT_STATE.md`, `WORKERS_TINA_CONFIGURATION_AUDIT.md`, `CHANGE_LOG.md`, `TINA_VISUAL_EDITING_GAP_ANALYSIS.md`, `ABOUT_COLLECTION_DECISION.md` without upgrading UNKNOWN. Live TinaCloud dashboard state kept as UNKNOWN per evidence-class constraint; SESSION 10014 caveat noted per WORKERS audit §3 / CHANGE_LOG §3. Zero-React / editorial-layer-only / truth-gate invariants preserved per gap analysis §3.*

