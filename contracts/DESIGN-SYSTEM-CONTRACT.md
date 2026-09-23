# Design System Contract

**ID:** CONTRACT-DESIGN-SYSTEM-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Freeze the design-system lifecycle and layer model that
governs how Adelux-derived evidence becomes UKBT-owned, implemented,
verified output — extending, not replacing, the four-state lifecycle
already frozen in `knowledge/06-TEMPLATE-BOUNDARY.yaml`.

## Outputs / Frozen lifecycle

### Extension: six states, not four

`knowledge/06-TEMPLATE-BOUNDARY.yaml`'s `token_lifecycle` freezes
`RAW → CANDIDATE → ADAPTED → APPROVED` for **tokens**. This contract
extends the same lifecycle shape to the full design-system item (tokens
*and* components *and* pages) with two further states describing what
happens after approval:

```
RAW → CANDIDATE → ADAPTED → APPROVED → IMPLEMENTED → VERIFIED
```

| State | Definition | Governed by |
|---|---|---|
| RAW | Literal source observation (a value/pattern as it appears in Adelux). | `knowledge/06` (unchanged) |
| CANDIDATE | Deterministically derived, recurring value/pattern with a coherent semantic cluster. | `knowledge/06` (unchanged) |
| ADAPTED | Translated into UKBT's own design-system vocabulary (pipeline stage 3, `UKBT_ADAPTATION`). | `knowledge/06` (unchanged) |
| APPROVED | Explicitly accepted into the UKBT implementation. | `knowledge/06` (unchanged) |
| **IMPLEMENTED** | **New.** Written into `apps/web`/`packages/truth` as real code (a token in generated CSS, a component in `apps/web/src/components/`, a page rendering that component). | This contract |
| **VERIFIED** | **New.** Passed the visual-regression gate (`VISUAL-REGRESSION-CONTRACT.md`) against the frozen reference render at every required viewport — structural, visual, responsive, interaction, and accessibility evidence all recorded. | This contract, cross-referencing `VISUAL-REGRESSION-CONTRACT.md` |

**No state may be skipped.** In particular:
- No automatic promotion from RAW, CANDIDATE, or ADAPTED directly to
  APPROVED (unchanged rule from `knowledge/06`).
- No automatic promotion from APPROVED to VERIFIED — an item that is
  `IMPLEMENTED` but has not run the visual-regression suite is not
  `VERIFIED`, regardless of how confident the implementation looks.
- `IMPLEMENTED` without `VERIFIED` is a valid, nameable state (code exists,
  parity is unproven) — it is never silently reported as done.

This is a `contracts/`-layer extension of an existing frozen model, not an
edit to `knowledge/06-TEMPLATE-BOUNDARY.yaml` itself — per the Stage 3
instruction not to reopen `knowledge/06`. The two files are consistent:
`knowledge/06`'s four states describe token *provenance/rights posture*;
this contract's six states describe the *full item's* journey through
implementation and verification, with the first four states identical by
definition.

### Ten-layer architecture (restated as binding; source:
`ARCHITECTURE-PROPOSAL-V3.md` §3)

See `REPOSITORY-CONTRACT.md`'s layer table for the authoritative
layer→location map. This contract owns the *lifecycle rule* that governs
movement between layers 2/3 (RAW/CANDIDATE, both Track A) and layers 4-10
(ADAPTED through VERIFIED, all Track B/C).

## Invariants

- A component or token cannot be `VERIFIED` without first being
  `IMPLEMENTED`, `APPROVED`, `ADAPTED`, `CANDIDATE`, and `RAW`, in that
  order, each recorded.
- Layers 1-3 (`artifacts/`) are read-only evidence once Track A closes;
  nothing in Stage 4 implementation writes back into them.
- The known `SOURCE_DEFECT` class (e.g. the `.btn-accent` invisible-focus
  finding, `INTERACTION-FORENSICS.md`) is never carried through ADAPTED
  unexamined — see `ACCESSIBILITY-CONTRACT.md`'s binding repair-by-default
  rule, which this lifecycle enforces at the ADAPTED→APPROVED transition.

## Forbidden behavior

- Claiming an item is `VERIFIED` because it was `IMPLEMENTED` and "looks
  right."
- Skipping ADAPTED and writing an Adelux RAW/CANDIDATE value directly into
  `packages/truth/tokens/approved/`.
- Treating layers 1-3 as editable once frozen.

## Validation method

- A registry (Stage 4: likely a field on each token/component contract
  file) records the current lifecycle state and the evidence for its last
  promotion.
- CI's visual-regression gate is the only mechanism that can mark an item
  `VERIFIED` — no manual/asserted promotion to that state.

## Owner

Track B for ADAPTED/APPROVED promotion (rights-gated — requires Track B to
unlock before any real Adelux-derived value may be adapted). Track C for
the lifecycle mechanism itself and for any UKBT-original item that never
touches Adelux's authored expression (which may proceed through all six
states without Track B, since it was never RAW Adelux material to begin
with).

## Dependency

`knowledge/06-TEMPLATE-BOUNDARY.yaml` (frozen four-state base, not
reopened). `VISUAL-REGRESSION-CONTRACT.md` (defines what VERIFIED
requires). `ACCESSIBILITY-CONTRACT.md` (SOURCE_DEFECT handling at
promotion).

## Change authority

Adding a seventh state, or altering the four inherited states, requires
amending `knowledge/06-TEMPLATE-BOUNDARY.yaml` itself via its own change
process (a new evidence record identifying the contradiction) — this
contract's two new states may be amended independently since they are this
contract's own addition, not `knowledge/06`'s.

## Evidence required

None new — this contract composes already-frozen evidence
(`knowledge/06-TEMPLATE-BOUNDARY.yaml`, `EV-20260826-019`).

## Reversibility

REVERSIBLE. The two new states are a process convention layered on top of
an unchanged four-state base; removing or renaming them affects tracking,
not any already-built artifact.
