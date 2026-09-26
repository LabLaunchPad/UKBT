# Form Contract

**ID:** CONTRACT-FORM-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the forms adapter boundary before any form is
implemented, so the UI never becomes hard-wired to Cloudflare's specific
API/payload shape.

## Outputs / Frozen layering (source: `ARCHITECTURE-PROPOSAL-V3.md` §7)

```
UI (Astro form component)
        ↓  calls
Application interface
  submitForm(payload): Promise<Result>
  — one module, one function; the UI never touches a provider API directly
        ↓  implemented by
Cloudflare Pages Functions adapter
  (or, per EV-…-001's sanctioned alternative, a third-party form service —
   a config change under the same interface, not a different architecture)
```

## Rules

- The UI depends only on `submitForm(payload): Promise<Result>`. It never
  imports a Cloudflare-specific type, never constructs a Cloudflare
  Functions request/response object, never references a provider's
  payload shape directly.
- The adapter implementation is replaceable: swapping Cloudflare Functions
  for a third-party service (Formspree, etc.) changes only the adapter
  module, never the UI component or the interface signature.
- **The adapter boundary protects the UI from rewrite if the backend
  changes. It does not guarantee Cloudflare's edge runtime can do
  whatever a future form eventually needs.** If a real requirement needs a
  Node API genuinely unavailable at the edge, the *adapter implementation*
  changes (e.g., to an external service reachable via the same interface)
  — not the UI, not this architecture. This is the honest, stated limit of
  what the boundary buys (`ARCHITECTURE-PROPOSAL-V3.md` §7, sharpened by
  the v3 red team) — it is not overclaimed as eliminating all future risk.

## Do not implement yet

**No form is implemented at this contract freeze.** This contract
establishes the boundary a future form will sit behind — the interface
signature and the layering — nothing more. Writing `submitForm`'s real
Cloudflare implementation, or any Astro form markup, is Stage 4+ work and
requires the surrounding truth/content/accessibility contracts to already
be in place (a form collects and may display user-submitted content, which
has its own provenance/validation surface distinct from the truth gate's
org-fact focus, but is not scoped further here since no form exists).

## Invariants

- `INV-004`: future forms must not require rewriting the site
  architecture.
- `INV-005`: form integrations must have an adapter boundary.
- `INV-006`: pages must not hard-code an assumption that forecloses a
  future runtime form endpoint (revised wording, `knowledge/03` — build-time
  content rendering is correct for content; the form *path* is what must
  stay open).

## Forbidden behavior

- A UI component importing `@cloudflare/workers-types` or any
  Cloudflare-specific request/response type directly.
- Implementing form submission logic inline in an Astro page rather than
  behind the `submitForm` interface.
- Treating a hypothetical Cloudflare edge-runtime limitation as a reason
  to abandon the adapter boundary rather than change the adapter's
  implementation.

## Validation method

- A future form's UI component is reviewed for zero direct
  Cloudflare-type imports before merge (Stage 4+ check).
- The `submitForm` interface is exercised by a unit test with a mock
  adapter, proving the UI does not require a live Cloudflare environment
  to test.

## Owner

Track C. Not gated by Track B — the forms boundary is UKBT-original
engineering with no Adelux-derived expression involved (form *styling*,
if adapted from Adelux's visual treatment, is separately gated under
`COMPONENT-CONTRACT.md`/`CSS-CONTRACT.md`, not this contract).

## Dependency

`DEPLOYMENT-CONTRACT.md` (Cloudflare Pages Functions availability).

## Change authority

Choosing a different adapter implementation (a new provider) requires
naming the interface remains unchanged — that is the entire test of
whether the boundary held.

## Evidence required

`EV-20260826-001` (static-first + forms hedge), `EV-20260826-018`
(Cloudflare).

## Reversibility

HIGH, by construction — this is the adapter boundary's entire purpose
(`ARCHITECTURE-PROPOSAL-V3.md` §7).

## AMENDMENT 01 — UI-ahead-of-endpoint state authorised (2026-09-26)

**Date:** 2026-09-26 · **Authority:** `artifacts/evidence/EV-20260926-008.yaml`
(repo-state observation on merged PR #122) · **Status:** AMENDED (frozen
text above preserved verbatim)

**Superseded:** the "Do not implement yet" section (lines 41-50: "No form
is implemented at this contract freeze") is now HISTORY. A form UI exists
on `/join/` behind the `submitForm()` boundary with a mock adapter that
always returns `unavailable` — no endpoint, no success state, no data sent
or stored.

**Unaffected:** the layering, rules, invariants (`INV-004/005/006`),
forbidden behavior, and validation method all stand and all hold against
the shipped UI (zero provider-type imports; mock-adapter unit test runs in
CI). The real adapter implementation remains Stage 4+ work under this same
boundary — this amendment authorises the shipped UI-ahead-of-endpoint
state, not an endpoint.
