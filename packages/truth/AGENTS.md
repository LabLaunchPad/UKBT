# packages/truth — `@ukbt/truth`

Local rules for the trust boundary. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds package-local detail.

## Scope

Zod content schemas + deterministic truth gate + Style-Dictionary design tokens. No UI, framework, or browser code.

## Role

Decides machine-checkable facts (gate rules T1–T9); `apps/web` consumes the verdicts. AI proposes, the gate disposes.

## Source of Truth

- Schemas: `src/schema/content-types.ts`, `src/schema/provenance.ts`
- Gate: `src/gate/rules.ts` (`evaluate()`), `src/gate/registry.ts`, `src/gate/derive.ts`, `src/gate/types.ts`
- Publish lifecycle: `src/gate/publish.ts` (`isPublishable(env)`) — layered atop `evaluate()`
- Contracts: `contracts/TRUTH-CONTRACT.md`, `contracts/CONTENT-CONTRACT.md` (frozen; change = re-approval)

## Structure

- `src/index.ts` — `.` export (shared types, incl. `NavItem`)
- `src/gate/index.ts` — `./gate` export (rules, registry, publish)
- `src/schema/index.ts` — `./schema` export (Zod types, provenance)
- `src/tokens/approved/*.json` — token source (`border`, `breakpoint`, `color`, `geometry`, `layout`, `motion`, `radius`, `shadow`, `spacing`, `typography`, `z-index`)
- `src/tokens/adapted/` — adapted (non-source) tokens
- `src/contracts/*.contract.md` — framework-neutral component contracts (`button`, `card`, `link`, `breadcrumb`)
- `style-dictionary.config.json` — token build config

## Dependencies

Runtime: `zod` only. Dev: `typescript`, `vitest`, `style-dictionary`. Consumed by `apps/web` as `workspace:*`. Nothing else may be added without a plan update.

## Allowed

- New Zod schemas + provenance types in `src/schema/` with co-located `*.test.ts`
- New gate rules in `src/gate/` (rule + registry entry + test)
- New approved tokens in `src/tokens/approved/` (then rebuild)
- Framework-neutral contract docs in `src/contracts/`

## Protected / Generated

- `apps/web/src/styles/generated/` is build output of `src/tokens/approved/**` via `style-dictionary` — never hand-edit; edit the source JSON and rebuild.
- Root `tina/__generated__/`, `dist/` — never touch (see root `AGENTS.md`).

## Conventions

- Schema change = contract change: update the 8 consumers (`apps/web/src/content/*-data.ts`), their tests, and the frozen contract if the shape's meaning shifted. Fail closed on drift.
- `NavItem` (defined in `src/schema/content-types.ts`) is type-only — consumers import it with `import type` (`apps/web/src/content/navigation-data.ts`, `Header.astro`, `Footer.astro`). No runtime value, no UI.
- Contracts in `src/contracts/` stay framework-neutral (no Astro/React/Vue APIs); they pair with root `contracts/COMPONENT-CONTRACT.md`.

## Validation

From repo root:

```bash
pnpm --filter @ukbt/truth tokens:build
pnpm --filter @ukbt/truth exec tsc --noEmit
pnpm --filter @ukbt/truth exec vitest run src/gate/rules.test.ts
```

Tests live in `src/**/*.test.ts`. Run `tokens:build` before typecheck/build so generated output is current.

## Failure Modes

- Hand-edited generated CSS/tokens — silently overwritten on next build; fix at the source JSON.
- Schema edited without updating `apps/web/src/content/*-data.ts` — build fails closed; update consumers first.
- Value-importing a type (`NavItem` without `import type`) — creates a runtime dependency on the trust boundary; keep type-only.
- UI/framework code in this package — breaks the trust boundary; it belongs in `apps/web`.

## Related

- Root `AGENTS.md` (pipeline, evidence rules), `apps/web/AGENTS.md` (consumer)
- `knowledge/07-CONTENT-TRUTH-POLICY.yaml`, `knowledge/01-VERIFIED-FACTS.yaml`
- Existing `CLAUDE.md` in this directory (command reference)

## Workflow

Edit source (`schema/`/`gate/`/`tokens/approved/`) → `tokens:build` → `tsc --noEmit` → `vitest run` → verify consumers in `apps/web` still pass.
