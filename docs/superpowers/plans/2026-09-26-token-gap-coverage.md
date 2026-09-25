# Token-Gap Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close (or explicitly rule out with evidence) every gap the 2026-09-26 ui-design-system audit found, so each ends VERIFIED-covered or rejected-with-cause — never speculative.

**Architecture:** Three read-only evidence sweeps over `apps/web` styles/components plus one upstream-report draft; promotion to `tokens/adapted/` happens only if a sweep produces measured evidence, and `tokens/approved/` is never touched by this plan.

**Tech Stack:** Node/pnpm repo, Astro site, Style Dictionary DTCG tokens, Playwright + gate scripts for verification. No new dependencies, no Python in-repo.

**Spec:** `docs/superpowers/specs/2026-09-26-ui-design-system-audit-design.md` — the coverage matrix and defect log (F-1–F-6) this plan argues from; executors read both.

## Global Constraints

- `tokens/approved/**` is frozen source — this plan writes nothing there.
- `tokens/adapted/` receives a draft only with measured consumer evidence attached.
- Every duration/easing/distance obeys `contracts/MOTION-CONTRACT.md` (tokens-first, transform/opacity only, spring/overshoot banned, reduced-motion kill-switch intact).
- `scripts/` stays pure Node stdlib; no new runtime deps (`packages/truth` = `zod` only).
- Research tasks change no shipped bytes; any commit contains only notes/spec updates.
- Biome style (single quotes, semicolons, 2-space) if any `.mjs`/`.ts` is touched (not expected).
- Verification evidence before completion claims, always.

---

### Task 1: Shadow-depth evidence sweep (G-1)

**Files:**
- Read: `apps/web/src/styles/**/*.css`, `apps/web/src/components/*.astro`, `packages/truth/src/tokens/approved/shadow.json`, `apps/web/src/styles/generated/` (compiled `--ukbt-shadow-*` only to list, never edit)
- Modify: none (research-only)
- Test: `node scripts/check-motion.mjs` (must stay PASS), `git status --short` (must show no source changes)

**Interfaces:**
- Consumes: audit spec §Coverage matrix row `shadows` (PARTIAL verdict)
- Produces: `Task-1-verdict` — either `NO-GO + cause` or `GO + consumer table` for Task 4

- [ ] **Step 1: List every shadow consumer**

Run: `rg -n "box-shadow|shadow" apps/web/src --glob '!styles/generated/**'`
Expected: a finite list mapping each hit to `sm`, `md`, a literal value, or none.

- [ ] **Step 2: Tabulate against approved sm/md**

For each consumer, record: file:line, rendered context (card, overlay, button…), token used or literal value. If a literal exists, note whether sm/md covers it visually or a deeper value is genuinely needed.

- [ ] **Step 3: Verdict with cause**

`NO-GO` if all consumers fit sm/md (record: "shadow depth gap closed — no consumer needs lg/xl/inner; adding them would be speculative"). `GO` only with ≥1 consumer needing depth beyond md, attaching file:line + context.

- [ ] **Step 4: Verify nothing broke**

Run: `node scripts/check-motion.mjs`
Expected: `MOTION_STATUS = PASS`. Run: `git status --short` — Expected: no modifications (research-only).

- [ ] **Step 5: Report**

Write findings to the SDD report file (brief path from `scripts/task-brief`), return `Task-1-verdict` + test evidence. No commit (nothing changed).

### Task 2: Named-keyframes evidence sweep (G-2)

**Files:**
- Read: `apps/web/src/styles/**/*.css`, `apps/web/src/components/*.astro`, `apps/web/src/layouts/*.astro`, `packages/truth/src/tokens/approved/motion.json`, `contracts/MOTION-CONTRACT.md` (restraint list + micro-interaction matrix)
- Modify: none (research-only)
- Test: `node scripts/check-motion.mjs` (must stay PASS)

**Interfaces:**
- Consumes: audit spec §Coverage matrix row `animation` (keyframes = RAW candidate)
- Produces: `Task-2-verdict` — `NO-GO + cause` or `GO + keyframe table` for Task 4

- [ ] **Step 1: List every keyframe/animation definition**

Run: `rg -n "@keyframes|animation:" apps/web/src --glob '!styles/generated/**'`
Expected: finite list with file:line + properties animated.

- [ ] **Step 2: Contract-check each hit**

Each keyframe must animate transform/opacity only, resolve static under `prefers-reduced-motion`, and use approved duration/easing tokens. Record compliant vs violating (violating = fix-existing task, out of this plan's scope — note and move on).

- [ ] **Step 3: Repetition test**

A named keyframe token is justified only if the same compliant keyframe repeats in ≥2 places with identical values. Single-use or differing values → `NO-GO` ("keyframe token would be abstraction without repetition").

- [ ] **Step 4: Verify nothing broke**

Run: `node scripts/check-motion.mjs`
Expected: `MOTION_STATUS = PASS`.

- [ ] **Step 5: Report**

Return `Task-2-verdict` + evidence to the report file. No commit.

### Task 3: Component-sizing parity check (G-3)

**Files:**
- Read: `packages/truth/src/contracts/card.contract.md`, `link.contract.md`, `breadcrumb.contract.md` (button.contract.md already verified: token deps reference approved space/font/motion/color/radius tokens), `packages/truth/src/tokens/approved/layout.json`, `geometry.json`
- Modify: none (research-only)
- Test: `pnpm --filter @ukbt/truth exec vitest run src/gate/rules.test.ts` (must stay 48 passed)

**Interfaces:**
- Consumes: audit spec matrix row `sizing.components` (COVERED-by-contract claim)
- Produces: `Task-3-verdict` — confirmed covered, or a named gap with file:line

- [ ] **Step 1: Read the three contracts**

Extract each contract's `Token dependencies` row. Confirm every sizing need (button/input/icon heights, paddings, container widths, control heights) resolves to an approved token or an explicit "none required" statement.

- [ ] **Step 2: Cross-check layout + geometry**

Confirm `layout.json` container/gutter and `geometry.json` control height cover what the contracts reference. Note any dangling reference (contract cites a token that does not exist) as a gap with exact file:line on both sides.

- [ ] **Step 3: Verdict**

`COVERED` if all references resolve; otherwise list each dangling reference as `GAP: <contract>:<line> → missing <token>`.

- [ ] **Step 4: Verify**

Run: `pnpm --filter @ukbt/truth exec vitest run src/gate/rules.test.ts`
Expected: 48 passed, 0 failed.

- [ ] **Step 5: Report**

Return `Task-3-verdict` + test evidence. No commit.

### Task 4: Upstream defect report draft (F-1/F-2 — not a repo gap)

**Files:**
- Read: audit spec §Defect log (F-1, F-2 exact error text)
- Create: nothing in-repo. Draft text is returned in the report only (filing on the upstream repo is an external side effect for the owner to approve separately).

**Interfaces:**
- Consumes: F-1 (`SyntaxError` line 64 `'#FBB\n\nD24'`, fix: join to `'#FBBF24'`), F-2 (`_export_as_scss` missing, fix: implement or drop `scss` from advertised formats)
- Produces: issue draft text (title + body with repro commands)

- [ ] **Step 1: Draft the issue**

Title: `design_token_generator.py unrunnable as-is: SyntaxError + missing scss exporter`. Body: repro (`python scripts/design_token_generator.py "#001E3A" modern summary` → SyntaxError line 64; `... scss` → AttributeError), the two minimal fixes, environment (Python 3.13, Windows). No speculation beyond the two reproduced failures.

- [ ] **Step 2: Report**

Return the draft text. Do not file, do not commit.

### Task 5: Closeout — spec update, verify, PR

**Files:**
- Modify: `docs/superpowers/specs/2026-09-26-ui-design-system-audit-design.md` (append `## Gap dispositions 2026-09-26` with the three verdicts + F-1/F-2 draft status)
- Test: `pnpm --filter @ukbt/truth exec tsc --noEmit`, `node scripts/check-motion.mjs`, `git status --short`

**Interfaces:**
- Consumes: `Task-1/2/3-verdict`, Task 4 draft
- Produces: updated spec + branch pushed + PR URL

- [ ] **Step 1: Append dispositions**

Add one subsection per verdict, quoting the cause line. If any verdict is `GO`, describe the `adapted/` draft as follow-up work (new task, not this plan — this plan never writes `adapted/` without a second approval).

- [ ] **Step 2: Verify clean**

Run: `pnpm --filter @ukbt/truth exec tsc --noEmit` (Expected: 0 errors), `node scripts/check-motion.mjs` (Expected: PASS), `git status --short` (Expected: only the spec file modified).

- [ ] **Step 3: Commit and push**

Run: `git add docs/superpowers/specs/2026-09-26-ui-design-system-audit-design.md && git commit -m "docs: gap dispositions for ui-design-system audit (shadow/keyframes/sizing)" && git push`
Expected: push succeeds on the execution branch.

- [ ] **Step 4: Report**

Return commit SHA + PR URL (open the PR with `gh pr create --fill` only if branch protection allows; otherwise report the pushed branch).

## Self-review

- Spec coverage: G-1 → Task 1, G-2 → Task 2, G-3 → Task 3, F-1/F-2 → Task 4, closeout → Task 5. Upstream `component docs / responsive calc / handoff` promises are UNKNOWN (never retrieved) and stay out of scope — noted, not planned.
- Placeholders: none — every step names exact files/commands/expected outputs.
- Type consistency: verdicts flow Task N → Task 5 by name; no code interfaces to mismatch (research-only plan).
