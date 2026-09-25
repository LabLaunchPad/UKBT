# contracts/ — frozen agreements

Local rules for the contract layer. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds directory-local detail.

## Scope

`<root>/contracts/` states *what is agreed, currently true, and permitted*. A contract is machine-checkable or it is not a contract (`README.md:4`). 19 `.md` files (17 `*-CONTRACT.md` + `evidence-contract.md` + `README.md`), plus `schemas/receipt.schema.json` and 2 `.yaml` templates. `docs/` explains *how* to work; `contracts/` states the agreement.

## Role

Freezes decisions so later work cannot silently drift. Consumers: agents (read before project-level decisions), gate scripts (enforce), CI (merge-blocking), reviewers (re-approval authority).

## Source of Truth

- Amendment mechanics: `README.md` rules 1–5 — the only authority on how contracts change
- Evidence discipline: `evidence-contract.md` + `knowledge/04-EVIDENCE-POLICY.yaml`
- Per-contract validation method: each contract's own `validation` section

## Structure

- `README.md` — index table (status per file) + the 5 rules; read first
- `REPOSITORY-, TRUTH-, DESIGN-SYSTEM-, CSS-, COMPONENT-, CONTENT-, ROUTE-, ASSET-, SEO-, ACCESSIBILITY-, FORM-, VISUAL-REGRESSION-, CI-, DEPLOYMENT-, RIGHTS-CONTRACT.md` — Stage 3 freeze (2026-08-26, post red-team `EV-20260826-019`); all FROZEN
- `MOTION-CONTRACT.md` — ACTIVE (2026-09-06); `SEO-CONTRACT.md` Amendment 01 — ACTIVE (2026-09-06); `AI-EXECUTION-CONTRACT.md` — FROZEN (2026-09-15), single normative source for agent execution
- `evidence-contract.md`, `evidence-record.template.yaml`, `task-contract.template.yaml`, `schemas/receipt.schema.json` — FROZEN skeletons/shapes
- Families: truth/content (`TRUTH`, `CONTENT`, `RIGHTS` + `knowledge/06`); delivery (`REPOSITORY`, `CI`, `DEPLOYMENT`); quality (`SEO`, `ACCESSIBILITY`, `VISUAL-REGRESSION`, `MOTION`, `CSS`, `COMPONENT`, `DESIGN-SYSTEM`, `ASSET`, `FORM`, `ROUTE`); execution (`AI-EXECUTION`); evidence (`evidence-contract`, templates, schema)

## Dependencies

Contracts constrain `apps/web`, `packages/truth`, `<root>/scripts/`, `<root>/tina/config.ts`, `<root>/wrangler.jsonc`. Direction is one-way: code conforms to contracts, never the reverse. `RIGHTS-CONTRACT.md` binds `knowledge/06-TEMPLATE-BOUNDARY.yaml` without reopening it.

## Allowed

- Reading any contract before deciding; citing the contract + its `REVERSAL_CONDITION` in plans
- Proposing an amendment as a dated `AMENDMENT` block backed by a new evidence record (see Conventions)

## Protected / Generated

- FROZEN status: every Stage 3 file + evidence skeletons + `AI-EXECUTION-CONTRACT.md`. Nothing here is generated output — all of it is hand-authored agreement.

## Conventions

- Amend, never quietly edit (`README.md` rule 4): a new evidence record naming the observation that invalidated the contract, appended as a dated amendment block. Silent edits to make tests pass are a fail-closed violation (`knowledge/00`).
- One source of truth per subject (rule 1): a contract supersedes any prose restating it — link here, don't copy terms elsewhere.
- `PROVISIONAL` is not authorization to build on; `REQUIRED` and `CHOSEN` are (rule 2).
- Freeze only what protects correctness or prevents drift (rule 5) — new contracts need plan approval, not enthusiasm.

## Validation

```bash
pnpm deploy:verify    # full release gate from repo root — never claim a subset as a release pass
```

Name-evident gate mappings: `MOTION` → `<root>/scripts/check-motion.mjs`, `SEO` → `check-seo.mjs`, `DEPLOYMENT` → `check-deploy-mapping.mjs`, `REPOSITORY` → `check-dependency-allowlist.mjs`, `AI-EXECUTION` → `check-control-plane.mjs`, `ROUTE` → `check-internal-links.mjs`. All other mappings live in `<root>/scripts/AGENTS.md` + `ci.yml` — check there, don't guess.

## Failure Modes

- Editing a FROZEN file to obtain PASS — gate weakening; amend via evidence record or stop.
- Adding/removing a route without updating `ROUTE-CONTRACT.md` — governance drift.
- Restating contract terms in `docs/` or `AGENTS.md` prose, then editing the copy — the contract always wins; fix the link, not a fork.
- Treating `MOTION-CONTRACT.md` ACTIVE status as looser than FROZEN — ACTIVE still amends by dated block only.

## Related

- Root `AGENTS.md` (pipeline, hard invariants), `knowledge/AGENTS.md` (decision substrate), `<root>/scripts/AGENTS.md` (gate coverage)
- `knowledge/00-KNOWLEDGE-CONTRACT.md` (fail-closed conditions), `knowledge/04-EVIDENCE-POLICY.yaml` (classification)

## Workflow

Read contract → check `REVERSAL_CONDITION` → implement against it → `deploy:verify`. If reality contradicts the contract, write the evidence record first, amend second, build third.
