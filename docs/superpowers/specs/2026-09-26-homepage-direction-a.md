# Homepage direction A — rhythm-led: "The Alternating Ledger" (Stage-2 Task 3)

> Spec task — changes no shipped bytes (branch `feat/homepage-redesign`).
> Consumes `2026-09-26-homepage-journeys.md` (Task 1) and
> `2026-09-26-homepage-brand-rails.md` (Task 2). Concrete enough that Task 4
> can diff it into token deltas. Ranges only, no invented hex; approved
> motion token names only.

## Step 1: Reuse inventory (what each component does today)

- `apps/web/src/components/Hero.astro` — photographic hero (two cleared team photos crossfading under a navy scrim) with EDITORIAL headline/CTAs + social row.
- `apps/web/src/components/ClubIntro.astro` — editorial intro: team slideshow, statement lede, typographic stats; team-photos-only enforcement.
- `apps/web/src/components/WhyChooseUs.astro` — typographic reasons list (`variant="editorial"` on homepage) with display numerals + gold ticks.
- `apps/web/src/components/AcademySection.astro` — full-width navy (`tone="inverse"`) band: recruitment narrative + three truth-gated counters in gold-on-navy.
- `apps/web/src/components/TournamentGrid.astro` — display-only fixture markup: one main event + "Also Coming" list, no links today (known findability gap, journeys B-step-1).
- `apps/web/src/components/CaptainSpotlight.astro` — captain portrait (shared-element `transition:name`) + identity line + `/club-captain/` CTA, `density="editorial"`.
- `apps/web/src/components/FranchiseTeaser.astro` — Uppsala crest + one-sentence network story + `/franchises/` link, gold top rule.
- `apps/web/src/components/AboutCTA.astro` — follow block (primary external button + `Also on` list) + Contact Us pill + team photo.

TRUTH-SENSITIVE reachability: every stat, fixture, captain fact, and
franchise fact stays rendered from its gated `*-data.ts` module; nothing
below drops or duplicates a gated value.

## Direction A thesis

The hero stays calm; the redesign lives in the **section cadence**. A
strict alternating surface rhythm (light → cream → navy → light → cream →
light → navy) with a single gold-rule grammar turns the current
nine-section scroll into a legible ledger: each band is one idea, navy
bands are conversion anchors, gold rules are the only ornament.

## Hero treatment

Deliberately minimal — the hero already passes A1/A2. Two changes only:

1. A persistent **secondary CTA** (`"See tournaments"` → `/tournaments/`,
   outline-on-dark) beside the primary `"Join the Club"` gold button, so
   journey-B boards above the fold instead of only at the tournament band.
2. Headline set at the tokenized `display` clamp (Montserrat 700,
   per the MEASURED h-scale); eyebrow, tagline, and `SocialLinks`
   `tone="on-dark"` row unchanged; two-photo crossfade unchanged
   (`motion.duration.slideshow`, opacity only).

## Section rhythm changes (current order kept, surfaces re-cut)

| # | Band | Treatment |
|---|---|---|
| 1 | ClubIntro | Light (`Canvas`); slideshow full-bleed above the statement; stats stay typographic, navy text, gold tick accents (non-text gold on light per R2). |
| 2 | WhyChooseUs | Cream (`surface.alt`) — the first alt band; reasons list unchanged, numerals navy. |
| 3 | Academy | Navy (`inverse`) — unchanged position, the mid-page conversion anchor; counters gold-on-navy (7.21:1 precedent). |
| 4 | Tournaments | Light; **event names become links** to the existing `/tournaments/#upcoming` anchor (no new route — F6 clear); main event at `display` size with a gold underline accent (non-text). |
| 5 | Captain | Cream (`surface.alt`); portrait + identity + CTA unchanged, navy text throughout. |
| 6 | Franchise | Light; crest + sentence + link unchanged, gold top rule kept as the band boundary. |
| 7 | AboutCTA finale | **Navy (`inverse`) finale**: follow/contact/join entries re-set as white-on-navy with one gold primary button; team photo moves above the band (off-navy, full-bleed) so no text sits on photography. Adds a third journey-A entry (`"Join the Club"` text link → `/join/`, A5). |

The grammar: gold appears as rules, ticks, and underlines on light, and
as text + primary button only on navy. No band introduces a second accent
logic.

## Color-scale usage (rails ranges, no new values)

- Navy surfaces/states within **R1** (`primary` → `primaryActive` band;
  lighter navy tints only as non-text surfaces carrying navy text).
- Gold within **R2** (`accent` → `accentActive` band; gold-as-text on navy
  only; non-text accent on light).
- Light bands within **R3** (`Canvas`, white, neutral ramp,
  `surface.alt` cream — used, never claimed as decided brand surface).
- Type within **R4**; crest within **R5** (franchise crest unchanged;
  no page use of `social-card.jpg` — stays `og:image`); states/scrim
  within **R6** (`overlay.scrim` retained on hero).

Any intermediate navy/gold stop the build needs goes through
`adapted/`-staging with evidence — not eyeballed (rails R1/R2).

## Motion notes (approved tokens only)

- Entrances reuse `data-motion="reveal"`: `motion.duration.slow` +
  `motion.easing.emphasized`, translateY `motion.distance.md` → 0,
  opacity 0 → 1; transform/opacity only.
- Hero crossfade unchanged (`motion.duration.slideshow`, opacity only,
  static-slide-1 resolution under reduced motion).
- Interactive states: `motion.duration.fast` + `motion.easing.standard`
  (CTA hover lift, link underline wipe, event-name hover).
- Counters render static (no count-up JS — F4 budgets).
- Two-tier reduced motion intact per `contracts/MOTION-CONTRACT.md`:
  instant states, soft-fade entrances, no-JS static render.

## Abstract-background placements (AI, rights-gated, never people)

- One AI-generated abstract only: navy field with fine gold
  thread-lines (no people, no faces, no likenesses — V4 floor), placed as
  a thin top-edge bleed on the Academy band and full-bleed behind the
  navy finale, both *under* flat-navy overlays so text contrast never
  depends on the artwork.
- Ships only with an `ASSET-CONTRACT` manifest row + `RIGHTS-CONTRACT`
  clearance record naming the generator, prompt, and licence basis;
  missing record ⇒ flat navy fallback (the direction is complete without
  the artwork).

## Per-journey walkthrough (against Task 1 criteria)

- **A1** met: hero primary CTA unchanged (`/join/`, join-naming label).
- **A2** met: native anchors + `:focus-visible` rings kept; finale gold
  button re-measured gold-on-navy on its new surface.
- **A3** met: one `h1` (hero); band headings stay `h2`; recorded `h3`-led
  franchise/CTA blocks unchanged, not copied elsewhere.
- **A4** met: counters keep gated values, gold-on-navy, non-links.
- **A5** improved: hero + header entries kept, finale adds a third
  one-click `/join/` entry (canonical trailing-slash href).
- **A6** UNKNOWN (needs user observation; heuristic pass is A1–A5).
- **B1** met: tournament CTA unchanged; **B-step-1 gap repaired** by
  linking event names to `/tournaments/#upcoming` (existing anchor).
- **B2** met: native anchors; focus ring re-verified on the light
  tournament surface.
- **B3** met: no homepage news section added (UNKNOWN-content gate
  respected — journeys `index.astro:18-24` note); footer `Club News` →
  `/news/` path untouched.
- **B4/B5** met: `SocialLinks` primitive untouched (gated URLs,
  `rel="me noopener"`, accessible names, 24px hit areas); hero row +
  finale list carry the same instances.
- **B6** UNKNOWN (findability probe now includes the linked event names).
- **F1–F6** met: contrast re-measured per surface (gold-text-on-navy
  only); keyboard/focus/skip-link preserved; reduced-motion + budgets
  (no new JS runtime, no new font) intact; heading/landmark order kept;
  EDITORIAL-only copy changes; no new routes.

## Rails + journey check record (Task 3 Step 3)

- **V1** zero violations: flat fills within navy (≈210°), gold (≈40°),
  white/cream neutrals, neutral ramp, tokenized feedback hues only.
- **V2** zero violations: Lato/Montserrat stacks only, tokenized
  sizes/weights.
- **V3** zero violations: hero text on `overlay.scrim` (AA precedents
  hold); finale photo relocated off-navy so no text-over-photo pair is
  introduced; AI abstract never carries text contrast.
- **V4** zero violations: no AI people; the single AI abstract is
  people-free and rights-record-gated with a flat-navy fallback.
- Journeys: A1–A5, B1–B5, F1–F6 met (A6/B6 UNKNOWN by policy, not by gap).
