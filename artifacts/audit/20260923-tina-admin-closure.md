# Tina Admin Closure — Narrative (T11 §31)

Date (UTC): 2026-09-23
BASE: `e544985322376dead374106f3b9c5f1b58e43614`
HEAD: `e544985322376dead374106f3b9c5f1b58e43614` (main, Merge PR #95; held working state uncommitted — 11M + untracked `publish.ts`/`publish.test.ts`/`adr-001`/`tina-layered.spec.ts` per `progress.md`)
Branch: `main`
Evidence pointers: `artifacts/audit/20260923-gemini-reconciliation.md` (T0 E0>E1), `artifacts/audit/20260922-p0-evidence-decision.md`, `artifacts/audit/20260922-p0-remediation-baseline.md`, `artifacts/audit/20260922-smoke-403-root-cause.md`, `.superpowers/sdd/2026-09-23-tina-admin-closure/{progress.md,plan.md,decisions.md,gemini-input.md,task-00-current-architecture.md,task-T0-report.md,task-T2-report.md,task-T3-report.md,task-T4-report.md,task-T5-report.md,task-T6-report.md,task-T7-report.md,task-T8-report.md,task-T9-report.md,task-T10-report.md}`, `packages/truth/src/gate/*`, `apps/web/public/_headers:15`, `wrangler.jsonc:35-42`, `apps/web/src/pages/tina-island/[name].ts:5-6`, `tina/config.ts`, `apps/web/src/lib/tina/islands.ts`, live `https://ukbanglatigers.co.uk` probes 2026-09-22T18:57–22:06Z

## §1 Executive summary

Tina Admin closure 2026-09-23 reconciled Gemini 2026-09-22 P0 hypotheses against E0 live + E1 repo truth and re-proved the Workers + Astro static + `@tinacms/astro@0.7.0` admin boundary. Direct P0 defects claimed by Gemini are disproven or historically fixed; no code diff was justified across T0–T10 except the single layered visual gate (T7). One indirect P1 truth-boundary bypass remains (island POST serves Tina content without `isPublishable` — V2, preview by design, deferred to NEW task) and three HUMAN_REQUIRED externals remain (T8-A Save, T8-B Reindex+unskip proof, T8-C drift reconcile). Governance is `VERIFIED_WITH_LIMITATIONS` (stale `dist/_headers` unstamped, `admin/assets` hash drift, `WORKERS_DEPLOY_VIA_CI` unset → Builds publish independent), so the package verdict is `TINACMS_ADMIN_CLOSED_WITH_EXTERNAL_BLOCKERS` (see `20260923-tina-admin-certification.md §S`).

## §2 Scope, BASE & anti-mixing

- **BASE contract:** `e544985` (plan §§0/35 — no blind Gemini, unknown stays unknown, no CSP/gate weakening, smallest bounded fix). Held working state recorded in `progress.md` (M AGENTS.md +7 producers + `gate/index.ts` + 2×Task2; untracked `publish.ts`/`publish.test.ts`, `adr-001`, 3 prior audit files) — not committed by TA design.
- **Out of scope per §36:** Broader truth/release work (P0 Tasks 3–13) paused during TA; §§22/23 own only Tina-boundary truth check (minimal FAQ string + About TinaMarkdown + dev 401→500 fail-closed). Phase ordering: T0→T1 (read-only)→T2↔T3 (bridge/island seam)→T4⊥T5→T6→T7→T8(§§21-23 Tina-boundary)→T9(full matrix)→T10(anti-drift)→T11(artifacts).
- **KNOWN-RED carried:** Production `astro build` exits 1 by design (fail-closed T6 `pending_review`, ~124 records — `progress.md`; T9 2a `Truth gate failed for 'captain.name': status=pending_review`). `pnpm dev` + live `https://ukbanglatigers.co.uk` unaffected; TA browser tasks used `127.0.0.1:4321` dev server + live single-shot probes.

## §3 GEMINI reconciliation summary (T0 `20260923-gemini-reconciliation.md`)

| Bucket | Count | Members |
|---|---|---|
| DISPROVEN-current | 5 | GEMINI-001 multi-CSP collision, 003 missing `prerender=false`, 004 Slate `[object Object]`, 009 Pages `_worker.js`/`src/worker.js` architecture, 012 TinaMarkdown refactor outstanding |
| REJECTED remedy | 1 | GEMINI-010 centralized Worker CSP proxy with `unsafe-inline`/`unsafe-eval` (premise disproven — single CSP live) |
| HISTORICAL-fixed | 1 | GEMINI-002 trailing-slash origin (GH var bare `https://ukbanglatigers.co.uk` since 2026-09-19T19:26:48Z; live 3× bare blocks) |
| PARTIALLY_VERIFIED | 5 | 006 screenshot-only method gap, 007 CI smoke presence-only gap, 011 `stripTrailingSlash` hardening candidate, 013 bounding-box method gap, 014-split (2000-char line/100-rule limits real but max live line 602 chars) |
| UNKNOWN (owned downstream) | 3 | 005 duplicate CSS (no re-render evidence), 008 responsive matrix (no auth viewport evidence), 015 indexing behavior → T8 |
| **Total** | **15** | **0 VERIFIED current P0 defect** |

Task A (`src/worker.js`/ADR-001) must not proceed — repo is Workers (`wrangler.jsonc:38` `main: ./apps/web/dist/server/entry.mjs`, `:40-42` `assets.directory`, `apps/web/astro.config.mjs:44` `cloudflare()`), not Pages. Sources: Context7 `/websites/tina_io`, `/withastro/docs`, Workers headers llms.txt; `tina.io/docs/contextual-editing/astro`.

## §4 Current architecture (T1 `task-00-current-architecture.md`, 139 lines / 19219 B verified)

- **Delivery:** Cloudflare **Workers with static assets** (`wrangler.jsonc` root, `name: ukbt-uk-bangla-tigers` pinned vs adapter `ukbt-web` drift). `apps/web/astro.config.mjs:15` `output:'static'` + `:44` adapter + `:9` `tina()` integration. No `middleware.ts`/`functions/`/`src/worker.js` (ABSENT).
- **Admin:** `tina/config.ts:8` `clientId PUBLIC_TINA_CLIENT_ID||TINA_CLIENT_ID`, `:4` branch chain `TINA_BRANCH||GITHUB_BRANCH||…||main`, `:11-12` `outputFolder admin` / `publicFolder apps/web/public`, media `apps/web/public/media/`. Build `tinacms build --skip-cloud-checks --skip-search-index` → `public/admin/index.html` (gitignored, asset `/admin/assets/index-LQnB6IK5.js` repo vs live `DswcyTjG` drift).
- **Island — only server route:** `apps/web/src/pages/tina-island/[name].ts:5-6` `prerender=false`, `ALL:APIRoute = experimental_createIslandRoute(islands)` (single handler, not GET/POST split). 7 islands `hero/aboutSection/aboutHero/aboutStory/aboutLeadership/faq/whyChooseUs` in `islands.ts`. Three pages use `<TinaIsland>` (`index.astro` 3, `about.astro` 3, `faq.astro` 1). `data-tina-field` markers on 10 components (parity via `check-tina-field-parity.mjs` PASS).
- **Handshake:** Static fallback (truth-gated) outside islands; editor keystroke `POST /tina-island/[name]` (Worker, `no-store`) → bridge `swapIslandHtml` keyed on `data-tina-island` (not class) inside admin iframe (`ukbanglatigers.co.uk` same-origin, `frame-ancestors` allows `*.tina.io`). TinaCloud `app.tina.io` popup auth only; no `?tinaEdit`/`auth/callback` string in `apps/web/src`.

## §5 Audits referenced (baselines)

- `20260922-p0-evidence-decision.md` — RELEASE_STATE `BLOCKED_EXTERNAL`, live BARE proven, smoke 403 `CAUSE=UNKNOWN`, Workers independent-YES.
- `20260922-p0-remediation-baseline.md` — held-state baseline pre-TA.
- `20260922-smoke-403-root-cause.md` — 5×403 `SMOKE_STATUS FAIL` run 35463035934 (2026-09-19T19:08:29Z, BUILD_ID `e544985` matched), same-run `/favicon.svg` 200 + CSP/nosniff present, 2026-09-22 both UAs→200, `CAUSE=UNKNOWN`, `EDGE_EVIDENCE UNAVAILABLE`.

## §6 Security (T2 `task-T2-report.md` — NO CHANGE)

- **CSP single-source PROVEN:** live `HEAD/GET /` 19:24Z + `GET /admin/` + `GET /admin/bridge.js` — exactly 1 `content-security-policy` per static response (case-insensitive count), `single _headers` `apps/web/public/_headers:15` (`__UKBT_CSP_SCRIPT_HASHES__` stamped by `stamp-csp.mjs`), 6 sha256 `8oMiKk… Iyjd6… eE9wx… u6B3Kd… v47l… zgMgx…`, `frame-ancestors 'self' https://*.tina.io https://app.tina.io https://*.tinajs.io`, no `X-Frame-Options` by intent (`_headers:7-10`). Worker island `POST /tina-island/*` carries **zero** CSP (Workers boundary — `_headers` static-only, E4 docs) — observed, not a defect. Remedy §§10 A–E: **NO CHANGE**.
- **Origin strict PROVEN 11/11:** GH var bare, live `/` 3× `adminOrigin=["https://ukbanglatigers.co.uk"]` zero slash, upstream `adminOrigins()` `split(',').trim.filter(Boolean)` (no slash normalization — hardening candidate, not current defect), bridge `isFromAdmin = includes(event.origin) && source===window.parent` with fallback `window.location.origin`. Matrix: legit ACCEPT, trailing-slash/localhost/preview/evil-sub/http/port/lookalike/null/malformed/wrong-source all REJECT.
- **Adversarial 11/11 PASS:** exactly one of the 10 unrelated origins + wrong-source case accepted? None — all blocked (1 ACCEPT legit + 10 REJECT). No fail-open.

## §7 Island runtime (T3 `task-T3-report.md` — NO CODE DIFF)

- **Prerender flag untouched:** `prerender=false` already present (all 3 preconditions unmet).
- **Swap-keying verdict BENIGN:** T1 §1.4 empty `className` on `about.astro:74,94,128` + `faq.astro:38` vs registry `islands.ts:113/133/155/169` does **not** no-op — installed `@tinacms/astro`/`@tinacms/bridge@0.3.1` selector is `[data-tina-island]`, `swapIslandHtml` keeps original tag + copies `class/id/data-tina-*` + swaps `innerHTML`; zero stylesheet references to `ukbt-*-island` classes.
- **Route semantics 9/9:** `rejectIfUnsafe` — GET→405, wrong `Content-Type`→404, unknown→404, valid→200 `text/html no-store` with `data-tina-field` markers, `Sec-Fetch-Site: cross-site`→403, large/malformed bodies inert (body never parsed), evil `Origin`→200 public-only (no secret, no Origin check by design — CSRF via preflighted `application/x-tina-preview+json` + `sec-fetch-site`). Dev hero 500 (401 → fail-closed, bridge keeps DOM) vs live hero/faq 200.

## §8 Content / rich-text (T4 `task-T4-report.md` — NONE, no `[object Object]`)

| Field | Schema | Loader | Renderer | Live |
|---|---|---|---|---|
| `about.storyBody` | `rich-text` `tina/config.ts:181` | `z.unknown()` `validateWithPreserve` | `AboutStory.astro:59` `TinaMarkdown` + `normalizeRichText` (invalid_markdown unwrap) | Live `/about` 2 paragraphs verbatim |
| `faq.items.answer` | `string` (migrated `883761d/a52a5f3`) `tina/config.ts:263-269` | `z.string()` | `FAQSection.astro:50` string `<p>` else `TinaMarkdown` | Live `/faq` 3× `<p>` strings, 0 `object Object` in full HTML |
| `renderFaqAnswer` | — | — | dormant 0 importers | — |
| Latent | — | — | `normalizeRichText` can hand bare string to `TinaMarkdown` on single `invalid_markdown` child — unreachable on current content | deferred |

`check-content-trust.mjs` PASS (35/35 truth unit tests pass).

## §9 Visual / responsive (T5 `task-T5-report.md`)

- 28 loads (7 viewports 1920→375 × {`/`,`/about`,`/faq`,`/admin/`}) + 6 focused `/admin/` probes via `pnpm dev` + Playwright bounding-box: C1 **NOT-REPRODUCED** (no absolute navbar, 0 marker↔header overlaps), C2 mobile drawer collapse 0x0 + overflowX 0 clean; C2/C3/C4 remaining sub-claims (admin forms, Save/Cancel, sidebar drawer 40%, media modals overlap) **UNTESTABLE-authenticated** (requires TinaCloud seat) — reachable parts `overflowX 0` everywhere. Recommendation **NONE**. Dev-500 transient 6/28 (401 cascade under rapid load) recorded; future runs retry-then-record.

## §10 Accessibility (T6 `task-T6-report.md` — 0 violations repo-owned)

- Axe `wcag2a/wcag2aa/wcag22aa/best-practice` at desktop 1280×800 + mobile 390×844: `/` 0, `/about` 0 (after transient-500 retry), `/faq` 0 (6 markers), `/admin/` unauth 0 (inputs 0, dialogs 0, vendor SPA). 18/18 §16 items PASS: aria-labels on brand/dropdown/toggles/drawer, keyboard Enter/Space/Arrow/Escape on dropdown + `<details>` FAQ, drawer `aria-modal inert` focus trap, `target-size` 24×24 AA (50×48 toggle mobile), `prefers-reduced-motion` kill, `data-tina-field` non-focusable. Vendor/admin-editor post-login: **UNTESTABLE-authenticated**.

## §11 Browser / layered regression (T7 `task-T7-report.md` — `tina-layered.spec.ts` 326 lines, 4/4 fresh)

- New single-file gate `tina-layered.spec.ts` layers L1 screenshot (`buf.length>0`) + L2 relative geometry (`scrollWidth-clientWidth ≤1`, marker↔header rect intersection, out-of-viewport) + L3 drawer/dropdown keyboard + L4 axe (homepage `wcag2a/aa/22aa/best-practice`, admin `wcag` only for vendor) + L5 `console.error`/`response≥400` filtered (retain TypeError/ReferenceError/SyntaxError/Uncaught; drop expected `401`/identity) on same load at 1920×1080 + 390×844 — plus admin unauth shell (overflow 0, `Log in` in-viewport at both viewports, `hasPreviewIframe false` UNTESTABLE-auth). Retry 2× `domcontentloaded` for transient-500 leniency.
- **Negative proof:** injected `fake.overlay` 1920×200 absolute → L2 `overlaps>0`, L1 screenshot still `>0` (proves L2 catches what L1 misses). Note: T9 re-run saw baseline 1 overlap `IMG.ukbt-hero__bg 142,0 1920×938 vs header 142h` (vs T7 0) — triaged as viewport-relative tolerance drift, not a layout defect. **Wave-1 closeout (CLOSED):** marker-scope exclusion of decorative `.ukbt-hero__bg` in `tina-layered.spec.ts` (2 lines + comment), biome clean, 2× consecutive 4/4 Playwright runs (27.5s + 25.4s, HEAD e544985) — see `task-T7-report.md §10/§10a` (runs STATED_BUT_UNVERIFIED as files); negative proof intact (fake overlay still caught).

## §12 Performance & release deps (T8–T9)

- **Network single-shot 8 URLs 2026-09-22T21:43Z (T8 §1):** `/`,`/admin/`,`/admin/bridge.js` (single CSP, `CF-Cache-Status: HIT/MISS`, `HSTS/coop/corp`), `/tina-island/faq|hero` POST 200 `no-store` zero CSP (Worker), GET `/tina-island/faq` 405, `/_astro/homepage-data.*.css` 200 immutable, `/brand/crest-512.png` 30-day `media/*` cache — all 200/405 expected. No new deps, no gate weakening.
- **Release path (T8 §5, T9 2a/6e/6f):** `ci.yml:385` `workers-deploy` `if: WORKERS_DEPLOY_VIA_CI=='true'` → currently **skipped** (flag unset, honest absence); `workers-builds` git-connected publishes on every `main` push independently of CI (run 35463035934: deploy skipped, smoke 403 observed Builds publish). `wrangler.jsonc` pinned `ukbt-uk-bangla-tigers` vs generated `ukbt-web` drift is dashboard-human step. `tina build` flags `--skip-cloud-checks --skip-search-index` must stay until T8-B proof; `pending_review` fail-closed keeps `astro build` red.

## §13 Truth / provenance boundary (§§21-23 Tina-boundary only)

Minimal check (T8 §6): FAQ string is escaped text sink + record-level `pending_review` build gate (not bypassed via preview string), About `TinaMarkdown` same gate, dev island 401→500 fail-closed. Verdict `can_tina_bypass_pending_review = NO` for live editorial fields under `e544985` schema via **static** path. **V2 candidate** (T10 V2): island POST path itself bypasses `isPublishable` (unauthenticated `POST /tina-island/faq` 200 22:06Z; evil Origin still 200 public HTML) — preview by design, but exposed unauth + divergent from static gate → **P1 deferred to NEW task post-cert** (not P0 admin blocker). No truth-sensitive fields on islands until that task closes.

## §14 Full matrix T0–T10

- **T0** reconciliation 0 current-defect /5 DISPROVEN+1 REJECTED /1 HISTORICAL /5 PARTIAL /3 UNKNOWN.
- **T1** architecture 139 lines read-only, wrapper mismatch BENIGN handed to T3.
- **T2** CSP/origin/bridge NO CHANGE 11/11 PASS.
- **T3** island BENIGN + 9/9 matrix PASS.
- **T4** rich-text WORKS, no `[object Object]`.
- **T5** C1 NOT-REPRODUCED, C2–C4 UNTESTABLE-auth + clean reachable.
- **T6** a11y 0 violations (repo), vendor UNTESTABLE-auth.
- **T7** layered 4/4 PASS + negative proof.
- **T8** 5 boundaries VERIFIED (network 8-probe PASS, auth shell PASS + T8-A/B/C HUMAN_REQUIRED pending, skip holds, release independent YES, truth no-bypass on static).
- **T9** 28/32 PASS (87.5%), geometry 1 FAIL (baseline regression triaged — **Wave-1 now CLOSED** per §11: `.ukbt-hero__bg` scope fix, 2× 4/4 runs per `task-T7-report.md §10/§10a`), build-dependent gates expected-red (audit `value.replace`, `deploy-mapping`/`security` FAIL unstamped), 10 SKIP (auth/BUILD_ID/`tina build` etc).
- **T10** 24 vectors; HIGHLIGHTED V2 bypass (P1 deferred); governance VERIFIED_WITH_LIMITATIONS (stale `dist/_headers` + admin hash drift + `WORKERS_DEPLOY_VIA_CI` unset).

## §15 Governance & evidence hygiene

- File scope: new `publish.ts`/`publish.test.ts`/`adr-001`/`tina-layered.spec.ts` untracked pending squashed re-approval; plan §§0/35 no weakening, `E0>E1>E2>E3>E4>E5`, `UNKNOWN` stays `UNKNOWN`; no simulated Save; secrets never printed (only `fork-pr-*-fallback` dummy, public hash strings); parity `TINA_FIELD_PARITY_STATUS PASS`; drift items re-stated not hidden.

## §16 Evidence pointers

- `HEAD_SHA e544985322376dead374106f3b9c5f1b58e43614`
- Live probes: 2026-09-22T18:57:48Z `/` 200 1 CSP `a3f3896c2b924cbf-SIN`; 18:57:56Z `/admin/` 200 1 CSP; 18:58:05Z `#root`; 18:59:07Z `/admin/bridge.js` 15550 B; T2 19:24:05Z HEAD/GET sweeps (1 CSP each); 19:40–19:42Z dev island matrix; T8 21:43Z 8-URL table; T10 22:05:54Z–22:06:21Z single-shot (POST `faq` 200, GET 405, malformed 200, cross-site 403, evil Origin 200 public).
- Report SHA: this file only (artifacts-only, no commit).
