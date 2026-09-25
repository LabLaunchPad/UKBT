# UKBT Roster Cards v1 — name/picture/role/country on one reusable card

> ID: ukbt-roster-cards-v1 — Status: ACTIVE — Owner: ukbt-agent
> Scope: 58-player truth (role+country per owner list 2026-09-23) + photo audit/rename + SquadCard
> persistent slots + one shared card component for `/players` AND Uppsala Tigers lists.
> Spec authority: owner roster list in chat 2026-09-23 (58 entries verbatim — names, roles,
> countries "as it is", supersedes EV-20260911-002 taxonomy ban). Screenshot = visual ref only.
> Hierarchy: OWNER LIST > CURRENT_REPO > FRESH_MEASUREMENTS > APPROVED_CONTRACTS > …

## Global Constraints

- pnpm only, `pnpm@10.33.0`, `node>=22.22.0`. Never npm/yarn. Bin via `pnpm exec <bin>`.
- `tokens:build` before `typecheck`/`build`. `tina/__generated__/client.ts` must exist. `@astrojs/cloudflare` stays.
- Truth gate: `@ukbt/truth` validates content modules — build fails on fact drift. New evidence
  record required (owner list 2026-09-23), superseding EV-20260911-002's Batter/Bowler ban.
- Owner values VERBATIM: `Kenner Lewis`, `Hamid Mehmood`, `Ellias Sunny`, `Abu Bakar`,
  `Sibet Ahmed`, `Roushan Singh`+Netherlands, `Srilanka`, `Netherands` — normalize NOTHING.
  UNKNOWN stays UNKNOWN; no invented photos (monogram fallback where missing).
- Contracts frozen: ROUTE, DESIGN-SYSTEM (tokens only, no new colors), VISUAL-REGRESSION
  (7 viewports), ACCESSIBILITY (WCAG 2.2 AA), MOTION, SEO.
- No new deps/routes. Ponytail ladder: shortest diff wins.

## Tasks

### Task 1 — Truth: role+country for all 58 + evidence record
Write `role` + `country` for every roster record in `apps/web/src/content/players-data.ts`
exactly per owner list (58 entries, #46 absent). Rename records: Kennar→Kenner Lewis,
Hamid Mahmood→Hamid Mehmood, Elias→Ellias Sunny, Abu Bakkar→Abu Bakar, Sibet Hussain→
Sibet Ahmed; countries per list incl. Roushan=Netherlands. Update Zod schema if `role`
needs declaring. New evidence `artifacts/evidence/EV-20260923-002.yaml` (owner-list source,
supersedes EV-20260911-002 ban + corrects EV-20260923-001 rename gaps). Files:
`players-data.ts`, truth schema if needed, evidence YAML. Verify: `test:unit`,
`check:content-trust`, build; report per-player role/country counts (expect All-rounder
~17/Bowler~/Batsman~/WK~5 — count, don't force).

### Task 2 — Photo audit + slug rename + fallback proof
Audit `apps/web/public/media/players/*.webp` against the 58 `photoSlug`s: rename stale
slugs via `git mv` (abu-bakkar→abu-bakar, elias-sunny→ellias-sunny,
hamid-mahmood→hamid-mehmood, kennar-lewis→kenner-lewis, sibet-hussain→sibet-ahmed);
list every record with NO matching file (expect Amahl Nathaniel, Anop Ravi,
Dhavalkumar Norotam, Elliot Green, Rajesh Sharma, Raminda Wijesooriya, Ruman Ahmed,
Tawfique Tushar — verify, don't assume) and prove monogram fallback renders for each
(built HTML check). Update MANIFEST if it lists renamed files. No new binaries.
Verify: build + grep photoSlug→file existence script output in report.

### Task 3 — SquadCard persistent slots (name/picture/role/country)
One canonical anatomy with FIXED slot order: media (photo or monogram, 1:1) →
name → role line → country line → (existing affiliation/meta/evidence after).
Horizontal alignment: role and country lines occupy persistent slots (min-height /
fixed position) so mixed content (badge vs line, long names) never shifts rows.
Player role renders as the line (Batsman/Bowler per T1); Wicket-keeper/All-rounder keep
badge+line rule. Touch `SquadCard.astro` ONLY. Verify: lint/typecheck/build + built
HTML slot counts (58 names/roles/countries).

### Task 4 — One shared card for Uppsala overlap
Audit `/franchises/uppsala-tigers` roster rendering: compute overlap (alsoUppsala-style
flags or name match) between the 58 and the Uppsala list; make overlap players render
the SAME card component (extract shared `PlayerCard.astro` from SquadCard ONLY if the
two markups differ — if Uppsala already uses SquadCard, wire the same props, no new
component). Touch Uppsala roster files + (maybe) new shared component. No route change.
Verify: lint/typecheck/build + both pages render overlap names identically.

### Task 5 — Verification (gates / visual / truth)
Full gate run (lint, tokens, typecheck, unit, build w/ Tina fallback+skip-cloud-checks,
deploy-mapping, release-path, content-trust, failure-injection, links, seo, ui, motion,
security, perf) + Playwright `pages.spec.ts` (CI=1) + targeted checks: 58× (name, role,
country, photo-or-monogram) in built `/players` HTML; overlap names identical on both
pages; no overflow 320/390; axe zero on `/players`. Fix NOTHING unless a gate fails.

## Definition of Done
58 cards each with name+picture-or-monogram+role+country in persistent slots; Uppsala
overlap shares the card; photo audit complete with renames; evidence record filed;
`deploy:verify` subset green; no contract drift; no invented facts.

### Task 6 — Role-in-picture consolidation (owner visual check 2026-09-23)
Role mentioned ONCE, in the picture area (badge overlay, per owner screenshot):
every player card shows its role as the media badge; the text-area role line is
removed (text = name → country → Uppsala affil only). Badge label = role display
form (`All-rounder`→`All-Rounder` per screenshot; Batsman/Bowler/Wicket-keeper
as-is), deduped against existing tag badges. Officials path untouched (role-led,
no country). Monogram cards: same badge overlay on the monogram block. Touch
`SquadCard.astro` ONLY.
