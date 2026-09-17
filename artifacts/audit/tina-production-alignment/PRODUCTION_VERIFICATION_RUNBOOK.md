# PRODUCTION_VERIFICATION_RUNBOOK — 2026-09-18

> Scope: production deployment-proof + content-proof layers only. The 5-step headed HITL flow (navigate → login → collections/edit probe → Save → gates) lives in `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md` — follow it, do not duplicate it here. Blocked baseline: `artifacts/audit/tina-hardening/TINA_HITL_EXECUTION_RECEIPT.md` (Steps 1–10 UNKNOWN/BLOCKED, no human at keyboard). Visual-editing wiring requirements: `external-evidence/tinacms-final-verification.md` Claims 1–6; code-ready vs runtime state: `artifacts/audit/tina-production-alignment/VISUAL_EDITING_STATUS.md` (all buckets UNKNOWN until HITL).
> Evidence classes: FACT / VERIFIED / OBSERVED / UNKNOWN. UNKNOWN never upgraded without execution. AI never sees credentials/MFA/TINA_TOKEN.

---

## P0-A — Playwright MCP harness (precondition proof 1/2)

Precondition: `C:\UKBT\ukbt-tina-hardening\opencode.json` must contain the `mcp.playwright` + `permission` block. Receipt §2.2 VERIFIED it is MISSING in this worktree; canonical block lives in `C:\UKBT\UKBT-main\opencode.json` (FACT, read 2026-09-18).

Steps (human):
1. Copy `mcp.playwright` (`npx -y @playwright/mcp@0.0.81 --browser chromium --user-data-dir ./.pw-mcp-profile --viewport-size 1440x900`, `enabled:true`, `timeout:30000`, `type:local`) + `"permission": {"playwright_*": "ask"}` from sibling into worktree `opencode.json`.
2. Ensure `.gitignore` contains `.pw-mcp-profile/` (receipt VERIFIED missing — add it).
3. Quit and restart OpenCode (config loads once at startup). Confirm `playwright_*` tools listed.

Expected evidence: `Get-Content opencode.json` shows `mcp.playwright`; `Test-Path .pw-mcp-profile` state recorded; startup tool list contains `playwright_*`.
PASS: block present + restart done + tools listed. Else STOP — `ask` enforcement cannot be relied upon.

## P0-B — Secrets / human ownership (precondition proof 2/2)

Precondition: human owns TinaCloud credentials + MFA + `CLOUDFLARE_API_TOKEN`; AI never prompts for, receives, or stores them (`TINA_HITL_RUNBOOK.md` Step 2 invariant; final-verification Claim 1: `TINA_TOKEN` is read-only build-time secret).

Steps: human confirms at session start: (a) TinaCloud login will be done personally in the visible headed browser, (b) `TINA_TOKEN` exists only in `.env`/CI/Cloudflare Build vars, never chat/docs/commits.
Expected evidence: log line `login: human-performed, agent-did-not-handle-credentials` + timestamp.
PASS: human ack recorded. FAIL/STOP: any credential appears in agent context → abort, rotate.

---

## Proof 1 — Cloudflare deploy proof (site is live)

Precondition: P0-A PASS. Target URL from TinaCloud dashboard Site pane (receipt §2.4 authoritative pattern `https://chore-tinacloud-admin-setup-ukbt-uk-bangla-tigers.mohammad-chowdhury.workers.dev`; prod `https://ukbanglatigers.co.uk` per `astro.config.mjs:15`). Record verbatim, never invent host.
Steps (AI, each `ask`-approved): `curl.exe -I <site>/admin` (expect 307 → `/admin/`), `curl.exe -I <site>/admin/` (expect 200 + `CF-RAY`), `curl.exe -I <site>/` (expect 200).
Expected evidence: status codes + `CF-RAY` + `CF-Cache-Status` + CSP `frame-ancestors` allowlist (`app.tina.io`, `*.tinajs.io`) pasted verbatim.
PASS: `/admin/` 200 and `/` 200 with Cloudflare headers. (Receipt §2.4 already VERIFIED this shape — re-confirm live.)

## Proof 2 — Tina login proof

Precondition: Proof 1 PASS. Delegates entirely to `TINA_HITL_RUNBOOK.md` Steps 1–2.
Steps: AI `playwright_navigate` to `<site>/admin` (human approves); human logs in manually in headed window; AI waits.
Expected evidence: `playwright_screenshot` of admin shell post-login (store `artifacts/audit/tina-hardening/` + timestamp) + login ack line.
PASS: admin shell OBSERVED loaded, credentials never touched agent. FAIL: any agent-driven `playwright_fill` on login form → abort.

## Proof 3 — Tina edit proof (sidebar, editorial-only)

Precondition: Proof 2 PASS. Delegates to `TINA_HITL_RUNBOOK.md` Step 3. Safe field only: `Site settings → footerTagline` (`tina/config.ts:284`; file `apps/web/content/site/siteSettings.json:2` current `"United by Passion. Driven by Cricket."`); fallbacks `Homepage → tagline`, `FAQ → pageHeading`. Sentinel: ` (edited via TinaCloud <YYYY-MM-DD>)`.
Steps: AI `playwright_snapshot` before-value; AI edits field (human approves each call); AI `playwright_snapshot` after-value pre-save. Do NOT click Save here.
Expected evidence: before/after screenshots + pasted values + collection/field name + timestamps.
PASS: sentinel visible in form, edit confined to editorial field (no truth-sensitive/About-org edits per About decision DORMANT).

## Proof 4 — Git commit proof

Precondition: Proof 3 PASS. Delegates to `TINA_HITL_RUNBOOK.md` Step 4 (human clicks Save).
Steps (after human Save): AI records GitHub `main` SHA (short + full 40-char from commits log), `git log --oneline -3` verbatim, `git diff HEAD~1 -- apps/web/content/site/siteSettings.json` (or edited file) verbatim, TinaCloud History screenshot.
Expected evidence: SHA + diff showing only sentinel insertion + timestamp.
PASS: new `tina: update …` commit exists on `main`. Until then SHA stays UNKNOWN.

## Proof 5 — Redeploy proof

Precondition: Proof 4 PASS. SESSION KV caveat applies: `wrangler.jsonc` has no `kv_namespaces` (receipt §6 VERIFIED MISSING) → second git-based deploy may fail `10014` duplicate-namespace. Record save number that triggers it; never fabricate an `id`.
Steps: AI polls Cloudflare dashboard `Workers & Pages → Deployments`; records deployment ID/URL + `DEPLOY_STATUS` (`BUILDING|SUCCESS|FAILED|10014`) + build log excerpt (first/last 50 lines). Then runs:
```bash
node scripts/check-deploy-mapping.mjs
node scripts/check-content-trust.mjs
pnpm run check-seo
```
Expected evidence: deployment ID/URL + status + exit codes + stdout pasted verbatim.
PASS: `DEPLOY_STATUS=SUCCESS` for this save AND all three commands PASS (mapping confirms `wrangler.jsonc`-at-root → adapter output; trust confirms DORMANT gate; seo confirms `site:` authority). `10014` → STOP visual proof, file `SESSION id UNKNOWN — retrieve via npx wrangler kv namespace list / dashboard copy` (receipt §7).

## Proof 6 — Website content proof

Precondition: Proof 5 PASS (`SUCCESS` + gates PASS).
Steps (AI, `ask`-approved headed): `playwright_navigate` to `/` (footerTagline/tagline probe) or `/faq` (pageHeading probe); `playwright_snapshot`/`playwright_screenshot` showing sentinel; copy visible text; capture `cf-ray`/`x-deployment-id`.
Expected evidence: screenshot ref + pasted visible text containing sentinel + header IDs + timestamp.
PASS: sentinel OBSERVED on live production URL served by Proof-5 deployment. Visual click-to-edit overlay (tina-island route per final-verification Claim 4: `tina()` + `tinaField()` + island `prerender=false`) is a separate post-hardening check — Proof 6 covers sidebar→deploy content only (VISUAL_EDITING_STATUS INLINE bucket stays UNKNOWN until island fetch exercised).

---

## HITL checkpoint script (who does what)

| Checkpoint | Human | AI |
|---|---|---|
| C0 session start | Copies Site URL verbatim into log; confirms P0-A/P0-B | Records HEAD SHA, timestamps, viewport 1440x900, mcp 0.0.81 |
| C1 deploy (P1) | Approves probes | Runs curl probes, pastes headers |
| C2 login (P2) | Logs in manually, MFA; approves navigate | Navigates, waits, screenshots shell |
| C3 edit (P3) | Approves each `playwright_*` | Snapshots before/after, edits safe field only |
| C4 save+commit (P4) | Clicks Save in sidebar | Records SHA, `git log`, diff, History shot |
| C5 redeploy+gates (P5) | Approves dashboard observation | Polls status, runs mapping/trust/seo, pastes outputs |
| C6 content (P6) | Approves production navigate | Snapshots sentinel on live page, records cf-ray |
| Abort | Any credential request, `10014`, or gate FAIL → stop | Records blocker verbatim, upgrades nothing |

Storage: filled evidence record → appendix of `FINAL_READINESS_REPORT.md` or `artifacts/receipts/<date>-hitl-evidence.md`. No credentials/tokens/cookies stored.
