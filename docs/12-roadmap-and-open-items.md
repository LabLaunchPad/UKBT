# Roadmap & Open Items

**Status:** LIVING DOCUMENT — update in place as stages/items close, don't
fork a second copy. Last updated 2026-09-09.

**Purpose:** one place that answers "what's done, what's next, what's
blocked, and on whom" without re-deriving it from receipts scattered across
`artifacts/`. This document adds no new facts — every line below cites the
receipt, contract, or CI run it comes from. If something isn't cited, it's
a gap in this document, not a new claim.

Per `CLAUDE.md`: UNKNOWN stays UNKNOWN. No target date appears below unless
a real one was set by the site owner — there is currently no production
launch date, so none is invented here.

---

## 1. Pipeline stage status

Stages per `docs/10-fresh-repo-pipeline.md`. This table is the single
source of truth for "what stage are we at" — update it when a stage's
gate changes state, not the paragraph prose elsewhere.

| # | Stage | Status | Evidence |
|---|---|---|---|
| 1 | Bootstrap discovery | DONE | `artifacts/bootstrap/` |
| 2 | Architecture red team | DONE | `artifacts/verification/ARCHITECTURE-REDTEAM.md` |
| 3 | Contract freeze | DONE | `contracts/REPOSITORY-CONTRACT.md` + the rest of `contracts/` |
| 4 | Foundation build | DONE | `artifacts/receipts/FOUNDATION.md` |
| 5 | Design system | DONE | `artifacts/ui/DESIGN-SYSTEM.md` |
| 6 | Reference analysis | DONE (evidence-based, not live-template) | `artifacts/ui/REFERENCE-ANALYSIS.md`, `knowledge/06-TEMPLATE-BOUNDARY.yaml` |
| 7 | Homepage | DONE | `artifacts/pages/HOMEPAGE-CONTRACT.md`, `artifacts/receipts/HOMEPAGE.md` |
| 8 | Independent homepage red team | DONE, all 8 findings remediated (F8 has one deliberate, documented partial exception) | `artifacts/review/HOMEPAGE-REDTEAM.md` — see § 2.1 below |
| 9 | Scale to remaining pages | DONE for route count (16 routes exist under `apps/web/src/pages/`) — content completeness is a separate, **partially blocked** item, see § 3 | route list: `about, club-captain, coaching, community, contact, design-system, faq, franchises, index, join, membership, news(+[slug]), players, services, tournaments, 404` |
| 10 | Full-site verification & release | **PASS** (2026-08-27 re-run) | `artifacts/receipts/RELEASE.md` — `RELEASE_STATUS = PASS`; see § 2.2 |
| 11 | Adaptive learning + replay | STARTED 2026-09-09 | `artifacts/adaptive-learning/` (catalog + checklist + protocol + index, prompt-07 schema); wired into `AGENTS.md`; adversarial replay (prompt 08) still open |

**Net position:** the site is built, deployable, and the release gate
passes cleanly as of the 2026-08-27 re-run (all three prior gaps closed:
content-schema drift, route/link integrity, SEO completeness). Two
non-blocking caveats remain, named honestly rather than silently
resolved: canonical URL is a genuine `UNKNOWN` pending a production-domain
decision, and branch protection on `main` is a repo-admin action outside
any code gate (§ 2.3). Client-content items are tracked separately in
§ 3 and don't block the release gate itself.

**September 2026 update:** since that re-run, `deploy:verify` has grown
five gates — `check:seo`, `check:ui`, `check:motion`, `check:security`,
`check:perf` — and the production domain is decided
(`https://ukbanglatigers.co.uk`, canonical/sitemap/robots live). Full
`deploy:verify` is green on `main` including all five (§ 2.8, § 2.12,
§ 2.13, § 2.9, § 2.11). The August receipt above is therefore a
historical record, not the current gate state; a fresh Stage-10-style
receipt (including the CI-only browser suites) has not been cut.

---

## 2. Open engineering to-dos (owner: this repo / whoever drives it next)

### 2.1 Homepage red-team findings — `artifacts/review/HOMEPAGE-REDTEAM.md`

Independently red-teamed in a separate session per pipeline rule 5. Eight
findings (F1–F8), severities as scored in that receipt:

| Finding | Severity | What | Status |
|---|---|---|---|
| F1 | HIGH | Mobile/tablet nav drawer is 100% keyboard-inoperable | **CLOSED** — was already fixed before this entry was written; listing it as OPEN was an error, corrected 2026-08-27. Verified empirically at 390×844 (`artifacts/review/MOBILE-VISUAL-QA.md`): toggle reachable on Tab #3, Enter opens, all 8 links tab-reachable, Escape closes and restores focus. Two *new* drawer defects found during that verification (no focus containment, no background scroll lock) were fixed in the same pass. |
| F2 | HIGH | Homepage silently expands beyond the frozen `HOMEPAGE-CONTRACT.md` structure (WhyChooseUs/AcademySection/AboutCTA present but not in the approved 8-section list) | **CLOSED** 2026-08-27 — owner decision: extend the contract rather than cut the sections. `HOMEPAGE-CONTRACT.md` Amendment 02 approves `AboutCTA` (Amendment 01 already covered `WhyChooseUs`/`AcademySection`) and replaces the "Structure" list with the 10-item structure that actually ships, closing the drift Amendment 01 left open. |
| F3 | HIGH | Focus-indicator contrast failure on every dark-background interactive element (real WCAG 1.4.11 failure, invisible to the existing outline-presence test) | **CLOSED** 2026-08-27 — see `artifacts/review/F3-FOCUS-CONTRAST-FIX.md`. Re-verified against current code first: 4 of 5 originally-flagged groups already carried a working per-surface `--ukbt-color-focus-ring` fix; only the footer social icons still failed, for a real reason the original fix comment got wrong (a CSS-specificity bug meant its override never applied). Fixed with an inset (negative-offset) ring, the only geometry where a single solid color can pass 3:1 against both the icon's gold tile and the page's navy at once (no such color exists for a ring that straddles both — proven by solving the WCAG formula for both constraints simultaneously). |
| F4 | MEDIUM | Heading hierarchy skips levels four times; the "0 axe violations" claim only holds for a filtered rule subset | **CLOSED** — re-verified 2026-08-27: current build's heading sequence (`grep -oE "<h[1-6]" dist/index.html`) has zero level-skips, and `homepage.spec.ts`'s axe scan already includes the `best-practice` tag (catches `heading-order`) and passes with 0 violations. Fixed by earlier work, never reconciled back into this doc. |
| F5 | MEDIUM | Identical primary CTA ("Join the Club" → `/contact`) duplicated three times on one page | **CLOSED** — re-verified 2026-08-27: `AboutCTA.astro`'s button no longer says "Join the Club"; it reads "Follow on {platform}" and links to the club's social profile, per the red team's own required fix. Header and Hero keep the join CTA (two instances, not three). |
| F6 | LOW-MEDIUM | The "dark rounded panel" surface pattern is hand-rolled ~7 times instead of composing `Card.astro` | **CLOSED** 2026-08-27 — owner decision: implement now. See `artifacts/review/F6-SURFACE-PRIMITIVE.md`. New `Surface.astro` primitive (background/foreground/radius/padding only, raw token passthrough not a fixed enum) migrated into 4 of 5 flagged components (`NewsTeaser` deliberately excluded — an `<a>`-element card with a different box model, not a clean fit). Verified zero visual change via direct computed-style comparison. Migrating surfaced and fixed a real regression: Astro's per-component scoping meant several `.some-class descendant` selectors silently stopped matching once `Surface` (a separate component) rendered the ancestor div — caught by the existing axe/contrast tests, fixed with `:global()`, and given a dedicated regression test. |
| F7 | LOW | Structured data omits the founding year even though the fact is available on the same page | **CLOSED** — re-verified 2026-08-27: `index.astro`'s `structuredData` already includes `foundingDate: homepage.founded`; confirmed in the built output (`dist/index.html`'s JSON-LD has `"foundingDate":"2020"`). Fixed by earlier work, never reconciled back into this doc. |
| F8 | LOW | Hard-coded `rgba()`/`rgb()` literals (should reference design tokens) | **CLOSED** 2026-08-27, mostly. 3 of 4 literals (`SubHeading.astro`, `Footer.astro` ×2 — all white-at-opacity) converted to `color-mix(in srgb, var(--ukbt-color-neutral-0) N%, transparent)` — same rendered color (verified: computes to `color(srgb 1 1 1 / 0.08)`, bit-identical to the old `rgb(255 255 255 / 8%)`), token reference only. The 4th (`Header.astro`'s `rgb(0 0 0 / 53%)` drawer-overlay scrim) was deliberately left as a literal: it's a true-black dim, and the closest token (`neutral-900`, `#17181c`) is not true black — swapping it in would be a real color shift, not a same-color reference, so it's recorded as a genuine gap rather than silently "fixed" with a slightly different color. |

**Corrected 2026-08-27:** the sentence previously here said "none of
F1–F8 have been fixed". That was written from the red-team receipt
without re-verifying against current code — the exact
"historical evidence is not current evidence" failure `CLAUDE.md` warns
about, and one this doc kept re-committing on later findings too (F4/F5/F7
were already fixed by the time this doc first listed them as OPEN). **All
eight findings are now closed** (F8 has one deliberate, documented partial
exception — see its row above).

A separate mobile-only visual QA pass (2026-08-27,
`artifacts/review/MOBILE-VISUAL-QA.md`) found and fixed six further
mobile defects not in the F1–F8 set — including real page-level
horizontal scroll on `/club-captain` at 320/360px, which the frozen
visual-regression matrix cannot see because its narrowest viewport is
390px.

A further follow-on round (2026-08-27, `artifacts/review/MOBILE-AXE-HEADING-ORDER.md`)
found that `playwright.config.ts`'s only project is Desktop Chrome, so
every axe-core scan in the suite had only ever run at desktop viewport —
no route had a full accessibility scan at mobile width before this round.
A dedicated mobile sweep across all 16 routes found 4 real `heading-order`
violations (`/about`, `/franchises` ×2, `/community`) — the same class of
bug as F4, but F4's fix and check were scoped to the homepage only — plus
an H1→H3 skip on `/404` (the only route with no H2 of its own). All fixed;
a new permanent regression test, `tests/visual/mobile-axe.spec.ts`, sweeps
all 16 routes at mobile viewport so this class of gap can't silently
reopen. `AboutStory.astro`'s pre-existing (non-flagged) h4-before-h2
ordering was deliberately left alone — out of scope without an actual
finding behind it.

A third round (2026-08-27, `artifacts/review/MOBILE-TOUCH-TARGET-SWEEP.md`)
measured every interactive element's tap target at 390×844 across all 16
routes against the 44×44 HIG/Material recommendation (stricter than WCAG
2.5.8's own 24px floor, which every route already passes per the existing
`TARGET_GROUPS` checks in `mobile-ux.spec.ts`). Of 284 undersized elements
found, all but two were text links whose ~24px hitbox is their own
line-height — already deliberately accepted at the WCAG floor; inflating
every nav/footer/social link site-wide would be a design-system-level
redesign, out of scope here. The two genuine fixes were the header's
icon-only nav-drawer toggle (50×36) and close (36×36) buttons — the
single most-used mobile control on the site — both raised to 44×44, with
new regression tests added to `mobile-ux.spec.ts`.

### 2.2 Release-gate gaps — `artifacts/receipts/RELEASE.md`

Of the four gaps that receipt originally found:

1. ~~Route/internal-link integrity~~ — **CLOSED**. `check:links` job
   (`scripts/check-internal-links.mjs`) now runs in CI and locally.
2. ~~SEO metadata completeness~~ — **CLOSED**. `pages.spec.ts` asserts
   non-empty, non-placeholder title + description on all indexable routes.
3. ~~Content-schema drift~~ — **CLOSED.** Re-verified 2026-08-27: this
   entry was stale — the fix already exists in the repository (committed
   as part of the original bootstrap build, `50e15a4`) and was simply
   never reconciled back into this doc, the same class of staleness
   corrected for F4/F5/F7 in § 2.1. Owner decision recorded in
   `contracts/CONTENT-CONTRACT.md`'s 2026-08-27 amendment was **Option
   A** (preserve the compile-time guarantee) — confirmed again
   2026-08-27 when this item was raised as a live decision. What's
   actually in the repo: `ContentRecordSchema`
   (`packages/truth/src/schema/provenance.ts`) is a Zod mirror of the
   real per-field `{field, value, status, sources}` shape content
   actually uses (not the Stage-3 aggregate types like `ClubInfo`, which
   no real content file's shape ever matched — see the contract
   amendment for why forcing that fit would have meant inventing
   placeholder fields). All 5 real content files
   (`apps/web/src/content/{homepage,about,captain,tournaments,franchises}-data.ts`)
   call `ContentRecordSchema.parse(...)` before `evaluate()` runs;
   `packages/truth/src/schema/content-types.test.ts` (9 tests, passing)
   verifies an invalid `status` value throws at parse time. Confirmed
   2026-08-27 with a fresh `pnpm deploy:verify` run — clean. The
   Stage-3 aggregate types remain genuinely unused by any real content
   file; whether to reshape content to populate them, retire them, or
   leave them for content types not yet gathered (fixtures/results don't
   exist yet) is recorded as a separate, smaller, still-open question in
   the contract's own amendment — not resolved here.
4. ~~Stale CI trailing-comment claim~~ — **CLOSED**, corrected to name
   which of the three original gaps are closed, enforced-elsewhere, or
   still absent.

### 2.3 CI/CD and deployment plumbing (this session)

The `main`-push deploy path (`workers-deploy` job in
`.github/workflows/ci.yml`, `cloudflare/wrangler-action@v4`) needed three
sequential fixes before it produced a real deploy — each one only visible
once the previous one was fixed, since each failure fully masked the next:

1. **Invalid YAML** (unquoted `name: Workers Builds: uk-bangla-tigers`)
   silently broke the entire workflow (0 jobs ever ran) — fixed.
2. **Worker name mismatch** (`wrangler.jsonc`'s `name` didn't match the
   Cloudflare-dashboard-renamed Worker) — every Workers Build failed
   instantly, 0-second duration, no logs — fixed (`contracts/
   DEPLOYMENT-CONTRACT.md`'s 2026-08-27 amendment).
3. **`workers-deploy` job missing `pnpm`/Node setup entirely** (dropped in
   an earlier simplification) — fixed via PR #9.
4. **`workers-deploy` job missing an install step, and `wrangler` declared
   only in `apps/web/package.json`** (invisible to `pnpm exec`/`pnpm add`
   run at the workspace root, which is where both `wrangler-action` and
   Cloudflare's own dashboard deploy command run from) — fixed via PR #10,
   merged as `f8d030c`.

**Status as of this update:** CLOSED. PR #10 merged as `f8d030c`; the
resulting push-to-main CI run's `workers-deploy` job completed with
`conclusion: success` (all 11 jobs green, including the "Deploy Workers"
step itself) —
https://github.com/LabLaunchPad/UKBT-UK-Bangla-Tigers/actions/runs/33042878477/job/98420743484.
This is the first fully successful GitHub-Actions-driven Cloudflare
Workers deploy after the four stacked fixes above.

**Still open, dashboard-only, cannot be fixed from this repository:**
- **Branch protection is not applied to `main`** (`docs/11-github-
  branch-protection.md` — `protected: false`, verified via the GitHub API).
  The rule, required-check list, and rationale are fully specified in that
  document; an admin must apply it in the GitHub web UI. Do this before
  treating `main` as a real production branch — right now a single
  mistaken push or force-push has no guard.
- **Cloudflare dashboard's Build command field**: reported empty in one
  amendment, then reported populated in a later dashboard screenshot
  supplied directly by the owner — not independently re-verified from
  this session against a fresh build log since. Confirm on the next real
  Workers Builds run before considering this fully closed.

### 2.3b Visual truth system adopted; 1920×1080 transcription gap CLOSED

- **CLOSED 2026-08-31** — `contracts/VISUAL-REGRESSION-CONTRACT.md`
  AMENDMENT 01 added 1920×1080 to the frozen matrix on 2026-08-26, but
  `apps/web/tests/visual/viewports.ts` still listed six viewports and
  still called itself "the frozen 6-viewport matrix". Every visual,
  responsive and screenshot run in those five days therefore exercised
  six viewports against a seven-viewport contract. Classified
  `CODE_DRIFT`; closed by transcribing the seventh viewport and
  capturing the 14 missing 1920×1080 screenshots plus geometry rows —
  never by narrowing the contract. See AMENDMENT 02 §1,
  `artifacts/visual/DECISION-LEDGER.md` VD-002, `EV-20260831-003`.
- **Measured at the newly-exercised width, no defect found.** The 1920
  row exists to observe centring and full-bleed behaviour above the
  1340px container cap. Measured on the homepage: container renders
  1340px wide, centred (290px each side); no horizontal overflow on any
  route at any of the seven viewports. Painted `.ukbt-section` panels
  measure viewport-minus-gutter at *every* width (30px gutter ≥1280,
  20px at 768–1024, 10px at 390) — consistent inset design, not a
  1920-specific regression. Recorded so the next reader does not
  re-investigate it.
- **New governance, now in force for UI work:**
  `docs/13-visual-truth-system.md` (nine roles, state machine,
  activation policy, ledger, drift model),
  `docs/14-tool-selection-layer.md` (authoritative tool per fact,
  UKBT's detected stack, adapter applicability),
  `knowledge/11-VISUAL-TRUTH-POLICY.yaml`, and the new `visual_never`
  block in `knowledge/10-ANTI-DRIFT-RULES.yaml`.

### 2.5 September 2026 work: captain profile links, full-codebase audit, P0 batch

**Captain profile links (2026-09-06, commit `96ea42a`).** Mohammad
Chowdhury's six stats-provider URLs (ESPN Cricinfo, Play-Cricket,
CricHeroes, LMS, NCL, CREX — supplied directly, not transcribed from the
ingestion PDF) wired as external links on `/club-captain`
(`captain-data.ts:186-211`, `club-captain.astro:109`). London Blaze and
Roma Ovest Titans moved Previous → Current per client confirmation.
The new gold-on-cream links failed axe color-contrast (2.12:1, needs
4.5:1) — fixed by switching link color to navy `#001E3A` (~15:1).
Verified: lint clean, typecheck 0 errors, build 17 pages,
`pages.spec.ts` 90/90.

**Full-codebase audit (2026-09-06).** Token system (143 tokens, generated
CSS matches source 1:1, ~30 dead tokens), 29-component visual QA, and
content/link integrity audited in one pass. Findings, impact-ordered:

- **P0 (all closed in `cba671d`, see below):** double-`h1` on
  `/club-captain`; NCL `http://` URL; stale anti-fabrication comments;
  uncommitted `playwright.config.ts` drift; stale crest-only portrait
  test.
- **P1 (open):** missing `:focus-visible` on SocialLinks links,
  PageBanner breadcrumbs, FranchiseTeaser link, StatsTable scroll
  wrapper; `ProfileHeader` flex overflow risk at 320–767px; franchise
  comment-vs-array contradiction risk (comment fixed, array is source of
  truth); `/design-system` missing from ROUTE-CONTRACT; hand-authored
  JSON-LD vs SEO-CONTRACT rule.
- **P2 (open):** five 24px touch floors (meet WCAG 2.2 AA, below 44px
  best practice); no shared `Link` primitive (five link treatments);
  ~21% dead tokens; 767/768 breakpoint seam; `Button` has no `external`
  prop; `check:links` was internal-only (now also gates `http://`).

**P0 batch (2026-09-06, commit `cba671d`).** ProfileHeader name `h1`→`h2`
(`/club-captain` now exactly one `h1`, verified in built HTML); NCL
`https://`; fabrication comments rewritten to cite the client-supplied
source; `playwright.config.ts` restored to the pinned `127.0.0.1` +
preview-`dist` version; `check-internal-links.mjs` now FAILs on any
`http://` href; portrait test updated to assert the client-confirmed
portrait (EV-20260831-008). Verified: lint clean, typecheck 0 errors,
build 17 pages, `check:links` PASS (695 internal, 0 insecure), built
HTML holds 1× `h1`, 1× portrait, 0× `http://`. Full Playwright e2e runs
on CI (ubuntu) — this Windows box cannot execute the Linux-pinned
browser path, so browser-dependent checks are CI-verified, not claimed
locally.

### 2.6 Minor, informational, not blocking anything

- **`crest-512.png` is supplied at 512px into 44-106px mobile slots**
  (4.8x-11.6x oversupply, measured 2026-08-27). Real mobile transfer-size
  waste. Closing it means generating smaller raster variants and updating
  `apps/web/src/assets/MANIFEST.md` provenance — asset work, not a CSS fix.
- **Frozen visual-regression matrix has no viewport below 390px**
  (`contracts/VISUAL-REGRESSION-CONTRACT.md`). A real horizontal-scroll
  defect on `/club-captain` existed only at 320/360px and was therefore
  structurally invisible to it. `apps/web/tests/visual/mobile-ux.spec.ts`
  now covers those widths separately; folding them into the frozen matrix
  would be a contract amendment and has not been done unilaterally.
- Header height at desktop viewport measures 182px against a 162px
  reference-evidence target after the responsive padding fix (PR #7,
  merged) — root-caused to UKBT's own separate fixed 60px logo asset, not
  the padding fix. Documented, not chased further (would require a logo
  decision, out of scope for that task).

### 2.7 External audit triage (2026-09-06)

An outside audit (no local execution — DNS-blocked, public tree only)
returned **SHIP_BLOCKED** with 5 P0 + 6 P1 findings. Every code claim
was re-verified locally this session before accepting it:

| Claim | Verdict |
|---|---|
| SEO contract violated: hand-built JSON-LD, no canonical/sitemap pipeline (`grep canonical\|sitemap = 0` hits in `src/`) | **CONFIRMED** — same finding as § 2.5 P1; still open |
| Canonical domain unknown | **CONFIRMED** — still `PENDING`, owner decision (§ 3) |
| Content ships as `pending_review` (8 hits across content modules) | **CONFIRMED** — needs a machine-enforced publish gate, still open |
| `main` branch protection | **UNVERIFIED this session** (no API access) — recorded open in § 2.3; admin action |
| No contact/form backend (0 `<form` in pages) | **CONFIRMED, deliberate** — shells by design until a backend exists (FORM-CONTRACT) |
| Actions tag-pinned, not SHA-pinned (all `uses:` are `@v4`/`@v2` tags) | **CONFIRMED** — still open |
| No `permissions:` block in `ci.yml` (0 hits) | **CONFIRMED** — still open |
| No `_headers` in `apps/web/public/` | **CONFIRMED** — still open |
| Spotlight unconditional / Sentry env-gated | **CONFIRMED** (`astro.config.mjs:11-14`) — needs production review |
| No perf budget, no live-site verification, no staleness enforcement | **CONFIRMED** (0 hits for budget tooling) — still open |
| "16 routes / 531 links" counts | **STALE** — now 18 pages, 695 internal links checked |

**Reconciliation with `RELEASE_STATUS = PASS`:** no contradiction. The
release gate passes for what it measures (code gates); the external
P0s are governance/operational (domain, approval, branch protection,
backend) plus real but ungated code gaps (SEO pipeline, headers, CI
hardening). Honest state: **release gate PASS, production SHIP_BLOCKED**
until the § 4 sequence below closes them. The auditor's phased ship
sequence (domain → metadata pipeline → security → journeys →
performance → live verification → release controls) is adopted as the
plan of record — see § 4.

### 2.8 SEO production pipeline shipped (2026-09-06)

Owner supplied the production domain (`https://ukbanglatigers.co.uk`);
Slices A+B of the approved SEO plan are implemented and merged:

- `src/lib/seo.ts`: SITE, canonical normalization (root `/` keeps
  slash, all other routes strip it), OG defaults (absolute 1200×630
  social card + alt), gated emitters (`homepageGraph`, `aboutGraph`
  with org-by-`@id`, `captainGraph` with Person + BreadcrumbList),
  `SEO_ROUTES` registry (12 indexable, 4 noindex).
- `BaseLayout.astro`: auto-canonical from `Astro.url` (indexable only,
  never on noindex/404), `index, follow, max-image-preview:large`
  robots, full OG/Twitter set, JSON-LD graph arrays.
- 3 hand-built JSON-LD blocks migrated to emitters; `design-system`
  page noindexed + described; `tournaments`/`faq` titles aligned to
  banners; `coaching` description rewritten after the new gate caught a
  real `about`/`coaching` description duplicate (same gated tagline).
- `public/robots.txt`, dist-derived `sitemap.xml` (12 URLs, no manual
  list), `scripts/check-seo.mjs` (`SEO_STATUS`), `tests/visual/seo.spec.ts`,
  `seo-gate` CI job, `deploy:verify` extended.
- `SEO-CONTRACT.md` Amendment 01 records the implementation.
- Verified fresh: `deploy:verify` fully green incl. `SEO_STATUS = PASS`
  (lint, typecheck 0 errors, unit 21/21, build 17 pages, links 695/0,
  seo 0 failures). Playwright suites (incl. `seo.spec.ts`) execute on CI.

---

## 3. Client-blocked content items (owner: UK Bangla Tigers club)

Full detail lives in `artifacts/content/CLIENT-ASK-LIST.md` — this is a
condensed pointer, not a fork of it. Update the source file, not this
list, when an item closes.

- Contact details (phone, email, venue, hours).
- Full player roster, full committee list, coaching staff names/roles.
- UKBT + Uppsala Tigers squad photos (blocked on direct file upload —
  tooling can't fetch from Google Drive).
- Photography rights confirmation for two watermarked photos.
- FAQ answers, membership tiers/terms, programme pricing, join/trial
  process, match reports/news, a real consented testimonial, full About
  Us history, sponsor names.
- Decisions: production domain, brand typography confirmation, whether a
  working contact form is wanted (none shipped — a form with no backend
  would silently drop real inquiries), analytics/tracking posture.

None of the above blocks a code fix. All of it blocks on information only
the club can supply.

---

## 4. What "next" means concretely

In priority order, next real work is:

1. ~~Confirm the `workers-deploy` job's actual success~~ — **done**, see
   § 2.3.
2. ~~Resolve F2's scope-expansion question~~ — **done**, 2026-08-27:
   owner chose to extend the contract; `HOMEPAGE-CONTRACT.md` Amendment
   02 approves `AboutCTA` and corrects the structure list.
3. ~~Fix F3 (focus-indicator contrast)~~ — **done**, 2026-08-27, see § 2.1.
4. ~~Re-verify F4/F5/F7 and fix F8~~ — **done**, 2026-08-27: F4, F5, F7
   were already fixed by earlier work and are now correctly marked
   closed (see § 2.1); F8 closed for 3 of 4 literals, 1 left as a
   documented, deliberate gap (see § 2.1).
5. ~~Decide on F6~~ — **done**, 2026-08-27: owner chose to implement now.
   `Surface.astro` primitive shipped, migrated into 4 of 5 flagged
   components. See § 2.1.
6. ~~Decide (A) or (B) for the content-schema drift~~ — **done**,
   2026-08-27: Option A was already implemented (see § 2.2 item 3); this
   doc's "STILL OPEN" label was stale and is now corrected.
7. Apply branch protection to `main` (§ 2.3 — owner action, not gated on
   anything else; can happen any time).
8. Work through `CLIENT-ASK-LIST.md` (§ 3) as the club supplies each item.
9. ~~Re-run the Stage 10 release gate~~ — **done**, 2026-08-27:
   `RELEASE_STATUS = PASS`, see § 1 and `artifacts/receipts/RELEASE.md`.
   Canonical URL and branch protection remain open as named, non-blocking
   caveats (§ 2.3), not gate failures.

Stage 11 (adaptive learning + replay) can start now that Stage 10 passes
clean — see `prompts/07-replay-stress.md` (or the `replay-stress` skill)
for what that stage actually does.

10. Work through the September audit's remaining P1/P2 items (§ 2.5) —
`Link` primitive, dead tokens, breakpoint seam, `/design-system`
contract entry. None blocks the release gate; each is a small,
independently committable fix (`focus-visible` gaps and ProfileHeader
overflow merged as `cadb7b4`).
11. External-audit ship sequence (§ 2.7): Phase 1 production SEO is
done (§ 2.8); Phase 2 CI/security hardening is done (§ 2.12);
performance budgets are done (§ 2.13). Remaining ship work is
owner-gated (domain live/DNS, publication approvals, contact backend,
local facts, branch protection) plus the desktop target-size batch and
the vitest/style-dictionary major upgrades.

### 2.12 Security hardening shipped (2026-09-06)

- **Least privilege:** top-level `permissions: contents: read`;
  `actions: write` only on the two artifact-upload jobs,
  `actions: read` on `workers-deploy`.
- **SHA-pinned actions:** all 7 `uses:` resolved via the GitHub API to
  commits (checkout, pnpm-setup, setup-node, upload/download-artifact,
  wrangler, gitleaks) with `# vN` trailers. Note: the gitleaks v2 tag
  itself is unsigned upstream — pin still fixes the consume-side risk.
- **`public/_headers`:** HSTS (no `includeSubDomains` — subdomain TLS
  posture unknown, honestly omitted), nosniff, DENY framing (+
  `frame-ancestors 'none'`), strict referrer, minimal
  permissions-policy, self-based CSP. `unsafe-inline` is required, not
  laziness: Astro bundles component scripts and scoped styles inline
  with per-build hashes (zero external `<script src>` in dist), so
  hashes/nonces cannot pin them. Sentry ingest host pre-allowed but
  inert until `SENTRY_DSN` is set.
- **`check-security.mjs`** (`SECURITY_STATUS`) + `security-gate` CI
  job + `deploy:verify` wiring: headers presence/content, CSP sanity
  (no eval/http/wildcards), no sourcemaps/env files, no
  plaintext-http subresources.
- **`pnpm audit` (first run): 9 findings (1 critical, 2 high,
  6 moderate) — all in dev/build tooling (vitest/vite/esbuild,
  style-dictionary, spotlight transitive), none reachable from the
  static production output. The critical (vitest UI file read) needs
  `vitest --ui` listening; the repo runs `vitest run`. Fixes need
  MAJOR bumps (vitest 2→3, style-dictionary 4→5) — queued as a
  dedicated upgrade batch with migration verification, not
  drive-by-bumped here.

### 2.13 Performance budgets shipped (2026-09-06)

First re-audit since the motion/logo work confirmed every prior P0/P1
as closed-or-owner-gated (notably: no hand-authored JSON-LD remains —
the two grep hits are emitter comments; homepage IA matches the
amended contract; `SITE` set). The one bounded code-only gap was
performance: measured baselines are lean (CSS 43KB, JS 16KB, HTML
≤47KB) except images (homepage 589KB, players 878KB, Uppsala roster
page 1.39MB; worst single file `uppsala-tigers-crest.jpg` 327KB).
`scripts/check-perf.mjs` (`PERF_STATUS`) enforces: HTML ≤64KB/page,
CSS ≤56KB, JS ≤32KB, single raster ≤350KB (WARN >300KB), page images
≤1600KB (WARN >1200KB), hero keeps `fetchpriority="high"`. Budgets
carry ~25% headroom — they catch regressions, not today's content.
Current WARNs (honest): uppsala crest recompression candidate,
Uppsala roster page weight. Wired as `perf-gate` CI job +
`deploy:verify`.

**New pre-existing finding (not caused by, and not fixed in, this
batch):** axe `target-size` fails on desktop header nav links
(e.g. `/franchises`, 138×16px — measured; the gold underline
`::after` is collapsed `scaleX(0)` and is not the obscurer).
Reproduced on unmodified `main`, so CI is affected with or without
this change. The repo's target-size tests only cover mobile groups at
390px; desktop nav was never measured. Fixing means raising desktop
nav links to 24px+ (header geometry change) — queued as its own
visual-QA batch, not bundled here.

### 2.9 UI/UX production program (2026-09-06, all phases approved)

Render-verified with local screenshots (home/captain/tournaments at
390+1280, banner at 320) plus keyboard-modality probes — no visual
claim without pixels. Static audit: zero heading skips, single h1 on
all 17 pages, zero img alt/dim defects in dist.

- **P0 fixed:** gold focus ring on the gold drawer toggle measured
  ~1:1 → white ring + 3px offset (`Header.astro`); same class fixed for
  the cream close button (navy ring) and `Section--inverse` subtree +
  `NewsTeaser` dark cards (accent token); `PageBanner h1` mid-word wrap
  at 390px → `text-wrap: balance` + fluid display size + banner title
  shortened to "Events" (matches nav/breadcrumb/route; SEO title
  unchanged) after two render-verified CSS-only attempts failed.
- **P1 fixed:** `check-ui.mjs` gate (`UI_STATUS`, CI job, wired into
  `deploy:verify`): heading order, single-h1, img alt/dims,
  stale-`Upcoming` FAIL (past month) / WARN (current month — Sept 2026
  Nordic Lights is WARN today, day unknown, needs club confirmation),
  dark-surface focus coverage, CTA-duplication WARN.
- **P1/P2 primitives:** `Link.astro` + `Breadcrumb.astro` with
  framework-neutral contracts; adopted by FranchiseTeaser,
  club-captain, Footer contact link, PageBanner (keeps `crumbs` API and
  `ukbt-breadcrumb` hooks for target-size tests); `Button.external`
  prop (AboutCTA social opens new tab).
- **Verified working, no change:** drawer keyboard (Tab/Enter/Escape,
  focus return, aria-expanded), StatsTable scroll region, PendingContent
  empty states.
- **Open, owner-gated:** "Join the Club" CTA → `/join` shell
  truthfulness (2× on homepage); Sept 2026 event confirmation;
  dead-token deletion; motion/rhythm tiers.

### 2.10 P2 leftovers closed (2026-09-06)

- **Dead tokens — keep, don't delete.** Re-verified all ~30
  candidates: all live only in generated output, but nearly all are
  scale members (type ramp, neutral ramp, gap ramp, z-stack, state
  pairs, border scale). Deleting scale steps would punch holes in the
  system; geometry values (72px header token vs 60px built) differ from
  shipped CSS, so adoption would be a redesign, not hygiene. One real
  fix: `button.contract.md` falsely listed `radius-md` as a dependency
  (only the design-system demo uses it) — corrected.
- **Media idiom normalized** (zero-visual-change): last six bare
  `@media (max-width:` → `screen and` (Hero, MissionWelcome,
  TournamentGrid, contact, tournaments ×2). The 479px MissionWelcome
  breakpoint is non-token but intentional — recorded, not "fixed" into
  a different layout.
- **200% zoom verified** (640 CSS px on home/tournaments/captain):
  zero overflow, h1 + links intact, screenshots read — drawer, hero,
  banner all usable.
- **Crest weight — no change, honest reason:** header/footer
  `crest-256.webp` is 28KB; smaller PNG variants save ≤13KB, and the
  real weight (`uppsala` 335KB, `crest-512` 183KB) needs binary
  tooling this session lacks. Lazy-loading already mitigates
  below-fold weight. Asset recompression is queued as tooling work,
  not attempted by hand.

### 2.11 Motion programme shipped (2026-09-06, M1–M4, ClientRouter)

- **Tokens:** `duration-slow`, `easing enter/exit/emphasized`,
  `distance sm/md`, plus `duration-signature` for the hero settle;
  4 literal transitions retokenized (timings preserved); dead
  `duration-fast` adopted.
- **Navigation:** ClientRouter in `BaseLayout` (normal document
  navigation preserved, incl. no-JS — tested); 350–550ms VT
  fade+rise; drawer stagger (capped 150ms), dropdown entry via
  `@starting-style` (exit instant, documented); gold underline-reveal
  on desktop nav + persistent current-page underline.
- **Micro-interactions:** Button arrow-shift + press scale(.98);
  linked-card lift; all transform/opacity, token-driven.
- **Hero/banner/reveals:** finite load choreography (image settle →
  headline → tagline → CTA → social); single IO controller with
  controller-gated initial states (no-JS renders static); SectionHeader
  + footer + banner reveals.
- **Reduced-motion catch:** probe found staged `backwards` entrances
  blanking content through their delays — delays now killed alongside
  durations; re-verified instant final state in-render.
- **Governance:** `contracts/MOTION-CONTRACT.md` (+ micro-interaction
  matrix), `check-motion.mjs` (`MOTION_STATUS`), `motion.spec.ts`,
  `motion-gate` CI job. Restraint list holds: no parallax/ambient/
  counters/letter-type/scroll-jacking (deferred, not drifted past).
- Verified: full `deploy:verify` green incl. `MOTION_STATUS = PASS`;
  screenshots read (hero final, drawer open, reduced-motion desktop,
  banner at 320/390).
- **First-visit logo intro (2026-09-06):** three-state machine
  (INTRO / NORMAL / CLIENT_NAV) — pre-paint head script arms
  `html.ukbt-logo-intro` + persists `ukbt-logo-intro-seen`
  (`duration-intro` 700ms token, −12px/1.03 desktop, −8px mobile,
  ≤1px settle, end state identical geometry); `astro:before-swap`
  removes the class pre-paint with `after-swap` re-assertion, so
  replay is impossible regardless of head-script re-execution;
  reduced-motion renders the final logo with `animation: none`.
  Render-verified: fresh armed + flag, absent across About/Players/
  Back/Forward/reload, returning-visitor final, reduced-motion
  static; bar height unchanged (88 mobile / 142 desktop).
- **Reduced-motion sweet spot (2026-09-06):** the blanket kill left
  staged entrances either blanked (fixed via delay-kill) or frozen.
  New two-tier model — state changes instant, entrances resolve as one
  200ms opacity fade (`ukbt-soft-fade`, no rise/scale/stagger); page
  swaps stay instant. Measured in-render (opacity 1, transform none,
  soft-fade active) and read on screenshot; enforced by gate rule 6
  and the strengthened `motion.spec.ts`.

### 2.14 E2E visual backlog (2026-09-09 — full local browser run, CI=true)

`deploy:verify` (13 gates) is green; the CI-only browser suites
additionally report 10 failures (318 passed / 10 failed,
`pages/mobile-axe/seo` 126/126 green after the in-session fixes below).
Each item names the failing test, the measured evidence, and the
suspected cause. Fixed in-session (not backlog): desktop nav
dropdown-toggle target-size on all 13 pages (exact 24×24 box,
`Header.astro`), captain-portrait test updated to the new
`mohammad-chowdhury-captain.jpg` asset.

**RESOLVED 2026-09-10:** all 10 fixed and verified — full local
browser suite **328 passed / 0 failed** (1 pre-existing skip) with
real chromium. BL-04/08/10: settled-hero waits + slideshow
exemption; BL-05: top-level-only focus locator; BL-06: gold nav
rules scoped to top level + cream-safe dropdown hover; BL-07:
Surface checks remapped to current hooks; BL-09: 24px icon-only hit
area; BL-01–03: scroll pass triggers lazy loads before the decode
wait. Per-item notes below stand as the investigation record.

- **BL-01–BL-03 — `homepage-delivery` image-decode waits time out
  (mobile/tablet/desktop).** `page.evaluate` waiting for
  `document.images` to decode exceeds 30s on all three viewports.
  Cause undetermined: slow local box vs. a genuinely stalled image
  (the two new 54–57KB images are small, so size alone does not
  explain it). Action: reproduce on CI ubuntu runner; if green
  there, treat as local-env flake and optionally raise the wait
  budget with a comment.
- **BL-04 / BL-08 — hero "Join the Club" button contrast 4.11:1
  (needs 4.5), desktop (`homepage.spec.ts:9`) + mobile
  (`mobile-axe.spec.ts` `/`).** Steady-state measurement (a 1.16
  first-run reading looks like a mid-entrance capture): navy text on
  the gold pill. Pre-existing button colors — no session change
  touched them. Action: darken the pill or adjust the label color to
  clear 4.5 without breaking the brand pair, then re-run both specs.
- **BL-05 — homepage focus-outline check fails on element 5
  (`homepage.spec.ts:39`, `outline-style: none`).** Pre-existing;
  the failing element index is not yet identified. Action: enumerate
  the locator set, identify element 5, restore a contrast-safe ring.
- **BL-06 — gold "Uppsala Tigers" link 2.12:1 on
  `/franchises/uppsala-tigers` (`homepage.spec.ts:228`).**
  Same gold-on-cream class as the earlier gold→navy fix, missed
  spot. Action: switch that link to the navy treatment and re-run.
- **BL-07 — Surface test finds no `.ukbt-franchise__cta a`
  (`homepage.spec.ts:324`).** Selector matches nothing in current
  components — test-vs-component drift, pre-existing. Action: align
  the test with the real `FranchiseTeaser` markup (or restore the
  class), keeping its original intent (scoped descendant styling
  must apply).
- **BL-09 — hero social icons 16px wide at 390px
  (`mobile-ux.spec.ts:118`).** Icons-only mobile row shrinks links
  below the 24px floor. Pre-existing `SocialLinks` sizing. Action:
  24px minimum hit area on the icon-only variant, no visual change
  to the icons themselves.
- **BL-10 — `motion.spec.ts:103` asserts zero running animations;
  the approved hero slideshow loops by design.**
  `MOTION-CONTRACT.md` Amendment 02 already covers the exception.
  Action: exempt the documented `.ukbt-hero__bg--alt` layer in the
  test (assert nothing ELSE runs) — a scoped test update, not a
  revert and not a gate weakening.

### 2.15 CI/deploy maintenance + axe-settle completion (2026-09-10)

- **Redundant Actions deploy job removed (PR #29, `a768c17`).**
  Production deploys via git-connected Workers Builds on every main
  merge (verified live: slideshow, spacing, captain links all
  present); the `wrangler deploy` Action failed solely on the expired
  `CLOUDFLARE_API_TOKEN` and was deleted, not re-credentialed.
  Branch protection confirmed absent, so no required check
  referenced it. Restoration note left in `ci.yml`.
- **Pinned actions bumped to node24-runtime majors (PR #30,
  `bd8ce26`).** checkout/setup-node/pnpm-action v4→v5,
  upload-artifact v4→v6, gitleaks v2→v3 — same-major tags had no
  newer release. Two fallout fixes, both catalog'd (AL-021, AL-022):
  `setup-node@v5` needs pnpm on PATH even in script-only jobs;
  the axe settle covered only 3 of 6 `AxeBuilder` specs, and the
  untouched two failed with the identical footer signature.
- **Release re-certified:** `artifacts/receipts/RELEASE.md`
  2026-09-10 update at this HEAD — full `deploy:verify` (13 gates)
  + full e2e (328 passed / 1 env-gated skip) fresh locally,
  main-branch CI run `34474337388` success, zero Node 20
  deprecation annotations. Verdict `PASS`; standing caveats
  (canonical URL `PENDING`, no branch protection) unchanged.

### 2.16 About Phase 1 — legacy port (2026-09-10)

Owner-supplied legacy About transcription
(`artifacts/review/LEGACY-ABOUT-INVENTORY.md`) ported into the built
`/about` behind the truth gate (`EV-20260910-001` owner confirmation
+ `EV-20260910-002` transcription, T7 two-source on new stats):
management-team graphic + Sayem portrait (owner-authorised exception,
photo-test pins exactly these files), FounderSpotlight (trophy photo,
450+ career matches, 30+ active players as distinct fields —
40+/7+ untouched), 3-paragraph management narrative, distilled
3-sentence vice-chair bio, hero subline, Contact Us pill +
team-huddle in AboutCTA. "Acting Chairman" retained. Hero subline
slot added to shared PageBanner (optional, other pages unaffected).
Still out: full long-form bios, 13-item CV detail beyond the
distillation (each needs its own evidence if ever rendered).

### 2.17 About N2/N3 round-2 + 3-page enhancement (2026-09-10, PRs #35-#40)

- **N2/N3 round-2 (PR #35).** Vice-chairman spotlight wraps below the
  portrait at extreme text scaling (`flex-wrap`, verified `text200-over:
  0` via a transient spec, since deleted); founder tablet cap lost its
  `min-width` lower bound (448px verified at 700/766/768/1024).
- **Phase 1 data-legal (PR #36, `EV-20260910-003`).**
  `org.stat_active_players` 30+ → 40+ on direct owner instruction
  (same supersession pattern as `EV-20260909-001`; T7 via
  `EV-20260910-001` + `-003`). Owner-approved legal wording
  "Founded in 2020 · registered as UK Bangla Tigers Cricket Club CIC"
  renders identically on `/` and `/about`; no 2025 date published per
  owner instruction. Both 40+ figures coexist with distinct
  labels/sections (owner-confirmed, not a conflict).
- **Phase 2 system (PR #37, additive, zero visual diff).** Optional
  Hero eyebrow/secondary-CTA; AcademySection copy + light tone;
  WhyChooseUs editorial variant; CaptainSpotlight density/identity/CTA;
  ProfileHeader athlete layout/identity; new `FranchiseTimeline`
  (current-emphasized / previous-subordinate spine, verbatim items).
- **Phase 3 homepage (PR #38, `index.astro` only).** Hero eyebrow +
  View-Tournaments CTA; editorial Why 01–04; editorial captain bridge
  ("View full profile"). Order, surfaces, stats, imagery unchanged;
  image duplicates kept deliberately (authorised, cache-shared,
  distinctly cropped).
- **Phase 4 about (PR #39).** Editorial values (one system, both
  pages); leadership cards with larger names + micro-label roles
  (text-only per photo-pin contract). Era-grouped story chrome
  deferred — only 2020 is gated.
- **Phase 5 captain (PR #40).** Athlete hero (20rem frame under the
  640px source, identity line from verbatim gated values, meta grid);
  franchise grid replaced by `FranchiseTimeline`; Back-to-Players
  close. One real bug caught by the suite: the athlete frame's
  higher-specificity desktop width held 320px at the 320 viewport —
  fixed with an explicit mobile collapse rule.
- Still out (unchanged): full long-form bios, 13-item CV detail,
  Companies House number + 2025 entity date (internal-only per owner).

### 2.18 Homepage enhancement implementation (2026-09-11, PR #41)

Executed the approved investigation (§2.17 lineage) as controlled
implementation on `feature/homepage-enhancement`:

- **Shared primitives first.** New `.ukbt-eyebrow` grammar in
  `base.css` (uppercase + gold tick, on-light/on-dark) replaces three
  bespoke dialects (hero, captain, tournament "Also Coming") — the
  SubHeading pill stays the separate header-row dialect. `Button`
  gains `tone="on-light"` (navy pill, values moved verbatim from
  AboutCTA); both `:global` recolors deleted — Hero's was a provable
  no-op, AboutCTA's is pixel-identical (about captures byte-identical).
  `SectionHeader` deliberately untouched: no evidenced use for a new
  tone/size, so generalizing it would have been speculation.
- **Trough recomposition.** TournamentGrid: larger main-event title,
  semibold navy date, tightened header bind (S4 trough lifted).
  FranchiseTeaser: 9rem crest + gold top rule (Captain → Franchise
  boundary fixed; same grammar as AboutCTA). No copy, image, route,
  token, or data change anywhere.
- **Evidence.** `deploy:verify` exit 0 (13/13), e2e 328/1, full-page
  captures reviewed at all 8 viewports — 320/375 measured for the
  first time (previously inferred). Cross-page safety: players
  (eyebrow tick), community + tournaments (franchise rule) reviewed,
  all intentional; about byte-identical. Geometry `sectionCount`
  unchanged (7). Transient review spec deleted after use.
- Awaiting human lock approval before About inherits the grammar.

### 2.19 About enhancement implementation (2026-09-11, PR #42)

Approved A1–A5 executed on `feature/about-enhancement` (branched off
the PR41 baseline, which stays untouched for its own lock review):

- **A4 mission tablet (measured defect).** 4-up fact row squeezed to
  micro-type at 768px (1024 fits, ≤767 stacked) → 2×2 ≤900px. The
  old ≤767 2-up rule deleted as dead (subsumed). Verified at
  768/900/1024.
- **A5 odd-count cards.** Trailing odd card spans the full row
  (`:last-child:nth-child(odd)`, count-agnostic, mobile no-op).
  Proven with 3 (production Sayem card) and 5 (transient DOM-injected
  clone test, no fixture route — a fixture page breaks the canonical
  gate, diagnosed and reverted).
- **A1 founder mirror.** `composition="mirror"` (default preserves)
  puts trophy image right / content left on desktop only; DOM order
  and ≤1025px stacking byte-identical, a11y order preserved.
- **A3 narrative hierarchy.** First gated paragraph takes the lede
  size-2 (exact ClubIntro/AboutCTA lede grammar); copy untouched.
- **A2 Why lede.** `WhyChooseUs` gains optional `lede` (default =
  homepage wording, homepage byte-identical); About passes "Why the
  club exists, stated from what is on record." Presentational
  framing, not a factual claim — items untouched.
- **Budget incident (new defect, root-caused).** A-rules tipped
  `css-weight` to 56.3KB > 56KB. Fixed WITHOUT gate change by
  removing provable-zero-change weight: duplicate overflow-wrap
  block, duplicate media queries (Section, FounderSpotlight N3),
  dead 767 rule, and the `surface-default` rule (restates body
  values verbatim — verified zero drift: all non-about captures
  byte-identical). Net CSS smaller than before the change.
- Evidence: `deploy:verify` exit 0, e2e 328/1, capture specs 108
  passed, 9-viewport full-page review (320 measured), geometry
  sectionCount still 7. Awaiting human lock approval; Captain next.

### 2.20 Captain enhancement implementation (2026-09-11, PR #43)

Approved C1–C3 executed on `feature/captain-enhancement` (combined
main + PR41 + PR42 baseline; ancestry reported before editing):

- **C2 stutter removed.** `ProfileHeader` gains `showEyebrow`
  (default true; single-consumer component); captain page passes
  false. Banner H1 + name + gated role carry the identity; DOM/a11y
  order unchanged.
- **C1 orientation.** Franchise → "Career Path", Stats →
  "Performance" SubHeadings (presentational structure, A2-class —
  no new facts); links h3s already orient, left alone. Gap folded
  into the page h2 rule instead of a new wrapper rule.
- **C3 terminal.** Gold top rule + pad on the close block
  (franchise-boundary precedent); no new CTA.
- **Budget incident (recurrence, same protocol).** C-rules tipped
  `css-weight` to 56.1KB. Fixed with zero-change cuts only:
  merged identical photo-collapse selectors, merged duplicate media
  blocks, removed dead 767 rule, removed `surface-default`
  restatement — then, 55B short, removed the zero-consumer
  `SectionHeader centered` variant (typecheck + no test + no
  contract reference prove no consumer) and merged Footer's
  identical list rules. No budget change. Net CSS below baseline.
- Evidence: `deploy:verify` exit 0, e2e 328/1, capture specs 108
  passed, 9-viewport full-page review incl 320 (transient spec
  deleted). Only the 7 club-captain PNGs changed — every other
  route byte-identical, proving the SectionHeader/Footer shared
  edits are zero-drift. Geometry sectionCount still 5. Awaiting
  human lock approval; merge order 41 → 42 → 43.

### 2.21 About corrections round — roster photo cards (2026-09-11)

Owner corrections on the about-refinements branch (same branch,
no new branch — direct continuation):

1. **Management-team graphic render removed** per owner direction.
   File + EV-20260910-001 authorisation retained (MANIFEST notes
   the removal); photo-pin test now asserts its absence.
2. **Roster cards carry portraits.** Each of the 3 leadership cards
   renders its member's cleared photo (Chowdhury via the
   already-rendered founder-trophy asset, Ratan EV-20260911-001,
   Sayem EV-20260910-001) — 5rem cover thumbs, card radius, face
   kept via object-position top. No quote cards created (quotes
   remain NOT VERIFIED across all layers).
3. **Both standalone spotlights deleted** (Sayem bio card + Ratan
   card) including all spotlight CSS (R-H superseded — presence now
   comes from the roster photos). Sayem bio + leadershipGraphic +
   sayem/ratan data exports retained in about-data (unrendered,
   noted — not deleted in case bios return with a design).
4. R-A founder icons + R-H intend kept (icons verified in crops;
   7.5rem rule removed with its component).
- Evidence: `deploy:verify` exit 0, e2e 328/1, capture specs 108
  passed, full-page + targeted crops reviewed at 1440/768/390/320
  (transient spec deleted). Only the 7 about PNGs changed.
- Incidental: `gallery-02.webp` shows as deleted in the working
  tree — NOT this workstream's change (owner-side file
  organisation); left unstaged and untouched.
5. **Bento recomposition (same branch, committed on top).** Founder
   card spans 2 rows with a tall top-crop photo; Ratan + Sayem
   stack beside it; mobile collapses to single-column compact
   crops. A5 orphan rule deleted (superseded by the bento span).
   Definite photo heights everywhere — transient diag spec
   confirmed the intrinsic-height trap (flex-fill / aspect-ratio
   fall back to 1200px+ intrinsic boxes, faces sliced, inside
   indefinite grid rows). Evidence: about spec 6/6 (`CI=true`
   against the managed chromium-1234 cache — the config's local
   `/opt/pw-browsers/chromium` override does not exist on Windows),
   `check-perf.mjs` PASS (CSS in 56KB budget), transient verify +
   diag specs deleted, 7 about PNGs refreshed. Owner-side files
   still untouched: gallery-02 deletion unstaged, the two `MD
   Shahidul Alam Ratan.webp` raw drops (measured distinct
   content, not a rename) untracked.
6. **Leadership intro compression (same branch, committed on top).**
   New `org.leadership_intro` gated fact compresses the
   managementStory passage (same facts/sources, roster hedge kept)
   into the grid title column, replacing the hardcoded committee
   line; `narrative` prop + its CSS removed, full passage retained
   unrendered (no duplicate page copy — the SEO rationale).
   Evidence: astro check 0 errors, about spec 6/6, check-perf PASS
   (net-negative CSS), about captures 7/7 reviewed at 1440/390.
   Section audit: 1×h1 + section h2s, eyebrows/rhythm consistent;
   open owner question (not changed): MissionWelcome fact cards vs
   WhyChooseUs 01–04 restate the same four pillars.
7. **WhyChooseUs removal + founder-stat restyle (same branch, committed
   on top; owner decisions from six-agent joint review).** WhyChooseUs
   removed from About (Mission cards own the pillars; kills the
   byte-identical duplication + stale Nordic Smash/Asian Challengers
   list — Mission list is the current record). 3-card bento kept.
   Founder stats navy-ruled (personal) vs Story gold-ruled (club);
   gated 40+ values untouched. Evidence: astro check 0 errors, about
   spec 6/6, captures 7/7 reviewed.    Perf: FAIL recorded as-is —
   56.7KB vs 56KB ceiling (baseline margin was only ~115B; removal
   reshuffles +797B into index.css). Owner: no cuts for now, no
   budget change; revisit is a separate re-approval event.
8. **About banner backdrop gallery-06 (same branch, committed on top).**
   Owner confirmed UKBT affiliation, explicitly overriding
   EV-20260826-030 §4 for this file (amendment recorded; MANIFEST
   section; spec allowlist updated with re-approval comment).
   PageBanner gains optional `background` prop (default plain navy
   elsewhere); token-navy shade preserves gold-on-dark contrast.
   Evidence: astro check 0 errors, about+pages 96/96, captures 7/7
   reviewed at 1440/390. Perf: no new failure (CSS still 56.7KB
   known FAIL; 202KB image under thresholds).
9. **Players banner backdrop gallery-08 (same branch, committed on
   top).** Owner confirmed UKBT squad photo (new drop, no prior EV;
   chest branding matches home-hero's flagged marks — disclosed).
   Same PageBanner prop, no component change. Evidence: astro check
   0 errors, pages.spec 89 passed + 1 unrelated timing flake,
   players captures 7/7 reviewed at 1440/390. Perf: no new failure
   (291KB image under thresholds; CSS still 56.7KB known FAIL).
10. **Events banner backdrop gallery-10 (same branch, committed on
    top).** Owner confirmed UKBT squad photo (no prior EV; MANIFEST
    contact-sheet label is a different numbering — recorded).
    Same PageBanner prop, no component change. Evidence: astro check
    0 errors, tournaments captures 7/7 reviewed at 1440/390.
    Calendar cross-checks the Mission record (no action). Perf: no
    new failure (230KB image under thresholds; CSS still 56.7KB
    known FAIL).
11. **Contact banner backdrop gallery-04 (same branch, committed on
    top).** Owner confirmed affiliation AND publication rights,
    superseding the contact-sheet watermark hold for this file
    (recorded; watermark disclosed). Same PageBanner prop, no
    component change. Evidence: astro check 0 errors, contact
    captures 7/7 reviewed at 1440/390. Perf: no new failure (67KB
    image trivial; CSS still 56.7KB known FAIL).
12. **Franchises banner backdrop nordic-smash-slide.jpg (same branch,
    committed on top).** Owner waived CLIENT_REQ_008 for this banner
    use only (baked-in excluded name; recorded in MANIFEST +
    requirements inventory; DOM/alt name-free). Same PageBanner
    prop, no component change. Evidence: astro check 0 errors,
    pages.spec 90/90, franchises captures 14/14 reviewed at
    1440/390. Perf: no new failure (202KB image under thresholds;
    CSS still 56.7KB known FAIL).
13. **Club Captain banner backdrop gallery-05 (same branch, committed
    on top).** Owner confirmed UKBT award-presentation photo (no
    prior record, no watermark). Same PageBanner prop, no component
    change. Evidence: astro check 0 errors, club-captain route 1/1,
    captures 7/7 reviewed at 1440/390. Perf: no new failure (56KB
    image trivial; CSS still 56.7KB known FAIL).
14. **Captain focal point + uniform banner heights + MissionWelcome
    stacking (same branch, committed on top).** `background.focus`
    prop (`50% 20%` on captain — both faces visible at 1440/768/
    390); strict min-heights 544/432/340 measured pixel-identical
    on all six banner pages; MissionWelcome intro stacked
    (About-only). Evidence: astro check 0 errors, 96/96 specs,
    about + captain captures reviewed. Perf: net-zero, still
    56.7KB known FAIL.
15. **CI gate fix: roster card headings h4→h3 (same branch, committed
    on top).** CI failed axe heading-order + check-ui heading-order
    on /about (card names under section h2). Fix is visually
    identical (explicit size-2/bold kept). Verified: check-ui PASS,
    mobile-axe + about 23/23, captures reviewed. Perf unchanged.
16. **Named view transitions (new branch `feature/view-transitions`,
    owner-approved plan).** KEEP global root; 3 semantic pairs:
    `ukbt-site-logo` (brand anchor, all pages), `ukbt-captain-portrait`
    (same photo home/players/captain), `ukbt-franchise-crest` (same
    file+220x220 franchises/detail); back-direction cue via
    `data-astro-transition`. No persist/loader/upgrade. Evidence:
    typecheck 0 errors, MOTION PASS, UI PASS, motion.spec 8/8,
    scratch matrix 9/9 zero page errors, settled captures reviewed.
    Perf: +1.0KB CSS (56.7→57.7KB, base layer duplicated across
    bundles) — same accepted FAIL class, no cuts per direction.
18. **Player roster photos (new branch `feature/players-roster-photos`,
    owner direction 2026-09-12).** 59 portraits + PDF list
    (EV-20260912-001): 58 players (4 renamed, 16 new) + 4 officials on
    /players, uniform 320px WebP thumbs (54 files, 485KB). HEIF decoded
    via Temp-only heic-convert (never staged). UUID file excluded (no
    name). Evidence: typecheck 0 errors (truth gate passes all 62
    records), MOTION/UI PASS, motion+pages 98/98, players captures 7/7
    reviewed at 1440/390. Perf: no new failure (players page under the
    page-image budget).
