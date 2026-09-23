# Rights Contract

**ID:** CONTRACT-RIGHTS-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Bind, in the `contracts/` layer, the rights posture already
frozen in `knowledge/06-TEMPLATE-BOUNDARY.yaml` — this contract restates
and cross-references that file; it does **not** reopen, edit, or duplicate
its decision authority. `knowledge/06` remains the source of truth for
rights facts; this contract is where other Stage-3 contracts point when
they need to cite the rights boundary.

## Source/reference freeze (verbatim, never reinterpreted without new
evidence)

```
ADELUX_SOURCE_SHA256      = cf4907bb60003b719f3d7712e2d06389c2ab7f8a02590bdea570da9780cafb54
SOURCE_HTML_FILES         = 14
RENDERABLE_REFERENCE_PAGES = 13
DOCUMENTATION_EXCLUDED    = 1
```

## Permission facts (restated from `knowledge/06`, authoritative there)

```
FORENSIC_PERMISSION      = ALLOWED
IMPLEMENTATION_PERMISSION = GOVERNED
PRODUCTION_CLEARANCE     = CONDITIONALLY_CLEARABLE   # superseded from NOT_CLEARED, EV-20260826-024/-025 — still per-item, see knowledge/06
REDISTRIBUTION_PERMISSION = NOT_ALLOWED
```

## The permitted/gated split this contract exists to make explicit

**Forensic source analysis is explicitly permitted** — reading, parsing,
rendering, and measuring the immutable Adelux source (pipeline stages
1-2, `FORENSIC_ANALYSIS`/`DESIGN_EXTRACTION`) requires no licence; it makes
no use of the licensed work beyond reading it to understand it.

**Rights-sensitive adaptation, production, and redistribution remain
gated:**
- Adaptation (pipeline stage 3, `UKBT_ADAPTATION`) — `GOVERNED`, requires
  every item classified by pipeline stage and token lifecycle state, never
  assumed clear by default.
- Production (pipeline stage 5, `PRODUCTION_RELEASE`) — `CONDITIONALLY_CLEARABLE`
  (superseded from `NOT_CLEARED`, `EV-20260826-024`/`-025` — the required
  external authority is now satisfied, see `knowledge/06`). Each item
  still individually passes the truth/asset gates before entering
  `APPROVED` — this removes the licence blocker, it does not pre-clear
  unproduced or ungated content.
- Redistribution — `NOT_ALLOWED`, regardless of how adaptation/production
  resolve. Prohibited by every licence tier examined
  (`EV-20260826-006`) and not the objective in any case.

## Never-claimable list (restated, binding)

Without specific, independently-verified evidence, this project never
claims: ownership of Adelux, an unrestricted licence, resale rights,
sublicensing rights, redistribution rights of the original template, or
third-party asset rights by inheritance from Adelux's own (unresolved)
licence status. A prompt's or instruction's assertion of a rights
conclusion is not itself evidence for that conclusion (`DR-023`).

## Provenance chain (restated, authoritative in `knowledge/06`)

| Link | Status |
|---|---|
| A. Original template authorship (Fox Creation) | VERIFIED |
| B. LabLaunchPad builder/author role | ASSERTED_NOT_EXECUTED — unchanged; this specific claim (authorship) was never established and is not what closed Track B |
| B2. LabLaunchPad licensee role (Envato Elements) | VERIFIED — `EV-20260826-024`/`-025`, License Code `HAXKDZUTYV` |
| C. UKBT single-site permission | ESTABLISHED — superseded from `NOT_ESTABLISHED`, via B2 not B |
| D. Third-party rights | INDEPENDENTLY_GOVERNED |

`UKBT_ADAPTATION_PERMISSION = ESTABLISHED` (superseded from
`NOT_ESTABLISHED`), scoped to the one End Product `EV-20260826-025`
confirms is the UKBT site — this does **not** extend to redistributing
the Adelux item itself (`REDISTRIBUTION_PERMISSION` stays `NOT_ALLOWED`)
or to Fox Creation's own brand assets
(`THIRD-PARTY-LICENSE-FIREWALL.md`, unaffected), and does not gate Track C
(UKBT-original engineering untouched by Adelux's expression), which was
never blocked by this in the first place.

## Three-track model (restated, authoritative in `knowledge/06`)

| Track | Definition | Current state |
|---|---|---|
| A — Source forensics | Read-only analysis of the reference | ALLOWED, may continue |
| B — Rights-gated adaptation | UKBT implementation material embedding/closely reproducing Adelux's authored expression | UNLOCKED (superseded from `RIGHTS_GATED`, `EV-20260826-024`/`-025`) — scoped to the one End Product confirmed as UKBT |
| C — UKBT-original engineering | Everything not touching Adelux's authored expression (this Stage-3 contract-freeze work included) | MAY PROCEED, gated only by architecture quality (BL-03, closed — `EV-20260826-019`), never by BL-02/provenance |

## Required evidence to close Track B (restated, authoritative in
`knowledge/06`)

**Needed** (all of):
1. An executed instrument establishing B — a signed attestation naming a
   real, identifiable person with authority to bind LabLaunchPad, OR a
   contract/assignment, OR verifiable source/creation history.
2. Resolution of the authorship conflict with A — e.g. evidence that "Fox
   Creation" is a LabLaunchPad-controlled account/alias, or a correction
   reconciling the two.
3. Confirmation the instrument's scope covers UKBT's actual intended use
   (single-site adaptation, framework translation) — silence on scope does
   not imply coverage.

**Never sufficient alone:**
- A prompt or instruction asserting the conclusion is already settled.
- An unsigned template, however detailed its surrounding classification
  scheme (the concrete instance already reviewed and rejected:
  `EV-20260826-012`, `provenance_contradiction`).
- LabLaunchPad's own unverified statement, repeated.

## Single-site scope (restated, `INV-016`)

This implementation is for UK Bangla Tigers only. No generic
Adelux-derived framework, reusable multi-client template, marketplace
product, or "Adelux Framework" for future customers. UKBT components
reused within UKBT's own pages is ordinary component design, not the
prohibited kind of reuse.

## Invariants

- This contract never overrides `knowledge/06`; a conflict between this
  file and `knowledge/06` is a defect in this file, to be corrected by
  editing this file, never by editing `knowledge/06` to match a
  Stage-3-layer convenience.
- Nothing in this contract, or in any contract it is referenced by, may be
  read as establishing B, C, or REDISTRIBUTION_PERMISSION — those remain
  exactly as `knowledge/06` states them until new, independently-verified
  evidence supersedes a specific record.

## Forbidden behavior

- Populating any `packages/truth/tokens/adapted/` or `.../approved/`
  content with a real Adelux-derived value while Track B remains
  RIGHTS_GATED.
- Treating this contract's existence, or the act of writing any Stage-3
  contract, as progress toward closing Track B — contract-writing is
  Track C work and does not touch the rights question at all.
- Reopening the provenance/permission model itself absent a genuine new
  contradiction (per the Stage 3 instruction not to relitigate completed
  architecture/governance decisions).

## Validation method

- Any PR touching `packages/truth/tokens/adapted/` or `.../approved/`, or
  any component contract citing Adelux-derived structure, must reference
  the Track B closure evidence in its receipt — absent that, the CI
  dependency/content review (Stage 4) rejects it.
- Periodic re-read of `knowledge/06` against this contract's restated
  values, to catch drift (`FINAL CONSISTENCY AUDIT`, this freeze).

## Owner

This contract is owned by the same authority as `knowledge/06` — the
project's rights-governance layer, not Track C engineering judgment alone.

## Dependency

`knowledge/06-TEMPLATE-BOUNDARY.yaml` (authoritative source, unchanged).
`ASSET-CONTRACT.md`, `CSS-CONTRACT.md`, `COMPONENT-CONTRACT.md`,
`DESIGN-SYSTEM-CONTRACT.md` (all cite this contract for their Track B
gating).

## Change authority

Amending any value in this contract requires first amending
`knowledge/06-TEMPLATE-BOUNDARY.yaml` via its own change process (a new
evidence record naming the invalidating observation) — this contract is
then updated to match, never the reverse.

## Evidence required

`EV-20260826-005, 006, 007, 008, 009, 012, 013` (provenance/licence
research, all reused, none re-derived for this freeze).

## Reversibility

NOT REVERSIBLE in the sense that matters most: shipping a rights-gated
value to production cannot be undone by a later contract edit — it is a
real-world publication event. The contract itself (this document) is
freely revisable; the consequence of violating it before Track B closes is
not.
