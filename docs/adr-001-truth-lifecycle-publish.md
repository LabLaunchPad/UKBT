# ADR-001: Production publishability is a lifecycle check, not just an evidence check

Date: 2026-09-23. Context: P0 closure Task 2 (truth lifecycle).
Base: main@e544985. Binds: contracts/TRUTH-CONTRACT.md, knowledge/07-CONTENT-TRUTH-POLICY.yaml.

## Decision

`evaluate()` in `packages/truth/src/gate/rules.ts` stays an evidence-validity
check (T1-T8). Production publishability gets its own fail-closed function,
`isPublishable()` in `packages/truth/src/gate/publish.ts`:

- production: `status` must be `approved` or `published`, a named approver
  must be present, `isPlaceholder` must be false, and `evaluate()` must pass.
- preview/dev: `evaluate()` passing is sufficient — `pending_review` content
  may render for human review, never as production.

## Underspecification being closed

The contract orders the lifecycle `draft -> pending_review -> approved ->
published` and forbids skipping approval, but a `ContentRecord` is a single
snapshot with no transition history. No per-record check can prove
`published` was once `approved`. The mechanical proxy implemented here is the
documented-intent portion only: `published` must carry a named approver (T6)
and pass every evidence rule. Real transition history (who approved what,
when) stays blocked on U-22/U-23 and must not be invented.

## Consequences

- `apps/web` `*-data.ts` modules hardcode `status: 'pending_review'` and
  treat `evaluate()` pass as render permission, so `pending_review` facts
  render in production today. Wiring the production render boundary to
  `isPublishable()` is a separate migration step, blocked on a real named
  approver (U-23) — no approver is invented here.
- `evaluate()` semantics are frozen; no existing test changes.
