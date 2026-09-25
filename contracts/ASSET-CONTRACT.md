# Asset Contract

**ID:** CONTRACT-ASSET-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the rights-classification discipline for every visual
asset before any asset is adopted into `apps/web`.

## Outputs / Frozen classification

Every asset (image, icon, font file, video) is recorded in one of four
provenance classes before use:

| Class | Meaning | Example |
|---|---|---|
| UKBT-owned | Captured/created for UKBT specifically, rights held by UKBT | A real match photo, once one exists |
| LabLaunchPad-authorized-authored | Created by LabLaunchPad for this engagement, authorization independently evidenced | None currently — `provenance_chain.B` is `ASSERTED_NOT_EXECUTED` |
| Third-party (cleared) | Licensed/permissive, attribution or terms tracked per component | Self-hosted OFL fonts (Lato/Montserrat, per `DEPLOYMENT`/`third_party_fonts`) |
| Unknown/uncleared | Rights not established | Any Adelux demo asset by default |

Per-asset record fields (binding, restated from `knowledge/06`
`asset_policy`): `SOURCE`, `IDENTITY`, `USAGE`, `RIGHTS_STATUS`,
`UKBT_REQUIRED`, `ALTERNATIVE`.

## Rules

- **No runtime use of uncleared material.** An asset without a resolved
  `RIGHTS_STATUS` never ships in a production build, regardless of how
  visually convenient it is.
- **No demo Adelux branding in production, ever** — `adelux_logo`,
  `adelux_name`, `adelux_demo_copy`, `adelux_specific_business_claims`, and
  `adelux_proprietary_branding` are permanently forbidden
  (`knowledge/06 brand_boundary.forbidden`), independent of how Track B
  resolves.
- When a needed visual role has no clearable Adelux-equivalent asset,
  replace it with a UKBT-cleared equivalent while preserving the visual
  role, dimensions, crop, ratio, and composition as closely as possible —
  and record the substitution (source asset, replacement, what was
  preserved, what changed, why). Never silently substitute and call it
  equivalent (`knowledge/06 asset_policy.when_needed_but_not_clearable`).
- Third-party assets are a **separate rights domain** from the Adelux
  template licence itself — Adelux's own licence status, whatever it
  resolves to, never automatically clears a bundled asset's independent
  licence (`DR-019`, `LP-03`).

## Invariants

- `boundary_roles.third_party_assets = SEPARATE_RIGHTS_DOMAIN`
  (`knowledge/06`), carried forward unchanged.
- Fonts: self-hosted, never loaded from `fonts.gstatic.com` at runtime
  (privacy/GDPR finding, `knowledge/06 privacy`; restated bindingly in
  `DEPLOYMENT-CONTRACT.md` §fonts).

## Forbidden behavior

- Copying an Adelux demo asset into `apps/web/public/` "temporarily."
- Shipping a font, icon, or image with `RIGHTS_STATUS: unknown`.
- Using Adelux's own brand marks anywhere in UKBT output.

## Validation method

- A per-asset manifest (Stage 4, `apps/web/src/assets/MANIFEST.md` or
  equivalent) records the four class fields for every committed asset.
- CI checks that no file under `apps/web/public/` or `apps/web/src/assets/`
  lacks a manifest entry (build fails otherwise — presence in the build
  without a recorded rights status is exactly the failure this contract
  exists to prevent).

## Owner

Track C for the manifest mechanism. Track B for clearing any specific
Adelux-derived asset for actual production use (none cleared at this
freeze).

## Dependency

`RIGHTS-CONTRACT.md` (overall rights posture). `DEPLOYMENT-CONTRACT.md`
(font self-hosting requirement).

## Change authority

Reclassifying an asset from `unknown`/`uncleared` to `cleared` requires a
new evidence record naming the clearance basis (a licence, a purchase
record, an explicit grant) — never a restated assertion.

## Evidence required

`THIRD-PARTY-DISPOSITION.md` (`EV-20260826-…`), reused for the
third-party-software/font baseline this contract's asset manifest will
extend at Stage 4.

## Reversibility

REVERSIBLE. No asset is currently committed to `apps/web` (it does not
exist yet); this contract fixes the intake discipline before the first
asset lands.

---

## AMENDMENT 01 — client-authorised provenance class

**Date:** 2026-08-26 · **Authority:** `EV-20260826-032` / `CLIENT_REQ_010`
· **Status:** AMENDED (frozen text above preserved verbatim)

### The gap this closes

The frozen four-class scheme has no slot for the situation actually in
front of us: images **supplied by the client from their own material**,
which the client has explicitly authorised for use, but whose UKBT
affiliation this project could not independently confirm from the image
itself. Filing them as `UKBT-owned` would overstate what we verified;
filing them as `Unknown/uncleared` would ignore the actual rights-holder's
explicit instruction. Neither is honest.

### Fifth class

| Class | Meaning | Example |
|---|---|---|
| Client-authorised | Supplied by the client from their own material and explicitly authorised by them for UKBT use; affiliation not independently verified by this project | The 20 supplied gallery photographs (`EV-20260826-032`) |

Per-asset records in this class carry two extra fields:

- `AUTHORISATION` — the evidence ID carrying the client's instruction.
- `INDEPENDENT_VERIFICATION` — what this project could and could not
  confirm from the asset itself, stated plainly. Never left blank, and
  never backfilled with the authorisation.

The distinction is the point: **the client's authorisation is recorded as
theirs**, not restated as our verification. Anyone reading the manifest
can see which is which.

### Rules for this class

1. **Affiliation only.** Client authorisation resolves doubt about
   whether an image depicts UKBT. It does not resolve any other
   objection.
2. **Named-person instructions are not overridden.** An image is still
   excluded if it displays a person the client has separately instructed
   be removed — `nordic-smash-slide.webp` stays excluded on
   `CLIENT_REQ_008` grounds (visible "NIPO KHADEM", `EV-20260826-031`),
   notwithstanding `CLIENT_REQ_010`. Two client instructions, and the
   narrower one governs.
3. **Visual inspection before use is mandatory.** Every asset entering
   this class is viewed at full resolution first, specifically checking
   for names, captions, or third-party branding baked into the pixels.
   `EV-20260826-031` is the reason: a text-content grep cannot see inside
   a raster image, and an excluded person shipped to production for a
   full stage because of it.
4. **Third-party marks are recorded, not scrubbed.** Several supplied
   photographs carry other organisations' sponsor logos and event
   branding. Where such an asset is used, its `INDEPENDENT_VERIFICATION`
   field names what is visible. This is disclosure, not clearance.

## AMENDMENT 02 (2026-09-25, repo-sync) — R-06: reversibility (assets shipped)

**Status:** PROPOSED — needs owner re-approval at PR review (frozen text + AMENDMENT 01 preserved verbatim).

§ Reversibility, lines 91-95 ("No asset is currently committed to `apps/web` (it does not exist yet)") is superseded: assets shipped — 50/58 player photos + 8 monogram fallbacks (`apps/web/src/content/players-data.ts:12-15`; `knowledge/01-VERIFIED-FACTS.yaml:65`); Uppsala 20+4 all pictured, Roy sharing `/media/players/dhrubonil-roy.webp` (`apps/web/src/content/franchises-data.ts:24-27`); per-photo manifest at `apps/web/src/assets/MANIFEST.md` (verified present). Reversibility now reads: asset changes migrate or reclassify live manifest entries (with evidence records per § Change authority), not greenfield intake design.

Recorded, no change (per audit R-06 note): the frozen four-class scheme + AMENDMENT 01 fifth class (Client-authorised) stand correctly amended; rendered cards dropping the affiliation note (`SquadCard.astro:14` — filter hook only, never visible text) does NOT violate AMENDMENT 01 rule 4, because disclosure lives in the manifest `INDEPENDENT_VERIFICATION` field, not rendered UI.
