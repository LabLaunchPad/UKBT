# Repository Contract

**ID:** CONTRACT-REPOSITORY-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the repository's package shape, dependency direction, and
ownership boundaries before any application code exists, so Stage 4
implementation has a single, unambiguous place for every kind of artifact.

## Inputs

- `artifacts/architecture/ARCHITECTURE-PROPOSAL-V3.md` §2 (repository shape
  decision, `ARCHITECTURE_VERDICT = PASS`, `EV-20260826-019`)
- `knowledge/03-ARCHITECTURE-INVARIANTS.yaml` INV-013 (content/truth
  co-location), INV-016 (single-site scope)

## Outputs / Frozen decisions

```
PACKAGES = apps/web, packages/truth
PACKAGE_COUNT = 2
THIRD_PACKAGE = FORBIDDEN absent a demonstrated independent consumer
                (i.e. a second package that needs to import it without
                also importing apps/web or packages/truth)
MONOREPO_TOOL = pnpm workspaces (pnpm-workspace.yaml)
LANGUAGE = TypeScript, strict mode, in both packages
```

### Package boundaries

| Package | Owns | Must NOT contain |
|---|---|---|
| `apps/web` | Astro pages/layouts/components (framework adapter, design-system layer 7), build config, deployment config, tests that exercise rendered output | Content schemas, truth-gate logic (these live in `packages/truth`, not duplicated) |
| `packages/truth` | Content schemas (Zod), the truth gate (`knowledge/07` rules T1-T9), content files, framework-neutral component contracts (design-system layer 6) | Astro-specific code, UI markup, anything requiring a UI framework to import it |

### Dependency direction

```
apps/web  → depends on →  packages/truth
packages/truth  → depends on →  (nothing inside this repo)
```

`packages/truth` must remain importable by a plain Node/TypeScript script
with no Astro runtime present — this is the mechanical test of "framework
adapter, never framework contract" from `ARCHITECTURE-PROPOSAL-V3.md` §3.
A dependency pointing the other way (`packages/truth` importing anything
from `apps/web`) is a contract violation, not a style preference.

### Source-of-truth locations (design-system layers 1-10, per §3 of the
architecture proposal — restated here as the binding location map)

| Layer | Location | Status at freeze |
|---|---|---|
| 1 Source evidence | `artifacts/extraction/`, `artifacts/source/` | Frozen (Track A) |
| 2 Raw tokens | `artifacts/extraction/token-candidates.json` | Frozen, RAW=61 |
| 3 Candidate tokens | same file | Frozen, CANDIDATE=20 |
| 4 Adapted tokens | `packages/truth/tokens/adapted/` | Not created — Track B gated |
| 5 Approved tokens | `packages/truth/tokens/approved/` | Not created — Track B gated |
| 6 Component contracts | `packages/truth/contracts/` | Not created |
| 7 Framework adapter | `apps/web/src/components/` | Not created |
| 8 UKBT content/truth | `packages/truth/content/` | Not created |
| 9 Rendered implementation | `apps/web` build output | Not started |
| 10 Visual verification | `apps/web/tests/visual/` | Not built |

Layers 1-3 live at the repository root (`artifacts/`), never inside either
package — this is the structural guarantee that Adelux evidence cannot be
mistaken for UKBT's own approved design system. A lint/CI rule (Stage 4)
must forbid any import from `artifacts/**` into `apps/web` or
`packages/truth` build output.

### Test locations

- `packages/truth/**/*.test.ts` — unit tests (Vitest), co-located with the
  code they test.
- `apps/web/tests/visual/**` — Playwright visual/E2E/accessibility suite.
- No test lives outside these two trees.

### Generated-code policy

- Style Dictionary output (CSS custom properties, see `CSS-CONTRACT.md`) is
  generated into `apps/web/src/styles/generated/` (or equivalent), is
  `.gitignore`d, and is never hand-edited. A hand-edit to a generated file
  is a contract violation; the fix goes into the token source.
- No other generated code is anticipated at this stage. Any future code
  generator must declare its output directory here before use (CHANGE
  CONTROL, see below).

### Dependency-addition policy

- Every `package.json` dependency (in either package) must appear on the
  CI dependency allowlist (`CI-CONTRACT.md`) before the build passes.
- Adding a dependency is not itself forbidden; adding one silently — one
  not yet reflected in the allowlist — fails CI by design (per
  `ARCHITECTURE-PROPOSAL-V3.md` §11's enforcement finding).
- `isotope` and `animate.css` are permanently `DO_NOT_ADOPT`
  (`THIRD-PARTY-DISPOSITION.md`) unless a future evidence record
  establishes a licence change.

### Configuration ownership

- Root-level config (`pnpm-workspace.yaml`, root `tsconfig.json` base,
  Biome config, root CI workflows) is owned by the repository, not either
  package.
- Package-level config (`apps/web/astro.config.*`, each package's own
  `tsconfig.json` extending the root) is owned by that package.

### Environment variable policy

- No environment variable may carry a real secret in this repository at
  any point (see `RIGHTS-CONTRACT.md` / hard invariants — no credential
  handling unless explicitly required and safely bounded, and none is
  currently required).
- Cloudflare Pages Functions environment bindings (once a form exists) are
  documented in `DEPLOYMENT-CONTRACT.md`, not invented here.
- `.env.example` (when created) documents variable names and purpose only,
  never real values.

### Secret policy

- No secret, API key, token, or credential is committed to this repository.
- CI runs a secret-scan gate (`CI-CONTRACT.md`); a positive match fails the
  build, it is never suppressed to obtain `PASS`.

## Invariants

- Two packages. A third requires a demonstrated independent consumer,
  recorded as a new evidence record before the package is created, not
  after.
- `packages/truth` never imports `apps/web`.
- Nothing in `artifacts/` is imported by application build output.

## Forbidden behavior

- Creating a third package "for organization" without a consumer.
- Duplicating content schemas or truth-gate logic inside `apps/web`.
- Hand-editing generated CSS/token output.
- Adding a dependency not on the CI allowlist.

## Validation method

- `pnpm -w list --depth -1` shows exactly two workspace packages.
- A CI import-boundary check (ESLint/Biome rule or a dedicated script)
  fails the build if `packages/truth` imports from `apps/web`, or if
  `apps/web`/`packages/truth` import from `artifacts/`.
- Dependency allowlist check, per `CI-CONTRACT.md`.
- These checks are Stage 4 implementation; this contract records that they
  are `REQUIRED`, not that they currently `PASS` (`ABSENT ≠ PASS`,
  `knowledge/08-VALIDATION-POLICY.yaml`).

## Owner

Track C (UKBT-original engineering). Not gated by Track B.

## Dependency

None — this is the foundational contract other Stage-3 contracts reference
for package/location facts.

## Change authority

Amending the package count or dependency direction requires a new evidence
record naming the demonstrated independent consumer (for a package split)
or the discovered coupling (for a merge), per `contracts/README.md` rule 4.

## Evidence required

`EV-20260826-019` (architecture verdict). No new evidence generated for
this contract — it restates an already-frozen decision in binding form.

## Reversibility

REVERSIBLE. Directory moves and `tsconfig` path changes, per
`ARCHITECTURE-PROPOSAL-V3.md` §2 — estimated one hour either direction.
Not irreversible in the sense that would require re-planning to change.
