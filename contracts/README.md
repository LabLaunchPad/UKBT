# Contracts

`docs/` explains *how* to work. `contracts/` states *what is agreed, currently
true, and permitted*. A contract is machine-checkable or it is not a contract.

## Present now (stage-independent)

| File | Purpose | Status |
|---|---|---|
| `evidence-contract.md` | Evidence registry, freshness, classification discipline | FROZEN |
| `evidence-record.template.yaml` | Per-claim skeleton | FROZEN |
| `task-contract.template.yaml` | Per-task skeleton | FROZEN |
| `schemas/receipt.schema.json` | Receipt shape (mirrors `schemas/`) | FROZEN |

## Created at Stage 3 (2026-08-26), after `ARCHITECTURE_VERDICT = PASS`

`ARCHITECTURE-PROPOSAL-V3.md` passed its 15-vector red team
(`ARCHITECTURE-REDTEAM-V3.md`, `EV-20260826-019`) with 0 critical findings
before any of the following were written — freezing these before the red
team ran would have pre-empted it and defeated the purpose of having one.

| File | Status | Gates |
|---|---|---|
| `REPOSITORY-CONTRACT.md` | FROZEN | Package shape, dependency direction, config/secret/env ownership |
| `TRUTH-CONTRACT.md` | FROZEN | T1-T9 rules, fact lifecycle, gate-construction-vs-authorization |
| `DESIGN-SYSTEM-CONTRACT.md` | FROZEN | 6-state lifecycle (extends `knowledge/06`'s 4-state token lifecycle) |
| `CSS-CONTRACT.md` | FROZEN | DTCG → Style Dictionary → CSS custom properties pipeline, selector-fidelity rule |
| `COMPONENT-CONTRACT.md` | FROZEN | Framework-neutral component contract shape |
| `CONTENT-CONTRACT.md` | FROZEN | Content types, placeholder discipline |
| `ROUTE-CONTRACT.md` | FROZEN | UKBT routes derive from UKBT evidence, never Adelux's page list |
| `ASSET-CONTRACT.md` | FROZEN | Per-asset rights classification |
| `SEO-CONTRACT.md` | FROZEN | Metadata/JSON-LD sourced only from gated content |
| `ACCESSIBILITY-CONTRACT.md` | FROZEN | WCAG 2.2 AA, source-defect repair-by-default rule |
| `FORM-CONTRACT.md` | FROZEN | UI → interface → Cloudflare Functions adapter boundary |
| `VISUAL-REGRESSION-CONTRACT.md` | FROZEN | 6-viewport matrix, pinned CI-vs-CI environment, anti-vacuity |
| `CI-CONTRACT.md` | FROZEN | Full required gate set, all merge-blocking |
| `DEPLOYMENT-CONTRACT.md` | FROZEN | Cloudflare Pages + Functions, rollback posture |
| `RIGHTS-CONTRACT.md` | FROZEN | Binds `knowledge/06-TEMPLATE-BOUNDARY.yaml`'s rights posture into `contracts/` |

Fifteen files, matching the Stage 3 instruction exactly — no additional
contract was created. Each records purpose, inputs/outputs, invariants,
forbidden behavior, validation method, owner, dependency, change
authority, evidence required, and a reversibility classification.
`knowledge/06-TEMPLATE-BOUNDARY.yaml` was not reopened or edited to
produce these; `RIGHTS-CONTRACT.md` restates and cross-references it.

## Added after Stage 3

| File | Status | Notes |
|---|---|---|
| `MOTION-CONTRACT.md` | ACTIVE (2026-09-06) | Token-first motion language, restraint list, micro-interaction matrix |
| `SEO-CONTRACT.md` Amendment 01 | ACTIVE (2026-09-06) | Track C pipeline implemented; production domain set |

## Rules

1. One source of truth per subject. A contract supersedes any prose restating it.
2. `PROVISIONAL` is not authorization to build on. `REQUIRED` and `CHOSEN` are.
3. Every frozen item carries a `REVERSAL_CONDITION`. An item nobody can describe
   a reversal for is either genuinely immutable or wasn't understood.
4. Amending a frozen contract requires a new evidence record naming the
   observation that invalidated it. Contracts are amended, never quietly edited.
5. Freeze only what protects correctness or prevents drift. Over-specification is
   itself lock-in.
