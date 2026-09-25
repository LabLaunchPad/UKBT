---
okf_version: "0.2"
bundle_name: ukbt-knowledge-base
description: >
  UK Bangla Tigers knowledge bundle — evidence-linked decision substrate,
  frozen contracts, and verification artifacts for the UKBT website project.
  Follows Google Open Knowledge Format v0.2 conventions.
bundle_type: project-knowledge
created: 2026-08-26
last_updated: 2026-09-25
status: active
maintainer: UKBT Engineering
---

# UKBT Knowledge Bundle

This is the OKF (Open Knowledge Format) index for the UK Bangla Tigers
website project. It maps the knowledge corpus so agents can navigate the
decision substrate, contracts, and verification artifacts without guessing.

## Quick Reference

| Question | Where to look |
|---|---|
| What is verified vs UNKNOWN? | `knowledge/01-VERIFIED-FACTS.yaml` |
| What rules govern agent decisions? | `knowledge/02-DECISION-RULES.yaml` |
| What are the architecture invariants? | `knowledge/03-ARCHITECTURE-INVARIANTS.yaml` |
| What is the evidence policy? | `knowledge/04-EVIDENCE-POLICY.yaml` |
| How are unknowns handled? | `knowledge/05-UNKNOWN-BLOCKER-POLICY.yaml` |
| What is the template boundary? | `knowledge/06-TEMPLATE-BOUNDARY.yaml` |
| What is the content truth policy? | `knowledge/07-CONTENT-TRUTH-POLICY.yaml` |
| What is the validation policy? | `knowledge/08-VALIDATION-POLICY.yaml` |
| What are the agent harness rules? | `knowledge/09-AGENT-HARNESS-POLICY.yaml` |
| What are the anti-drift rules? | `knowledge/10-ANTI-DRIFT-RULES.yaml` |
| What is the visual truth policy? | `knowledge/11-VISUAL-TRUTH-POLICY.yaml` |
| What is the AI control plane? | `knowledge/12-AI-CONTROL-PLANE.yaml` |
| What is the agent operating contract? | `CLAUDE.md` |
| What is the build order? | `docs/10-fresh-repo-pipeline.md` |
| What are the frozen contracts? | `contracts/` directory |

## Knowledge Corpus

### Decision Substrate (`knowledge/`)

The compact, evidence-linked decision substrate. Read before any project-level
decision. Every entry carries an evidence link or is marked as unestablished.

| File | Purpose | Last Updated |
|---|---|---|
| `00-KNOWLEDGE-CONTRACT.md` | Defines how the knowledge directory works | 2026-08-26 |
| `01-VERIFIED-FACTS.yaml` | Only what has actually been established with evidence | 2026-09-06 |
| `02-DECISION-RULES.yaml` | Rules the agent applies autonomously (DR-001..DR-015) | 2026-08-26 |
| `03-ARCHITECTURE-INVARIANTS.yaml` | Boundaries inside which the agent may decide freely | 2026-08-26 |
| `04-EVIDENCE-POLICY.yaml` | Evidence classification and publishability rules | 2026-08-26 |
| `05-UNKNOWN-BLOCKER-POLICY.yaml` | Guards against overblocking and underblocking | 2026-08-26 |
| `06-TEMPLATE-BOUNDARY.yaml` | Adelux template provenance and license boundary | 2026-08-26 |
| `07-CONTENT-TRUTH-POLICY.yaml` | Permitted and prohibited content sources | 2026-08-26 |
| `08-VALIDATION-POLICY.yaml` | Validation states and verification rules | 2026-08-26 |
| `09-AGENT-HARNESS-POLICY.yaml` | Agent roles, independence, and topology rules | 2026-08-31 |
| `10-ANTI-DRIFT-RULES.yaml` | Rules to prevent silent drift from frozen decisions | 2026-08-26 |
| `11-VISUAL-TRUTH-POLICY.yaml` | Visual truth, extraction, and drift policy | 2026-08-31 |
| `12-AI-CONTROL-PLANE.yaml` | AI control plane and governance pipeline | 2026-09-15 |

### Knowledge Examples (`knowledge/examples/`)

| File | Purpose |
|---|---|
| `FEW-SHOT-GOOD-DECISION.md` | Example of a correct agent decision |
| `FEW-SHOT-BAD-DECISION.md` | Example of an incorrect agent decision |
| `FEW-SHOT-CONFLICT.md` | Example of a conflict resolution |

## Frozen Contracts (`contracts/`)

Machine-checkable agreements. Changing one is a re-approval event.

| Contract | Scope |
|---|---|
| `REPOSITORY-CONTRACT.md` | Repository structure and package boundaries |
| `ROUTE-CONTRACT.md` | Route set governance |
| `SEO-CONTRACT.md` | Search engine optimization requirements |
| `CSS-CONTRACT.md` | CSS architecture and conventions |
| `ACCESSIBILITY-CONTRACT.md` | WCAG compliance requirements |
| `FORM-CONTRACT.md` | Form handling and validation |
| `DEPLOYMENT-CONTRACT.md` | Cloudflare Workers deployment |
| `CI-CONTRACT.md` | CI/CD pipeline requirements |
| `RIGHTS-CONTRACT.md` | Licensing and rights management |
| `VISUAL-REGRESSION-CONTRACT.md` | Visual regression testing |
| `COMPONENT-CONTRACT.md` | Component architecture |
| `DESIGN-SYSTEM-CONTRACT.md` | Design system tokens and patterns |
| `CONTENT-CONTRACT.md` | Content schemas and validation |
| `TRUTH-CONTRACT.md` | Truth gate and provenance |
| `ASSET-CONTRACT.md` | Asset management and licensing |
| `MOTION-CONTRACT.md` | Animation and motion design |
| `AI-EXECUTION-CONTRACT.md` | AI execution state machine |

### Contract Schemas

| Schema | Purpose |
|---|---|
| `schemas/receipt.schema.json` | Task receipt validation |
| `evidence-record.template.yaml` | Evidence record template |
| `task-contract.template.yaml` | Task contract template |

## Verification Artifacts (`artifacts/`)

Detailed evidence behind the knowledge substrate. Retrieved only when a
decision needs it.

| Directory | Contents |
|---|---|
| `adaptive-learning/` | Error catalog, prevention checklist, recurrence protocol |
| `bootstrap/` | Bootstrap discovery output |
| `receipts/` | Per-stage verification receipts |
| `review/` | Independent review output |
| `content/` | Client-blocked content asks |
| `verification/` | Architecture verification |
| `evidence/` | Raw evidence records |
| `design/` | Design system evidence |
| `ui/` | UI verification evidence |
| `visual/` | Visual verification evidence |
| `responsive/` | Responsive verification evidence |
| `pages/` | Per-page verification |
| `renders/` | Render evidence |

## Scripts and Verification Commands

| Command | Script | Purpose |
|---|---|---|
| `pnpm deploy:verify` | (orchestrates all below) | Full release gate |
| `pnpm check:governance-scaffold` | `scripts/scaffold-self-test.mjs` | Scaffold integrity |
| `pnpm check:control-plane` | `scripts/check-control-plane.mjs` | AI control-plane self-audit |
| `pnpm check:deps` | `scripts/check-dependency-allowlist.mjs` | Dependency allowlist |
| `pnpm lint` | `biome check .` | Code quality |
| `pnpm tokens:build` | `style-dictionary build` | Design tokens |
| `pnpm typecheck` | `tsc --noEmit` | Type safety |
| `pnpm test:unit` | `vitest run` | Unit tests |
| `pnpm build` | `astro build` | Production build |
| `pnpm check:links` | `scripts/check-internal-links.mjs` | Link validation |
| `pnpm check:seo` | `scripts/check-seo.mjs` | SEO validation |
| `pnpm check:ui` | `scripts/check-ui.mjs` | UI validation |
| `pnpm check:motion` | `scripts/check-motion.mjs` | Motion validation |
| `pnpm check:security` | `scripts/check-security.mjs` | Security validation |
| `pnpm check:perf` | `scripts/check-perf.mjs` | Performance validation |
| `pnpm test:failure-injection` | `scripts/test-deploy-failure-injection.mjs` | Deploy failure injection (P14) |
| `pnpm smoke:deploy` | `scripts/smoke-deploy.mjs` | Post-deploy HTTP gate |

## Agent Topology

### OpenCode Agents (`.opencode/agents/`) and Skills (`.opencode/skills/`)

9 motion advisors (read-only subagents, `edit: deny`, `bash: deny`, one skill each) vendored from `iart-ai/web-animation-skills` @ `b6dba3e` (MIT; see `THIRD-PARTY-NOTICES.md`). Each skill carries a binding `## UKBT overlay` subordinating upstream guidance to `contracts/MOTION-CONTRACT.md`. Added 2026-09-15 under owner direction (EV-20260915-001); the harness-policy exception is recorded there.

| Agent | Skill | Verdict |
|---|---|---|
| `ukbt-60fps` | `60fps-animation` | ADOPT (transform/opacity discipline) |
| `ukbt-accessible-motion` | `accessible-animation` | ADOPT with UKBT two-tier remap |
| `ukbt-svg-motion` | `svg-animation` | ADOPT CSS/SMIL subset; morph/path libs BLOCKED |
| `ukbt-micro-interaction` | `micro-interaction` | ADOPT CSS subset; Framer/springs BLOCKED |
| `ukbt-gsap-reference` | `gsap-web` | REFERENCE ONLY (GSAP BLOCKED on site) |
| `ukbt-page-transition-reference` | `page-transition-animation` | REFERENCE ONLY (Astro ClientRouter owns transitions) |
| `ukbt-glass-reference` | `glassmorphism` | CONDITIONAL (paint cost, zero CSS headroom) |
| `ukbt-lottie-reference` | `lottie-animation` | REFERENCE ONLY (runtimes BLOCKED) |
| `ukbt-ascii-reference` | `ascii-animation` | REFERENCE ONLY (restraint list; terminal contexts) |

### Governance Model

Per `knowledge/09-AGENT-HARNESS-POLICY.yaml`:
- Roles are accountability vocabulary, NOT a spawn list
- "Do not create an agent merely because a task exists"
- Independence requires SEPARATE_SESSION, not subagent
- Single writer for application code
- `.claude/agents/` is empty by design

## Evidence Classification

Per `knowledge/04-EVIDENCE-POLICY.yaml`:

| Class | Meaning | Publishable? |
|---|---|---|
| VERIFIED | Authoritative or reproducible evidence | Yes |
| DERIVED | Deterministically derived from verified | According to policy |
| STATED_BUT_UNVERIFIED | Explicitly stated, not independently verified | No |
| ASSUMPTION | Working hypothesis | No |
| UNKNOWN | Not established | No |
| CONFLICTING | Contradictory evidence | No |

## Anti-Drift Rules

Per `knowledge/10-ANTI-DRIFT-RULES.yaml`:
- Read `knowledge/` before project-level decisions
- Read current evidence before relying on historical decisions
- Never silently change a frozen decision
- Never silently downgrade UNKNOWN to VERIFIED
- Never claim validation passed if not executed
- When uncertain, preserve uncertainty explicitly

## Architecture Overview

```
pnpm-workspace.yaml
  apps/*          → @ukbt/web (Astro static site)
  packages/*      → @ukbt/truth (Zod schemas, truth gate, tokens)

wrangler.jsonc    → Cloudflare Workers config (repo root, not apps/web/)
contracts/        → Frozen Markdown contracts (19 files; recount 2026-09-18)
knowledge/        → Decision substrate (13 files)
artifacts/        → Evidence and receipts (19 directories; recount 2026-09-18)
scripts/          → Verification scripts
.opencode/agents/ → 9 UKBT motion advisors (read-only subagents)
.opencode/skills/ → 9 vendored motion skills + binding UKBT overlays
THIRD-PARTY-NOTICES.md → vendored-work attribution (MIT, iart.ai)
```

## Build Pipeline

Stage/gate sequence defined in `docs/10-fresh-repo-pipeline.md`:

```
scaffold-self-test → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf
```

Release is PASS only when `deploy:verify` passes fresh with no open blocker.

## File References

| Reference | Points to |
|---|---|
| `CLAUDE.md` | Operating contract, authority order, hard invariants |
| `AGENTS.md` | Evidence and role doctrine for agents |
| `README.md` | Project overview and current state |
| `CONTRIBUTING.md` | Development setup and code quality |
| `SECURITY.md` | Security policy |
| `CHANGELOG.md` | Release history |
| `scaffold-manifest.json` | Scaffold metadata and stress cases |
