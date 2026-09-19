---
name: ukbt-schema-contract
description: Use when changing or auditing Tina schemas, Zod schemas, generated GraphQL, tina-lock.json, content JSON, required/optional fields, defaults, or schema drift.
---

# UKBT Schema Contract

Project authority: `tina/config.ts` canonical; `AGENTS.md` governs.

## When to load
Tina schemas, Zod schemas, generated GraphQL, `tina-lock.json`, content JSON, required/optional/default/nullability, schema drift.

## Rules
- `tina-lock.json` keys are exactly `schema,lookup,graphql` (never `branch`); must be committed + in sync.
- Every Tina field must be classified in `apps/web/src/lib/content-trust.ts`.
- Run `check-tina-field-parity` (28 checks) + `check-content-trust` on every schema change.
- Prefer repo facts; verify versions from `package.json`, not skill defaults.
- Fail closed on drift; surface matrix, don't silently relax.

## Workflow
LOAD → DELEGATE to `schema-contract-auditor` → diff `tina/config.ts` vs `loaders.ts` vs content vs renderer → parity + trust checks → SYNTHESIZE.
