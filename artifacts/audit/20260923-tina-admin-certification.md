# Tina Admin Certification — T11 §33 (A–S)

Date (UTC): 2026-09-23
BASE: `e544985322376dead374106f3b9c5f1b58e43614`
HEAD: `e544985322376dead374106f3b9c5f1b58e43614` (main, Merge PR #95; held working state uncommitted — 11M + untracked `publish.ts`/`publish.test.ts`/`adr-001`/`tina-layered.spec.ts` per `progress.md`)
Branch: `main`
Evidence pointers: `artifacts/audit/20260923-gemini-reconciliation.md` (T0), `artifacts/audit/20260923-tina-admin-closure.md` (T11 §31), `artifacts/audit/20260923-tina-admin-issue-register.md` (T11 §32), `artifacts/audit/20260922-p0-evidence-decision.md`, `artifacts/audit/20260922-smoke-403-root-cause.md`, `.superpowers/sdd/2026-09-23-tina-admin-closure/{progress.md,plan.md,decisions.md,task-00-current-architecture.md,task-T*.md}`, live `https://ukbanglatigers.co.uk` 2026-09-22T18:57–22:06Z

## A — Scope & mandatories

**Scope:** Tina Admin closure (Gemini 2026-09-22 input §§1-19 + roadmap `gemini-input.md`, 15 Gemini hypotheses GEMINI-001..015 mapped to ISS-001..009). Tina-boundary only per §§21-23/§36; P0 Tasks 3–13 paused during TA; broader truth/release (`U-22`/`U-23` migration, new field `moat`, `publish.ts` lifecycle) deferred to NEW task post-cert. **Mandatories ( §§0/35 binding):** no blind Gemini, `UNKNOWN` stays `UNKNOWN`, no CSP/gate weakening, no runner allowlists without proven rule, no simulated Save, no secrets, smallest bounded fix. **Anti-drift:** `E0 live > E1 repo > E2 CI > E3 history > E4 docs > E5 Gemini`; review-package = `BASE HEAD` (`progress.md` + `task-T*/report.md`).

**Verdict:** VERIFIED — scope preserved; plan max 5 fix rounds (R4-5 fresh implementer) respected; evidence hierarchy enforced T0–T10.

## B — BASE / HEAD / provenance

BASE `e544985322376dead374106f3b9c5f1b58e43614` (Merge PR #95 `fix/tina-contract-alignment`) at `.superpowers/sdd/2026-09-23-tina-admin-closure/progress.md:1` + all `task-T*.md` headers. HEAD equals BASE (branch `main`, normal checkout; `git rev-parse HEAD` 22:05Z `e544985`). Held state: `git status --short` 22:05Z 11M tracked (`M AGENTS.md`, `M apps/web/src/components/ClubIntro.astro`, `M apps/web/tests/visual/mobile-ux.spec.ts`, `M 7× *-data.ts` `isPublishable` split, `M packages/truth/src/gate/index.ts`, +2×Task2) + untracked `packages/truth/src/gate/publish.ts`/`publish.test.ts`, `docs/adr-001-truth-lifecycle-publish.md`, `apps/web/tests/visual/tina-layered.spec.ts` (326 lines), audit files (`20260922-*`, `20260923-gemini-reconciliation.md`) — per `progress.md` + T10 §3 governance check. Files `tina/__generated__/` + `apps/web/dist/` + `apps/web/public/admin` remain gitignored by design.

**Verdict:** VERIFIED_WITH_LIMITATIONS — BASE/HEAD pinned; held state must be squashed-re-approved before commit (file-scope contract per `knowledge/12-AI-CONTROL-PLANE.yaml`).

## C — Evidence hierarchy & classification

Hierarchy enforced per `knowledge/04-EVIDENCE-POLICY.yaml`: E0 fresh `curl -D` single-shot per URL (timestamps cited §§ J/Q/R), E1 repo/installed reads (`file:line`), E2 CI (`ci.yml`, run `35463035934`), E3 git history (`883761d/a52a5f3/6e3f8f2/f7122d1`), E4 Context7/Workers docs. Claims tagged `VERIFIED` (live 1 CSP, 11/11 matrix, island 405/404/403), `DERIVED` (gate logic), `STATED_BUT_UNVERIFIED` (none published), `UNTESTABLE-authenticated` (editor DOM), `UNKNOWN` (live reindex, indexing sync). Disproven rows never fixed (Task A/010 rejected).

**Verdict:** VERIFIED.

## D — Gemini disposition (15 Gemini hypotheses)

Rollup per `20260923-gemini-reconciliation.md` (T0): 0 current-defect VERIFIED, 5 DISPROVEN-current (001 multi-CSP, 003 prerender flag, 004 Slate object, 009 Pages architecture, 012 TinaMarkdown), 1 REJECTED remedy (010 Worker proxy), 1 HISTORICAL-fixed (002 trailing-slash), 5 PARTIALLY_VERIFIED method/candidate gaps (006 screenshot-only, 007 smoke presence-only, 011 `stripTrailingSlash`, 013 bounding-box availability, 014-split 2000-char line/100-rule), 3 UNKNOWN (005 duplicate CSS, 008 responsive, 015 reindex). Each `GEMINI-00x` row in `issue-register.md` carries `Evidence | Fix | Verification | External`.

**Verdict:** VERIFIED — reconciliation is the gate; no Gemini P0 requires code (Task A/010 must not proceed per `decisions.md`).

## E — Architecture truth (Workers, not Pages)

Repo delivers to Cloudflare **Workers with static assets** (`wrangler.jsonc:38` `main: ./apps/web/dist/server/entry.mjs`, `:40-42` `assets.binding ASSETS` + `directory ./apps/web/dist/client` + `not_found_handling 404-page`; `apps/web/astro.config.mjs:15` `output:'static'` + `:44` `adapter: cloudflare()` + `:9` `tina()`). Proofs: `Test-Path src/worker.js/_worker.js/functions` FALSE ×7, `git ls-files` shows only `apps/web/public/_headers`, `tina/__generated__/client.ts` 22:06Z dummy. Island `tina-island/[name].ts:5-6` `prerender=false` + `ALL:APIRoute` is the sole server route; `no middleware.ts`; TinaCloud `app.tina.io` popup auth only. Drift: `wrangler.jsonc` `ukbt-uk-bangla-tigers` compat `2026-09-14` vs `dist/server/wrangler.json` `ukbt-web` compat `2026-08-25` — root overrides on `wrangler deploy` from root, but dashboard display needs human parity check (T1 §2.1 + T8-C).

**Verdict:** VERIFIED_WITH_LIMITATIONS — Workers proof chain complete; `adr-001` must not re-target `src/worker.js`.

## F — Security: CSP (single-source)

Live `GET /` 2026-09-22T18:57:48Z + `HEAD /` 19:24:05Z + `GET /admin/` 19:24:29Z + `GET /admin/bridge.js` 19:25:05Z + T8 21:43Z 8-probe + T10 22:05:54Z — each static response **exactly 1** `content-security-policy` (case-insensitive count), `single _headers` `apps/web/public/_headers:15` (`__UKBT_CSP_SCRIPT_HASHES__` → 6 sha256 `8oMiKk… Iyjd6… eE9wx… u6B3Kd… v47l… zgMgx…` stamped via `scripts/stamp-csp.mjs`), `frame-ancestors 'self' https://*.tina.io https://app.tina.io https://*.tinajs.io`, no `X-Frame-Options` by intent (`_headers:7-10`), `style-src 'unsafe-inline'` preserved. Worker island `POST /tina-island/*` carries **zero CSP** (`no-store` + `NEL/Report-To` only) — `_headers` static-only per Workers docs, payload is same-origin `fetch`+`innerHTML` swap never framed (T2 boundary, not a defect). No `unsafe-eval` added.

**Verdict:** VERIFIED_WITH_LIMITATIONS — CSP correct live; `dist/client/_headers` locally **unstamped** (literal placeholder) — `check-security` correctly FAILs (LIM: stale `dist` not deployed).

## G — Security: origin & bridge (strict equality + `event.source`)

GH `PUBLIC_TINA_ADMIN_ORIGIN` bare `https://ukbanglatigers.co.uk` (2026-09-19T19:26:48Z, E2 baseline); live `/` 3× `adminOrigin = ["https://ukbanglatigers.co.uk"]` bare zero slash (T1 F1–F5, T2 bake, T8 re-confirm). Upstream `apps/web/node_modules/@tinacms/astro/src/internal/admin-origin.ts` `split(',').trim.filter(Boolean)` + `node_modules/@tinacms/bridge@0.3.1/dist/index.js` (15550 B stock, live `/admin/bridge.js`) `isFromAdmin = includes(event.origin) && source===window.parent` with `window.location.origin` fallback. **11/11 adversarial matrix PASS** (1 ACCEPT legit + 10 REJECT: trailing-slash/localhost/preview/evil-sub/http/port/lookalike/null/malformed/wrong-source).

**Verdict:** VERIFIED — no `stripTrailingSlash` code needed now (hardening candidate, fails closed); no CSP/origin weakening performed.

## H — Island runtime (route, swap, gates)

`apps/web/src/pages/tina-island/[name].ts` 6 lines `experimental_createIslandRoute(islands)` + `prerender=false` + `ALL` — all runtime in `@tinacms/astro` `island-route.ts`. **Swap-keying PROVEN** `data-tina-island` (`ISLAND_SELECTOR [data-tina-island]`, `refreshIsland` → `endpoint /tina-island/<name>` → `swapIslandHtml` keeps tag + copies `class/id/data-tina-*` + `innerHTML`) — T1 §1.4 empty `className` on `about.astro:74,94,128`/`faq.astro:38` vs registry `islands.ts:113/133/155/169` **BENIGN** (zero CSS refs to `ukbt-*-island`). **Gates 9/9:** `rejectIfUnsafe` GET→405, wrong `Content-Type`→404, unknown→404, valid `application/x-tina-preview+json`→200 `text/html no-store` (FAQ 1967B `ukbt-faq-island`), `Sec-Fetch-Site: cross-site`→403, large/malformed inert (body never parsed), evil `Origin`→200 public-only (no `Origin` check by design, CSRF via preflighted CT + `sec-fetch-site`). Dev hero 500 (401 fail-closed) vs live 200 proves degraded gap only.

**Verdict:** VERIFIED_WITH_LIMITATIONS — no repo-side origin/payload guard added (would be new primitive beyond smallest fix); `prerender` untouched.

## I — Content / rich-text (T4 §13 — no `[object Object]`)

`about.storyBody` (`tina/config.ts:181` `rich-text`) stored Slate root object valid, loader `z.unknown()` `validateWithPreserve`, renderer `AboutStory.astro:59` `TinaMarkdown`+`normalizeRichText` identity — live `/about` 2 paragraphs verbatim. `faq.items.answer` (FAQ string migration `883761d/a52a5f3` ≤e544985, `tina/config.ts:263-269` + `loaders.ts` `z.string()`) — `faq.json` 3 strings, renderer `FAQSection.astro:50` string branch `<p>`, live `/faq` full raw HTML 3× `<div class="ukbt-faq-answer"><p>` zero `object Object`. `renderFaqAnswer` dormant (0 importers). P2s deferred: `about.json:7` mojibake `�?"` (OWNER copy decision), latent `invalid_markdown` string hand-off unreachable (do not fix speculatively). `check-content-trust` PASS, `packages/truth` 35/35.

**Verdict:** VERIFIED_WITH_LIMITATIONS — renders clean current content; no new tests/authoring needed (apps/web has no vitest); `astro build` not run (KNOWN-RED §B).

## J — Visual / responsive (T5 §14)

`sweep pnpm dev 127.0.0.1:4321 + Playwright chromium-1234` 28 loads (7 viewports 1920/1440/1366/1024/768/430/375 × 4 routes) + 6 focused `/admin/` shell probes. `overflowX = documentElement.scrollWidth - innerWidth == 0` on all 28 (incl `/admin/` at 430/375); nav geometry 1920: `HEADER relative z=20` NAV `static`, ≤1024: `sticky z=20` (h 140/88) hamburger `Open navigation menu`; markers `/` 13 `/about` 1 `/faq` 6 vs `/admin/` 0; rect intersection kept markers↔header 0 overlaps every width (C1 absolute-navbar claim contradicted → **NOT-REPRODUCED**). Admin unauth shell: `Let's get you editing` login overlay, 5 clickables all in-viewport. C2 Save-clipped/C3 drawer 40%/C4 modal-clip & Save off-screen → **UNTESTABLE-authenticated** (forms/modal/Save need TinaCloud seat) — reachable inventory clean. Dev-500 6/28 (401 cascade under rapid load) documented; retry-then-record guidance pinned.

**Verdict:** VERIFIED_WITH_LIMITATIONS — no CSS/z-index/drawer change on this evidence; authenticated overlay remains HUMAN_REQUIRED post-login.

## K — Accessibility (T6 §16 — config vs upstream attribution)

`pnpm dev` + `@axe-core/playwright 4.10.1` `wcag2a/wcag2aa/wcag22aa/best-practice` at 1280×800 + 390×844 via `t6-tmp/t6-playwright.config.mjs` reuse: `/` 0/0, `/about` 0 after retry (empty HTML false-positive on transient 500 correctly retried), `/faq` 0/0 (`tinaFields 6`), `/admin/` unauth `inputs[] dialogs[]` axe `[].passes 17` 0/0 (customer-SPA, no controls to label). §16 table 18/18 PASS: `aria-label` on brand/dropdown/toggles/drawer `aria-label Site menu aria-modal true`, keyboard Enter/Space/Arrow on dropdown + `<details>` FAQ, drawer focus trap `inert`/`Escape`, `tabindex>0:0`, `color-contrast` 0 via axe (token colors, F3 gold-on-gold already fixed), `target-size` 24×24 AA (50×48 mobile toggle), `prefers-reduced-motion reduce` (0.01ms kill), `data-tina-field` non-focusable. Existing `axe.spec.ts`/`mobile-axe.spec.ts`/`ui-focus.spec.ts` retained as gates. Vendor/admin-editor post-login remains UNTESTABLE-authenticated (config `label`/wrapper enhancement only if later failed).

**Verdict:** VERIFIED_WITH_LIMITATIONS — 0 repo-owned violations on reachable DOM; no wrapper/useless ARIA added (ladder).

## L — Browser / layered regression & performance (T7 §15)

New `apps/web/tests/visual/tina-layered.spec.ts` **326 lines** biome-clean single-file gate — layers L1 screenshot (`buf.length>0`) + L2 relative `getBoundingClientRect` (`scrollWidth<=clientWidth`, marker↔header `!(r.bottom<=hr.top||…)` with `+200` header tolerance, `outOfView right<0||left>vw`) + L3 drawer/dropdown keyboard + L4 axe (homepage `wcag`+`best-practice`, admin `wcag` only for vendor `landmark` exclusion) + L5 `console.error`/`sameOriginFailedRequests` filtered (retain `TypeError|ReferenceError|SyntaxError|Uncaught`, drop expected `401`/identity) + `retry 2× domcontentloaded 2500ms` for transient-500 leniency. **4/4 PASS** 28.5s (desktop 1920×1080 7.6s, mobile 390×844 7.7s, admin shell 5.6s `hasPreviewIframe false` `UNTESTABLE-auth`, negative proof 4.7s). **Negative proof:** injected `fake.overlay` 1920×200 absolute → `overlaps>0` while screenshot still `>0` — proves L2 catches what L1 alone passes. Regression: T9 re-run hit **1 overlap `IMG.ukbt-hero__bg 142,0 1920×938 vs header 142h`** at `tina-layered.spec.ts:324` (was 0 in T7) — **Wave-1 now CLOSED (honest scope fix):** marker-scope exclusion of decorative `.ukbt-hero__bg` in `tina-layered.spec.ts` (2 lines + comment), biome clean, 2× consecutive 4/4 Playwright runs (27.5s + 25.4s, HEAD e544985) — see `task-T7-report.md §10/§10a` (runs STATED_BUT_UNVERIFIED as files); negative proof intact (fake overlay still caught). Perf: `htmlPerPage 72KB cssTotal 60KB jsTotal 48KB` budgets already accommodate Tina bridge 15.5 KB; `_astro/*` immutable + `media/*` 30d verified T8.

**Verdict:** VERIFIED_WITH_LIMITATIONS — layered gate closes ISS-006; line-count `non-empty 326 / total 350` ambiguity noted; geometry baseline regression CLOSED via Wave-1 (see issue register DISCOVERED-002).

## M — Network (T8 §19 — 8-probe single-shot)

Fresh 2026-09-22T21:43Z `https://ukbanglatigers.co.uk`: 1 `/` 200 `CF-Cache-Status: HIT` single CSP, 2 `/admin/` 200 MISS single CSP same 6 sha256, 3 `/admin/bridge.js` 200 `text/javascript` `ETag bfdf…` single CSP, 4 `POST /tina-island/faq` 200 `no-store` `text/html` 1967B `ukbt-faq-island` (zero CSP — Worker boundary correct), 5 `POST /tina-island/hero` 200 `no-store` 7325B `ukbt-hero-island`, 6 `GET /tina-island/faq` 405, 7 `/_astro/homepage-data.BBLv3RM0.css` 200 immutable, 8 `/brand/crest-512.png` 30d media cache — all 200/405 expected. Console warnings: unauth `401` identity resource error per load (environmental, not blocker). Island gating: preview `Content-Type application/x-tina-preview+json` → preflight + `sec-fetch-site` (T3 `rejectIfUnsafe`). No loops, no simulated Save.

**Verdict:** VERIFIED.

## N — Auth / Save boundary (T8 §20 — shell vs Save)

**Observable unauthenticated PASS:** admin shell `GET /admin/` 200 `#root` `index-DswcyTjG.js` + css, `Log in` 103×40 in-viewport, bridge 15550 B, island public-fallback `POST /tina-island/faq` 200 without auth, public pages render truth statics unconditionally. **Requires TinaCloud seat BLOCKED_EXTERNAL:** OAuth `app.tina.io` popup (JWT never enters workspace), Save→`POST` overlay preview swap → GraphQL mutation `browser→TinaCloud` → Git commit to `tina/config.ts:4` branch → Workers Builds or gated `workers-deploy` redeploy. No creds printed, no Save simulated per §35.

**Human Save artifact consumption or BLOCKED_EXTERNAL (5-field `HUMAN_REQUIRED` T8-A):** No owner Save since `e544985` — `git log --oneline -20` still `e544985`, `GET /admin/` hash still `DswcyTjG` (drift §O). **T8-A fields:** (1) project `ukbt-uk-bangla-tigers` `fe5da197…` `TINA_BRANCH=main`, (2) branch `main`, (3) field `faq.items[0].answer` before exact `"Visit the Join page or contact us at info@ukbanglatigers.co.uk. Trials and training details are shared via our social channels."` → after `"<same> — edit 2026-09-23T21:4xZ T8 probe"` (editorial only), (4) commit SHA on `main` (`git log -1`) with `faq.json` diff, (5) deployment (`BUILD_ID` `workers-build-id`) + live `GET /faq` suffix + `/admin/` hash rotation → revert History `e544985`.

**Verdict:** BLOCKED_EXTERNAL — auth boundary correct (fail-closed); consumption awaits TinaCloud owner.

## O — Generation & stale artifacts (T10 §§29 V4–V6/V12)

- `tina/__generated__/client.ts` fallback dummy (`cacheDir ...1789843926875` + `fork-pr-*-fallback` per `ci.yml:31-38`) — live secrets not exposed. `tina-lock.json` 66KB `schema,lookup,graphql` stable (FAQ string) but `tinacms audit` FAILs `about.json value.replace` (audit expects string, loader `z.unknown` correct) — non-gating.
- `dist/` **stale**: `apps/web/dist/client/_headers` still literal `__UKBT_CSP_SCRIPT_HASHES__` (unstamped, would fallback to `script-src 'self'` only) vs live stamped 6 sha256 — `stamp-csp.mjs` is post-`astro build` finalization (blocked by KNOWN-RED).
- `public/admin/index.html:8` `/admin/assets/index-LQnB6IK5.js` vs live `…DswcyTjG.js` (drift CONFIRMED T0→T10 22:05:57Z).
- `tina-layered.spec.ts` untracked (22:06Z) + `t6-tmp/`/`t9-tmp/` gitignored — clean clone lacks gate.
- `tina/tina-lock.json` lock correct (keys `schema,lookup,graphql` only, AGENTS.md).

**Verdict:** VERIFIED_WITH_LIMITATIONS — `dist` must not be deployed until post-`astro build` stamp; drift reconciles via T8-C.

## P — CI / quality gates (T9 §28 suites 6)

`pnpm lint` `Checked 86 files 290ms No fixes` **PASS**; `packages/truth` `tsc --noEmit` **PASS** (web full `tsc` SKIP via KNOWN-RED); `packages/truth` vitest **35/35** `rules 13 content-types 9 publish 13` **PASS**; `check-content-trust.mjs` **PASS**; `check-deploy-mapping.mjs` **FAIL** (`index.html absent`, `404.html absent` — adapter `client/`+`server/entry.mjs` split while build red) — expected; `check-security.mjs` **FAIL** (`csp-unstamped` + inline hash missing — stale `dist`) — correctly blocking; smoke via T8 probes **PASS** cited. `tina audit` FAIL (see O) non-blocking. Suite 6: 4 PASS /2 FAIL (build-dependent) /1 SKIP.

**Verdict:** VERIFIED_WITH_LIMITATIONS — lint/unit/truth gates green; build-dependent gates expected-red while `pending_review` holds.

## Q — Release / deploy path (T8 §22 + `20260922-smoke-403-root-cause.md`)

Wiring `ci.yml:385` `workers-deploy` `needs: [build,deploy-mapping,…,visual]` + `if: push && ref==main && vars.WORKERS_DEPLOY_VIA_CI=='true'` → while unset **skipped honest absence** (same as `smoke-verify` `push && !failure() && !cancelled()`). Comment `ci.yml:360-382`: git-connected **Workers Builds** publishes on every `main` merge **independently of CI** while flag unset — red-CI still ships. Evidence: run `35463035934` (2026-09-19T19:08:29Z) `SMOKE_STATUS FAIL` 5×403 (`/`, `/about`, `404-probe`, `POST hero`, `/admin/` all 403 at correct `BUILD_ID e544985`; same-run `/favicon.svg` 200 + CSP/nosniff present) vs 2026-09-22T17:44Z + 18:57–22:05Z `GET /` 200 `HIT` `a3f31d…-SIN` both UAs `GitHub-Actions` — `CAUSE=UNKNOWN`, `EDGE_EVIDENCE UNAVAILABLE` (`CLOUDFLARE_API_TOKEN` empty). `BUILD_ID`/live SHA drift `DswcyTjG` vs `LQnB6IK5` proves independent path.

**Answer to "can Tina Save deploy independently of repo CI cert?":** **YES** (recorded as dependency; T1 route-graph: Save→commit→Builds; CI gates are not a pre-publish gate for Builds). `check-release-path.mjs` asserts wiring, not exclusivity.

**Verdict:** VERIFIED_WITH_LIMITATIONS — duality documented; closing it requires Cloudflare-owner deploy-path decision (one path, gated via `workers-deploy` with `CLOUDFLARE_API_TOKEN`).

## R — Truth / provenance enforcement (§23 minimal + T10 V2/V14/V18)

**Static path (guarded):** `packages/truth/src/gate/publish.ts:18-50` `isPublishable` fail-closed (`environment='production'` + `status approved/published` + named approver) + 7 `*-data.ts` `import.meta.env.PROD ? isPublishable : evaluate` throw on `pending_review` — verified by forcing `NODE_ENV=production astro build` KNOWN-RED (§B). Real `apps/web/content/*.json` record validation at module load (`ContentRecordSchema.parse` + `evaluate`).

**Island path (candidate bypass — T10 V2 HIGHLIGHTED):** `apps/web/src/lib/tina/islands.ts:12-62` fetchers `requestWithMetadata` + `validateWithPreserve(Zod)` only — **zero** `evaluate`/`isPublishable`/`ContentRecord` provenance check, `propsFromData` maps `d.*` directly to components. Live `POST /tina-island/faq` 200 public HTML 22:06:04Z even though record would fail prod `isPublishable`; `GET` 405 / wrong-CT 404 / `Sec-Fetch-Site: cross-site` 403 / malformed 200 (body never parsed per `island-route.ts:81-93`) / `Origin: https://evil.example` 200 public-only 22:06:21Z (no Origin check, CSRF via preflight CT — safe but diverging). Dev hero 401→500 vs live 200 confirms unauthorized exposure. Bridge `swapIslandHtml` (`@tinacms/bridge`) then swaps preview without re-running gate — **preview bypass by design**, unauthenticated POST makes it observable.

**Gap to post-cert:** Adding `isPublishable`-aware filtering in `islands.ts` (preview env passes, prod filters) or restricting island POST to authenticated editor origin — needs NEW task per `knowledge/12-AI-CONTROL-PLANE.yaml` + held-state scope rule; not a TA P0 blocker, but it means **islands are not a truth peer of static pages until that task closes**. Recommendation: **do not put truth-sensitive fields on Tina islands** until V2 closed. Content classification editorial (headline/CTA/FAQ/about copy) vs truth-sensitive (players/stats/dates/org claims) remains enforced on static path.

**`--skip-cloud-checks` & search:** `package.json:18` + `ci.yml:160,272` `tinacms build --skip-cloud-checks --skip-search-index` **must stay** (T8-B). Reindex state UNKNOWN without `TINA_TOKEN`; no dry-run without secrets. **T8-B HUMAN_REQUIRED:** dashboard Reindex→`Complete` + `pnpm exec tinacms build --skip-search-index` (without `--skip-cloud-checks`, with `PUBLIC_TINA_CLIENT_ID`/`TINA_TOKEN`/`TINA_BRANCH=main`) exit 0 + `git diff tina/tina-lock.json` stable (FAQ `answer: String`) before removing `--skip-cloud-checks` alone (keep `--skip-search-index` unless search re-enabled per `tina/config.ts:20`). `docs/tina-integration.md` runbook owns this.

**U-22/U-23 migration:** Broader truth lifecycle (new field `moat`, domain-wide `publish.ts` + `U-22/U-23` plan `artifacts/ukbt-20-iteration-deep-plan.md` + `artifacts/tina-20-iteration-plan.md`) explicitly deferred post-cert per §36 + T8 §7 (see issue-register `DISCOVERED-021`).

**Verdict:** VERIFIED_WITH_LIMITATIONS — FAQ string (`about.storyBody` Slate→`TinaMarkdown` unwrapping) shows `can_tina_bypass_pending_review = NO` via **static escaped text sink**; island PREVIEW path is `YES` via unauthenticated side-channel (P1 V2 deferred).

## S — Verdict

**Verdict (one of three per §33):** `TINACMS_ADMIN_CLOSED_WITH_EXTERNAL_BLOCKERS`

(TA closure packages are artifacts-only; no commit — `0 diff` except this artifact triple.)

- **Meets `READY_FOR_NEXT_TASK` on:** Tina Admin CSP single-source proven (1 CSP, 6 sha256, `frame-ancestors`), origin strict 11/11 + `event.source` proven, bridge 15550 B gated by preview `Content-Type` + `sec-fetch-site`, island `ALL` handler `prerender=false` + 9/9 gate matrix, rich-text 0 `[object Object]` live, visual `C1 NOT-REPRODUCED` + reachable `overflowX 0` + 0 marker↔nav overlaps, a11y 0 violations repo-owned, layered L1-L5 gate with negative proof, 8-probe single-source network, auth boundary fail-closed shell vs Save, parity `PASS`, live `200`s stable — all `GEMINI-00x` disproved/rejected/gapped, held STATE scoped per plan.

- **Blocked by HUMAN_REQUIRED externals, so `NOT_CLOSED` is not justified either:**
  - **T8-A** Save artifact (project `ukbt-uk-bangla-tigers` `fe5da197…`, branch `main`, `faq.items[0].answer` before→`“… — edit 2026-09-23T21:4xZ”` after, commit SHA, deployment+live+revert `BUILD_ID`/live SHA).
  - **T8-B** Dashboard Reindex + clean `tinacms build --skip-search-index` + `git diff lock` stable before un-skipping `--skip-cloud-checks`.
  - **T8-C** Drift reconcile — owner push/Save so Builds publishes repo `LQnB6IK5` over live `DswcyTjG`, report `BUILD_ID`/live SHA (single-source after gate green).
  - **T8-D** Post-login authenticated sweep (T5 overlay stacking at 1920 + Save/Cancel 1366–1440 with table payload; T6 labels/contrast/modal) — record only.
  - **V2** post-cert NEW task — P1 island preview bypass (`POST /tina-island/*` unauth) mirrors `publish.ts` divergence (§R) before Tina truth lifecycle settled; must close before putting truth-sensitive fields on islands.
  - **U-22/U-23 migration** — full Tina-boundary truth lifecycle broader than TA §23 owns (knowledge `knowledge/09-AGENT-HARNESS-POLICY.yaml` etc.); tracked at `artifacts/tina-20-iteration-plan.md`/`artifacts/ukbt-20-iteration-deep-plan.md`, deferred per §36.

**Evidence hierarchy attested:** `E0 2026-09-22T18:57–22:06Z > E1 repo @ e544985 > E2 run 35463035934 > E3 883761d/a52a5f3/f7122d1 > E4 Workers/tina.io llms.txt`. No training-data claims presented as verified; `UNKNOWN` (reindex live sync, authenticated overlay, BUILD_ID header vs dashboard) stays UNKNOWN; no gate weakening; no whitelist/edge change without Ray-ID evidence.

**References (selected):** `tina/config.ts:4,8,20-30,40,169,233,263-269` `apps/web/astro.config.mjs:15,44` `wrangler.jsonc:35-42` `apps/web/public/_headers:15` `apps/web/src/pages/tina-island/[name].ts:5-6` `apps/web/src/lib/tina/islands.ts` `apps/web/src/lib/tina/loaders.ts` `packages/truth/src/gate/publish.ts:18-50` `scripts/stamp-csp.mjs:1-12` `scripts/check-tina-field-parity.mjs` `scripts/check-security.mjs` `scripts/check-deploy-mapping.mjs` `scripts/check-release-path.mjs` `.github/workflows/ci.yml:31-38,160,272,360-410`.

## S-addendum — Wave-2 integration note (2026-09-23, post-cert, transcription only — no re-investigation)

- Direct push to `origin/main` REJECTED by ruleset GH013 (18/18 checks required); no bypass attempted. Integration rerouted as PR #96 (OPEN, MERGEABLE, mergeState BLOCKED), branch `chore/wave2-blocker-closure`, head `9a3f302`, base `main`, commits `648b21e` + `7d81ec6` + `9a3f302` (boundaries per Wave-2 review).
- CI run `35804157789` on PR #96: 9 PASS (Lint, Typecheck, Unit/integration, Control-plane, Dependency-allowlist, Failure-injection, Scaffold, Install, Secret-scan); Build FAIL BY DESIGN with verbatim `Truth gate failed for 'captain.name': T6: status=pending_review is not publishable — production requires approved/published with a named approver` (exit 1); all downstream jobs (deploy-mapping, links, SEO, UI, motion, perf, Playwright, security, smoke, workers-deploy) honest-skips off failed Build; Workers Builds branch entry fail. Live production untouched (PRs don't deploy).
- Local `main` reset to `origin/main` `e544985`; work on `chore/wave2-blocker-closure`; working tree clean tracked.
- Externals: NO owner artifacts arrived (no Save evidence, no reindex proof, no dashboard/deploy-path/U-22-23 evidence) — T8-A/B/C/D, R-GATE-02 creds run, deploy-path decision, U-22/U-23 all remain BLOCKED_EXTERNAL; V2 island preview bypass (§R) remains DEFERRED to NEW task.
- Verdict KEPT: **`TINACMS_ADMIN_CLOSED_WITH_EXTERNAL_BLOCKERS`**. No code changes by this cert update. No commit. No push.
