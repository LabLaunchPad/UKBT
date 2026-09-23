# P0 Evidence Decision — 2026-09-22

Date (UTC): 2026-09-22. Repo: `C:\UKBT- latest\UKBT` on `main`, HEAD `e544985322376dead374106f3b9c5f1b58e43614`.
Mode: consolidation only. No app-code edits. No tracked modifications except this file + decision-report.md.
Binding: LIVE=BARE (Task 1); Site URLs UNKNOWN (Task 2); 403 CAUSE=UNKNOWN; secrets never printed; no new hypotheses; allowed verdicts only.

## 1. CURRENT RELEASE STATE

RELEASE_STATE=BLOCKED_EXTERNAL

Rationale: internal CI build/gates green except smoke; live origin BARE (fixed); About stored+render working; hygiene non-blocking. Remaining certs require external authorities: TinaCloud-owner Site URLs screenshot (UNKNOWN), Cloudflare-owner edge evidence (token EMPTY), human-E2E Save/Revert (deferred by plan).

## 2. P0 MATRIX

| P0 | Claim | Status | Evidence | Confidence | Owner Action |
|---|---|---|---|---|---|
| live-admin-origin | Live bundle bakes trailing-slash origin | BARE (corrected) | Task 1 F1–F5 2026-09-22T17:32–17:34Z: 3× `["https://ukbanglatigers.co.uk"]` OFF 23704/32750/36956; zero `adminOrigin…co.uk/`; bridge.js param-default only | HIGH | None |
| TinaCloud-Site-URLs | Dashboard lists exact prod + local origins | UNKNOWN | Task 2: `app.tina.io` behind auth; no creds; login forbidden; docs `docs/tina-integration.md` step 5 is intent not truth; clientId `fe5da197…` proves project exists only | HIGH (in UNKNOWN) | Screenshot Configuration tab literal entries + saved-state + timestamp (Task 2 §6) |
| production-403 | 2026-09-19 5×403 cause identified | HTTP_403 VERIFIED; CAUSE UNKNOWN | Verbatim smoke log 2026-09-19T19:08:29Z run 35463035934, BUILD_ID `e544985` matched; fresh 2026-09-22 both UAs → 200 HIT, POST hero → 404 (different content-type, not like-for-like) | High (occurrence + non-reproduction); Low (mechanism) | Header-capture smoke re-run once (unmodified); if 403 recurs, zone-owner Security Events lookup by Ray ID |
| Tina-Save-Revert | Save-Revert E2E proven | NOT ATTEMPTED — HUMAN_REQUIRED (deferred) | Ledger ruling: plan says DO NOT EXECUTE human E2E yet; no browser/session evidence | HIGH (in deferral) | Human E2E only after Site URLs VERIFIED |
| non-skipped-build | CI build + gates green, deploy wired | VERIFIED: 17 jobs success; smoke failure; workers-deploy skipped | `gh run view 35463035934`: deploy skipped, smoke failure step `smoke-deploy.mjs … --expect-sha e544985… --wait-secs 600`; Task 0 §2.3 | HIGH | None; re-run only after external evidence |
| About-storyBody | storyBody carries FAQ `invalid_markdown` risk | PROVEN_WORKING (stored-shape + render path) | `about.json:3-8` valid Slate (no wrapper); loader `z.unknown().optional()` pass-through; `AboutStory.astro:32-40` unwrap guard; live `/about/` 200 both paragraphs, no `[object Object]` | High (stored/render); save round-trip uncovered | Optional single editor save round-trip OR migrate-to-string decision only — no code now |
| Workers-authority | Production gated by repo CI | INDEPENDENT-YES (fail-open); dashboard side UNKNOWN | Task 7: `WORKERS_DEPLOY_VIA_CI` ABSENT ⇒ gate cannot fire; run shows deploy skipped yet BUILD_ID live; `wrangler.jsonc` has no `vars`; GH secrets `CLOUDFLARE_ACCOUNT_ID/TOKEN`, `TINA_TOKEN` PRESENT, vars present, values not printed; local `$env:CLOUDFLARE_API_TOKEN` empty | HIGH | Owner deploy-path decision; no edge/WAF change now |
| workspace-hygiene | Untracked files block release | CLASSIFIED KEEP-ALL; non-blocking | Task 8: 8× `??` (`.agents/`, `skills-lock.json` TOOLING; 5 docs EVIDENCE; 2× `artifacts/audit/20260922-*` active P0 EVIDENCE); no app/CI imports; zero deletions | HIGH | Post-P0 batch track/ignore/remove by owner; retain audit pair unconditionally |

## 3. VERIFIED VS HYPOTHESIS

Proven facts: HEAD `e544985` on `main`, untracked-only status; run 35463035934 failure = smoke FAIL (5×403 verbatim) with 17 green, deploy skipped; GH `PUBLIC_TINA_ADMIN_ORIGIN=https://ukbanglatigers.co.uk`; live adminOrigin BARE in all 3 blocks; live `/` 200 / `/about/` 200 / 404-probe 404 / `/admin/` 200 (2026-09-22); BUILD_ID `e544985` in CI log + live `/sw.js` (identity only); `about.json` valid Slate + live render clean; `WORKERS_DEPLOY_VIA_CI` ABSENT; local Cloudflare token empty.
Plausible hypotheses (not verdicts): content-type/route-matching guard explains POST-hero 404-vs-403 difference; transient edge-policy window explains same-run 200s + later 200s vs 19:08Z 403s — neither proven, no arrow drawn.
Unresolved: TinaCloud Site URLs list; 403 mechanism (edge evidence unavailable); Save-Revert round-trip; dashboard Build Vars/Secrets; post-purge MISS-body confirmation of `/`.

## 4. ROOT-CAUSE GRAPH

Observed failure: smoke 2026-09-19T19:08:29Z 5×403 (`/`, `/about`, 404-probe, POST hero, `/admin/`) against identity-verified BUILD_ID `e544985` → verified mechanism: NONE PROVEN (CAUSE=UNKNOWN; no edge/Worker log; smoke records status only) → contributing factors (evidence-bounded, not causes): deploy-path independence (red CI still ships, Task 7); UA/ASN-persistent-block contradicted by same-run `/favicon.svg` 200 + CSP/nosniff on `GET /` + 2026-09-22 both-UAs 200; island content-type mismatch (`x-tina-preview+json` vs `application/json` probe) keeps guard/route-matching as candidate only → remediation authority: Cloudflare-zone owner (Security Events by Ray ID) + repo (header-capture re-run only) — no WAF/Bot/whitelist change without Ray-ID evidence.

## 5. EXTERNAL ACTION GRAPH

- Repo/CI: header-capture unmodified smoke re-run once (partially automatable); publish this decision; no code, no gate weakening.
- Cloudflare-owner: inspect Security Events for Ray IDs only if 403 recurs; deploy-path decision (`WORKERS_DEPLOY_VIA_CI` + token provisioning + disconnect Builds vs keep); no edge change now.
- TinaCloud-owner: Site URLs screenshot + saved-state + timestamp (Task 2 §6); no login from this environment.
- Human-E2E: Save/Revert round-trip (About `storyBody` + FAQ) only after Site URLs VERIFIED; explicitly deferred until then.

## 6. NEXT SINGLE EXECUTION STEP

Obtain the TinaCloud-owner Site URLs screenshot (project `fe5da197…` → Configuration tab, literal `https://ukbanglatigers.co.uk` + `http://localhost:4321` entries, saved-state + timestamp) — unblocks Tina-Save-Revert certification; request only, no login from this environment.

## 7. RELEASE-CONTROL FINDING

1. Deploy without CI checks? YES — Workers Builds git-connected publishes on main merge independently (BUILD_ID live despite red run).
2. `workers-deploy` (CI-gated) required? NO — currently inert (`WORKERS_DEPLOY_VIA_CI` ABSENT, run shows skipped).
3. Smoke required / merge-blocking? NO — post-merge observe-only by design (`needs: [build, workers-deploy]`, `if: push && !failure() && !cancelled()`), does not gate the publish it checks.
4. Red smoke can coexist with release? YES — demonstrated by run 35463035934 (failure + live BUILD_ID).
5. Two authorities? YES — repo/CI vs dashboard (Worker connection + Build Vars/Secrets authoritative, unverifiable from repo+gh).
6. Fail-closed? NO — fail-open: red-CI merge still ships. Finding: release governance must treat smoke as detector, not gate, until deploy-path decision closes the bypass.

## 8. ADAPTIVE LEARNING (provisional, pending catalog-ID check — no dup claimed)

- AL-NEXT-01 (provisional): observation HIT with correct bytes (Task 1) → failed assumption "HIT = stale" → durable rule: compare bytes + offsets before claiming staleness; HIT ≠ stale.
- AL-NEXT-02 (provisional): observation same-run 200s beside 403s (Task 3) → failed assumption "uniform edge block" → durable rule: require per-route Ray-ID/header evidence before naming a block mechanism.
- AL-NEXT-03 (provisional): observation runbook URLs ≠ dashboard truth (Tasks 2/7) → failed assumption "repo docs prove external state" → durable rule: dashboard state is UNKNOWN until authenticated read/screenshot; absence-in-file ≠ absent.
- AL-NEXT-04 (provisional): observation BUILD_ID match beside FAIL (Tasks 0/3) → failed assumption "identity = health" → durable rule: BUILD_ID is deployment-identity only, never a pass signal.

## 9. CODE-CHANGE DECISION

NO CODE CHANGE — EXTERNAL BLOCKER

No repo edit justified: origin already BARE live; About stored+render proven (migration would be speculative scope expansion); 403 mechanism unproven (any WAF/app edit would be guessing); remaining certs need TinaCloud-owner screenshot, Cloudflare-owner edge lookup, and deferred human E2E — all outside repo code.
