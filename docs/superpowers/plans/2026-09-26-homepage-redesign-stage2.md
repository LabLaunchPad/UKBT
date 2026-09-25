# Homepage Redesign Stage-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the approved homepage redesign (Approach A) from journey framing through build to three sign-offs, keeping `packages/truth` the single design-system source.

**Architecture:** Ordered specialist passes (research → rails → 2 static directions → owner pick → deltas → single-writer build → gate reviews), each landing evidence or specs before the next begins; code changes only in Tasks 5–6.

**Tech Stack:** Astro 7 + `@ukbt/truth` DTCG tokens via Style Dictionary; pure-Node gate scripts; Playwright + axe; pnpm monorepo (Node ≥22.22). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-26-homepage-redesign-design.md` (PR #119, approved 2026-09-26 — the plan argues from the spec, so the spec travels with it; executors read both).

## Global Constraints

- `packages/truth/src/tokens/approved/**` changes only with evidence records via `adapted/` staging + Style Dictionary rebuild (`tokens:build` before typecheck/build).
- Every duration/easing/distance from approved motion tokens; transform/opacity only; two-tier reduced motion intact (`contracts/MOTION-CONTRACT.md`).
- Perf budgets: HTML 72KB/page, CSS 96KB total, JS 48KB total (`scripts/check-perf.mjs`).
- TRUTH-SENSITIVE stays code-owned via `*-data.ts` + gate; Tina touches EDITORIAL only; no new routes without ROUTE-CONTRACT amendment.
- Single writer on app code; research/spec tasks change no shipped bytes.
- Biome style (single quotes, semicolons, 2-space) for any `.ts`/`.mjs`.
- Verification evidence before completion claims, always.

---

### Task 1: Journey framing + pass criteria (UX Researcher)

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-homepage-journeys.md`
- Read: `apps/web/src/pages/index.astro`, `apps/web/src/components/Hero.astro`, `apps/web/src/components/AcademySection.astro`, `apps/web/src/content/homepage-data.ts` (funnel entry points only — change nothing)
- Test: none (spec task) — review checklist in Step 4

**Interfaces:**
- Consumes: design doc §Locked decisions 6 (both journeys), baseline section order
- Produces: `journey-A` (player: hero → academy → join with per-step observable criteria), `journey-B` (fan: tournaments → news → socials with per-step criteria), `a11y-floor` (contrast/focus/reduced-motion/budget gates each journey must clear)

- [ ] **Step 1: Map the current funnel**

Read `index.astro` section order + `Hero.astro` CTAs + `AcademySection.astro` counters. Record the exact click path for journey-A (which CTA → which route) and journey-B (tournament grid → news slug → social link) as they exist today, with file:line per step.

- [ ] **Step 2: Write pass criteria**

For each journey step, write one observable criterion (e.g. "hero primary CTA label names the join action and links `/join/`; reachable by keyboard with visible focus; announced heading order intact"). Mark anything needing real user data as UNKNOWN — heuristic/contract review only.

- [ ] **Step 3: Write the journeys file**

Create `docs/superpowers/specs/2026-09-26-homepage-journeys.md` with `journey-A`, `journey-B`, `a11y-floor` sections. No placeholders: every criterion names its route/element.

- [ ] **Step 4: Self-check against the brief**

Re-read the task brief: every journey step has file:line grounding, every criterion is observable, UNKNOWNs labeled. Fix gaps inline.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-09-26-homepage-journeys.md
git commit -m "docs: homepage journey framing + pass criteria (player + fan)"
```

### Task 2: Brand rails lock (Brand Guardian)

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-homepage-brand-rails.md`
- Read: `packages/truth/src/tokens/approved/color.json` (brand primary `#001E3A`, accent `#CCA44F`), `typography.json` (Lato/Montserrat), `artifacts/brand/BRAND-DECISION.md`
- Test: none (spec task) — checklist in Step 3

**Interfaces:**
- Consumes: design doc §Locked decision 4 (in-brand exploration, fonts stay)
- Produces: `brand-rails` (permitted color ranges, crest/social-card usage rules, explicit veto list), consumed by Task 3 directions

- [ ] **Step 1: Extract the anchors**

Record the verified anchors with sources: primary/accent hex + crest provenance (`color.json:5-12`), font stacks + PROPOSED status (`typography.json:3-14`), crest/social-card asset paths in `apps/web/public/`.

- [ ] **Step 2: Write rails + vetoes**

Write `brand-rails` with: permitted exploration ranges (tints/shades/scales of navy/gold — ranges, not values), crest minimum-size/clear-space/never-alter rules, and a veto list (off-palette hues, new font families, gradients over photography that harms contrast, AI people imagery). Each veto cites the contract or evidence behind it.

- [ ] **Step 3: Self-check**

Every rail traces to a token, asset, or contract line; vetoes are checkable (a direction either violates one or not). Fix gaps inline.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-26-homepage-brand-rails.md
git commit -m "docs: homepage brand rails + veto list"
```

### Task 3: Two static direction specs (UI Designer)

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-homepage-direction-a.md`, `...-direction-b.md`
- Read: Task 1 journeys file, Task 2 brand rails, `apps/web/src/components/` (reuse inventory: Hero, ClubIntro, WhyChooseUs, AcademySection, TournamentGrid, CaptainSpotlight, FranchiseTeaser, AboutCTA)
- Test: none (spec task) — each direction must pass the rails checklist in Step 3

**Interfaces:**
- Consumes: `journey-A/B`, `a11y-floor`, `brand-rails`
- Produces: `direction-A`, `direction-B` (section-by-section treatment: layout, rhythm, hero, color usage, motion notes referencing approved tokens only), exactly one owner pick consumes them (human gate, not a task)

- [ ] **Step 1: Reuse inventory**

List homepage components with what each does today (one line each, file paths). Mark keep / restyle / drop-candidate per direction later — both directions must keep all TRUTH-SENSITIVE content reachable.

- [ ] **Step 2: Write both directions**

Each direction file: hero treatment, section rhythm changes, color-scale usage (within rails ranges), motion notes (approved tokens by name, e.g. `duration-slow`/`easing-emphasized`), abstract-background placements (AI, rights-record-required), and a per-journey walkthrough of what improves. Concrete enough that Task 4 can diff them into token deltas. No code.

- [ ] **Step 3: Rails + journey check**

Run each direction against the brand veto list (zero violations or the direction is rewritten) and both journey criteria (each criterion either met or explicitly deferred with cause). Record the check results at the foot of each file.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-26-homepage-direction-a.md docs/superpowers/specs/2026-09-26-homepage-direction-b.md
git commit -m "docs: two homepage direction specs for owner pick"
```

### Task 4: Token/component deltas (UX Architect)

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-homepage-deltas.md`
- Read: winning direction file (named by owner at the human gate), `packages/truth/src/tokens/approved/*.json`, `packages/truth/style-dictionary.config.json`, affected components
- Modify: none yet — deltas are a proposal; `adapted/` drafts (if any) come as a separately-approved follow-up inside this task's verdict
- Test: `pnpm --filter @ukbt/truth tokens:build` (must pass unchanged — proves baseline green before deltas)

**Interfaces:**
- Consumes: winning direction + `brand-rails` + current approved tokens
- Produces: `delta-table` (per change: token/component, old → new, evidence/cause, lifecycle route: direct-approved-edit with evidence vs `adapted/` staging), consumed by Task 5

- [ ] **Step 1: Baseline green proof**

Run: `pnpm --filter @ukbt/truth tokens:build`
Expected: exit 0, no diff in `apps/web/src/styles/generated/`.

- [ ] **Step 2: Diff direction into deltas**

For each direction element, record the concrete change: token additions/edits (with DTCG shape `$value`/`$type`), component edits (file + lines), motion usages (token names). Anything the direction implies but evidence cannot ground is marked DROPPED with cause (YAGNI), not carried.

- [ ] **Step 3: Lifecycle-route each delta**

Mark each delta: `approved-direct` (extends existing scale with measured/brand evidence attached) or `adapted-stage` (needs new evidence record first — listed as follow-up, not executed here). No `adapted/` writes without the attached evidence.

- [ ] **Step 4: Write + commit the deltas file**

```bash
git add docs/superpowers/specs/2026-09-26-homepage-deltas.md
git commit -m "docs: token/component deltas for winning homepage direction"
```

### Task 5: Single-writer build (implementer)

**Files:**
- Modify: `apps/web/src/pages/index.astro`, homepage components per `delta-table`, `apps/web/src/content/homepage-data.ts` (TRUTH-SENSITIVE only, gate-kept), `apps/web/content/homepage/homepage.json` (EDITORIAL only), `packages/truth/src/tokens/approved/*.json` (only `approved-direct` deltas with evidence), plus `docs/` evidence records as needed
- Read: `delta-table`, `packages/truth/AGENTS.md` workflow (source → tokens:build → tsc → vitest → consumers)
- Test: `pnpm --filter @ukbt/truth tokens:build`, `pnpm typecheck`, `pnpm test:unit`, `pnpm --filter @ukbt/web exec playwright test tests/visual/homepage.spec.ts tests/visual/pages.spec.ts`

**Interfaces:**
- Consumes: `delta-table`, `journey-A/B`, `a11y-floor`, copy evidence map (built inline per Step 2)
- Produces: built homepage + green targeted gates, consumed by Task 6

- [ ] **Step 1: Tokens first (if any approved-direct deltas)**

Edit source JSON, run `pnpm --filter @ukbt/truth tokens:build`, confirm `apps/web/src/styles/generated/` regenerates. Expected: exit 0. Commit tokens separately:

```bash
git add packages/truth/src/tokens/approved/ apps/web/src/styles/generated/
git commit -m "feat(homepage): approved token deltas per delta-table"
```

- [ ] **Step 2: Copy evidence map**

Write every new/changed org claim into the build report with its gate/evidence source; anything ungrounded is omitted (UNKNOWN-shell precedent), never invented. EDITORIAL copy goes through Tina JSON + loaders (allowed-urls, XSS choke).

- [ ] **Step 3: Components + page**

Implement the winning direction per `delta-table`, following existing data-module → props → render flow, tokens-only CSS, ClientRouter-proofed JS (`window.__ukbt*Wired` once-guards where touched).

- [ ] **Step 4: Targeted verification**

Run: `pnpm typecheck` (Expected: 0 errors), `pnpm test:unit` (Expected: pass), `pnpm --filter @ukbt/web exec playwright test tests/visual/homepage.spec.ts tests/visual/pages.spec.ts` (Expected: all pass). Fix failures before proceeding — never weaken a gate.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src apps/web/content packages/truth/src
git commit -m "feat(homepage): implement winning direction (visual + copy)"
```

### Task 6: Finish-gate + walkthrough + sign-offs (reviewers)

**Files:**
- Read: built homepage (preview task `UKBT-Preview`, `http://127.0.0.1:4321/`), Task 1 criteria, brand rails, copy evidence map
- Modify: none unless a sign-off fails (fix rounds return to Task 5 scope, max 3 loops, then escalate)
- Test: full `pnpm --filter @ukbt/web exec playwright test`, `pnpm deploy:verify` (subset never claimed as release)

**Interfaces:**
- Consumes: built homepage, `journey-A/B` criteria, `brand-rails` vetoes, copy map
- Produces: `signoff-visual`, `signoff-copy`, `signoff-usability` (each explicit PASS/FAIL + causes)

- [ ] **Step 1: Finish-gate pass**

Judge the built homepage against the veto list + generic-dashboard test. Record PASS or FAIL with file:line causes. FAIL returns to Task 5 (loop counter 1/3).

- [ ] **Step 2: Both-journey walkthrough**

Execute `journey-A` and `journey-B` step by step in preview, checking each pass criterion + `a11y-floor` (keyboard, focus visibility, contrast, reduced-motion static resolution, budgets). Record per-step PASS/FAIL.

- [ ] **Step 3: Copy sign-off**

Verify every shipped org claim traces to the evidence map; every Tina edit is EDITORIAL-classified (`check-content-trust` PASS). Record PASS/FAIL.

- [ ] **Step 4: Full gates**

Run full Playwright suite then `pnpm deploy:verify`. Expected: green. Any FAIL returns to Task 5 (loop counter increments; at 3/3 stop and escalate scope to owner per design doc anti-spin rule).

- [ ] **Step 5: Report the three sign-offs**

Write results to the SDD report; all three PASS (or parked-with-cause at cap) completes the plan.

## Self-review

- Spec coverage: design doc §§ orchestration → Tasks 1–3+5–6; single-source protocol → Task 4 + Task 5 Step 1; copy/imagery rules → Task 5 Step 2 (+ AI abstracts need rights records before shipping — enforced at sign-off); exit criteria → Task 6; anti-spin → Task 6 Step 4 cap.
- Placeholders: none — every step names files/commands/expected outputs; owner-pick is a human gate between Tasks 3 and 4, not a plan gap.
- Type consistency: `journey-A/B`, `a11y-floor`, `brand-rails`, `direction-A/B`, `delta-table`, `signoff-*` named once and threaded through.
