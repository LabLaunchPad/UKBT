# Homepage token/component deltas for Direction A — "The Alternating Ledger" (Stage-2 Task 4)

> Proposal only — changes no shipped bytes. Winning direction (owner-picked
> 2026-09-26): `docs/superpowers/specs/2026-09-26-homepage-direction-a.md`.
> Rails: `2026-09-26-homepage-brand-rails.md`. Branch `feat/homepage-redesign`.

## Step 1: Baseline green proof

Run from repo root 2026-09-26: `pnpm --filter @ukbt/truth tokens:build` —
exit 0 (`style-dictionary build`, `tokens.css` regenerated), `git status
--short apps/web/src/styles/generated/` clean (no diff). Baseline green;
every delta below is diffed against this tree.

## Step 2+3: Delta table (diff + lifecycle route)

Token source: `packages/truth/src/tokens/approved/*.json` (Style Dictionary
source; output `apps/web/src/styles/generated/tokens.css`, never hand-edited).
Lifecycle routes: `approved-direct` = ships with existing approved tokens /
EDITORIAL paths, evidence cited; `adapted-stage` = needs a new evidence
record first — follow-up only, NOT executed here. No `adapted/` writes in
this task.

| # | Direction A element | Change (file:line, old → new) | Tokens / motion | Evidence / cause | Route |
|---|---|---|---|---|---|
| D1 | Hero secondary CTA (`"See tournaments"` → `/tournaments/`, outline-on-dark) | EDITORIAL label only: `apps/web/content/homepage/homepage.json:9` `"View Tournaments"` → `"See tournaments"`; href stays `homepage.json:10` `/tournaments/` (canonical trailing slash). Zero component change — `Hero.astro:98-100` already renders `secondaryCta` as `Button variant="secondary"` (transparent, `currentcolor` border = outline-on-dark, `Button.astro:151-158`), wired via `index.astro:100`. | No token change. No motion change. | Secondary-CTA prop + Tina plumbing already shipped (`loaders.ts:26`, `islands.ts:88-90`, `content-trust.ts:62`); direction's ask reduces to a label rename. | `approved-direct` (EDITORIAL via Tina in Task 5; no token lifecycle) |
| D2 | Display-clamp headline (Montserrat 700, MEASURED h-scale) | `Hero.astro:260-268` hardcoded `font-size: clamp(2.5rem, 1.5rem + 4vw, 4.5rem)` + mobile override `Hero.astro:321-323` `clamp(2rem, 1.2rem + 4vw, 3rem)` → `font-size: var(--ukbt-font-size-display)` (single declaration, overrides deleted). Family/weight already tokenized (`--ukbt-font-family-heading`, 700). | Consumes existing `font.size.display` `clamp(2.25rem, 1.4rem + 3.5vw, 3.75rem)` (`typography.json:45-49`, DERIVED). No new token. | Direction A §Hero treatment; rails R4 (type stays on tokenized sizes). Deletes two hardcoded clamps — pure token-adoption. | `approved-direct` (component-only, existing approved token) |
| D3 | 7-band surface re-cut | Six of seven bands already match (verified `index.astro:106-148`): ClubIntro default(Canvas) ✓, WhyChooseUs `surface="alt"` ✓, Academy `surface="inverse"` ✓, Tournaments default ✓, Captain `surface="alt"` ✓, Franchise default ✓. Sole change — band 7 finale: `index.astro:146` `<Section surface="alt" paddingBottom="normal">` → `<Section surface="inverse" …>` (AboutCTA block). | Consumes existing `color.surface.inverse` `#001E3A` + `inverseForeground` (`color.json:64-72`); `Section.astro:72-79` already implements the inverse surface incl. gold focus-ring subtree repaint. No new token. | Direction A §Section rhythm row 7; rails R1 (navy flat fill within `primaryActive → primary` band) + R3. | `approved-direct` (component-only, existing approved tokens) |
| D4 | Tournament event-name links → `/tournaments/#upcoming` | `TournamentGrid.astro:16-42`: main-event name (`:18`, currently `h2` span-text) and each `otherEvents` item-name (`:32`, currently `span`) become native anchors `href="/tournaments/#upcoming"`. Anchor verified to exist — `tournaments.astro:43` `<h2 id="upcoming">Upcoming</h2>` — so no new route, F6 clear. No TRUTH-SENSITIVE change (names still render from `homepage.upcomingTournaments`, `index.astro:46`). | Hover underline wipe: `motion.duration.fast` + `motion.easing.standard` (existing tokens, `motion.json:4-7,31-34`). Focus ring re-verified on the light surface (direction B2). No new token. | Direction A §Section rhythm row 4; repairs journeys B-step-1 findability gap per the direction's walkthrough. | `approved-direct` (component-only, existing approved tokens) |
| D5 | Navy finale re-set (AboutCTA white-on-navy + photo above band + third `/join/` entry) | `AboutCTA.astro:20-108` + `index.astro:146-148`: (a) text re-set — headline/body to `inverseForeground` / `neutral-300` (precedent: `SectionHeader.astro:110-112` inverse lede uses `neutral-300`), social-label likewise; (b) buttons `tone="on-light"` (`AboutCTA.astro:26-34`) → default on-dark gold primary; (c) team photo (`AboutCTA.astro:41-49`) hoisted above the band in `index.astro` (off-navy, full-bleed) so no text sits on photography (rails V3); (d) add `"Join the Club"` text link → `/join/` (canonical trailing slash) — third journey-A entry. Gold top rule (`AboutCTA.astro:57` 3px accent) is absorbed by the band boundary (grammar: rules live on light, text+button on navy). | Consumes existing `inverseForeground`, `neutral-300`, `brand.accent` (+hover), gold focus-ring via `Section.astro:75-79` subtree repaint. Contrast precedents hold: white-on-navy 16.84:1, gold-on-navy 7.21:1 (`BRAND-DECISION.md:58-65` via brand rails). No new token. | Direction A §Section rhythm row 7 + walkthrough A2/A5; rails R1/R2 (gold-as-text/button on navy only) + V3 (photo relocated off-navy). | `approved-direct` (component-only, existing approved tokens) |
| D6 | Gold-rule grammar (rules/ticks/underlines on light; text+button on navy) | Already shipped: `SectionHeader` accent rule 3px (`SectionHeader.astro:84-86`), AboutCTA top rule (`AboutCTA.astro:57`), hero continuity 1px accent line (`Hero.astro:306-315`). Sole addition — tournament main-event gold underline accent (non-text, so the gold-text rule holds): `TournamentGrid.astro:63-71` title gains `text-decoration`/`border-bottom` in `brand.accent`. No second accent logic introduced anywhere. | `color.brand.accent` non-text use on light per rails R2 / `BRAND-DECISION.md:67-71`. No new token. | Direction A §grammar; rails R2 + V1 (hue stays ≈40°). | `approved-direct` (component-only, existing approved token) |
| D7 | Abstract thread-lines (navy field, fine gold lines; Academy top-edge bleed + navy finale full-bleed, under flat-navy overlays) | NO code/token change in this task. Ships only with an `ASSET-CONTRACT` manifest row + `RIGHTS-CONTRACT` clearance record naming generator, prompt, licence basis; missing record ⇒ flat-navy fallback, and the direction states it is complete without the artwork. | None proposed. | Direction A §Abstract-background placements (rights-gated, people-free, V4 floor). Evidence does not exist yet. | `adapted-stage` — follow-up (rights record + manifest row first), NOT executed here |
| D8 | Intermediate navy/gold stops | DROPPED (YAGNI). Direction A says any intermediate stop goes through `adapted/`-staging with evidence, never eyeballed (rails R1/R2) — and no band needs one: every surface/state resolves to an already-tokenized stop (`primary/primaryHover/primaryActive`, `accent/accentHover/accentActive`, `surface.alt`, neutrals). | None. | Rails R1/R2; Global Constraint `adapted/`-staging rule. Reopen only with crest/measured evidence attached. | DROPPED with cause, not carried |

### Motion roll-up (no motion deltas)

Every motion usage the direction names resolves to an approved token with
the two-tier reduced-motion model intact (`contracts/MOTION-CONTRACT.md`):
entrances `motion.duration.slow` + `motion.easing.emphasized` +
`motion.distance.md` (`motion.json:12-14,43-46,53-57`); hero crossfade
`motion.duration.slideshow` opacity-only (`motion.json:24-28`);
interactive states `motion.duration.fast` + `motion.easing.standard`
(`motion.json:4-7,31-34`); counters static (no count-up JS, F4 budgets).
Zero new motion tokens; zero keyframe additions proposed.

### Token additions/edits: NONE

The full Direction A diff is component + EDITORIAL only — every value it
needs already exists in `approved/`. Task 5 therefore touches no
`packages/truth/src/tokens/approved/**` file and runs `tokens:build` as a
no-op verification, not a regeneration step.

## Task 5 handoff (single writer)

1. EDITORIAL: `homepage.json:9` label → `"See tournaments"` (Tina;
   `content-trust.ts:62` allowlist already covers the field).
2. `Hero.astro:260-268,321-323` → `var(--ukbt-font-size-display)`.
3. `index.astro:146` finale section → `surface="inverse"`; hoist AboutCTA
   photo above the band; add `/join/` text link (D5 a–d).
4. `TournamentGrid.astro:16-42` event-name anchors + gold underline (D4+D6).
5. Verify: `tokens:build` (no-op), `typecheck`, `test:unit`,
   `playwright test tests/visual/homepage.spec.ts tests/visual/pages.spec.ts`;
   contrast re-measure per surface (gold-text-on-navy only); keyboard/focus/
   heading-order preserved; no new routes, no new JS runtime, no new font.

## Follow-ups (not this task)

- F-A1 (`adapted-stage`, from D7): thread-lines artwork rights record +
  manifest row, then flat-navy-overlay implementation. Owner-commissioned
  only; flat navy is the complete default.
