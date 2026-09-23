# CSS Contract

**ID:** CONTRACT-CSS-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the CSS pipeline, the compiler choice, and the rule that
decides when a selector may be simplified without weakening visual
fidelity.

## Outputs / Frozen pipeline (source: `ARCHITECTURE-PROPOSAL-V3.md` §3 and
§5 — §3's ten-layer table is authoritative for filesystem location; §5 is
authoritative for the pipeline's processing order, not its own separate
location claim)

```
DTCG-compatible token source
  RAW        → artifacts/extraction/token-candidates.json  (repo root — frozen Track A evidence)
  CANDIDATE  → artifacts/extraction/token-candidates.json  (same file)
  ADAPTED    → packages/truth/tokens/adapted/               (UKBT-owned, governed)
  APPROVED   → packages/truth/tokens/approved/               (UKBT-owned, governed)
        ↓
Style Dictionary
  (compiles tokens/approved/** ONLY — fail-closed; RAW/CANDIDATE/ADAPTED
   are never compiled directly into shipped CSS)
        ↓
CSS custom properties
  (--ukbt-color-*, --ukbt-space-*, --ukbt-font-*, generated, not hand-edited —
   see REPOSITORY-CONTRACT.md's generated-code policy)
        ↓
semantic / component CSS
  (component-scoped stylesheets consuming the custom properties)
        ↓
Astro adapter
  (apps/web components import semantic CSS; Astro is a consumer of this
   pipeline, never its source of truth)
```

**RAW and CANDIDATE are evidence/extraction artifacts** (design-system
layers 2-3, `REPOSITORY-CONTRACT.md`'s layer table) — they live at the
repository root, outside both `apps/web` and `packages/truth`, and are
never created as `packages/truth/tokens/raw/` or `.../candidate/`
directories. **ADAPTED and APPROVED are UKBT-owned, governed artifacts**
(layers 4-5) and live inside `packages/truth/tokens/`. This wording
corrects a Stage 3 transcription defect that previously implied all four
stages were co-located inside `packages/truth/tokens/` — the underlying
architecture (`ARCHITECTURE-PROPOSAL-V3.md` §3) was always explicit and
consistent on this point; only this contract's diagram mis-transcribed it.
See `artifacts/verification/CONTRACT-CONFLICT-001.md` (RESOLVED) and
`EV-20260826-021`.

`TOKEN_COMPILER = Style Dictionary` (reversal from v2's deferred bespoke
script, on explicit requester direction, recorded in
`ARCHITECTURE-PROPOSAL-V3.md` §5 — not re-litigated here).

`TAILWIND = NEVER THE SOURCE OF TRUTH.` Utility-class frameworks are not
part of this pipeline at any layer (`A09`/`A10`, unchanged).

## Selector fidelity rule

> **Visual outcome > selector elegance.**

- Fidelity binds to **rendered visual outcome and cascade behavior**, not
  to literal selector text or nesting depth.
- A deep selector found in the source (e.g. the 4-level descendant chain
  `.card-blog.card-blog-post .image-container img`,
  `CSS-EVIDENCE-GRAPH.md`) may be preserved **or** flattened (e.g. to a
  BEM-style single class per element) in UKBT's semantic CSS, **if and
  only if** the computed visual result and responsive behavior remain
  equivalent to the frozen reference at parity-check time
  (`VISUAL-REGRESSION-CONTRACT.md`).
- The parity gate checks rendered output, never selector text — this is
  what makes selector simplification safe rather than a silent weakening.
- No broad CSS "modernization" (e.g. rewriting the whole cascade to a
  utility-first or CSS-in-JS approach) happens before parity is achieved
  for the item in question. Modernizing before proving parity risks
  conflating a refactor with a regression.

## Cascade preservation

- Authored cascade relationships (specificity ordering, pseudo-state
  layering, media-query overrides) are preserved where required for
  fidelity — no CSS is "cleaned up" pre-emptively (unchanged instruction,
  `ARCHITECTURE-PROPOSAL-V3.md` §5).
- Where a selector is flattened per the rule above, the *cascade behavior*
  it implemented (e.g. hover overriding base, breakpoint overriding
  default) must be reproduced by an equivalent mechanism, not dropped.

## Invariants

- No CSS custom property or semantic rule reaches `apps/web` without
  passing through Style Dictionary from an `APPROVED` token
  (`DESIGN-SYSTEM-CONTRACT.md`).
- No literal Adelux CSS file is copied wholesale into `apps/web` at any
  point — every rule that ships is the product of RAW→CANDIDATE→ADAPTED→
  APPROVED, even when the resulting value is numerically identical to the
  source.

## Forbidden behavior

- Compiling `artifacts/extraction/token-candidates.json` (RAW/CANDIDATE)
  or `packages/truth/tokens/adapted/` directly into shipped CSS (bypassing
  the APPROVED gate).
- Introducing Tailwind or an equivalent utility framework as a styling
  source of truth.
- Modernizing/refactoring CSS before the corresponding item passes visual
  parity.
- Flattening a selector without verifying the parity gate still passes for
  every affected viewport and state.

## Validation method

- Style Dictionary build fails if pointed at anything other than
  `tokens/approved/**` (Stage 4 config requirement, named here).
- Visual-regression suite (`VISUAL-REGRESSION-CONTRACT.md`) is the sole
  arbiter of whether a flattened selector preserves fidelity.
- CI lint rule forbidding a raw/candidate/adapted token path in generated
  CSS output (Stage 4 implementation detail, required by this contract).

## Owner

Track B for any rule/token whose value derives from Adelux's authored
expression (rights-gated). Track C for the pipeline mechanism itself
(Style Dictionary config, build wiring) and for any UKBT-original CSS that
never derives from Adelux material.

## Dependency

`DESIGN-SYSTEM-CONTRACT.md` (token lifecycle gating what may compile).
`REPOSITORY-CONTRACT.md` (generated-code location).
`VISUAL-REGRESSION-CONTRACT.md` (the parity gate this contract's
flattening freedom depends on).

## Change authority

Reversing the compiler choice again, or relaxing the APPROVED-only compile
rule, requires a new evidence record naming what changed since
`ARCHITECTURE-PROPOSAL-V3.md` §5's reasoning.

## Evidence required

`EV-20260826-019` (architecture verdict, §5). `CSS-EVIDENCE-GRAPH.md` /
`css-rule-graph.json` (`EV-20260826-009`) for the cited selector-depth
example — reused, not re-derived.

## Reversibility

MODERATE. Style Dictionary config is itself data-driven; swapping compiler
tooling later rewrites one config file, not the token data
(`ARCHITECTURE-PROPOSAL-V3.md` §5).
