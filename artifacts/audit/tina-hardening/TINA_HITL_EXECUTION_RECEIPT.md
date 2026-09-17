# TINA HITL EXECUTION RECEIPT — P0-2 — 2026-09-17

> Base: `ff8930261c4b5742cb312c4a28232603a0dd45ad` (`ff89302` docs(tina): phase 0 revalidation + P0-1 SESSION KV blocked)
> Runbook: `artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md` at `8a546d8` (5-step flow, sentinel `footerTagline`)
> Authority: `artifacts/audit/tina-hardening/SESSION_KV_VERIFICATION.md` (ff89302) + `artifacts/audit/tina-hardening/TINA_CURRENT_STATE_REVALIDATION.md` + `wrangler.jsonc:35-43` + `apps/web/public/admin/index.html` + `curl.exe` probes + `npx @playwright/mcp --version`
> Evidence classes: FACT / VERIFIED / OBSERVED / UNKNOWN — per `knowledge/04-EVIDENCE-POLICY.yaml`. UNKNOWN never upgraded to FACT.
> Verdict: **BLOCKED / UNKNOWN** — headed browser + human-at-keyboard required to complete Steps 1-10. Do NOT claim VERIFIED.

---

## 1. Attempt timestamp

| Field | Value |
|---|---|
| Attempt start (local `Get-Date -Format o`) | `2026-09-17T23:36:55.5732200+06:00` — VERIFIED (`git rev-parse HEAD` ff89302) |
| Attempt end / receipt write | `2026-09-17T23:37:15.7784971+06:00` — VERIFIED |
| Curl probes (UTC) | `Thu, 17 Sep 2026 17:37:03 GMT` + `17:37:06 GMT` — VERIFIED via `curl.exe -I` `CF-RAY` headers |
| Operator | QA Automation Engineer (sandbox, no human at keyboard — **BLOCKED**) |
| Worktree | `C:\UKBT\ukbt-tina-hardening` detached, HEAD `ff89302`, branch `HEAD` detached — VERIFIED `git log --oneline -5` |

---

## 2. Environment

### 2.1 Worktree & git

- `git rev-parse HEAD` → `ff8930261c4b5742cb312c4a28232603a0dd45ad` — **VERIFIED**
- `git status --short` → `?? apps/web/public/admin/` + `?? docs/superpowers/` — **VERIFIED** (admin build is gitignored build artifact, not committed — expected)
- `git show ff89302:opencode.json` → `{"$schema":...,"instructions":[...],"username":"ukbt-agent"}` — **VERIFIED** — no `mcp` key at `ff89302`

### 2.2 Browser MCP installation

| Check | Command | Result | Class |
|---|---|---|---|
| `npx @playwright/mcp --version` | `npx -y @playwright/mcp@0.0.81 --version` | `Version 0.0.81` `EXIT:0` | **VERIFIED** — package fetchable via npx, version pinned |
| `npm list @playwright/mcp` | `npm list` in worktree | `(empty)` — not installed as local dep, expected (invoked via `npx -y`) | **VERIFIED** |
| `opencode.json` `mcp.playwright` | `Get-Content opencode.json` at ff89302 | **MISSING** — file contains only `$schema`+`instructions`+`username`, no `mcp.playwright` block | **VERIFIED — CONFLICTS with mission's "VERIFIED" claim** |
| Sibling reference | `C:\UKBT\UKBT-main\opencode.json` | Contains `mcp.playwright: {command: ["npx","-y","@playwright/mcp@0.0.81","--browser","chromium","--user-data-dir","./.pw-mcp-profile","--viewport-size","1440x900"], enabled:true, type:"local"}` + `permission.playwright_*="ask"` — **FACT** in sibling, **MISSING** in this worktree | **VERIFIED** |
| `.pw-mcp-profile` dir | `Test-Path .\.pw-mcp-profile` | `False` — directory **MISSING** on disk | **VERIFIED** |
| `.gitignore` ` .pw-mcp-profile` | `Select-String .gitignore -Pattern "pw-mcp"` | **0 hits** — not gitignored in this worktree | **VERIFIED — CONFLICTS with mission's "gitignored" claim** |
| `permission playwright_*=ask` | `opencode.json` | **MISSING** (requires `mcp.playwright` block to be present) | **VERIFIED** |
| Headed mode default | `opencode.json mcp.playwright` args | No `--headless` in sibling config — headed by default — but **UNKNOWN live** in this worktree until config is added and opencode restarted | **UNKNOWN** |

**Interpretation (repo truth vs plan):** Mission states "opencode.json has mcp.playwright 0.0.81 chromium headed, .pw-mcp-profile gitignored, permission playwright_*=ask — VERIFIED" — **repo truth at ff89302 is that `opencode.json` does NOT contain `mcp.playwright` and `.gitignore` does NOT list `.pw-mcp-profile`** (both VERIFIED via `Get-Content` + `Select-String`). `npx @playwright/mcp@0.0.81` itself IS fetchable (VERIFIED `0.0.81`). Sibling checkout `UKBT-main` does have the correct config — this worktree diverged. Next human-headed session must add the `mcp`+`permission` block to `opencode.json` (copy from sibling) and ensure `.pw-mcp-profile` is gitignored before relying on `ask` enforcement. This receipt does NOT patch `opencode.json` — it records the gap.

### 2.3 Admin build existence

| Location | Exists | Evidence | Class |
|---|---|---|---|
| `apps/web/public/admin/index.html` (local, `tinacms build` output) | **YES** — 2290 bytes, `<title>TinaCMS</title>` + `src="/admin/assets/index-CcmAlrV1.js"` | `Test-Path True`, `Get-ChildItem` assets dir 100+ files, `Get-Content index.html` | **VERIFIED** |
| `apps/web/public/admin/assets/` | **YES** — 100+ chunk files (`index-CcmAlrV1.js` 5584782 bytes, `index-Dzus0vdL.css` 517712 bytes) | `Get-ChildItem` listing | **VERIFIED** |
| `apps/web/public/admin/.gitignore` | **YES** — `index.html` gitignored (`git check-ignore` → `apps/web/public/admin/.gitignore:1:index.html`) | `git check-ignore -v` 1 hit | **VERIFIED** |
| `apps/web/public/admin` git tracking | `git ls-files` → 0 files | VERIFIED untracked artifact (expected — build intermediate) | **VERIFIED** |
| `tina/__generated__/` | **YES** — dir exists, `tina-lock.json` 66244 bytes | `Test-Path True` | **VERIFIED** |
| `apps/web/dist/client/admin/index.html` (post `pnpm run build` adapter output) | **YES** — `Test-Path True`, `bridge.js` 15550 bytes | `Test-Path` + `Get-ChildItem dist/client/admin` | **VERIFIED** |
| `apps/web/dist/client/admin` vs `public/admin` | Both present — `public/admin` is Tina's static admin shell, `dist/client/admin` is Cloudflare adapter's served copy | Both `Test-Path True` | **VERIFIED** |

**Conclusion:** Local admin build **VERIFIED present** without needing `pnpm run build` in this attempt — `apps/web/public/admin/` already on disk (likely from prior `tinacms build --skip-cloud-checks` per `package.json:build`). Rebuild not required to prove reachability; production URL is reachable (see §2.4).

### 2.4 Production URL reachability

Workers URL under test (from screenshot cited in mission): `https://chore-tinacloud-admin-setup-ukbt-uk-bangla-tigers.mohammad-chowdhury.workers.dev`

| Probe | Command | Status | Headers excerpt | Class |
|---|---|---|---|---|
| `GET /admin` (no slash) | `curl.exe -I --max-time 10 .../admin` | `HTTP/1.1 307 Temporary Redirect` → `Location: /admin/` | `content-security-policy: ... frame-ancestors 'self' https://app.tina.io https://*.tinajs.io; ...` `x-frame-options: DENY` `CF-RAY: a3c9e06a2c6b2ae6-SIN` | **VERIFIED** |
| `GET /admin/` | `curl.exe -I --max-time 10 .../admin/` | `HTTP/1.1 200 OK` `Content-Type: text/html` `CF-Cache-Status: HIT` | `ETag: "c4b00e1a6a5b488ab7256d23ae8c3ab4"` `CF-RAY: a3c9e07cadb22ae6-SIN` | **VERIFIED** |
| `GET /admin/` body snippet | `curl.exe -s .../admin/` | `<!DOCTYPE html> <title>TinaCMS</title> <script src="/admin/assets/index-DLwx0yB0.js">` — matches `public/admin/index.html` shape | Body length VERIFIED | **VERIFIED** |
| `GET /` workers root | `curl.exe -I .../` | `HTTP/1.1 200 OK` `CF-Cache-Status: HIT` `ETag: "8c9673d234749714685fe4ea50c5769c"` | `CF-RAY: a3c9e06d1f8f2ae6-SIN` | **VERIFIED** |
| `GET /admin` prod `ukbanglatigers.co.uk` | `curl.exe -I https://ukbanglatigers.co.uk/admin` | `HTTP/1.1 307 Temporary Redirect` | `content-security-policy: ... frame-ancestors ...` `CF-RAY: a3c9e06b9e032ae6-SIN` | **VERIFIED** |

**Which is reachable:** **BOTH** — local `apps/web/public/admin/` **and** production `workers.dev` `/admin/` are reachable (VERIFIED 200). Local `pnpm dev`/`pnpm preview` not started in this sandbox — production `workers.dev` is the authoritative target for HITL (matches TinaCloud `Site URL` pattern). `curl` probes confirm no CSP `frame-ancestors` violation at the header level (`app.tina.io` + `*.tinajs.io` allowlisted).

---

## 3. Flow steps 1-10 — VERIFIED / UNKNOWN per step

Per mission: 1 Open /admin 2 Human login 3 Authenticate Tina 4 Open content 5 Edit field 6 Save 7 Verify git commit 8 Verify SHA 9 Verify rebuild trigger 10 Verify deployment

Mapped to `TINA_HITL_RUNBOOK.md` 5-step flow (Steps 1-5 there = steps 1-6 here) + evidence steps 7-10.

| # | Step (mission) | Runbook mapping | What was attempted this sandbox | Result | Class |
|---|---|---|---|---|---|
| 1 | Open /admin | Runbook Step 1 `playwright_navigate` to `<site>/admin` | `curl.exe` HEAD/GET to `workers.dev/admin` (200) + local `public/admin/index.html` exists — **no `playwright_navigate` executed** — headed browser requires human approval via `ask` + visible window | **UNKNOWN — not executed (requires human-headed session)** | UNKNOWN |
| 2 | Human login | Runbook Step 2 human logs in headed browser, agent never sees credentials | **STOP at login** invariant enforced — agent did not prompt for, receive, capture, or store credentials/tokens/`TINA_TOKEN` — no `playwright_fill`/`playwright_click` on login form | **UNKNOWN — blocked awaiting human at keyboard** | UNKNOWN |
| 3 | Authenticate Tina | Runbook Step 2-3 TinaCloud auth in visible browser | No auth performed — session cannot proceed without human completing login in headed window | **UNKNOWN** | UNKNOWN |
| 4 | Open content | Runbook Step 3 verify collections (Homepage/About/FAQ/Site settings) + sidebar form | Collections schema VERIFIED in `tina/config.ts` (4 collections FACT per runbook), but **no `playwright_snapshot`/`playwright_screenshot` captured** — requires `ask`-approved headed session | **UNKNOWN — content files on disk verified, UI not observed** | UNKNOWN |
| 5 | Edit field | Runbook Step 3 edit probe `Site settings → footerTagline` sentinel ` (edited via TinaCloud YYYY-MM-DD)` | Sentinel target field VERIFIED: `apps/web/content/site/siteSettings.json:2` `"footerTagline": "United by Passion. Driven by Cricket."` — **no edit performed** — editing requires human-observed session per `ask` boundary | **UNKNOWN — before-value recorded from file, no after-value** | UNKNOWN |
| 6 | Save | Runbook Step 4 human clicks Save | **Not executed** — human Save triggers GitHub commit + Workers rebuild — cannot be automated without headed `ask` session | **UNKNOWN — no commit, no SHA, no redeploy triggered by this attempt** | UNKNOWN |
| 7 | Verify git commit | Runbook Step 4 `git log --oneline -3` + diff | `git log --oneline -5` VERIFIED at `ff89302` (no new commit since `ff89302`) — **no new Tina commit to verify** | **UNKNOWN — SHA remains UNKNOWN until Save** | UNKNOWN |
| 8 | Verify SHA | Rebuild trigger commit SHA | `git rev-parse HEAD` `ff8930261c4b5742cb312c4a28232603a0dd45ad` — pre-session SHA — **post-save SHA is UNKNOWN** — do NOT invent | **UNKNOWN** | UNKNOWN |
| 9 | Verify rebuild trigger | Runbook Step 4 Cloudflare Workers Builds `Deployments` log | `curl` probes VERIFIED production serves `200` but **no rebuild log inspected** — requires Cloudflare dashboard `Workers & Pages → Deployments` + human-observed `DEPLOY_STATUS` after Save | **UNKNOWN** | UNKNOWN |
| 10 | Verify deployment | Runbook Step 5B production content visible (sentinel on `/` or `/faq`) + Step 5A `check-content-trust`+`check-seo` PASS | `curl` VERIFIED `/` serves `200` with `ETag` — **no sentinel verified, no `check-content-trust`/`check-seo` run post-save, no `cf-ray`/`x-deployment-id` captured for new deployment** | **UNKNOWN** | UNKNOWN |

**Summary:** Steps 1-10 remain **UNKNOWN/BLOCKED** per evidence hierarchy — `VERIFIED` only for the environment primes (timestamp, HEAD SHA, browser MCP version fetchable, local admin build exists, production URL reachable). No step was upgraded to `VERIFIED` without execution.

---

## 4. Screenshots

| Item | Status | Evidence |
|---|---|---|
| `playwright_screenshot` of `/admin` shell | **UNKNOWN — not attempted** | Requires `playwright_* = ask` headed session — no screenshot file created this attempt |
| `playwright_snapshot` collections list (Homepage/About/FAQ/Site settings) | **UNKNOWN** | Runbook requires human approval per tool call — not executed |
| Before-value snapshot (`Site settings → Footer tagline`) | **UNKNOWN** (file value known: `"United by Passion. Driven by Cricket."` from `siteSettings.json:2` — but no UI snapshot) | File FACT, UI UNKNOWN |
| After-value (sentinel) | **UNKNOWN** | No edit performed — sentinel ` (edited via TinaCloud 2026-09-17)` not yet applied |
| TinaCloud History / GitHub commits log | **UNKNOWN** | No Save → no commit |
| Cloudflare Deployments log | **UNKNOWN** | No redeploy triggered |
| Production `/` footer with sentinel | **UNKNOWN** | No deployment to verify |
| Dashboard checklist 3/4 → 4/4 | **UNKNOWN** — prior fixing plan OBSERVED 3/4, live 4/4 not yet captured | Kept UNKNOWN per evidence policy |

**Screenshot policy:** No `Invoke-WebRequest` screenshot surrogate — `curl.exe` probes used only for reachability; headed `playwright_screenshot` must be captured in human session and stored under `artifacts/audit/tina-hardening/` or `playwright-report/` with timestamp + `CF-RAY` per receipt schema.

---

## 5. SHA

| Field | Value | Class |
|---|---|---|
| Pre-session HEAD SHA (full 40) | `ff8930261c4b5742cb312c4a28232603a0dd45ad` | **VERIFIED** `git rev-parse HEAD` 2026-09-17T23:37:15 |
| Pre-session short SHA | `ff89302` | **VERIFIED** |
| Post-save commit SHA (GitHub `main`) | `UNKNOWN — not retrievable this session (no Save performed)` | **UNKNOWN** |
| `git log --oneline -3` post-save | `UNKNOWN — no new commit` — current log: `ff89302 docs(tina): phase 0 revalidation + P0-1 SESSION KV blocked` → `3fe59ff` → `8a546d8` | **UNKNOWN** |
| Before/after diff `apps/web/content/site/siteSettings.json` | `UNKNOWN — no edit, no diff` — file on disk is pre-edit `footerTagline: "United by Passion. Driven by Cricket."` | **UNKNOWN** (file FACT, diff UNKNOWN) |

Do NOT invent a SHA — kept UNKNOWN until human-headed Save produces a GitHub commit (typically `tina: update ...`).

---

## 6. Deployment evidence

| Item | Status | Evidence |
|---|---|---|
| Workers Builds deployment ID | **UNKNOWN** | No redeploy triggered this attempt |
| `DEPLOY_STATUS` (`BUILDING \| SUCCESS \| FAILED \| 10014`) | **UNKNOWN** | Requires dashboard poll after Save |
| Build log excerpt (first/last 50 lines) | **UNKNOWN** | Not retrievable without Save |
| `check-content-trust` + `check-seo` | **UNKNOWN** — not run post-save (pre-save run would be meaningless for proof) | `package.json:deploy:verify` gate requires `PASS` after deployment |
| `cf-ray` / `x-deployment-id` | **UNKNOWN** — curl probes captured `CF-RAY: a3c9e07cadb22ae6-SIN` for existing deployment, not for post-save deployment | UNKNOWN for proof |
| `wrangler.jsonc` `kv_namespaces` | **MISSING** — `Select-String wrangler.jsonc -Pattern "kv_namespaces|SESSION"` 0 hits — VERIFIED | **VERIFIED MISSING** |

---

## 7. Blockers

### P0-1 SESSION KV — STILL BLOCKED (carried from `SESSION_KV_VERIFICATION.md`)

- `wrangler.jsonc` has **no `kv_namespaces`** — **VERIFIED** 0 hits this attempt (same as `SESSION_KV_VERIFICATION.md` §1 Attempt 2 `CLOUDFLARE_API_TOKEN` missing → `wrangler kv namespace list` ERROR).
- Workers doc Pin SESSION KV sentinel: second git-based deploy (including redeploy triggered by HITL Save) → `X [ERROR] 10014 duplicate-namespace` — **expected on second Save** until `id` is pinned.
- No `id` invented — kept **UNKNOWN/BLOCKED** per Global Constraint.
- Unblock: human with `CLOUDFLARE_API_TOKEN` runs `npx wrangler kv namespace list` (no `--json` flag) or dashboard `Workers & Pages | KV → Copy ID` → pin `kv_namespaces: [{binding:"SESSION", id:"<real-id>"}]` in `wrangler.jsonc` → `node scripts/check-deploy-mapping.mjs` PASS.

### P0-2 HITL — BLOCKED awaiting human

- **Headed browser + human login is the required next step** — per runbook Step 2 security invariant: agent never sees credentials, human completes TinaCloud login IN THE VISIBLE BROWSER, every `playwright_*` call requires `ask` approval.
- **Browser MCP harness gap:** `opencode.json` missing `mcp.playwright` + `permission.playwright_*=ask` + `.pw-mcp-profile` not gitignored — must be fixed before the `ask` enforcement can be relied upon. Sibling `UKBT-main` has the correct block — copy it, restart opencode.
- **No human at keyboard in this sandbox** — this receipt's sandbox is non-interactive (`NonInteractive` PowerShell mode VERIFIED via `Invoke-WebRequest` failure). `curl.exe` reachability probes are the maximum automation possible without violating the headed-human requirement.
- Until a human-headed session runs Steps 1-10, **P0-2 remains BLOCKED/UNKNOWN per evidence hierarchy** — no step upgraded.

---

## 8. Next step — human-headed session (exact invocation)

1. **Fix browser MCP config** (one-time, before next HITL):
   ```bash
   # copy correct mcp block from sibling (or add manually):
   # C:\UKBT\UKBT-main\opencode.json → C:\UKBT\ukbt-tina-hardening\opencode.json
   # ensure opencode.json contains:
   # "mcp": {"playwright": {"command":["npx","-y","@playwright/mcp@0.0.81","--browser","chromium","--user-data-dir","./.pw-mcp-profile","--viewport-size","1440x900"],"enabled":true,"timeout":30000,"type":"local"}},
   # "permission":{"playwright_*":"ask"}
   # ensure .gitignore contains:
   # .pw-mcp-profile/
   # .pw-mcp-profile/**
   ```
   Then **quit and restart opencode** — config loads once at startup.

2. **Start human-headed session** (`--headless false` is already the default when `mcp.playwright` has no `--headless` — do NOT add `--headless`, `--isolated`, or `--save-session`):
   ```bash
   opencode
   # human approves every playwright_* tool call via "ask" in the UI
   ```

3. **Flow (human approves each `playwright_navigate`):**
   - AI: `playwright_navigate` to `https://chore-tinacloud-admin-setup-ukbt-uk-bangla-tigers.mohammad-chowdhury.workers.dev/admin/` — human clicks **Approve** (headed window opens, human watches).
   - **STOP at login** — human completes TinaCloud login IN THE VISIBLE BROWSER. Agent waits — does not prompt for credentials. Agent records `login: human-performed, agent-did-not-handle-credentials` + timestamp.
   - AI (after `ask`): `playwright_snapshot`/`playwright_screenshot` to verify Admin shell + 4 collections + sidebar form (Homepage/About/FAQ/Site settings) + edit probe `Site settings → Footer tagline` append ` (edited via TinaCloud 2026-09-17)`.
   - Human clicks **Save** in Tina sidebar — AI then records GitHub `main` SHA (`git log --oneline -3`), `git diff HEAD~1 -- apps/web/content/site/siteSettings.json`, Cloudflare `Workers & Pages → Deployments` status + log, `node scripts/check-content-trust.mjs && pnpm run check-seo` PASS, headed `playwright_snapshot` of `/` footer showing sentinel + `cf-ray`.

4. **Do NOT invent SHA/screenshots/deployment success** — commit the filled evidence as appendix to `FINAL_READINESS_REPORT.md` or `artifacts/receipts/<date>-hitl-evidence.md` with timestamps, commit SHA, `CF-RAY`, and `TinaCloud Site URL (test): <url>` copied verbatim from dashboard.

---

## 9. Evidence log (commands + outputs — VERIFIED)

```
# 2026-09-17T23:36:55
npx -y @playwright/mcp@0.0.81 --version → Version 0.0.81 EXIT:0
Test-Path .pw-mcp-profile → False
Get-Content opencode.json at ff89302 → {"$schema":...,"username":"ukbt-agent"} (no mcp)
Get-Content .gitignore → no pw-mcp line
Test-Path apps/web/public/admin → True; Get-Content index.html → <title>TinaCMS</title> 2290 bytes
Get-ChildItem dist/client/admin → assets, index.html, bridge.js
git rev-parse HEAD → ff8930261c4b5742cb312c4a28232603a0dd45ad
curl.exe -I ...workers.dev/admin → 307 → /admin/ (CSP frame-ancestors allowlist VERIFIED)
curl.exe -I ...workers.dev/admin/ → 200 OK CF-RAY a3c9e07cadb22ae6-SIN CF-Cache-Status HIT
curl.exe -s ...workers.dev/admin/ → <script src="/admin/assets/index-DLwx0yB0.js">
curl.exe -I ...workers.dev/ → 200 OK CF-RAY a3c9e06d1f8f2ae6-SIN
curl.exe -I ukbanglatigers.co.uk/admin → 307
git status --short → ?? apps/web/public/admin/ + ?? docs/superpowers/
wrangler.jsonc Select-String kv_namespaces → 0 hits (MISSING VERIFIED)
```

---

*Receipt written 2026-09-17T23:37:15+06:00 — worktree ff89302 — browser MCP fetchable (0.0.81) but opencode.json harness MISSING (copy from sibling required) — local admin build VERIFIED — production workers.dev /admin VERIFIED reachable (200) — flow Steps 1-10 UNKNOWN/BLOCKED awaiting human-headed headed session via opencode with --headless false (default) + human-approves playwright_navigate to <site>/admin. No SHA, screenshot, or deployment success invented. Commit: docs(tina): P0-2 HITL execution receipt (blocked awaiting human)*

