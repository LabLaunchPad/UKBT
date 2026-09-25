# 🔄 Agent Handoff — post-deep-init main (`e73dad2`)

> Refreshed 2026-09-25 on `feat/repo-sync`. Supersedes the frozen 2026-09-15 (#76 / `51bb451`) handoff below it — that section is kept verbatim as history, do not edit it.
> Scope note: `artifacts/AGENTS.md` (added #111) marks this file historical/frozen; this rewrite is explicitly ordered by `docs/superpowers/plans/ukbt-repo-sync.md` Task 3 (owner direction 2026-09-25) and the D-18 audit — flagged for reviewer awareness, not silent.

## Current State

**Repo**: `LabLaunchPad/UKBT.git`
**Main**: `e73dad2` — `feat/deep init (#111)`, merged 2026-09-25 (verified: `git rev-parse origin/main` = `e73dad2…`; `git log origin/main --oneline -6` shows #106→#111 in order)
**Branch**: `feat/repo-sync` @ `68addeb` — repo-sync Tasks 1 (`edb9346`) + 2 (`68addeb`) landed, Task 3 is this file, Tasks 4–8 pending

### Merged since the last handoff (all 2026-09-25, verified via `git log --format='%h %ad %s'`)

| PR | SHA | What |
|---|---|---|
| #106 | `cdf4800` | Roster cards v1 — owner-verbatim 58-player role+country cards, shared Uppsala card (`EV-20260923-002`) |
| #107 | `840bb2b` | ClientRouter rewire — slideshow dots + squad filters re-init on `astro:page-load` (`tests/visual/clientrouter-rewire.spec.ts`, AL-042) |
| #108 | `ff59488` | Roster spelling (Wayne Parnell, Sri Lanka x2, Netherlands — supersede verbatim for those four only) + unique officials grid id |
| #110 | `30cefe6` | Affil-note removal (cards → `data-uppsala` filter attribute), SquadGrid `:global()` hide-rule fix, Roy photo parity 20/20, `pages.spec` pin 19→20 |
| #111 | `e73dad2` | Deep init — 9 local-rules `AGENTS.md` files (`.github`, `apps/web`, `artifacts`, `contracts`, `docs`, `knowledge`, `packages/truth`, `scripts`, `tina`; 17 files in the #111 stat, +1360/−11, which also counts root `AGENTS.md`, `README.md`, `docs/deep-init-report.md`, 4 plan docs, `docs/tina-integration.md`), `docs/deep-init-report.md`, 4 plan docs under `docs/superpowers/plans/` |

### Verified tree counts (recounted 2026-09-25, not copied from the audit)

- **`artifacts/` = 20 subdirectories**: `adaptive-learning`, `adelux`, `architecture`, `audit`, `bootstrap`, `brand`, `content`, `design`, `evidence`, `extraction`, `pages`, `performance`, `receipts`, `renders`, `responsive`, `review`, `source`, `ui`, `verification`, `visual` (via `Get-ChildItem -Directory artifacts`)
- **`contracts/` = 20 Markdown files**: 19 frozen (17× `*-CONTRACT.md` + `README.md` + `evidence-contract.md`) + `AGENTS.md` (added #111). D-18 said "19" — the +1 is the #111 local-rules file, frozen set unchanged
- **`knowledge/` = 12 YAML (01–12) + `00-KNOWLEDGE-CONTRACT.md` + `AGENTS.md`** (added #111). Frozen substrate unchanged
- **`.opencode/` present** (D-18's "9 skills + 9 agents" undercounts — verified): **17 agent files** = 9 `ukbt-*` motion advisors (`ukbt-60fps`, `ukbt-accessible-motion`, `ukbt-ascii-reference`, `ukbt-glass-reference`, `ukbt-gsap-reference`, `ukbt-lottie-reference`, `ukbt-micro-interaction`, `ukbt-page-transition-reference`, `ukbt-svg-motion`) + 8 domain (`browser-forensics`, `cloudflare-release-auditor`, `monorepo-auditor`, `orchestrator`, `schema-contract-auditor`, `security-auditor`, `tina-architect`, `tinacloud-commissioner`); **15 skill dirs** = 9 motion (`60fps-animation`, `accessible-animation`, `ascii-animation`, `glassmorphism`, `gsap-web`, `lottie-animation`, `micro-interaction`, `page-transition-animation`, `svg-animation`) + 6 `ukbt-*` (`ukbt-browser-forensics`, `ukbt-release-verification`, `ukbt-schema-contract`, `ukbt-security-boundary`, `ukbt-tinacloud-e2e`, `ukbt-tinacms`); plus `commands/` and `node_modules/`
- **Site state**: 58 players + 4 officials on `/players` (50 photos + 8 monograms; 54 `.webp` on disk incl. officials/management); 20 players + 4 officials on `/franchises/uppsala-tigers`, 20/20 photos after Roy parity (#110); 18 `.astro` route files
- **`opencode.json`**: valid, `instructions: ["AGENTS.md", "README.md", "index.md", "artifacts/HANDOFF.md"]`, `username: "ukbt-agent"`
- **`index.md`**: `okf_version: "0.2"` frontmatter intact; `last_updated: 2026-09-15` header date is now stale (post-#111) — flagged, not fixed here (outside Task 3 file scope)

### Pipeline / CI (verified)

- **Engines** (`package.json:6-10`): Node `>=22.22.0`, pnpm `>=10.0.0`, `packageManager pnpm@10.33.0`
- **`deploy:verify`** (`package.json:42`, 18 steps): scaffold-self-test → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → check:release-path → check:content-trust → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf
- **CI jobs** (`.github/workflows/ci.yml`): 20 jobs — install, governance-scaffold, dependency-allowlist, control-plane, failure-injection, lint, typecheck, unit-tests, build, deploy-mapping, link-integrity, seo-gate, ui-gate, security-gate, perf-gate, motion-gate, visual-and-accessibility, secret-scan, smoke-verify, workers-deploy (18 required + smoke-verify + workers-deploy)
- **Last green CI**: run `36129209093` — all 18 required checks PASS, Playwright **4m42s** (per `docs/12-roadmap-and-open-items.md` roster-cards section)

### Standing blocker — post-deploy smoke FAIL (owner action, unchanged)

Post-deploy smoke FAILs on `main` (run `35816266024` + retry, all 6 paths `403 mitigated=challenge`, rays `a3f6b6*`): GH-runner egress is Cloudflare-challenged while production is 200 externally. Owner action: dashboard Security → Events lookup for ray `a3f6b6da2a2d433c` → rule name, then decide (allowlist Actions egress / tune bot policy / bless alternate vantage). Smoke gate stays enforced; nothing weakened. (Source: roadmap Tina-closure § item 5.)

### Local environment notes (this machine)

- `astro dev` stays blocked — Device Guard kills `workerd`, miniflare spawn UNKNOWN −4094
- Static preview runs as Scheduled Task `UKBT-Preview` (`http://127.0.0.1:4321/`, AL-040) — stops on logoff/reboot

## repo-sync progress (plan `docs/superpowers/plans/ukbt-repo-sync.md`)

- [x] Task 1 — docs numbers/Tina/client-guide (`edb9346` "docs: sync counts, versions, budgets, Tina status to main@30cefe6", 4 files)
- [x] Task 2 — roadmap surgery (`68addeb` "docs: roadmap sync to post-#110 reality", roadmap only)
- [x] Task 3 — this handoff refresh (this commit)
- [ ] Task 4 — knowledge simple updates (K-01–K-06)
- [ ] Task 5 — scripts/specs/content hardening batch (F-1–F-6, F-9, C-1–C-5 + `astro:page` → `astro:page-load`)
- [ ] Task 6 — contract amendments (R-01–R-11, dated AMENDMENT blocks, needs owner re-approval)
- [ ] Task 7 — smoke-endpoint package (`/__smoke` + runbook; dashboard stays owner-side)
- [ ] Task 8 — verification + closeout (PR + merge when all checks green)

Next agent: continue Task 4 per the plan; read `.superpowers/sdd/repo-sync/audit-knowledge-contracts.md` K-items first. Present domain agents live in `.opencode/agents/` (not the generic proposals in the frozen section below).

## Verification Checklist for Incoming Agent

- [ ] `git rev-parse origin/main` = `e73dad2` (PR #111 merged); branch `feat/repo-sync` carries Tasks 1–3 on top
- [ ] `git log origin/main --oneline -7` shows `cdf4800` / `840bb2b` / `ff59488` / `30cefe6` / `e73dad2`, all dated 2026-09-25
- [ ] `Get-ChildItem -Directory artifacts` count = 20 (list above)
- [ ] `Get-ChildItem contracts/*.md` count = 20 (19 frozen + `AGENTS.md`); `Get-ChildItem knowledge/*.yaml` count = 12
- [ ] `Get-ChildItem .opencode/agents/*.md` count = 17; `Get-ChildItem .opencode/skills -Directory` count = 15
- [ ] Roadmap cites CI run `36129209093` (Playwright 4m42s) and smoke-FAIL run `35816266024` — both present in `docs/12-roadmap-and-open-items.md`
- [ ] No push performed; only `artifacts/HANDOFF.md` modified in this commit

---

*Handoff refreshed by: UKBT Agent | Date: 2026-09-25 | Main: `e73dad2` (#111) | Branch: `feat/repo-sync`*

---

# 🔄 Agent Handoff — OKF Knowledge Bundle Integration (FROZEN 2026-09-15 — history, do not edit below this line)

## Current State

**Repo**: `LabLaunchPad/UKBT.git` (local checkout: `C:\UKBT\UKBT-main`)
**Branch**: `main` (merged at commit `51bb451`)
**PR**: #76 — `feat: add OKF knowledge bundle index, update AGENTS.md, add opencode.json`
**All 18/18 CI checks PASSED**

### Files Changed
| File | Change | Lines |
|---|---|---|
| `AGENTS.md` | Updated — added OKF section, visual truth section, evidence classification, agent topology | +43 |
| `index.md` | Created — Full OKF v0.2 bundle index with YAML frontmatter | +229 |
| `opencode.json` | Created — References AGENTS.md, README.md, index.md | +1 |

### Key Details
- **pnpm monorepo**: `apps/*` and `packages/*` workspaces, Node >=22, pnpm >=10.33.0
- **deploy:verify order**: scaffold-self-test → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf
- **All 18 required checks passed + Workers Builds**: Build, Control plane, Dependency allowlist, Deploy failure injection, Deploy mapping, Governance scaffold, Install, Internal link integrity, Lint (Biome), Motion gate, Performance budgets, Playwright (3m54s on PR #77 run 34951850100), SEO gate, Secret scan, Security headers, Typecheck, UI gate, Unit/integration tests, plus Workers Builds
- **opencode.json**: Valid JSON with `instructions: ["AGENTS.md", "README.md", "index.md", "artifacts/HANDOFF.md"]` (3 on main, 4th added by this PR) and `username: "ukbt-agent"`
- **`.opencode/agents/` does NOT exist on main @51bb451** (verified `Test-Path .opencode` = False) — agent definitions referenced below are PROPOSED, not present
- **knowledge/ directory**: 12 YAML files (01-12) + `00-KNOWLEDGE-CONTRACT.md`
- **contracts/ directory**: 19 Markdown files (17× `*-CONTRACT.md` + `README.md` + `evidence-contract.md`)
- **artifacts/ directory**: 19 subdirectories (verified)

### Agent Roles (from `knowledge/09-AGENT-HARNESS-POLICY.yaml`)
- Roles are accountability vocabulary, NOT a spawn list
- Independence requires SEPARATE_SESSION, not subagent
- Single writer for application code
- `.claude/agents/` is empty by design

---

## Recommended Agents for Next Steps

### 1. `engineering-knowledge-graph-engineer` — HIGH PRIORITY
**Why**: The `knowledge/` directory has 12 YAML files (01-12) that could benefit from graph-based structuring. The `index.md` maps them but they're still flat files. This agent should:
- Structure the knowledge corpus as interconnected entity-relationship nodes
- Add provenance edges linking each knowledge file to its evidence sources (EV-xxxxx IDs)
- Build a queryable graph from the knowledge YAML files
- Ensure every claim in `01-VERIFIED-FACTS.yaml` traces to source nodes
- Cross-reference bi-directionally between knowledge files
- Flag orphan nodes and contested claims

### 2. `testing-reality-checker` — HIGH PRIORITY  
**Why**: The PR was merged but the Playwright test took 4m22s. This agent should:
- Verify the merged state in production
- Cross-check that `index.md`, `AGENTS.md`, and `opencode.json` render correctly
- Validate that the OKF bundle is properly structured
- Run the deploy mapping check to ensure wrangler.jsonc paths are correct
- Confirm the build output matches expectations

### 3. `marketing-ai-citation-strategist` — MEDIUM PRIORITY
**Why**: This is a new website project. AEO/GEO optimization should be considered early:
- Audit UKBT brand visibility across ChatGPT, Claude, Gemini, Perplexity
- Check if the OKF knowledge bundle structure helps AI citation
- Verify structured data and schema markup on key pages
- Recommend content fixes to improve AI citations
- The `knowledge/07-CONTENT-TRUTH-POLICY.yaml` already defines content truth rules

### 4. `marketing-seo-specialist` — MEDIUM PRIORITY
**Why**: SEO gates are part of `deploy:verify`. The SEO check passed but ongoing optimization needed:
- Review `docs/tina-integration.md` and `docs/tina-client-guide.md` for SEO implications
- Check `knowledge/11-VISUAL-TRUTH-POLICY.yaml` for visual SEO impact
- Verify `scripts/check-seo.mjs` findings are addressed
- Review the 12-page site for structured data opportunities
- Check `apps/web/public/llms.txt` for LLM crawler optimization

### 5. `security-architect` — MEDIUM PRIORITY
**Why**: Security checks passed but ongoing threats exist:
- Review `scripts/check-security.mjs` and `scripts/check-deploy-mapping.mjs` for gaps
- Check if `wrangler.jsonc` observability settings are properly configured
- Verify `tina/config.ts` doesn't expose secrets
- Check `.github/workflows/ci.yml` for any security gaps
- Review the 18 CI checks for any that could be bypassed

### 6. `engineering-code-reviewer` — LOW PRIORITY
**Why**: Review the new files for quality:
- Verify `index.md` YAML frontmatter is valid
- Check `opencode.json` schema compliance
- Review `AGENTS.md` for consistency with `CLAUDE.md`
- Ensure no hardcoded values that should be in contracts

### 7. `agents-orchestrator` — LOW PRIORITY
**Why**: Manage the next pipeline stage:
- Coordinate the handoff between agents above
- Track progress on knowledge graph construction
- Manage the QA loop for the merged changes
- Ensure all agents complete their tasks before marking done

---

## Other Recommended Things

### OpenCode Config Notes
- `opencode.json` has `instructions` array loading AGENTS.md, README.md, index.md (+ artifacts/HANDOFF.md via this PR)
- `.opencode/` does NOT exist on main @51bb451 — no bundled agents/skills/commands yet; agent names below are PROPOSED roles per `knowledge/09-AGENT-HARNESS-POLICY.yaml`, not present definitions
- Consider adding `.opencode/skills/` for OKF-specific skills

### Knowledge Base Gaps to Address
1. **`knowledge/06-TEMPLATE-BOUNDARY.yaml`** — Adelux template boundary needs updating after merge
2. **`knowledge/12-AI-CONTROL-PLANE.yaml`** — Pipeline state may need updating after PR merge
3. **`knowledge/01-VERIFIED-FACTS.yaml`** — Add new verified facts about OKF integration
4. **`artifacts/receipts/`** — Should have a new receipt for the OKF integration

### Contract Considerations
- **`contracts/REPOSITORY-CONTRACT.md`** — May need to reference OKF as a new standard
- **`contracts/DESIGN-SYSTEM-CONTRACT.md`** — Design tokens should align with OKF structure
- **`contracts/CONTENT-CONTRACT.md`** — Content truth rules should reference OKF bundle format

### Pipeline Notes
- `deploy:verify` order includes `check:control-plane` and `test:failure-injection`
- The `scripts/check-deploy-mapping.mjs` validates `wrangler.jsonc` paths against build output
- `pnpm tokens:build` must run before `typecheck` and `build`
- `@astrojs/cloudflare` is a production dependency (not devDependency) in the merged state

---

## Verification Checklist for Incoming Agent

- [ ] `pnpm install` completed (deps verified)
- [ ] `pnpm deploy:verify` all 18 checks passed
- [ ] `opencode.json` valid JSON with 4 instructions (3 on main + HANDOFF.md via this PR)
- [ ] `index.md` has valid YAML frontmatter with `okf_version: "0.2"`
- [ ] `AGENTS.md` has OKF section at top (lines 3-17)
- [ ] Git branch `main` synced with `origin/main`
- [ ] PR #76 merged at commit `51bb451`
- [ ] `.opencode/` absent on main verified (no bundled agents — names above are PROPOSED)
- [ ] `knowledge/` directory has 12 YAML files (01-12) + `00-KNOWLEDGE-CONTRACT.md`
- [ ] `contracts/` directory has 19 Markdown files
- [ ] `artifacts/` directory has 19 subdirectories

---

*Handoff created by: UKBT Agent | Date: 2026-09-15 | Commit: 51bb451*
