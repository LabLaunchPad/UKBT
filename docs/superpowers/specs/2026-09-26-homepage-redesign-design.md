# Homepage Redesign + Polish — Design Doc (Approach A: token-first iterative)

> Status: PROPOSAL — owner review requested before any implementation planning.
> Architectural path (brainstorming skill): classification → 6 alignment answers →
> approach approval → this doc → owner spec review → writing-plans.

**Goal:** Take the homepage from brief to polished, accessible UI inside one
unified design system, with visual, copy, and usability sign-offs gating each
loop. Redesign where recommended, polish everywhere else.

**Baseline (grounded 2026-09-26):** `apps/web/src/pages/index.astro` renders
Banner → About → Why Choose Us → Academy → Tournament → Captain → Community →
CTA → Footer (Testimonial/News deliberately omitted as UNKNOWN shells).
Content flows via `homepage-data.ts` + truth gate; Tina owns EDITORIAL fields
only. Full suite last green: 334 passed / 9 skipped.

## Locked owner decisions

1. Scope: redesign where recommended + polish (not audit-only).
2. Single source: `packages/truth/src/tokens/approved/` updated accordingly —
   still the only source, via adapted/ + evidence + Style Dictionary rebuild.
3. Imagery: mixed — club photos primary, AI abstract backgrounds only.
4. Visual: explore within logo brand colors (navy `#001E3A`, gold `#CCA44F`
   family), iterate on existing, propose freely — owner picks direction.
   Fonts stay (Lato/Montserrat). Color enhancement may use scoped web research
   (W3C/WCAG + DTCG official sources first) under explicit owner authorization.
5. Copy: designers propose; every org claim evidence-mapped or omitted.
6. Usability: both journeys — prospective player (hero → academy → join) and
   fan (tournaments → news → socials).
7. Approach: A (iterative redesign) over B (library-first) and C (audit-only).

## Team orchestration (ordered, single writer)

1. UX Researcher — frames both journeys + pass criteria (heuristic/contract
   review only; real user data stays UNKNOWN unless owner supplies it).
2. Brand Guardian — locks brand rails (logo-color ranges, crest usage, what
   counts as off-brand veto).
3. UI Designer — produces 2 in-brand directions as static specs, no code.
4. Owner picks a direction (this is the visual sign-off input).
5. UX Architect — translates winner into token/component deltas.
6. One implementer builds (single writer on app code, always).
7. Finish-Gate + Persona Walkthrough (both journeys) + accessibility review.
8. Whimsy / Storyteller / Image-Prompt / Inclusive-Visuals consulted once for
   hero + abstract backgrounds — not a standing 10-agent loop (per
   `knowledge/09`: roles are accountability vocabulary, not a spawn list).

## Single-source update protocol

- `approved/` changes only with evidence records + adapted/ staging; values
  never invented (color.json brand stays crest-anchored; enhancements extend
  scales/ranges, never replace verified anchors without re-evidence).
- Scoped color research is documented as an owner-authorized exception to the
  usual research scope, official sources first, ≥2 sources for versioned
  claims, repo facts outrank community claims.
- No new runtime dependencies; `scripts/` stays pure Node.

## Copy + imagery rules

- Copy proposal ships with an evidence map: gate-passed, EDITORIAL (Tina),
  or omitted-as-UNKNOWN. TRUTH-SENSITIVE stays code-owned.
- Club photography primary (existing assets, rights-held). AI abstracts only:
  one rights record each, owner approval before shipping, never people/faces,
  never presented as club photography (Inclusive-Visuals guardrail).

## Verification + exit criteria (all three required)

- Visual: owner picks direction, Finish-Gate passes (no generic-dashboard
  verdict), Playwright visual specs green.
- Copy: evidence map complete, no unverified org claim ships.
- Usability: Persona Walkthrough passes both journeys against the framed
  criteria; accessibility (contrast, focus, reduced-motion, budgets:
  HTML 72KB / CSS 96KB / JS 48KB) green via `deploy:verify`.
- Anti-spin: after 3 revise-and-reverify loops, scope escalates to owner.

## Non-goals

New routes (ROUTE-CONTRACT amendment territory), testimonial/news shells
until real content exists, font changes, AI people imagery, vendoring
external design tools into the repo.

## Staged follow-ups (NOT approved by this doc)

- Stage 2 (after owner approves this spec): writing-plans implementation plan,
  then subagent-driven execution starting with journey framing + brand rails.
- The winning-direction build may surface token amendments — each as a dated
  contract block with re-approval, never drive-by edits.
