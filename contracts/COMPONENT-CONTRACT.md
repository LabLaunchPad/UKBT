# Component Contract

**ID:** CONTRACT-COMPONENT-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix what a "component" means in this design system before any
are written — framework-neutral by definition, Astro as an adapter that
never becomes the contract itself.

## Outputs / Frozen shape

Every component contract (design-system layer 6,
`packages/truth/contracts/`) is **framework-neutral** and specifies, at
minimum:

| Field | Content |
|---|---|
| Purpose | What the component is for, in one sentence. |
| DOM structure | The element tree, described abstractly (e.g. "container > heading + list of cards"), not as Astro markup. |
| Variants | Named variations (e.g. `accent`, `secondary` for a button), each mapped to APPROVED tokens. |
| States | Interactive/visual states (hover, focus, active, disabled, loading, empty), each with its required visual/behavioral change. |
| Responsive behavior | What changes at which breakpoint (referencing the frozen 6-viewport matrix, `VISUAL-REGRESSION-CONTRACT.md`), described as a rule, not as CSS. |
| Accessibility behavior | Required semantics (landmark/role), keyboard interaction, focus visibility, ARIA where native semantics are insufficient. |
| Token dependencies | Which APPROVED tokens the component consumes — never a raw/candidate/adapted value, never a literal. |
| Asset dependencies | Which UKBT-cleared assets (if any) the component requires (`ASSET-CONTRACT.md`). |
| Content dependencies | Which content-schema fields (`CONTENT-CONTRACT.md`) it renders, as props — never a hard-coded fact. |
| Interaction requirements | Any JS-driven behavior (e.g. a toggle, a carousel), named and scoped, with a note on whether it is required for the component to be usable without JS (progressive enhancement expectation, consistent with Astro's zero-JS-by-default model). |

**Astro is the adapter, never the contract.** A component contract file
contains no Astro syntax (no `.astro` frontmatter, no slots-as-specified-
in-Astro-terms) — it is written so that a hypothetical future rewrite in a
different framework could implement it unchanged. `apps/web/src/
components/` holds the Astro *implementation* of a contract; the contract
itself lives in `packages/truth/contracts/`, per `REPOSITORY-CONTRACT.md`'s
layer table.

## Named component candidates carried forward from Track A (evidence,
not yet contracts — `COMPONENT-CANDIDATES.md`, `css-component-token-graph.
json`, `EV-20260826-009`)

| Candidate | Track A finding | Disposition at this freeze |
|---|---|---|
| `.btn-accent` | Simple — base + one token-driven hover pseudo-state | Reasonable first component contract candidate once Track B unlocks; carries the known `SOURCE_DEFECT` (invisible focus outline) — `ACCESSIBILITY-CONTRACT.md` governs its repair-by-default handling |
| `.nav-link` | Moderate — base/container/hover/focus/active, mostly token-driven | Candidate; behavioral parity already partly evidenced (`mobile-nav-toggle-test.json`, breakpoint-confirmed 1280×800↔1024×768) |
| `.card-blog` | High structural complexity, 14 matching rules, genuine sub-components (category/recent/tag) | Candidate; its complexity is real per independent CSS-graph confirmation, not to be under-scoped into a "simple card" |
| `.card-chooseus` | Thin — 1 matching rule, narrowly scoped (2 pages) | **Not** carried forward as a general reusable UKBT component candidate on current evidence — may be revisited if a broader UKBT use emerges, but is not assumed reusable by default |

This table is a restatement of existing Track A evidence for
cross-reference, not a new finding — it does not authorize writing any of
these as real component contracts yet (Track B remains RIGHTS_GATED for
Adelux-derived component shape).

## Invariants

- A component contract has no dependency on a specific framework's
  templating syntax.
- A component never receives a literal fact as a hard-coded value — only
  as a prop sourced from layer 8 (UKBT content/truth). This is the
  structural enforcement named in `ARCHITECTURE-PROPOSAL-V3.md` §4's leak-
  path table ("a component cannot render a hard-coded Adelux fact because
  it has no fact to hard-code").
- Every state and variant a contract declares must be traceable to either
  Track A evidence (for a component being adapted from the reference) or
  a stated UKBT-original requirement (for one that is not).

## Forbidden behavior

- Writing an Astro component before its framework-neutral contract exists.
- Letting an Astro-specific convention (e.g. a particular slot pattern)
  become part of the contract's own specification rather than staying in
  the adapter.
- Treating `.card-chooseus`-tier thin evidence as sufficient grounds for a
  general reusable component without additional justification.

## Validation method

- A contract review step (human or Track B unlock precondition) confirms
  no framework syntax appears in `packages/truth/contracts/*`.
- Each Astro implementation in `apps/web/src/components/` is checked
  against its contract's state/variant/accessibility list before being
  considered `IMPLEMENTED` (`DESIGN-SYSTEM-CONTRACT.md`).

## Owner

Track B for any component contract adapting Adelux-observed structure
(rights-gated). Track C for the contract *format* itself and any
UKBT-original component with no Adelux analog.

## Dependency

`DESIGN-SYSTEM-CONTRACT.md` (lifecycle states a component contract moves
through). `CSS-CONTRACT.md` (token consumption). `CONTENT-CONTRACT.md`
(prop sourcing). `ACCESSIBILITY-CONTRACT.md` (required behavior fields).

## Change authority

Adding a required contract field, or changing the framework-neutrality
rule, requires a new evidence record naming the gap (e.g. a real
Astro-specific leak discovered once the first contract is implemented —
already named as an honest, unverified risk in
`ARCHITECTURE-PROPOSAL-V3.md` §3).

## Evidence required

`COMPONENT-CANDIDATES.md`, `css-component-token-graph.json`,
`CSS-EVIDENCE-GRAPH.md` (all `EV-20260826-009`-linked, reused per the
evidence-reuse rule).

## Reversibility

REVERSIBLE. Zero component contracts exist yet — this contract fixes the
*shape* a future contract must have, which can itself be amended before
any real contract is written against it.
