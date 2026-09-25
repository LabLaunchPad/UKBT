# Route Contract

**ID:** CONTRACT-ROUTE-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix that UKBT's information architecture is derived from UKBT
evidence, never from Adelux's page structure — closing leak-path `LP-02`
(`knowledge/06`) at the contract level.

## The binding rule

> **The 13 renderable Adelux pages are reference evidence only. They are
> not an instruction to build 13 identical UKBT routes.**

Adelux's page inventory (`documentation-index` excluded; `index`, `about`,
`service`, `coaching`, `booking`, `membership`, `community`, `event`,
`blog`, `single-post`, `faq`, `contact`, `404-page` —
`artifacts/source/PAGE-INVENTORY.yaml`, `EV-20260826-…`) is a **padel-club
template's** information architecture. UKBT is a cricket club (per this
project's own stated identity, `AGENTS.md`). Its section names
(`courts`, `coaching`, `membership tiers`, `booking`) are Adelux-specific
facts, not UKBT requirements — deriving UKBT's routes from that list
directly would make the template a source of UKBT information architecture
without any single step looking like an invention (`LP-02`).

## Outputs / Route decision process (this contract fixes the *process*,
not a final route list — no UKBT route list exists yet, since it depends
on unresolved content facts, `U-01`)

1. UKBT's actual information needs are established from **UKBT evidence**
   (club identity, actual offerings, actual organizational structure) —
   never from Adelux's section names.
2. Adelux's page *types* (a homepage, an about/info page, a contact page,
   a news/blog listing) may inform **generic web-information-architecture
   patterns** that are not Adelux-specific (every club-type site plausibly
   needs a homepage and a contact page — this is a category-level
   observation, not a template-derived fact).
3. Any specific route name, section, or page that maps to an
   Adelux-specific concept not evidenced as a UKBT concept (`courts`,
   `booking`, `membership tiers` as Adelux defines them) is **not** carried
   over unless independently evidenced as a real UKBT need.
4. A route may only render content that has passed the truth gate
   (`TRUTH-CONTRACT.md`) or is explicitly UI-label/generic-copy content —
   `ARCHITECTURE-PROPOSAL-V3.md` §4's leak-path table: "a route cannot
   exist without a corresponding content entry that passed the gate."

## Invariants

- `INV-014`: reference analysis informs visual grammar only; route and
  content architecture derive from UKBT evidence, never from the
  reference.
- A route's *visual layout* (hero, card grid, section rhythm) may be
  informed by Track A/B design-system work; a route's *existence and
  name* may not be informed by Adelux's page list.

## Forbidden behavior

- Building a UKBT route named or scoped to match an Adelux page merely
  because Adelux has one (e.g. a `booking` route because Adelux has
  `booking.html`, absent an evidenced UKBT booking need).
- Treating the 13-page count as a UKBT page-count target.
- Rendering any route from content that has not passed the truth gate.

## Validation method

- A route/link-integrity CI check (`CI-CONTRACT.md`) verifies every route
  resolves and every internal link targets an existing route — this
  checks mechanical correctness, not the route-derivation rule above.
- The route-derivation rule itself is validated by inspection at Stage 9
  (per `prompts/16-reference-analysis.md`'s scope note): each proposed
  UKBT route must cite its UUKBT-evidence justification, not "Adelux has
  one."

## Owner

Track C. Route architecture is explicitly named as not gated by Track B
(`ARCHITECTURE-PROPOSAL-V3.md` §4) — though a route's *content* remains
gated by the truth gate per item, and a route's *visual layout*, if
adapted from Adelux, remains gated by Track B for that layout specifically.

## Dependency

`CONTENT-CONTRACT.md` (a route needs approved content to render).
`TRUTH-CONTRACT.md` (gate a route's content must pass).

## Change authority

Adding a UKBT route derived from an Adelux page name requires stating the
independent UKBT evidence for that route's existence — "Adelux has a page
like this" is not sufficient justification on its own.

## Evidence required

`artifacts/source/PAGE-INVENTORY.yaml` (`EV-20260826-…`, reused as the
reference-evidence input this contract explicitly does not treat as a
route list).

## Reversibility

REVERSIBLE. No route exists yet; this contract fixes the derivation
process a future route list must follow.

---

## AMENDMENT 01 — template-mirrored route set

**Date:** 2026-08-26 · **Authority:** `EV-20260826-032` / `CLIENT_REQ_009`
· **Status:** AMENDED (frozen text above preserved verbatim)

### What changed

The route set now mirrors the reference template's page set. UKBT routes
are added for page types the template carries, including ones with no
current UKBT content.

### Why this is not the behaviour the frozen text forbids

The frozen "Forbidden behavior" clause names building a `booking` route
"merely because Adelux has `booking.html`, **absent an evidenced UKBT
booking need**." The change-authority clause resolves it: adding such a
route "requires stating the independent UKBT evidence for that route's
existence."

That evidence now exists and is stated. `EV-20260826-032` records the
site owner instructing what their own site should contain. A client
instruction about their own IA is first-party UKBT evidence — the same
class as `CLIENT_REQ_001`, which this contract already accepts as the
source of the seven-page IA. The justification for each mirrored route is
that instruction, **never** "the template has a page like this."

`INV-014` is otherwise intact: reference analysis still informs visual
grammar, and route *content* remains gated by the truth gate per item.

### Conditions attached

1. **No invented content.** A mirrored route with no UKBT evidence
   renders its section shells with `CONTENT_STATUS = UNKNOWN`. Inventing
   pricing tiers, membership benefits, testimonials, FAQ answers, or
   articles to fill a shell remains forbidden (`CLAUDE.md` hard
   invariant, unaffected by this amendment).
2. **Commerce-shaped shells are not advertised.** Routes describing
   offerings UKBT has no evidence of (`/membership`, `/join`,
   `/services`) ship `noindex` and stay out of the primary navigation
   until real content lands. A shell is scaffolding, not a claim that the
   club sells the thing.
3. **The rule survives this amendment.** A future route still needs its
   own stated justification. This amendment authorises the template-
   mirrored set recorded in `artifacts/ui/PAGE-PARITY-MATRIX.md`, not a
   general licence to derive routes from any reference.

### Route set authorised

`/`, `/about`, `/club-captain`, `/players`, `/franchises`, `/tournaments`,
`/contact` (CLIENT_REQ_001) · `/community`, `/coaching`, `/services`,
`/membership`, `/join`, `/faq`, `/news`, `/news/[slug]` (CLIENT_REQ_009)
· `/404` (routing hygiene, no organisational claim).

---

## AMENDMENT 02 — `/franchises/uppsala-tigers`

**Date:** 2026-08-31 · **Authority:** `EV-20260831-001` / `EV-20260831-002`
· **Status:** AMENDED (AMENDMENT 01 and the frozen text above preserved
verbatim)

### What changed

`/franchises` is no longer a single-franchise showcase page. It is now a
card-grid landing listing UKBT's sister franchises, each linking to its
own detail route under `/franchises/`. `/franchises/uppsala-tigers` is
added as the first such detail route, carrying the content the old
`/franchises` page rendered directly.

### Why this is not the behaviour the frozen text forbids

This is not a route derived from Adelux's page list (the frozen text's
concern) — it is a client instruction about UKBT's own information
architecture, the same evidence class AMENDMENT 01 already accepts.
`EV-20260831-001` records the client instruction verbatim: Uppsala
Tigers "should be under Our Franchise once you click, in future there
will be more in the list." `EV-20260831-002` records the requester's
confirmation that this means dedicated per-franchise pages, not a
reorganisation of the single existing page.

### Conditions attached

1. **No invented future franchises.** The card grid at `/franchises`
   lists only franchises with real evidence (today: Uppsala Tigers
   only). A grid slot is not pre-created for a franchise that does not
   yet exist in evidence — see `apps/web/src/content/franchises-data.ts`'s
   `ourFranchises` array and its comment.
2. **Content unchanged, only relocated.** `/franchises/uppsala-tigers`
   renders the same evidenced facts and overseas-signings roster the old
   `/franchises` page rendered (as updated by `EV-20260831-001`/`-002`)
   — this amendment changes routing/IA, not content provenance.
3. **The rule survives this amendment.** A future franchise detail route
   still needs its own stated UKBT evidence before being added to
   `ourFranchises` and given a page — "the grid pattern already exists"
   is not sufficient justification on its own, matching AMENDMENT 01's
   condition 3.

### Route set authorised (delta)

Adds `/franchises/uppsala-tigers` to the route set in AMENDMENT 01.
`/franchises` itself is unchanged as a route (same path), only its
rendered content changes from a showcase to a grid landing.

---

## AMENDMENT 03 (2026-09-25, repo-sync) — R-10: route-set reality + `/__smoke` reservation

**Status:** PROPOSED — needs owner re-approval at PR review (frozen text + AMENDMENTS 01-02 preserved verbatim).

1. **Reversibility (§ Reversibility, lines 97-100: "No route exists yet"):** superseded. 18 routes live (verified by listing `apps/web/src/pages/`: 16 root `.astro` files + `franchises/uppsala-tigers.astro` + `news/[slug].astro`; same 18-route list in `apps/web/AGENTS.md` Structure). Reversibility now reads: route removal migrates links/sitemap/SEO, not greenfield derivation.
2. **Route-set delta:** AMENDMENT 01 authorises 16 incl. `/404` (lines 150-155); AMENDMENT 02 adds `/franchises/uppsala-tigers` (17; lines 201-205). Two live routes were never authorised in either set and are AUTHORISED here with evidence: `/offline` (offline fallback page, `apps/web/src/pages/offline.astro`) and the `tina-island/[name]` endpoint (`apps/web/src/pages/tina-island/[name].ts`, sole `prerender=false` POST route per `knowledge/01-VERIFIED-FACTS.yaml:293`). Neither carries an organisational claim beyond its function; content rules for their rendered output are unchanged.
3. **`/​__smoke` RESERVED (not implemented):** the path `/__smoke` is RESERVED for Task 7's build-attested smoke endpoint. Reservation only — no route, no behavior, no sitemap entry is authorised by this block; implementation lands (or is reported NEEDS_CONTEXT) in Task 7.
