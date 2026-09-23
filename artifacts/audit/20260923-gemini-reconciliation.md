# Gemini reconciliation — 2026-09-22 input vs current repo + live (T0)

Date (UTC): 2026-09-22. HEAD: `e544985322376dead374106f3b9c5f1b58e43614` + held working state (see TA `progress.md`). Mode: read-only; no code edits; no secrets.
Hierarchy: E0 live > E1 repo > E2 CI > E3 history > E4 platform docs > E5 Gemini. Gemini numbering (GEMINI-001..015) is T0-assigned — the input (`gemini-input.md`) numbers only ISS-001..009; mapping below is explicit so nothing is smuggled.

## Fresh live evidence (E0, this run)

- `GET /` → 200 at 2026-09-22T18:57:48Z. Exactly **ONE** `content-security-policy` response header (single value, 6 stamped `sha256-…` hashes in `script-src`). `Server: cloudflare`, `CF-Cache-Status: HIT`, Ray `a3f3896c2b924cbf-SIN`.
- `GET /admin/` → 200 at 2026-09-22T18:57:56Z. Exactly **ONE** `content-security-policy` header (identical single policy). Body at 2026-09-22T18:58:05Z: 3595 chars, contains `<div id="root"></div>`.
- `GET /admin/bridge.js` → 200 at 2026-09-22T18:59:07Z, 15550 B; `adminOrigin` appears only as a generic default param (`adminOrigin = window.location.origin`), no baked domain.

## Classification table

| ID | Claim (Gemini) | Final | Confidence | Conflict? |
|---|---|---|---|---|
| 001 | Multi-CSP collision (static `_headers` + edge worker both emit CSP, enforced as intersection) blocks iframe/API (ISS-001) | **DISPROVEN-current** | HIGH | Yes — live shows exactly one CSP on `/` and `/admin/`; repo has a single `_headers` authority and no edge worker file; E4 Workers docs: `_headers` is NOT applied to Worker-generated responses, so additive collision is architecturally impossible here |
| 002 | Trailing-slash `PUBLIC_TINA_ADMIN_ORIGIN` fails strict origin check, drops postMessage (ISS-002) | **HISTORICAL (fixed)** | HIGH (fix) | Yes — GH var is bare `https://ukbanglatigers.co.uk` since 2026-09-19T19:26:48Z (E2 baseline); live bundle bakes bare origin in all 3 blocks, zero `adminOrigin…co.uk/` (E0 task-1, 2026-09-22T17:32–17:34Z). Residual normalization hardening is a separate candidate, not a current defect |
| 003 | Island route missing `prerender=false` → POST 405 (ISS-003) | **DISPROVEN-current** | HIGH | Yes — `apps/web/src/pages/tina-island/[name].ts:5` declares `export const prerender = false`; E4 (tina.io + Astro docs) confirms this is the required form. Live island probes return 403/404 by content-type, never 405 |
| 004 | Slate AST interpolated → literal `[object Object]` (ISS-004) | **DISPROVEN-current / HISTORICAL** | HIGH | Yes — FAQ schema is now `string` (`tina/config.ts:263-269`), `faq.json` answers are strings, `FAQSection.astro:50` branches string vs `TinaMarkdown`; About `storyBody` Slate renders via `TinaMarkdown` with unwrap guard (`AboutStory.astro:32-40,59`); live `/about/` clean (E2 P0 decision). Fixed in `883761d, 71c8208, a52a5f3` |
| 005 | Duplicate scoped CSS on island re-renders (ISS-005) | **UNKNOWN** | LOW | No current browser re-render evidence; no CSS-dedup middleware exists in repo (grep empty) — but absence of the remedy is not proof of the defect |
| 006 | Playwright screenshot-only misses layout displacement (ISS-006) | **PARTIALLY_VERIFIED (method gap, not current defect)** | MEDIUM | Partly — the blanket "screenshot-only" is stale: `mobile-ux`, `reference-geometry`, `ukbt-geometry` specs already assert `getBoundingClientRect()/boundingBox()`. Whether they cover the upstream `/admin/` shell is unverified |
| 007 | CI deploys without verifying live edge headers (ISS-007) | **PARTIALLY_VERIFIED (pipeline gap)** | MEDIUM-HIGH | Partly — smoke asserts CSP+nosniff *presence* on `GET /` only (`scripts/smoke-deploy.mjs:166-170`) and records status-only on failures; no single-CSP-count assert, no `/admin/` header assert. The "green deploy + broken live" framing is HISTORICAL (run 35463035934 failed on smoke, deploy skipped) |
| 008 | Responsive/mobile breakage matrix (tablet drawer, mobile overlap/clipping) | **UNKNOWN — flagged for T5** | N/A | No fresh viewport evidence taken in T0; not verified now by design |
| 009 | Architecture = Cloudflare Pages + `_worker.js`/Functions; `src/worker.js` is header authority (§§2/11) | **DISPROVEN** | HIGH | Yes — repo is Workers + `@astrojs/cloudflare` adapter (`apps/web/astro.config.mjs:44`, `output: 'static'`), root `wrangler.jsonc` (`main` + `assets.directory`); `src/worker.js`, `_worker.js`, `functions/` all absent (E1 `Test-Path` False ×7; only `apps/web/public/_headers` tracked). ADR-001/Task A target a file that does not exist |
| 010 | Remedy Task A: centralize CSP in edge Worker proxy, strip static `_headers` (sample CSP carries `unsafe-inline`/`unsafe-eval`) | **REJECTED (premise disproven)** | HIGH | Yes — single CSP already live; stripping `_headers` would remove the only authority; sample CSP weakens policy — DO NOT ADOPT |
| 011 | Remedy Task B: Zod `stripTrailingSlash` normalization | **PARTIALLY_VERIFIED (hardening candidate, not P0)** | MEDIUM | Upstream `admin-origin.ts:12-18` only trims/splits — no slash normalization exists, so the hardening gap is real, but live+var already bare so there is no current defect to fix. T2 candidate only |
| 012 | Remedy Task D: `TinaMarkdown` refactor (FAQ/Body) | **DISPROVEN-current (already done)** | HIGH | Yes — both components already render via `TinaMarkdown` with legacy guards (see 004). No refactor outstanding |
| 013 | Remedy ADR-004: bounding-box visual-regression acceptance | **PARTIALLY_VERIFIED (method gap)** | MEDIUM | Same residual as 006: geometry assertions exist for site pages; admin-shell coverage is the unverified remainder. T7 decision, not a current defect |
| 014 | External blockers: `_headers` 2000-char truncation risk; human OAuth `HUMAN_REQUIRED`; indexing latency | **PARTIALLY_VERIFIED (split)** | MEDIUM | Limits are real (E4: 2000 chars/line, 100 rules) but current max `_headers` line is 602 chars — risk not current. OAuth-human deferral matches plan (E1). Indexing-latency applicability unproven |
| 015 | Schema reindex behavior/claims | **UNKNOWN — owned by TA T8** | N/A | No evidence taken in T0 by design |

## Per-claim evidence detail (compressed)

- **001.** Current repo: `apps/web/public/_headers:15` single `Content-Security-Policy` (no `/admin/*` override; `f7122d1` reverted the inert scoped block). Current live: one CSP each on `/`, `/admin/` (this run). Historical: `6e3f8f2` (island/document/CSP boundaries), `2e8f715`. E4: Workers `_headers` applies to static-asset responses only, never Worker-code responses. Action: none; T2 asserts single-CSP in regression.
- **002.** Current repo: origin consumed only via upstream `adminOrigins()` (`apps/web/node_modules/@tinacms/astro/src/internal/admin-origin.ts:6-19`); `.env.example` leaves `PUBLIC_TINA_ADMIN_ORIGIN` empty (local default). Current live: BARE (task-1 F1–F5). Historical: none needed — fixed at var level 2026-09-19. Action: T2 may propose `stripTrailingSlash` hardening as a NEW candidate, never as a P0 fix.
- **003.** File read verbatim (6 lines, flag at line 5). E4 tina.io: "This route must have prerendering disabled"; Astro docs: per-route opt-out requires an adapter — present (`astro.config.mjs:44`). Action: none; island runtime owned by T3.
- **004.** Schema + content + renderer agree on strings for FAQ; About Slate path guarded and TinaMarkdown-rendered. Live `/about/` 200 clean. Action: none; T4 covers only proven-broken residuals, save round-trip deferred per plan.
- **005.** Action: T7 to observe island re-render `<style>` behavior during refresh tests; no fix now.
- **006/013.** Action: T7 audits admin-shell geometry coverage; no site-spec rework presumed.
- **007.** Action: T7/T9 may add single-CSP-count + `/admin/` header asserts; no code now.
- **008.** Action: T5 reproduces first; no blind CSS.
- **009/010.** Action: T1 restates Workers architecture; ADR-001/Task A must not proceed on the Pages premise.
- **011.** Action: T2 candidate only.
- **012.** Action: none.
- **014.** Action: none now; T8 owns indexing/OAuth-boundary questions.
- **015.** Action: T8.

## Counts

2 VERIFIED-or-fixed-adjacent (002 HISTORICAL-fixed counts as resolved; 014 partial) — in the required terms: **0 VERIFIED current-defect, 5 DISPROVEN-current (001, 003, 004, 009, 012) + 1 REJECTED remedy (010), 5 PARTIALLY_VERIFIED (006, 007, 011, 013, 014-split), 1 HISTORICAL-fixed (002), 3 UNKNOWN (005, 008, 015)**.

## Risks / concerns

- Live `/admin/` asset hash (`index-DswcyTjG.js`) differs from repo `public/admin/index.html` (`index-LQnB6IK5.js`) — build drift noted, out of T0 scope, flagged for T1/T8.
- Smoke 403 CAUSE remains UNKNOWN per `20260922-smoke-403-root-cause.md`; nothing in Gemini input resolves it — no edge change authorized on that basis.
- `astro build` is KNOWN-RED by design (TA progress.md); T0 made no build claims.
