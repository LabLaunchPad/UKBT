# About Us — Page Contract

**Date:** 2026-08-26 · Method: identical to Stage 7G's Homepage — the real
Adelux `about.html` source and `assets/css/main.css` (read directly, not
guessed from memory) mapped section-by-section to actually-evidenced UKBT
content. Sections with no evidenced UKBT content are explicitly omitted,
not filled with placeholder/fabricated copy (same discipline as
`HOMEPAGE-VISUAL-QA.md`'s "what was not pixel-matched, and why").

## Section mapping

| Adelux section (real CSS) | UKBT content | Evidence | Status |
|---|---|---|---|
| `.section-banner-inner` (page-title banner, breadcrumb) | "About Us" title + Home / About Us breadcrumb | structural only | AVAILABLE — new `PageBanner.astro`, reusable on every inner page |
| `.welcome-about-wrapper` (`grid-template-columns: 0.42fr 0.52fr`, gap 100px) + `.card-about-misson` 4-card row | Eyebrow "Welcome to UK Bangla Tigers" + heading + tagline (long) as intro; 4 fact cards: International Cricket (Nordic Lights/Global T20), Community & Learning (tagline), Sister Franchise Network (Uppsala Tigers), Registered Organisation (CIC #16850390, founded 2020) | `knowledge/01-VERIFIED-FACTS.yaml` (`tagline`, `aggregate_stats`, `legal_entity`, `founded`, `sister_franchises`) | AVAILABLE — new `MissionWelcome.astro` |
| Partnership swiper (sponsor logos) | — | none | **EXCLUDED** — no sponsor identified (same exclusion as Homepage mapping) |
| `.about-wrapper` (flex row, gap 100px, align-items center) + `.about-highlight-box` 3-stat row | Fuller two-paragraph narrative (tagline + founding/legal-entity fact) + 3 stats: Founded 2020, 40+ Players, 7+ International Tournaments (the same real aggregate figures already used on the Homepage — not the Adelux placeholder numbers 2022/100/25) | `EV-20260826-028/-029` (tagline, founding year), `EV-20260826-026` (aggregate stats) | AVAILABLE — new `AboutStory.astro` (distinct component from Homepage's `ClubIntro.astro`, which stays untouched per its frozen Homepage Contract; same visual grammar, fuller copy) |
| `.section-chooseus` / `.card-chooseus` 2×2 "Why Choose Us" grid | — | none distinct from the mission-welcome cards above | **EXCLUDED** — would either repeat already-shown facts or require invented differentiators |
| `.team-content-wrapper` / `.card-team` (photo-overlay team grid) | Leadership: Mohammad Chowdhury (Founder & CEO, Club Captain), MD Shahidul Alam Ratan (**Acting** Chairman — client correction, `EV-20260826-026`), Sayem Rahman (Vice-Chairman) | `knowledge/01-VERIFIED-FACTS.yaml` `leadership:` block | AVAILABLE_NEEDS_ADAPTATION — new `LeadershipGrid.astro`, **text-only cards, no photos**: no leadership portrait has confirmed identity/rights (`image_affiliation_caution`, management-portrait.webp unconfirmed) |
| Founder spotlight (legacy S2: trophy photo + stat pair + bio) | Founder bio (2 condensed paragraphs), 450+ career matches, 30+ active players (distinct fields from club 40+/7+ aggregates) + trophy photo | `EV-20260910-001` (owner confirmation) + `EV-20260910-002` (legacy transcription) | **AVAILABLE 2026-09-10 (About Phase 1)** — new `FounderSpotlight.astro` mirroring `AboutStory` grammar; trophy photo staged as `public/media/founder-trophy.webp` |
| Leadership portrait exception (legacy S1 graphic + Sayem mini-card) | management-team.webp graphic (all 3 leaders identified, labels match gated strings) + Sayem Rahman portrait (owner-supplied, identity confirmed) | `EV-20260910-001` | **AUTHORISED EXCEPTION 2026-09-10** — renders in `LeadershipGrid` section only; cards stay text-only; photo-test pins exactly these two files |
| `.card-membership-cta` (2-col: content card + benefit/image card) | "Follow the Tigers" content card (social links, reused from `homepage.social`) + "Join the Club" CTA; no specific membership-perks bullet list (Adelux's list — priority booking, discounted coaching — has no UKBT equivalent evidence) | `EV-20260826-026` (social handles) | AVAILABLE — new `AboutCTA.astro`, perks list omitted, not invented |
| Testimonial section | — | none | **EXCLUDED** — no consented member testimonials exist |

## Identity, responsive, accessibility, SEO

Identical rules to `HOMEPAGE-CONTRACT.md`: brand tokens only (no ad-hoc
colours), crest as the only confirmed image asset (no `home-hero.webp`/
`join-us.webp`/`gallery-06.webp`/unconfirmed portraits), single collapse
breakpoint via the existing `Header`/`Footer`, WCAG AA contrast on all
text, `<title>`/meta description/OG tags via `BaseLayout`, real
screenshots at the frozen 6-viewport matrix before sign-off.

## Acceptance criteria

1. `pnpm typecheck && pnpm lint && pnpm build` all exit 0.
2. Playwright + axe: zero violations on `/about`.
3. Content-contamination grep (Adelux/Padel Club/Fox Creation/Nipo
   Khadem/Nipo) returns zero matches in the rendered page.
4. Excluded-asset grep (`home-hero.webp`/`join-us.webp`/`gallery-06.webp`)
   returns zero matches.
5. No leadership photo rendered without a confirmed-identity source —
   since 2026-09-10 exactly two owner-authorised files
   (`management-team.webp`, `sayem-rahman.jpg`), pinned by test.
6. Real screenshots captured at all 6 frozen viewports, inspected
   directly (not assumed from a passing test).
7. Mobile nav toggle functions on `/about` (shared `Header` component).
8. No horizontal overflow at any of the 6 viewports.
