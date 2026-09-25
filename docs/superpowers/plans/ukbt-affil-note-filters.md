# Affiliation-Note Removal + Filters Fully-Working + Photo Parity Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the "Also plays for Uppsala Tigers" note from player cards while keeping every filter button on both roster pages fully working, and close the Dhrubonil Roy photo gap (photo on /players/, missing on Uppsala) plus any same-class gaps the audit finds.

**Architecture:** Audit first (two parallel read-only audits: filters behavior + photo parity), then one implementer applies both fixes: affiliation becomes a `data-uppsala="true"` attribute on the card (no visible text) with `SquadGrid.matches()` reading the dataset instead of the removed element; missing photos wired only where files provably exist.

**Tech Stack:** Astro 7, TypeScript in `.astro` `<script>`, Playwright.

**Spec:** Owner directions 2026-09-25 (chat): (a) hide the affiliation note line, players stay on both pages; (b) "all these filters buttons does not work — ensure fully working state"; (c) Dhrubonil Roy photo present on /players/, absent on Uppsala — investigate gaps + same-class causes repo-wide. No separate spec doc — rulings provisional.

## Global Constraints

- pnpm only (`pnpm --filter @ukbt/web …`); Node ≥22, pnpm ≥10.
- Biome style: single quotes, semicolons, 2-space indent; `pnpm lint` clean.
- No new dependencies, no new routes, no contract changes.
- Reduced-motion + no-JS fallbacks preserved (filters hidden pre-script with full roster visible — that behavior stays).
- Inline-script/HTML weight: players page lives near its 72KB budget — no budget edits (numeric changes are re-approval events).
- UNKNOWN stays UNKNOWN: wire only photos whose files exist; never guess faces in unnamed gallery shots.
- Tina layer untouched.

## Root Cause Pointers (controller-verified, audit must confirm)

- `SquadCard` renders the note as `.ukbt-squad-card__affil`; `SquadGrid.matches()` key `'t'` tests `c.querySelector('.ukbt-squad-card__affil') !== null`. Deleting the element without changing `matches()` silently kills the Uppsala filter — the fix must move both together.
- Dhrubonil Roy: `players-data.ts:335-340` has `photoSlug: 'dhrubonil-roy'`; `franchises-data.ts` `uppsala.squad.roy` (~line 320) has no photo and its header comment (lines 24-26) still claims he has none — stale since the photo landed.
- Owner reports filter buttons dead: PR #107's rewire is merged to main; if the reporter tested production before deploy propagation, that explains it. The audit must reproduce on a FRESH local build and name exactly which buttons on which pages fail, if any.

---

### Task 1A: Filters behavior audit (read-only, parallel-safe)

**Files:** none (read-only).

- [ ] **Step 1: Map every filter control**

Read `apps/web/src/components/SquadGrid.astro` (filters list, `matches()` keys, `data-squad-ready` gate), `apps/web/src/pages/players.astro`, `apps/web/src/pages/franchises/uppsala-tigers.astro` (which grids render filters, which pass `filters={false}`), `apps/web/src/components/SquadCard.astro` (where `.ukbt-squad-card__affil` renders and under what conditions, e.g. officials variant, `org` prop).

- [ ] **Step 2: Reproduce against a fresh local build**

Build: `pnpm --filter @ukbt/truth tokens:build`, then with Tina env (`PUBLIC_TINA_CLIENT_ID=fe5da197-2c26-4071-9d72-e8216d5b53d6`, `TINA_TOKEN=local-build-fallback`, `TINA_BRANCH=main`) `pnpm --filter @ukbt/web exec astro build`; serve `apps/web/dist/client/` on :4321 (`node apps/web/tests/serve-static.mjs`, reuse the `UKBT-Preview` Scheduled Task — restart it via `Stop-ScheduledTask` + `Start-ScheduledTask` if stale). With Playwright (transient config minus the absent `/opt/pw-browsers/chromium` override — never modify the repo config), click EVERY filter button on `/players/` (`a,p,n,k,r,j,t`) and on `/franchises/uppsala-tigers/` (whichever render), fresh load AND after an away-and-back client navigation. Record: button, page, fresh/post-nav, resulting count text, PASS/FAIL.

- [ ] **Step 3: Write the audit report**

Write to `.superpowers/sdd/ukbt-affil-note-filters/task-1a-report.md`: per-button table + verdict (all working vs exact failures with evidence) + note on whether the owner-visible failure is explained by pre-#107 production. Return only: verdict line + failing buttons (or "all green").

### Task 1B: Photo parity audit (read-only, parallel-safe)

**Files:** none (read-only).

- [ ] **Step 1: Cross-match the two roster modules**

Read `apps/web/src/content/players-data.ts` (58 records: name, photoSlug, alsoUppsala) and `apps/web/src/content/franchises-data.ts` (`uppsalaSquad` + `uppsalaOfficials`: name, photo/photoSlug/photoAlt or absence). Match by exact name. For each person present on both sides, compare photo presence. Confirm file existence for every claimed photoSlug in `apps/web/public/media/players/` (+ `uppsala-squad/` if referenced) and `apps/web/src/assets/MANIFEST.md`.

- [ ] **Step 2: Hunt the same class elsewhere**

Grep both data modules + `SquadCard.astro` for stale photo-absence comments; check officials on both pages for the same gap class; check whether Uppsala-side records duplicate photo info or reference the players-data record (note the exact field names the fix must add).

- [ ] **Step 3: Write the audit report**

Write to `.superpowers/sdd/ukbt-affil-note-filters/task-1b-report.md`: gap list (name, side missing photo, file proof path or "no file — stays monogram"), stale comments found, exact field names/shapes for the fix. Return only: gap count + names.

### Task 2: Implement note removal + parity fixes

**Files:**
- Modify: `apps/web/src/components/SquadCard.astro`, `apps/web/src/components/SquadGrid.astro`, `apps/web/src/content/franchises-data.ts` (+ `players-data.ts` ONLY if the audit proves a gap on that side)
- Test: existing `apps/web/tests/visual/clientrouter-rewire.spec.ts` must stay green unmodified (its `50 of 58` / `8 of 58` counts must hold — if your change alters counts, STOP and report BLOCKED: counts are owner-verified truth).

**Interfaces:**
- Consumes: Task 1A + 1B reports (read both first — they name the exact gaps).
- Produces: no visible affiliation text anywhere; `data-uppsala="true"` on cards of Uppsala-affiliated players; `matches()` key `'t'` reading the dataset; photos wired where files exist.

- [ ] **Step 1: Move affiliation from element to data attribute**

In `SquadCard.astro`: remove the visible `.ukbt-squad-card__affil` paragraph; instead emit `data-uppsala="true"` on the card `<article>` when the player is Uppsala-affiliated (same condition that rendered the paragraph). Remove the now-orphaned `.ukbt-squad-card__affil` CSS rule only if nothing else uses the class (grep first). In `SquadGrid.astro`: change `matches()` key `'t'` from `c.querySelector('.ukbt-squad-card__affil') !== null` to `(c as HTMLElement).dataset.uppsala === 'true'`. Keep the `t` (Uppsala Tigers) filter button. Keep `aria-pressed`, counts, and all other keys byte-identical in behavior.

- [ ] **Step 2: Wire the audited missing photos**

For each Task 1B gap with a proven file: add the photo reference in the exact field shape that module uses (mirror adjacent records). Update/delete each stale photo-absence comment the audit found. Persons with no file anywhere stay monogram — record each as such in your report, do not guess.

- [ ] **Step 3: Lint + typecheck + commit**

Run `pnpm lint`, `pnpm typecheck` (both clean). Commit the touched files only: `git commit -m "fix(roster): affiliation note to data attribute, photo parity gaps closed"`.

- [ ] **Step 4: Report**

Write full report to `.superpowers/sdd/ukbt-affil-note-filters/task-2-report.md` (status, exact diff summary, commands + output, commit, self-review, concerns incl. any stays-monogram names). Return only: status, commit, one-line test summary, concerns.

### Task 3: Green verification + docs + PR

**Files:**
- Modify: `docs/12-roadmap-and-open-items.md` (append item under the roster-cards-v1 section)

**Interfaces:**
- Consumes: Task 2 commit.
- Produces: rebuilt dist proving no visible note + photos present, green suites, roadmap entry, pushed branch + PR.

- [ ] **Step 1: Rebuild + prove in dist**

Rebuild (tokens + Tina env + astro build as in Task 1A). Prove: zero occurrences of `Also plays for Uppsala Tigers` text in `dist/client/players/index.html` and `dist/client/franchises/uppsala-tigers/index.html`; `data-uppsala="true"` present; Dhrubonil `<img>` present on both pages. Restart the `UKBT-Preview` task so :4321 serves the fresh build.

- [ ] **Step 2: Run the suites**

`pnpm lint`, `pnpm typecheck`, `tests/visual/clientrouter-rewire.spec.ts` (transient-config method, unmodified — must stay green), plus `homepage.spec.ts` + `mobile-ux.spec.ts` neighbors. Full `deploy:verify` stays the CI canonical gate.

- [ ] **Step 3: Roadmap + commit + push + PR**

Append to the roster section: `9. **Affiliation note removal + photo parity (owner 2026-09-25):** note line removed from cards (filter kept via data attribute); Dhrubonil + <N> other parity gaps closed; <names> stay monogram (no photos in repo).` Commit roadmap only, push branch, `gh pr create --fill`. Report PR URL. Do NOT merge (owner merges).
