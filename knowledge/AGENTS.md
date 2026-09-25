# knowledge/ — decision substrate

Local rules for the decision/context layer. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds directory-local detail.

## Scope

`<root>/knowledge/` is the durable, compact, evidence-linked decision substrate — read before any project-level decision. `00-KNOWLEDGE-CONTRACT.md` + 12 YAML files (`01`–`12`) + `examples/` (3 few-shot `.md`). Detailed evidence lives in `<root>/artifacts/`; this directory carries decisions, not raw proof.

## Role

Lets an agent act without remembering a conversation: the repository carries the knowledge. Priority (`00`): direct authoritative evidence → repository evidence → recorded verified facts → explicit decisions → deterministic tool output → model inference. Inference never overrides higher evidence.

## Source of Truth

- Operating rules: `00-KNOWLEDGE-CONTRACT.md` (priority, `OBSERVE → REASON → PROPOSE → VERIFY → ACT`, fail-closed conditions)
- Evidence classes/promotion/registry: `04-EVIDENCE-POLICY.yaml` (authoritative — this file summarizes, it decides)
- Bundle map: `<root>/index.md`

## Structure

- `00-KNOWLEDGE-CONTRACT.md` — how this directory works; maintenance rule: a file changes only when evidence changes, citing the evidence ID
- `01-VERIFIED-FACTS.yaml` — only established claims, each evidence-linked or marked unestablished; an unevidenced entry is a defect
- `02-DECISION-RULES.yaml` — autonomous rules (DR-001..DR-023); `03-ARCHITECTURE-INVARIANTS.yaml` — boundaries for free agent decision
- `04-EVIDENCE-POLICY.yaml` — classes, freshness, promotion, registry (`artifacts/evidence/`, `EV-YYYYMMDD-NNN`, append-only)
- `05-UNKNOWN-BLOCKER-POLICY.yaml` — against over/under-blocking; `06-TEMPLATE-BOUNDARY.yaml` — Adelux provenance + rights (not reopened to write contracts; `RIGHTS-CONTRACT.md` restates it)
- `07-CONTENT-TRUTH-POLICY.yaml` — permitted/prohibited sources; `08-VALIDATION-POLICY.yaml` — validation states
- `09-AGENT-HARNESS-POLICY.yaml` — roles are accountability vocabulary, not a spawn list; `10-ANTI-DRIFT-RULES.yaml` — no silent changes
- `11-VISUAL-TRUTH-POLICY.yaml` — visual authority chain; `12-AI-CONTROL-PLANE.yaml` — governance pipeline (compact rules; normative detail in `contracts/AI-EXECUTION-CONTRACT.md`)
- `examples/` — `FEW-SHOT-GOOD/BAD-DECISION.md`, `FEW-SHOT-CONFLICT.md`

## Dependencies

`knowledge/` restates nothing it does not need. Where it and a frozen contract disagree, that is a conflict to escalate (DR-015), never one to resolve silently (`00`).

## Allowed

- Adding a `01` fact with an evidence link (`EV-…` record in `<root>/artifacts/evidence/`) or an explicit unestablished mark
- Closing an UNKNOWN via a new record naming source + verification method (promotion rule, `04`)
- Superseding: write a new record; reclassify the old as `SUPERSEDED` with a pointer — never rewrite history

## Protected / Generated

- Evidence classes are fixed by `04` — nothing here is generated output.

## Conventions

- Exact classes (`04` — 7, not 5: root `AGENTS.md` table omits `CONFLICTING`/`PROPOSAL`): `VERIFIED` (publishable) · `DERIVED` (derivation recorded; inherits union of inputs' provenance + earliest `validUntil`) · `STATED_BUT_UNVERIFIED` (may inform planning only) · `ASSUMPTION` (must be labeled) · `UNKNOWN` (do not guess) · `CONFLICTING` (STOP, escalate, do not choose) · `PROPOSAL` (not authoritative until accepted). `STALE` is not `FALSE` — it means unverified now; publishing from stale is FORBIDDEN.
- UNKNOWN discipline: `UNKNOWN` stays `UNKNOWN`; `UNKNOWN`/`INFERRED` never silently become `VERIFIED`. "The model believes X" is never evidence for X. `FACT != ASSUMPTION != DECISION != PROPOSAL`.
- Every material claim classified; source + retrieval time recorded.

## Validation

```bash
pnpm test:unit    # Vitest, packages/truth + apps/web — decision logic and the forms adapter boundary stay green
```

No gate "passes" a knowledge edit — correctness is the evidence link. Re-read `04` promotion/registry rules before adding or closing any fact.

## Failure Modes

- Upgrading UNKNOWN to VERIFIED without a new record — the most common defect here.
- Editing a fact's meaning in place instead of superseding — history must stay traceable.
- Resolving a knowledge-vs-contract conflict by editing one side — escalate per DR-015.
- Citing root `AGENTS.md`'s 5-row class table as complete — `04` is authoritative (7 classes).

## Related

- Root `AGENTS.md` (evidence classification summary, hard invariants), `contracts/AGENTS.md` (frozen agreements), `<root>/artifacts/AGENTS.md` (where the linked evidence lives)
- `contracts/evidence-contract.md` (freshness defaults), `contracts/AI-EXECUTION-CONTRACT.md` (execution states)

## Workflow

New evidence → write/append `EV-…` record in `<root>/artifacts/evidence/` → update the `knowledge/` file citing the ID → never claim validation passed unless executed.
