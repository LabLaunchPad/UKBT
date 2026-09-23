# CI Contract

**ID:** CONTRACT-CI-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the complete required gate set before any workflow file
exists, so Stage 4 implements against a fixed list rather than discovering
gates ad hoc — and so `ABSENT` is never mistaken for `PASS` in the interim.

## Outputs / Frozen gate set (source: `ARCHITECTURE-PROPOSAL-V3.md`
"Gate set", restated here as the binding CI requirement)

| Gate | Checks | Blocking? |
|---|---|---|
| Install/lockfile | `pnpm install --frozen-lockfile` succeeds | Yes |
| Typecheck | `tsc --noEmit` across both packages | Yes |
| Lint | Biome (`A13`) | Yes |
| Unit/integration | Vitest, `packages/truth` | Yes |
| Content schema | Zod schema validation against all content files | Yes |
| Truth gate | T1-T9 (`TRUTH-CONTRACT.md`) against all content files | Yes |
| Placeholder detection | Sentinel absence in production build / presence in test fixtures | **NO** (amended 2026-09-18) — never wired; `placeholderSentinel()` has no production caller and no dist scan exists. Open item, see below |
| Build | `astro build` succeeds | Yes |
| Route/link integrity | Every route resolves; every internal link targets an existing route | Yes |
| SEO metadata completeness | `A14` — title/description/canonical/OG per route | Yes |
| Accessibility | axe-core + keyboard suite (`ACCESSIBILITY-CONTRACT.md`) — **merge-blocking, not informational** | Yes |
| E2E / visual regression | `VISUAL-REGRESSION-CONTRACT.md`, CI-vs-CI only | **PARTIAL** (amended 2026-09-18) — Playwright e2e + axe run merge-blocking; the *visual comparison* (screenshot/geometry diff) has never existed. Open item, see below |
| Secret scan | No credential/token/key committed | Yes |
| Git cleanliness | No uncommitted generated output, no stray files | **NO** (amended 2026-09-18) — never wired to CI. Open item, see below |
| Dependency allowlist | Every `package.json` dependency (either package) is on the explicit allowed list; anything else fails the build | Yes |

**Explicit, restated:** "the gate runs" and "the gate blocks merge on
failure" are different claims. This contract adopts the second for every
gate above — a check that cannot fail the build is decorative (`DR-010`).
The accessibility gate in particular is named merge-blocking, not
informational, because it was the gate most likely to be softened under
time pressure (`ARCHITECTURE-PROPOSAL-V3.md`'s explicit red-team finding).

## Current state (honest, per `knowledge/08-VALIDATION-POLICY.yaml`;
regenerated 2026-09-18 — the previous state block still said
`CI_WORKFLOW_PRESENT = false` / `GATES_IMPLEMENTED = 0` while
`.github/workflows/ci.yml` implemented 16+ merge-blocking jobs; a frozen
state block contradicting the repository it governs is itself a defect)

```
CI_WORKFLOW_PRESENT = true
CI_STATE = IMPLEMENTED (merge-blocking) — 16+ jobs, SHA-pinned actions
GATES_IMPLEMENTED = 12 of the 15 table rows above (the other three
are marked NO/PARTIAL: placeholder detection, visual comparison, git
cleanliness)
NOT WIRED YET (ABSENT != PASS, recorded here and in ci.yml's closing
note, not faked with vacuous steps):
  1. Placeholder detection — implement `__PLACEHOLDER_[A-Z0-9_]+__`
     scan of dist (belongs in check-security or a dedicated gate) and
     wire isPlaceholderSentinel() into the truth gate's evaluate();
  2. Visual comparison — either implement toHaveScreenshot/geometry-diff
     in CI or amend VISUAL-REGRESSION-CONTRACT.md to mark parity
     VERIFIED = NOT_CURRENTLY;
  3. Git cleanliness — a `git status --porcelain` (or equivalent)
     job/step.
```

`ABSENT ≠ PASS`. `NOT_RUN ≠ PASS`. The three gaps above are recorded
rather than faked; adding them is backlog, not aspiration.

## Invariants

- No gate listed above may be marked `non-required` or skipped to obtain a
  green build (`knowledge/08` rule: "Never weaken, skip, narrow or mark
  non-required a gate in order to obtain PASS").
- Every gate must be capable of failing on a real input — a check without
  a stated failing case is decorative and does not satisfy this contract
  (`knowledge/08 anti_vacuity`).

## Forbidden behavior

- Adding a workflow step but marking it `continue-on-error: true` for a
  gate this contract lists as blocking.
- Removing a gate from CI without removing it from this contract first
  (contract amendment precedes implementation change, not the reverse).
- Reporting a gate as `PASS` in a receipt when it was `NOT_RUN`, `ABSENT`,
  `BLOCKED`, `UNKNOWN`, or `WEAK_EVIDENCE`.

## Validation method

- This contract's own validation is Stage 4's workflow file matching the
  table above line-for-line, verified once written.
- Each gate names what input would make it fail (`knowledge/08
  anti_vacuity.rule`) — recorded in the Stage 4 implementation, not
  invented here.

## Owner

Track C. Not gated by Track B — CI mechanism applies regardless of
Adelux's rights status, though the *content* the truth/accessibility/
visual gates operate on may itself be Track-B-gated per item.

## Dependency

Every other Stage-3 contract names a gate this contract must run
(`TRUTH-CONTRACT.md`, `CONTENT-CONTRACT.md`, `ACCESSIBILITY-CONTRACT.md`,
`VISUAL-REGRESSION-CONTRACT.md`, `REPOSITORY-CONTRACT.md`'s dependency
allowlist).

## Change authority

Removing a gate from this list requires stating why it no longer applies
(e.g. a feature it protected was removed) — never "it was failing and we
needed to ship."

## Evidence required

`knowledge/08-VALIDATION-POLICY.yaml current_state` (reused, current
honest baseline).

## Reversibility

REVERSIBLE. No workflow file exists yet; this is the specification a
future one is written against.
