# Homepage brand rails + veto list (Stage-2 Task 2)

> Spec task — changes no shipped bytes (branch `feat/homepage-redesign`).
> Locks the in-brand exploration envelope for the Task 3 direction specs
> (plan: `docs/superpowers/plans/2026-09-26-homepage-redesign-stage2.md`
> Task 2; constraint "fonts stay; exploration inside logo navy/gold family
> only"). Every rail below traces to a token, asset, or contract line;
> every veto is checkable — a direction either violates one or not.

## Verified anchors (sources)

**Colour** — `packages/truth/src/tokens/approved/color.json:2-13`,
`artifacts/brand/BRAND-DECISION.md:40-88` (EV-20260826-029, pixel-sampled
from `artifacts/brand/raw/brand/crest.png`, not taken on the supplied
README's word):

- Primary navy `#001E3A` — VERIFIED, 62.1% of crest, dominant field
  (`color.json:5`, `BRAND-DECISION.md:45,77`). Derivations already
  tokenized: `primaryHover #001A33` (−12% lightness), `primaryActive
  #00172D` (−22%) — DERIVED formula, not brand-specified
  (`color.json:6-7`, `BRAND-DECISION.md:78-79`); `primaryContrast
  #FFFFFF`, 16.84:1 on navy (`color.json:8`, `BRAND-DECISION.md:62,80`).
- Accent gold `#CCA44F` — VERIFIED, 10.1% (+7.8% antialiased), accent role
  in every mark (`color.json:9`, `BRAND-DECISION.md:46,81`).
  `accentHover #B49046`, `accentActive #9F803E` — DERIVED
  (`color.json:10-11`, `BRAND-DECISION.md:82-83`); `accentContrast
  #001E3A`, 7.21:1 navy-on-gold; never white text on gold
  (`color.json:12`, `BRAND-DECISION.md:61,84`).
- Green `#064D49` — PROPOSED tertiary only: real crest colour but minor
  artwork detail (3.3%), no UI-usage evidence (`BRAND-DECISION.md:85`).
  Not in the approved `brand` token group. Out of the exploration family
  unless promoted via evidence.
- Cream `#F8F4E8` — PROPOSED surface alternative: tokenized as
  `color.surface.alt` (light section background, `color.json:60-62`) but
  explicitly "not asserted as a decided brand surface".
- Supporting tokens (unchanged by this task): generic neutral ramp
  (`color.json:14-44`), `surface` system-keyword background/foreground/link
  + `inverse #001E3A` / `inverseForeground #FFFFFF` (`color.json:45-73`),
  `overlay.scrim rgba(0, 0, 0, 0.53)` (`color.json:74-81`), `feedback`
  danger/success/warning (`color.json:82-96`, `BRAND-DECISION.md:88`).
- Measured contrast precedents (`BRAND-DECISION.md:58-65`): gold-on-white
  2.34:1 FAILS · gold-on-navy 7.21:1 · white-on-navy 16.84:1 ·
  navy-on-cream 15.32:1. Adopted rule: gold is never text on
  white/cream; gold text lives on navy/dark, or gold is a non-text accent
  (borders, icons, underlines) on light surfaces
  (`BRAND-DECISION.md:67-71`).

**Typography** — `packages/truth/src/tokens/approved/typography.json`,
`BRAND-DECISION.md:95-116`:

- `font.family.base` Lato / `font.family.heading` Montserrat, self-hosted
  SIL OFL — PROPOSED, not VERIFIED: carried over as an Adelux-template
  assumption, never confirmed by the club (`typography.json:4-13`,
  `BRAND-DECISION.md:101-116`). PROPOSED still means locked for this
  redesign: fonts stay (plan Task 2 Interfaces, design doc Locked
  decision 4 as restated in the plan).
- `font.size.0-6` 1.25 modular scale — DERIVED convention
  (`typography.json:15-44`); `font.size.display` fluid clamp —
  DERIVED (`typography.json:45-49`); `font.heading.h1-h6` scale —
  MEASURED port (`typography.json:77-212`); weights 400/500/700 + 600
  for h5/h6 (`typography.json:51-65,181-206`).

**Crest + social assets** — `artifacts/brand/BRAND-DECISION.md:22-36`,
`apps/web/src/assets/MANIFEST.md:9-25`:

- Canonical: `artifacts/brand/raw/brand/crest.png` (1504×2048, shield
  crest: "UK BANGLA TIGERS", tiger head, crown, "EST 2020").
- Shipped: `apps/web/public/brand/crest-512.png` (canonical source for
  derivatives, `MANIFEST.md:9`), `apps/web/public/brand/crest-256.webp`
  (header/drawer/footer use, `MANIFEST.md:13`), `apps/web/public/favicon.svg`
  (simplified 64×64 "UBT" monogram, same three-colour scheme,
  `BRAND-DECISION.md:27-28`, `MANIFEST.md:21`).
- Single colorway only: LIGHT/DARK/MONOCHROME variants NOT SUPPLIED
  (`BRAND-DECISION.md:35`). No explicit brand guideline document was ever
  supplied (`BRAND-DECISION.md:141-148`) — so the crest rules below anchor
  to shipped usage as the floor, never to invented numbers.
- Shipped crest sizes: header/drawer 44×60 (`Header.astro:45,116`),
  footer 53×72 (`Footer.astro:36`); `ProfileHeader.astro:49` uses
  `crest-512.png`. Smallest shipped crest render: **44×60**.
- Social card `apps/web/public/social-card.jpg` (1200×630, crest +
  wordmark + tagline) is the OG/Twitter preview image only
  (`MANIFEST.md:24`, wired in `apps/web/src/lib/seo.ts:30`) — not a page
  design element.

## brand-rails — permitted exploration ranges

Ranges, not invented values. Anything outside these ranges is not
"exploration" — it is a token change and follows the plan Global
Constraints route (`adapted/` staging + evidence record + rebuild).

- **R1 — navy range.** Flat navy surfaces and text stay within the hue of
  `#001E3A` (≈210°): the tokenized band `primaryActive #00172D` →
  `primary #001E3A` covers interactive/dark states; lighter navy tints
  (same hue, toward white) are permitted only as non-text surfaces
  carrying navy text, per the 15.32:1 navy-on-cream precedent. New
  intermediate navy stops must hold the hue and go through
  `adapted/`-staging with a crest/evidence basis — never eyeballed hex.
- **R2 — gold range.** Gold accents and interactive states stay within the
  hue of `#CCA44F` (≈40°): the tokenized band `accentActive #9F803E` →
  `accent #CCA44F` covers hover/active. Gold-as-text is permitted only on
  navy/dark (7.21:1 precedent); on light surfaces gold is non-text accent
  only (borders, icons, rules, underlines) per `BRAND-DECISION.md:67-71`.
- **R3 — light surfaces.** `Canvas` (system keyword), white, neutral ramp,
  and cream `#F8F4E8` as a light section-background alternative. Cream
  may be used but must not be presented as a decided brand surface
  (PROPOSED status, `color.json:62`).
- **R4 — type.** Lato body / Montserrat heading stacks only, at
  `font.size.0-6` steps, the `display` clamp, or the MEASURED h1–h6
  scale; weights from the tokenized set (400/500/600/700 as tokenized
  per level). No new families, no off-scale sizes, no new weights.
- **R5 — crest usage.** (a) Minimum size: never render the full crest
  smaller than the smallest shipped use, 44×60 (`Header.astro:45,116`);
  below that threshold use the `favicon.svg` monogram, which exists
  precisely for small sizes. (b) Clear space: no element may touch or
  overlap the crest bounding box; surrounding breathing room must be at
  least the spacing of the shipped header placement — checkable by
  side-by-side comparison, no invented pixel value (no guideline doc
  exists to cite one). (c) Never alter: no recolor, crop, stretch,
  rotation, added shadows/outlines, or re-setting the wordmark — only one
  colorway exists (`BRAND-DECISION.md:35`), so any "variant" is a
  fabrication. (d) Backgrounds: crest sits on navy or uncluttered
  light-neutral; never directly on gold or on photography unless a scrim
  preserves the contrast precedents above. (e) Social card stays an
  `og:image`/`twitter:image` (`seo.ts:30`); directions must not crop it
  into page layout.
- **R6 — feedback and scrim.** Semantic states use the tokenized
  `feedback` hues and `overlay.scrim` only; feedback hues are a UI
  convention, never brand expression (`color.json:82-96`).

## Veto list (each checkable, each cited)

- **V1 — off-palette hues. VETO.** Any flat colour whose hue falls outside
  navy (≈210°), gold (≈40°), white/cream neutrals, the generic neutral
  ramp, or tokenized feedback hues violates the rails. Cites:
  `contracts/DESIGN-SYSTEM-CONTRACT.md:14-16` (RAW → CANDIDATE →
  ADAPTED → APPROVED lifecycle — a new hue is a token change requiring
  evidence, not a direction-level choice), `BRAND-DECISION.md:43-50`
  (pixel-sampled palette admits only navy/gold/white + minor
  green/cream), and the plan Global Constraint limiting exploration to
  the navy/gold family. Check: sample the direction's flat fills; any hue
  outside the permitted bands = violation. (Green `#064D49` counts as
  off-palette until promoted from PROPOSED with evidence.)
- **V2 — new font families. VETO.** Any `font-family` resolving outside
  the Lato/Montserrat stacks (plus their tokenized system fallbacks)
  violates the rails. Cites: plan Task 2 Interfaces + Global Constraints
  ("fonts stay"; research/spec tasks change no shipped bytes),
  `typography.json:4-13` (stacks locked even at PROPOSED status), and the
  perf budgets (HTML 72KB / CSS 96KB / JS 48KB, `scripts/check-perf.mjs`
  via plan Global Constraints — a new family is a new webfont payload).
  Check: list every family in the direction; anything beyond the two
  stacks = violation.
- **V3 — contrast-harming treatment over photography (including
  gradients/scrims). VETO.** Any text-over-image treatment measuring
  below AA fails, regardless of how attractive the gradient is. Cites:
  `contracts/ACCESSIBILITY-CONTRACT.md:12,29` (WCAG 2.2 AA; contrast at
  AA thresholds for text and meaningful UI), `BRAND-DECISION.md:58-71`
  (2.34:1 gold-on-white precedent + the gold-text rule, which applies
  with full force over busy photography). Check: recompute each
  text-over-photo pair; normal text < 4.5:1 = violation. The approved
  escape hatch is the tokenized `overlay.scrim` (`color.json:76-81`) or
  relocating the text off the photo.
- **V4 — AI-generated people imagery. VETO.** Any raster depicting a
  person must trace to client-supplied photography with a manifest entry;
  AI-synthesized people fail by construction. Cites:
  `contracts/ASSET-CONTRACT.md:10-11,62-65,82` (every asset needs a
  provenance class + manifest record before use; new assets need an
  evidence record naming the clearance basis),
  `contracts/RIGHTS-CONTRACT.md:38,53-59` (rights-sensitive production
  stays bounded; no inherited/third-party rights claims), the plan's
  Task 3/6 rule (AI abstract backgrounds only with a rights record before
  shipping), and the `MANIFEST.md:47` precedent (real photography used on
  client authorisation with caption restraint — the standard AI people
  cannot meet). Fabrication of team-member likenesses additionally
  breaches the truth boundary (never invent people). Check: every
  direction image with a person names its manifest row; no row = violation.

## Self-check record (Task 2 Step 3)

- R1 traces to `color.json:5-8` + `BRAND-DECISION.md:45,62,77-80`; R2 to
  `color.json:9-12` + `BRAND-DECISION.md:46,61,67-71,81-84`; R3 to
  `color.json:14-62`; R4 to `typography.json` full; R5 to
  `BRAND-DECISION.md:24-35`, `MANIFEST.md:9-13,21`, `Header.astro:45,116`,
  `Footer.astro:36`, `seo.ts:30`; R6 to `color.json:74-96`.
- V1–V4 each cite ≥1 contract or evidence record and each is decidable by
  inspection (hue sample / family list / contrast recompute / manifest
  row). No placeholders: every value above is quoted from its source.
- Known limitation: the approved design doc (PR #119) referenced by the
  plan § Spec is not present on this branch (`docs/superpowers/specs/`
  holds only the Task 1 journeys file); the "fonts stay / navy-gold
  family" constraint is therefore cited from the brief + stage-2 plan
  rather than the design doc's Locked decision 4 directly.
