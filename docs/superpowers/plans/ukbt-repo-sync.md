# Repo-Wide Docs/Knowledge/Contracts/Specs Sync Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every doc, knowledge file, contract, script comment, spec pin, and content comment into agreement with the verified current state at main `30cefe6` (PRs #106–#110 merged).

**Architecture:** Four read-only audits already ran (reports in `.superpowers/sdd/repo-sync/audit-{docs,knowledge-contracts,scripts-specs,content}.md` — READ the one for your lane first; item IDs D-/R-/K-/F-/C- below come from them). Simple corrections go direct; the 11 contracts/ items go in as dated AMENDMENT blocks (the repo's own amendment mechanism), flagged for owner re-approval at review.

**Tech Stack:** Markdown/YAML/JSON docs, Astro 7, Playwright, Cloudflare Workers.

**Spec:** Owner direction 2026-09-25 ("update all docs, knowledge, contracts, scripts, schemas, specs, code per current state") + the four audit reports + web research below. No separate spec doc — rulings provisional.

**Web research (done 2026-09-25, cite in code comments where used):**
- Astro View Transitions (`https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/view-transitions.mdx`): `astro:page-load` is canonical ("runs on both initial page load and every subsequent navigation to restore event listeners"); `astro:before-swap`/`astro:after-swap` semantics confirmed. Our rewires already use them. The motion controller's `astro:page` is the legacy name — normalize to `astro:page-load` (Task 5).
- Cloudflare bot products (`https://developers.cloudflare.com/bots/get-started/bot-fight-mode/`, `/bots/troubleshooting/false-positives/`, `/waf/feature-interoperability/`): free Bot Fight Mode CANNOT be skipped by WAF custom rules or Page Rules — a `/__smoke` path exception only works under Super Bot Fight Mode (Pro+) via Skip rule, or by turning BFM off/upgrading. Corrects the pasted CI-fix note: first step is Security-Events lookup by ray to identify the exact Service; path-scoped Skip rule applies to SBFM/managed-challenge only. (Task 7.)

## Global Constraints

- pnpm only; Biome style (single quotes, semicolons, 2-space); `pnpm lint` + `pnpm typecheck` clean after every code-touching task.
- No new dependencies. No scope expansion without a ledger ruling.
- UNKNOWN stays UNKNOWN; every factual edit cites its evidence (commit, EV, file:line).
- contracts/ edits ONLY as dated AMENDMENT blocks appended in-file (never rewrite frozen text); each flagged `needs owner re-approval`.
- knowledge/ edits evidence-linked, minimal.
- Do NOT "fix": F-7 waits, F-8 skips, F-10/F-11/F-12, content non-issues (per-source splits, provenance filenames, Jeremy Martins, Roushan notes), R-06 note, clean lanes listed in audits.
- Full `deploy:verify` stays the CI canonical gate; no release-PASS claims locally.

---

### Task 1: Docs numbers + Tina docs + client guide (mechanical batch)

**Files:** Modify: `README.md`, `CONTRIBUTING.md`, `docs/tina-integration.md`, `docs/tina-client-guide.md`
**Audit:** `.superpowers/sdd/repo-sync/audit-docs.md` items D-01, D-02, D-11, D-12, D-13, D-14, D-15, D-16, D-17 (exact stale→fixed text per item; use the report verbatim).

- [ ] Apply all nine items exactly as the audit specifies (squad line, 14→18 checks, Astro 5.x→7.x, 15→18 gates, node-removal rebase, cssTotal 96KB both files, Tina closure status + smoke blocker, admin URL, frame-ancestors verify-note).
- [ ] `git commit -m "docs: sync counts, versions, budgets, Tina status to main@30cefe6"`.
- [ ] Report: status, commit, concerns.

### Task 2: Roadmap surgery (single-file judgment)

**Files:** Modify: `docs/12-roadmap-and-open-items.md`
**Audit:** items D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10.

- [ ] D-03 header date → 2026-09-25. D-04 Stage-9 row → 18 routes (README.md:41 list governs). D-05 remove canonical-UNKNOWN (domain decided). D-06 branch-protection line → 18 checks (keep admin residuals only if verifiable, else drop). D-07 §3 blockers → merged reality (58+4, 50+8, 20/20 Roy parity; committee/coaching still owner-gated). D-08 drop decided domain from open decisions.
- [ ] D-09: split the #106-titled section into four dated entries (#106 `cdf4800` roster cards; #107 `840bb2b` rewire + spec; #108 `ff59488` spelling + officials id; #110 `30cefe6` affil-note + `:global()` + Roy + pin 19→20). Keep items 1–9 content, redistributed under the right headings.
- [ ] D-10: disambiguate T2 line → "54 webp files on disk; of 58 players, 50 pictured + 8 monograms, 0 orphans".
- [ ] `git commit -m "docs: roadmap sync to post-#110 reality"`.
- [ ] Report: status, commit, concerns.

### Task 3: HANDOFF.md refresh (rewrite)

**Files:** Modify: `artifacts/HANDOFF.md`
**Audit:** item D-18 (full rewrite spec with exact values).

- [ ] Rewrite handoff to HEAD `30cefe6`: PRs #106–#110 with SHAs, `.opencode/` present (9 skills + 9 agents), `artifacts/` 20 dirs (recount via listing), contracts 19 / knowledge 12+1 (confirm), Playwright 4m42s run `36129209093`, smoke-FAIL standing blocker, local Device Guard + Scheduled Task notes. Verify every number against the repo (listings, git log) — never copy the audit blindly.
- [ ] `git commit -m "docs: handoff refresh to main@30cefe6"`.
- [ ] Report: status, commit, concerns.

### Task 4: Knowledge simple updates (K-01–K-06)

**Files:** Modify: `knowledge/01-VERIFIED-FACTS.yaml`, `knowledge/06-TEMPLATE-BOUNDARY.yaml`, `knowledge/07-CONTENT-TRUTH-POLICY.yaml`, `knowledge/08-VALIDATION-POLICY.yaml`
**Audit:** `.superpowers/sdd/repo-sync/audit-knowledge-contracts.md` K-01–K-06 (exact text per item).

- [ ] K-01 meta refresh (HEAD `30cefe6`, new EV cites). K-02 Uppsala 20+4 all pictured (Roy shared file). K-03 template-license roll-forward (mirror knowledge/01 + B2, append -024/-025, don't delete). K-04 content-truth counts (>0, registry populated, UNKNOWNs named). K-05 validation lists regenerated (18 checks; honest NO/PARTIAL survivors). K-06 unknowns recompute vs `artifacts/bootstrap/UNKNOWN-EVIDENCE.md`.
- [ ] `git commit -m "docs: knowledge substrate sync to post-#110 evidence"`.
- [ ] Report: status, commit, concerns.

### Task 5: Scripts/specs/content hardening batch

**Files:** Modify: `.github/workflows/ci.yml` (comments only), `apps/web/tests/visual/mobile-axe.spec.ts`, `apps/web/tests/visual/mobile-ux.spec.ts`, `tina/config.ts`, `scripts/check-perf.mjs`, `apps/web/playwright.config.ts`, `apps/web/src/layouts/BaseLayout.astro` (1 line), `apps/web/src/content/players-data.ts` (comment), `apps/web/src/components/SquadCard.astro` (comment), `apps/web/src/components/SquadGrid.astro` (comment), `apps/web/src/assets/MANIFEST.md` (2 spots)
**Audits:** scripts F-1, F-2, F-3, F-4, F-5, F-6, F-9; content C-1–C-5.

- [ ] F-1 header → production-stage gates (point to footer history). F-2/F-3 footer: 16→18 routes; RM-4 gap marked closed. F-4: add one-line exclusion rationale per file (offline/slug covered elsewhere — verify where, or extend lists). F-5: line pins → `(package.json:18, ci.yml:135, ci.yml:312)`. F-9: fail string uses `kb(BUDGETS.htmlPerPage)`.
- [ ] F-6: playwright chromium override → `existsSync` fallback to bundled (verify `node:fs` import style used in repo; keep CI path identical). Then run one spec file locally to prove both paths (override present/absent can't both be tested here — prove the fallback branch by pointing at a bogus path via env if the implementer wires env support; else prove config loads + typechecks and note CI proves the primary path).
- [ ] Motion `astro:page` → `astro:page-load` (BaseLayout motion controller listener + its comment citing Astro docs 2026-09-25 research). Behavior identical (page-load is the canonical name for the same hook).
- [ ] C-1 provenance pairs; C-2 ban comment reword; C-3 filter-absence rationale; C-4 Chowdhury twice-by-design (MANIFEST + EV-20260912-001 note — append-only: add amendment note, never rewrite the EV line); C-5 Depicts → Wayne Parnell (Source cell unchanged).
- [ ] Run `pnpm lint`, `pnpm typecheck`, plus the touched-area specs (`pages.spec.ts` Uppsala test + `mobile-ux.spec.ts` one file each minimum; full suite stays CI's). `git commit -m "chore: sync comments, pins, fallbacks to post-#110 reality"`.
- [ ] Report: status, commit, test outputs, concerns.

### Task 6: Contract amendments (re-approval batch, two halves — ONE dispatch, sequential commits)

**Files:** Modify: `contracts/CONTENT-CONTRACT.md`, `contracts/TRUTH-CONTRACT.md`, `contracts/REPOSITORY-CONTRACT.md`, `contracts/COMPONENT-CONTRACT.md`, `contracts/MOTION-CONTRACT.md`, `contracts/SEO-CONTRACT.md`, `contracts/ASSET-CONTRACT.md`, `contracts/DEPLOYMENT-CONTRACT.md` (flag-only note, no frozen-text touch), `contracts/VISUAL-REGRESSION-CONTRACT.md`, `contracts/ROUTE-CONTRACT.md`, `contracts/CI-CONTRACT.md`
**Audit:** R-01–R-11 (amendment text per item; R-08 = flag-only, R-06 note = no change).

- [ ] For each R-item: append a dated `AMENDMENT 2026-09-25 (repo-sync)` block in that file's existing amendment style, carrying the corrected statement + evidence links. NEVER edit frozen blocks. R-10 must additionally authorize `/offline` + `tina-island/[name]` (missing from Amendment 01/02 sets) AND reserve `/__smoke` (see Task 7 — if Task 7 lands, one amendment covers both; if Task 7 is deferred, reserve-only wording).
- [ ] Two commits: `docs: contract amendments batch 1 (content/truth/repository/component)` + `docs: contract amendments batch 2 (motion/seo/asset/deployment/visual/route/ci)`.
- [ ] Report: status, commits, per-contract one-liner, concerns. Flag prominently: each amendment needs owner re-approval at PR review (no silent freeze-lift).

### Task 7: Smoke-endpoint package (code + runbook, dashboard stays owner-side)

**Files:** Create: `apps/web/src/pages/__smoke.astro` (or `.ts` — match repo's island-endpoint pattern); Modify: `scripts/smoke-deploy.mjs`, `docs/12-roadmap-and-open-items.md` (smoke note), `contracts/ROUTE-CONTRACT.md` ONLY if Task 6 already opened the amendment (append /__smoke there, else note it as pending).
**Research:** Cloudflare docs 2026-09-25 — free Bot Fight Mode CANNOT be skipped by rule; Skip-rule path exception works for SBFM/managed-challenge only. First step is always ray-based Service identification.

- [ ] Endpoint returns JSON `{ok, buildId}` with the build SHA baked at build time (read how CI passes `--expect-sha ${{ github.sha }}`; bake via `import.meta.env` public var or build-time file — verify the mechanism exists before inventing one; if no clean mechanism, report NEEDS_CONTEXT instead of guessing). Headers: `content-type application/json`, `cache-control no-store`, `x-content-type-options nosniff`. Must not disturb perf budgets (tiny static output) or the sitemap (exclude: check how `offline`/`404` are treated and mirror).
- [ ] `smoke-deploy.mjs`: try `/__smoke` first for the SHA assertion; keep homepage/asset/header checks intact; NEVER accept 403 as pass (explicit: challenge-looking 403 fails with ray forensics, per current script behavior).
- [ ] Runbook in roadmap smoke note: ray lookup → Service identification → BFM (turn off/upgrade) vs SBFM (path-scoped Skip rule `(http.request.uri.path eq "/__smoke")` skipping bot products only) vs managed rules (WAF exception). Mark dashboard config OWNER ACTION.
- [ ] `git commit -m "feat(smoke): build-attested __smoke endpoint + dashboard runbook"`. If the SHA-bake mechanism can't be verified, do NOT commit a half-endpoint — report NEEDS_CONTEXT with the exact gap.
- [ ] Report: status, commit or NEEDS_CONTEXT + gap, test outputs, concerns.

### Task 8: Verification + closeout (PR + merge)

**Files:** Modify: none (docs only if CI demands). Commit the two untracked plan docs (`docs/superpowers/plans/ukbt-*.md` — records of merged work) if still untracked.
**Interfaces:** Consumes: Tasks 1–7 commits.

- [ ] Run `pnpm lint`, `pnpm typecheck`, and the specs covering touched areas (rewire + pages Uppsala + mobile-ux minimum). Push branch, `gh pr create --fill`. Record CI run URL.
- [ ] Merge ONLY when every required check is green (owner standing instruction). If red: single fix round per SDD loop, else report BLOCKED with the failing job + log excerpt.
- [ ] Report: status, PR URL, merge SHA or BLOCKED + cause.
