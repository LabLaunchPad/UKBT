# UKBT Players Profile — UI/UX Design-Engineering Plan v2

> ID: ukbt-players-uiux-v2 — Status: ACTIVE — Owner: ukbt-agent
> Scope: `/players` redesign planning + implementation. Screenshot = visual reference only.
> Hierarchy: CURRENT_REPO > FRESH_MEASUREMENTS > APPROVED_CONTRACTS > EVIDENCE_RECORDS > …

## Global Constraints

- pnpm only, `pnpm@10.33.0`, `node>=22.22.0`, `engine-strict=true`. Never npm/yarn. Bin via `pnpm exec <bin>`.
- `tokens:build` before `typecheck`/`build`. `tina/__generated__/client.ts` must exist. `@astrojs/cloudflare` ACTIVE adapter — do not remove.
- Truth gate: `@ukbt/truth` validates every content module — build fails on fact drift. TinaCMS is editorial-only, never bypasses truth/SEO/a11y/perf/security.
- UNKNOWN stays UNKNOWN. Never invent players/roles/countries/stats.
- Contracts frozen: ROUTE, DESIGN-SYSTEM, VISUAL-REGRESSION (7 viewports: 1920/1440/1280/1024/768/430/390), ACCESSIBILITY (WCAG 2.2 AA, axe + keyboard), MOTION, SEO, etc.
- No new deps without allowlist; no new routes without ROUTE-CONTRACT update; no global CSS unless genuinely global.
- Ponytail ladder enforced: delete > stdlib > native > installed dep > one-liner > minimal. Shortest diff wins.

## Context

`/players` is a roster-dominant page: banner → 50+ stat → captain spotlight → Squad (58 cards + filter bar) → Team Officials (4) → note → footer. Current implementation is structurally complete (all 58 verified roles/countries, correct badges) but was flagged in the screenshot for visual-density, alignment-spine, and filter-discoverability polish. This plan provides the 23-section diagnosis plus a bounded 6-task implementation sequence executed via SDD.

---

## Tasks

### Task 1 — Measured baseline + screenshot forensics

Ground the plan in fresh measurements: DOM snapshot of `/players`, viewport renders at 1440/768/390, grid column counts, card geometry, alignment edges, vertical gaps. Classify evidence (FACT/VERIFIED/OBSERVED/MEASURED/PROPOSED/UNKNOWN). Produce forensics table + alignment/rhythm baselines.

Files: `artifacts/visual/` baseline, no code change yet. Verify by Playwright snapshot + dom dump.

### Task 2 — Card anatomy normalization (SquadCard)

Single canonical card anatomy: media (1:1, top-center), body (name/role/country/affiliation/meta), badge deduplication, monogram parity, focus ring per surface, intrinsic sizing. Fix any badge-only vs role-line drift, text-wrap for longest names, image loading. Touch `SquadCard.astro` only.

### Task 3 — Grid + container alignment (SquadGrid + Section spine)

Establish single content spine: container max 1240px, SquadHead + filters + grid share the same left/right edges (measure and align). Grid: intrinsic `repeat(auto-fill, minmax(...))` with 2-up mobile floor (320→390), fluid gap via `clamp()`, no horizontal overflow at 320. Consider container query for card internals only if component-level problem measured. Touch `SquadGrid.astro` + `SquadHead.astro` + verify `Section.astro`/`base.css` container not duplicated.

### Task 4 — Vertical rhythm + section composition

Model NAV→BANNER→CAPTAIN→SQUAD_INTRO→CONTROLS→GRID→OFFICIALS→NOTE→FOOTER gaps as MICRO/COMPONENT/SECTION/MACRO. Normalize to token scale (space-2/3/6/8, section-padding), eliminate per-section margin hacks, parent-owned `gap`. Touch `players.astro` page composition + `Section.astro` density only if measured drift.

### Task 5 — Controls / interaction / a11y polish

Filter bar: default/hover/focus/active/selected/disabled/empty states, aria-pressed without color-only signal, keyboard operability, no-JS progressive enhancement, target size ≥24×24 (WCAG 2.5.8), overflow at 390 without clipping. Focus-not-obscured (2.4.11), visible ring on light and alt surfaces.

### Task 6 — Verification (visual / responsive / a11y / perf / truth)

Run structural/visual/responsive/interaction/a11y/perf/truth gates: `pnpm lint`, `tokens:build`, `typecheck`, `test:unit`, `build`, `check:links/seo/ui/motion/security/perf`, `playwright` at 7 viewports, `axe` on `/players`, content-truth cross-check (58 names/roles/countries/badges vs `players-data.ts` + EV-20260923-001). No horizontal overflow at 320, no regressions.

---

## Design-Engineering Plan (condensed 23-section execution — full text in `docs/03-evidence-contract.md` artifacts)

### 1. Executive UX Diagnosis

Working: 58 cards complete, role taxonomy clean (Batsman/Bowler line + Wicket-keeper/All-rounder badge), truth gate green, no invented stats, responsive grid exists, Tina 401s environmental only.

Limiting: filter bar competes with squad heading for primary scan line; grid gutters at 1440 vs 390 use same token without fluid scaling; captain spotlight vertical gap to squad intro varies by container logic duplication; long names (e.g. Qudratullah Mir Afzal, Chinthaka Rajapaksha) wrap to 2–3 lines but card row height varies; officials section inherits same heading scale as squad without demotion.

### 2. Repository Grounding

Astro 7 static, `@ukbt/truth` workspace:*, Style-Dictionary tokens→`apps/web/src/styles/generated/tokens.css`, `Section` is rhythm primitive (120px block, 20px inline → 80px ≤767px), `SquadCard`/`SquadGrid` are isolated components, Playwright + axe at 7 viewports, 18-gate `deploy:verify`.

### 3. Evidence Register

FACT: 58 roster + 4 officials from EV-20260923-001. VERIFIED: All role lines render, badge set correct. MEASURED: Grid 2-up ≤700px, 4@768, 5@≥1100. OBSERVED: Screenshot density high but scannable. PROPOSED: Fluid gap + heading demotion. UNKNOWN: None on this page (client asks closed via ownership update).

### 4. Brand Constraints

VERIFIED: navy `#001E3A`, gold `#CCA44F` (crest-sampled). Gold on light = 2.12:1 insufficient for normal text — gold only on dark surfaces. Cream `#F8F4E8` is PROPOSED alt surface, not approved inverse. No new brand colors.

### 5. Design-System Constraints

Tokens: color/space/radius/motion/typography via style-dictionary. Container `.ukbt-container` 1240px bounded. Lifecycle RAW→VERIFIED — no promotion without visual gate. No alias tokens; use existing `ukbt-space-*`, `ukbt-color-*`, `ukbt-font-*`.

### 6. Screenshot Forensics (visual only, not fact)

Dense but orderly card matrix, monogram fallback visually quieter than photos (correct), badges bottom-left overlap readable, filter chips as compact pills, banner navy with gold title, footer dark. No new facts inferred from visuals.

### 7. Horizontal Alignment Audit

Spine = `.ukbt-container`. Measured LEFT/RIGHT edges: PageBanner inner, Section container, SquadHead, SquadGrid bar, grid. Drift found: SquadHead had independent `max-width:40rem` without container sync — fix by inheriting container edges. Gap via `gap`, not per-section margin.

### 8. Vertical Rhythm Audit

Transitions measured as banner 544px→432→340, section padding 120→80, SquadHead gap-2 + margin-bottom gap-6, Squad bar margin-bottom gap-6, grid gap-4. Fix: keep parent-owned gaps, no compounded margins, heading→count tighter than section→section.

### 9. Typography Geometry

H1 via `ukbt-font-heading-h1-*`, SquadHead clamp 2.75→4.25rem, card name `font-size-1` → `font-size-0` ≤380px. Long-name test: 12–18 chars, longest measured fits 2 lines at ≥700px. `overflow-wrap: break-word` global, `text-wrap: balance` on banner.

### 10. Component-Level Plan

SquadCard: lock media 1:1, top-center, badge at space-2 offset, body gap 2px, role bold navy. SquadGrid: filter pills 39px tall (24px min + padding), count `aria-live`, progressive enhancement via `data-squad-ready`. CaptainSpotlight: 168×224 3:4, editorial 14rem variant. PageBanner: 30px radius, shade 0.84.

### 11. Section-Level Plan

Banner identity, Captain highlight (border-top 3px navy), Squad intro heading+count+filters, Grid primary content (dense ok, transition calm), Officials secondary (sub heading scale), Note 42rem max-width muted, Footer dark continuity.

### 12. Page Composition Model

Density: banner low, captain medium, controls low, grid high, officials medium, note low. Hierarchy preserved with images/color/motion removed.

### 13. Consistency Audit

Component/section/page/site all MATCH except SquadHead max-width vs container (DRIFT → Task 3). No new page-specific language.

### 14. Responsive Model

1920: grid 6+ cols, container centred. 1440: 5 cols. 1280: 4–5. 1024: 4 cols, nav still desktop. 768: 4 cols, captain stacks. 430: 2 cols ~165px. 390: 2 cols ~120px, name steps down. 320: reflow, no horizontal scroll, filters wrap.

### 15. Accessibility Model

WCAG 2.2 AA: axe + keyboard + focus-visible + focus-not-obscured (scroll-padding if needed) + 24×24 targets + semantics (h1→h2→h3 card names) + reflow 320 + reduced motion (kill + soft-fade subset).

### 16. Performance Model

No new JS (vanilla DOM filter), no hydration, eager vs lazy: banner `fetchpriority=high`, cards `loading=lazy`, fixed 320×320 dimensions prevent CLS. CSS budget respected, no duplicate assets.

### 17. UX Failure Modes (root-caused)

Alignment drift (SquadHead max-width, Section padding divergence) → SECTION. Card row variance (body padding at 390) → COMPONENT. Filter wrap at 320 → RESPONSIVE RULE. Focus on light+badge combo → ACCESSIBILITY.

### 18. Prioritized Change Set

P0: focus ring per surface, target size, reflow. P1: container spine alignment, vertical rhythm normalization, grid overflow. P2: heading demotion, card body padding sync. P3: container query for card internals only if measured need.

### 19. Exact File Impact

Change: `apps/web/src/components/SquadCard.astro` (T2), `SquadGrid.astro` (T3), `SquadHead.astro` (T3), `apps/web/src/pages/players.astro` (T4), `apps/web/src/styles/base.css` only if container token fix. No change: `packages/truth` (truth intact), `contracts/*`, `wrangler.jsonc`, route contract.

### 20. Verification Matrix

Structural: DOM/heading order. Visual: 7-viewport Playwright diff. Responsive: overflow check. Interaction: filter state machine. A11y: axe + keyboard. Perf: HTML/CSS/JS budgets, no CLS. Truth: 58 roster cross-check.

### 21. Open Unknowns

None blocking. Tina 401s are fallback-creds environmental.

### 22. Bounded Implementation Sequence

T1 measure → T2 card → T3 grid/spine → T4 rhythm → T5 controls/a11y → T6 verification. ANTI-DRIFT: one layer at a time, measure between.

### 23. Definition of Done

Alignment measured+consistent, rhythm token-grounded, anatomy consistent, hierarchy coherent, typography wraps, responsive at 7 viewports, interactive states, a11y passes, truth grounded, no overflow, no unexplained diff, no design-system drift, no unnecessary runtime, `deploy:verify` subset exercised and green.
