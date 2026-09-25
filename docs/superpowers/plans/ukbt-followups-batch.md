# Follow-ups Batch Plan (post repo-sync + deep-init residuals)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the five queued residuals: AGENTS:42 qualifier, v2-plan 16-gate line, Uppsala All-rounders filter, committed-spec visibility hardening, parity-checker gating decision.

**Architecture:** One mechanical batch (F1), one code+decision task (F2), one spec-hardening task (F3), verify+PR+merge (F4). Sequential implementation (SDD).

**Tech Stack:** Astro 7, Playwright, Markdown/YAML.

**Spec:** Owner queue 2026-09-25 + controller rulings below. No separate spec doc — rulings provisional.

**Controller rulings (binding):**
- Ruling F2-r: SHOW the All-rounders (`r`) filter on the Uppsala page, sourced from the same role data `matches()` already reads (badge text). The 5 `role:'All-rounder'` Uppsala records are owner-verified (EV-20260923-002); the button's absence is a tags-vs-badge render-count artifact, not a truth decision. Players page already pairs a tags-based world with badge matching. Cost if wrong: a filter grouping owner didn't intend — mitigated: roles ARE the grouping truth, counts stay exact.
- Ruling F2-p: parity checker (check-tina-field-parity.mjs) STAYS advisory (no CI job). Reason: TinaCloud-dependent live-index separation (Area B review); wiring it as a gate would fail PRs on cloud state. Already documented in scripts/AGENTS.md — F2 only confirms the rationale is present, no code change.
- Ruling F1: one-liners only, each verified in source first.

## Global Constraints

- pnpm only; Biome style; lint + typecheck clean.
- No new dependencies/routes/contracts. UNKNOWN stays UNKNOWN.
- Guard specs stay green: rewire 50/8, pages Uppsala 20-pin (Roy webp), mobile suites.

---

### Task F1: Mechanical one-liners batch

**Files:** `artifacts/AGENTS.md`, `docs/superpowers/plans/ukbt-players-uiux-v2.md` (tracked plan scratch — confirm tracked before editing)
- [ ] artifacts/AGENTS.md Protected §: qualify the HANDOFF never-edit line (living top refreshed 2026-09-25; frozen 2026-09-15 section below stays verbatim). One line.
- [ ] ukbt-players-uiux-v2.md:63: 16-gate → 18-gate (verify the line first).
- [ ] Commit: `docs: follow-up one-liners (HANDOFF qualifier, v2-plan gate count)`. Report + return contract.

### Task F2: Uppsala All-rounders filter + parity rationale check

**Files:** `apps/web/src/components/SquadGrid.astro` (render-count source only), maybe `apps/web/src/content/franchises-data.ts` (ONLY if tags must change — prefer NOT to touch data; see below)
- [ ] Read how the `r` button render count is derived (tags-based per Task 1A) vs how `matches('r')` works (badge text). Implement the minimal change so the `r` button renders on Uppsala IFF role data supports it (5 All-rounders) WITHOUT altering any record's tags/roles (data truth untouched). If the render path cannot use role data without restructuring, report BLOCKED with the exact structural reason instead of guessing.
- [ ] Confirm scripts/AGENTS.md already documents parity-checker advisory status + rationale (read it; if absent, add the two-line rationale there — that file may also need it).
- [ ] Run `pnpm lint`, `pnpm typecheck`, and the Uppsala roster spec (`pages.spec.ts -g "Uppsala Tigers roster photos"`) green. Commit: `fix(roster): show All-rounders filter on Uppsala from role data`.
- [ ] Report + return contract.

### Task F3: Visibility hardening for the guard spec

**Files:** `apps/web/tests/visual/clientrouter-rewire.spec.ts` (extend in place)
- [ ] Add computed-visibility assertions to both tests: after each filter/dot click (fresh AND post-nav), assert VISIBLE (non-`hidden`, Playwright `toBeVisible` on first matched card + count of hidden cards) matches the count text (players p→50 visible/58, n→8, k→5, r→17, j→3, t→20; Uppsala k→3/20, j→3/20). Reduced-motion context already in file — keep. No other behavior change; 50/8 pins intact.
- [ ] Run the spec file green (transient-config method if needed, delete after; rebuild only if dist stale). Commit: `test(web): visibility assertions in ClientRouter rewire spec`.
- [ ] Report + return contract.

### Task F4: Verify + PR + merge

- [ ] `pnpm lint`, `pnpm typecheck`, rewire spec + pages Uppsala + mobile-ux minimum. Push, `gh pr create --fill`. Merge ONLY on full green, else BLOCKED with evidence.
- [ ] Report: PR URL, merge SHA or BLOCKED cause.
