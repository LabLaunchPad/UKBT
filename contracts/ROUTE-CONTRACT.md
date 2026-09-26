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

### AMENDMENT 03 follow-up (2026-09-25, repo-sync Task 7) — `/__smoke` implemented as `/smoke.json` static

**Status:** PROPOSED — needs owner re-approval at PR review (AMENDMENT 03 above preserved verbatim).

Per the controller ruling (Shape A): the reserved `/__smoke` path is implemented as the prerendered static endpoint `/smoke.json` (`apps/web/src/pages/smoke.json.ts`, `{"ok":true,"buildId":"<short-SHA>"}`). Exact `/__smoke` JSON was rejected (round-1 report: no verified build→runtime SHA channel for an SSR route without out-of-scope `astro.config`/`wrangler`/`ci.yml` wiring), and `/__smoke.json` as a file route is un-buildable — Astro excludes `_`-prefixed `src/pages` files from the router and `dist/` (routing docs "Excluding pages", verified 2026-09-25). AUTHORISED: `/smoke.json` static route (no organisational claim; sitemap/gate-neutral by construction — gates crawl `**/*.html|css|js`), the append-only `public/_headers` `Cache-Control: no-store` rule for it, the `smoke-deploy.mjs` try-`/smoke.json`-first + `/sw.js` fallback identity order, and the `scripts/build-smoke.mjs` post-build SHA stamp + its `apps/web/package.json` `build`-chain wiring (in-file SHA bake rejected: the adapter prerender shim stubs `node:child_process`).

---

## AMENDMENT 04 — removal of `/community` and `/coaching` (18 → 16 routes)

**Date:** 2026-09-26 · **Authority:** `EV-20260926-002` (owner instruction: "these pages are not needed, so we need to delete these pages") · **Status:** AMENDED (frozen text + AMENDMENTS 01-03 preserved verbatim)

### What changed

`/community` and `/coaching` are removed from the authorised route set. Both `.astro` files are deleted; their `secondaryNav` entries, `SEO_ROUTES` registry entries, `llms.txt` lines, and Playwright route-list entries are removed with them. Stale generated captures (`artifacts/ui/screenshots` community/coaching PNGs) are removed as regenerated output, not evidence.

### Why this is consistent with the frozen text

Route removal is not route derivation — the frozen text governs how routes get *added* (UKBT evidence, never the template list). A client instruction to remove two of their own IA's routes is the same first-party evidence class AMENDMENT 01/02 accept, applied in reverse. No content is invented or relocated by this change.

### Conditions attached

1. **Deleted URLs fall through to `/404`** (`not_found_handling: 404-page`). No redirect file is created — removal-only was ordered, and inventing redirect targets would be scope expansion.
2. **No other route's content changes.** The shared `FranchiseTeaser` component (previously rendered on `/community`) is untouched and continues on `/` and `/tournaments`.
3. **The rule survives this amendment.** Reinstating either route needs its own stated UKBT evidence — "it existed before" is not sufficient justification on its own.

### Route set authorised (delta)

Removes `/community` and `/coaching` from the AMENDMENT 01 set. Authorised set is now 16 `.astro` routes: `/`, `/about`, `/club-captain`, `/players`, `/franchises`, `/franchises/uppsala-tigers`, `/tournaments`, `/news`, `/news/[slug]`, `/contact`, `/faq`, `/services`, `/membership`, `/join`, `/offline`, `/404` — plus the `tina-island/[name]` endpoint (AMENDMENT 02/03) and `/smoke.json` static endpoint (AMENDMENT 03 follow-up).

---

## AMENDMENT 05 — `/privacy` applicant notice stub (16 → 17 `.astro` routes)

**Date:** 2026-09-26 · **Authority:** owner decision 2026-09-26 to build the player application form — `docs/superpowers/specs/2026-09-26-join-form-design.md` ("Status: PROPOSAL approved by owner 2026-09-26"), the same first-party owner decision class AMENDMENTS 01/02/04 accept · **Status:** AMENDED — evidence record `artifacts/evidence/EV-20260926-006.yaml` filed 2026-09-26 (frozen text + AMENDMENTS 01-04 preserved verbatim)

> Rule 4 (`contracts/README.md`): the evidence record naming the observation behind this amendment is `artifacts/evidence/EV-20260926-006.yaml` (owner instruction for the form + privacy stub, filed 2026-09-26).

### What changed

`/privacy` (`apps/web/src/pages/privacy.astro`) is added: an **applicant privacy notice stub**, linked from the consent hint on the `/join/` application form. `/join/` itself is unchanged as a route — only its rendered content changed (the `PendingContent` shell became the form), still `noindex` per AMENDMENT 01 condition 2.

### Why this is consistent with the frozen text

The frozen text governs route *derivation*, and this route is not derived from Adelux's page list — it is a consequence of a first-party owner instruction about UKBT's own form, the same evidence class AMENDMENT 01 (`CLIENT_REQ_009`), 02 and 04 accept. The form's consent hint needs a destination that is honest about applicant data; a UKBT-evidenced destination is required precisely because the template-derived one would not be. `INV-014` is intact: no reference page, name or count is borrowed.

### Conditions attached

1. **The notice is a stub, not a policy.** It states what the form asks for, which channels are real, and that the working notice — carrying the lawful basis, retention period, data-protection contact and complaints route — ships with online applications. It does **not** claim a full policy already exists.
2. **`noindex`.** Following the convention AMENDMENT 01 condition 2 set for shell pages (and `/offline` follows), a stub is not public content; indexing an incomplete notice would invite readers to treat it as the club's policy. It becomes indexable only when the working notice replaces the stub text.
3. **No invented legal terms.** No retention period, DPO, registrant, postal address or lawful basis is asserted. Contact channels are rendered from `contact`/`homepage.social` in `src/content/homepage-data.ts`, never retyped. `UNKNOWN stays UNKNOWN` — a gap is named as a gap.
4. **The rule survives this amendment.** A future route still needs its own stated UKBT evidence. "The form links to it" is not sufficient justification on its own.

### Route set authorised (delta)

Adds `/privacy` to the AMENDMENT 04 set. Authorised set is now 17 `.astro` routes: the 16 listed in AMENDMENT 04 plus `/privacy` — alongside the `tina-island/[name]` endpoint (AMENDMENT 02/03) and the `/smoke.json` static endpoint (AMENDMENT 03 follow-up).
