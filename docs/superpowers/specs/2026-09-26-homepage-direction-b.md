# Homepage direction B — hero-led: "The Captain's Masthead" (Stage-2 Task 3)

> Spec task — changes no shipped bytes (branch `feat/homepage-redesign`).
> Consumes `2026-09-26-homepage-journeys.md` (Task 1) and
> `2026-09-26-homepage-brand-rails.md` (Task 2). Concrete enough that Task 4
> can diff it into token deltas. Ranges only, no invented hex; approved
> motion token names only.
>
> Genuinely different from direction A: where A re-cuts the section
> cadence and keeps the hero calm, B spends the redesign budget **above
> the fold** and compresses everything below into three merged bands.

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
franchise fact stays rendered from its gated `*-data.ts` module; merging
bands never drops a gated value — merged ≠ removed.

## Direction B thesis

One commanding masthead, then a short compressed page. The hero becomes
the club's full identity statement (kicker, display headline, tagline,
dual CTAs, socials — all above the fold); below it only three bands
remain: a merged light narrative, the navy Academy anchor, and a merged
navy network finale. Fewer bands, taller hero, faster route to both
journeys' first clicks.

## Hero treatment (the redesign's centre of gravity)

1. **Taller editorial composition**: identity kicker eyebrow (`UK Bangla
   Tigers Cricket Club` — already the Tina default), headline at the
   tokenized `display` clamp (Montserrat 700), tagline, then a **dual CTA
   row** — `"Join the Club"` gold primary → `/join/` plus `"All
   tournaments"` outline-on-dark secondary → `/tournaments/`. Both
   journeys board from the first viewport.
2. **Single static photograph**: the crossfade resolves to the cleared
   `team-huddle.webp` frame only (crossfade JS removed from this
   instance — a F4 budget gift, not a regression: reduced-motion users
   already see slide 1 statically). `overlay.scrim` retained; all hero
   text re-measured against the single frame (V3).
3. `SocialLinks` `tone="on-dark"` row retained beneath the CTAs; crest
   still absent from the hero (header anchoring rule holds).

## Section rhythm changes (order compressed, not just re-cut)

| # | Band | Treatment |
|---|---|---|
| 1 | Narrative (merged ClubIntro + WhyChooseUs) | Light (`Canvas`): slideshow full-bleed on top, statement lede, then the reasons list in the same flow — one continuous editorial column instead of two bands. |
| 2 | Academy anchor | Navy (`inverse`), unchanged: the page's single mid-anchor; counters gold-on-navy, recruitment narrative intact (journey-A confidence step). |
| 3 | Tournaments (given weight) | Light; main event at `display` size with gold underline accent; grid **kept display-only** (see B deferral below) with the section-header `"All tournaments"` CTA as the single path. |
| 4 | Network finale (merged Captain + Franchise + AboutCTA) | Navy (`inverse`): captain portrait (shared-element `transition:name` kept, exactly one instance) + identity + `/club-captain/` CTA, franchise crest + sentence + link, then follow/contact/join entries re-set white-on-navy with one gold primary button. Team photo sits above the band, off-navy. |

The grammar: light carries narrative, navy carries proof and action;
gold is text + primary button on navy, rules/ticks/underlines on light —
same rail logic as A, opposite page shape (4 bands, not 7).

## Color-scale usage (rails ranges, no new values)

- Navy surfaces/states within **R1** (`primary` → `primaryActive` band;
  lighter navy tints only as non-text surfaces carrying navy text).
- Gold within **R2** (`accent` → `accentActive` band; gold-as-text on navy
  only; non-text accent on light).
- Light bands within **R3** (`Canvas`, white, neutral ramp; cream
  `surface.alt` unused here — the merged narrative stays `Canvas` so the
  single navy mid-anchor hits harder).
- Type within **R4**; crest within **R5** (Uppsala crest in the finale at
  shipped scale; no page use of `social-card.jpg` — stays `og:image`);
  states/scrim within **R6**.

Any intermediate navy/gold stop the build needs goes through
`adapted/`-staging with evidence — not eyeballed (rails R1/R2).

## Motion notes (approved tokens only)

- Entrances reuse `data-motion="reveal"`: `motion.duration.slow` +
  `motion.easing.emphasized`, translateY `motion.distance.md` → 0,
  opacity 0 → 1; transform/opacity only. With fewer bands, reveals are
  staggered per band, never per item (calm over busy).
- Hero is static media: no crossfade, no scroll parallax (transform-only
  rule would allow it; restraint chosen — the masthead must read
  instantly). Hero entrance: single soft fade (`motion.duration.intro` +
  `motion.easing.enter`).
- Interactive states: `motion.duration.fast` + `motion.easing.standard`.
- Counters render static (no count-up JS — F4 budgets).
- Two-tier reduced motion intact per `contracts/MOTION-CONTRACT.md`:
  instant states, soft-fade entrances, no-JS static render.

## Abstract-background placements (AI, rights-gated, never people)

- One AI-generated abstract only: dark-navy grain with a single diagonal
  gold light-break (no people, no faces, no likenesses — V4 floor),
  placed **inside the hero only**, layered *under* `overlay.scrim` at low
  presence so the cleared team photograph stays the legible backdrop and
  text contrast never depends on the artwork.
- Ships only with an `ASSET-CONTRACT` manifest row + `RIGHTS-CONTRACT`
  clearance record naming the generator, prompt, and licence basis;
  missing record ⇒ photograph + scrim alone (the direction is complete
  without the artwork).

## Per-journey walkthrough (against Task 1 criteria)

- **A1** met and strengthened: hero primary CTA unchanged in label/link,
  now elevated to a taller masthead with the recruitment narrative
  (Academy anchor) one scroll below.
- **A2** met: native anchors + `:focus-visible` rings kept; dual-CTA row
  keeps ≥24px gaps so adjacent targets stay operable; rings re-measured
  on the single-frame hero.
- **A3** met: one `h1` (hero); merged bands keep sequential `h2`s; the
  merged narrative/finale must not introduce skipped levels at build
  (flagged as a Task 5 watch-item, not a waiver).
- **A4** met: counters keep gated values, gold-on-navy, non-links.
- **A5** improved: hero + header entries kept, navy finale adds a third
  one-click `/join/` entry (canonical trailing-slash href).
- **A6** UNKNOWN (needs user observation; heuristic pass is A1–A5).
- **B1** met: hero secondary CTA (`"All tournaments"` → `/tournaments/`)
  plus the section-header CTA give two labelled entries; main event set
  at display size for scanability.
- **B2** met: native anchors; focus rings re-verified on hero-dark and
  tournament-light surfaces.
- **B3** met: no homepage news section added (UNKNOWN-content gate
  respected); footer `Club News` → `/news/` path untouched.
- **Explicitly deferred — display-only tournament grid.** Unlike
  direction A, B does not link event names (keeps the B-step-1 gap as
  recorded). Cause: with the hero already carrying a tournaments CTA,
  per-event links add a third tournaments entry competing with the
  masthead's hierarchy; the known findability risk is probed at B6
  observation instead of solved structurally here. If B6 observation
  shows fans stalling, A's anchored-names repair is the documented
  fallback.
- **B4/B5** met: `SocialLinks` primitive untouched (gated URLs,
  `rel="me noopener"`, accessible names, 24px hit areas); hero row +
  finale list carry the same instances.
- **F1–F6** met: single-frame hero contrast re-measured (white-on-scrim
  ≥ 4.5:1, gold-text-on-navy only); keyboard/focus/skip-link preserved;
  reduced-motion + budgets intact (crossfade removal *reduces* JS);
  heading/landmark order kept (merge watch-item noted); EDITORIAL-only
  copy changes; no new routes.

## Rails + journey check record (Task 3 Step 3)

- **V1** zero violations: flat fills within navy (≈210°), gold (≈40°),
  white/cream neutrals, neutral ramp, tokenized feedback hues only.
- **V2** zero violations: Lato/Montserrat stacks only, tokenized
  sizes/weights.
- **V3** zero violations: hero text on `overlay.scrim` over a single
  known frame (re-measured, not assumed); finale photo relocated
  off-navy; AI abstract under the scrim, never carrying contrast.
- **V4** zero violations: no AI people; the single AI abstract is
  people-free and rights-record-gated with a photograph-only fallback.
- Journeys: A1–A5, B1–B4, B5, F1–F6 met; display-only grid explicitly
  deferred with cause above (A6/B6 UNKNOWN by policy, not by gap).
