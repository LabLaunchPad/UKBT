# Join Form — Design Doc

> Status: PROPOSAL approved by owner 2026-09-26 (destination: UI now, wire later,
> own Worker endpoint in Phase 2). Architectural path — this spec precedes any code.
> Depends on nothing unmerged; branch from `origin/main` @`131f8d5`.

**Goal:** Build a polished, accessible player-application form on `/join/` that
is real and reviewable today, never lies about delivery, and can be wired to a
real endpoint later without touching the UI.

**Non-goals (Phase 2, deliberately out):** live endpoint, R2 photo storage,
upload validation, spam/rate limiting, live privacy notice, `noindex` change.

## Why this shape

`/join/` and `/contact/` both deliberately ship no form — their comments state
that a form with no working backend "would silently drop real inquiries — worse
than not having one." `FORM-CONTRACT.md` (FROZEN) mandates that form logic sit
behind `submitForm(payload): Promise<Result>` and forbids inline page logic. The
owner approved a UI-first split, so the form is fully built but backed by a mock
adapter that reports `unavailable`; no personal data leaves the browser in v1.

## Owner decisions (2026-09-26)

1. **Destination:** UI now, wire later; eventual destination is our own Cloudflare
   Worker endpoint (not a third-party service — applicant PII stays with us).
2. **Date of birth:** keep exact DOB (not an age band).
3. **Picture:** design the field, gate it off in v1.

## Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| Full Name | `text` | yes | `autocomplete="name"` |
| Date of Birth | `date` | yes | kept per decision 2 |
| Nationality | `text` | yes | |
| Country of Residency | `text` | yes | |
| Phone Number | `tel` | yes | hint: include country code |
| Email | `email` | yes | |
| Main Statistics Link | `url` | no | e.g. CricHeroes |
| Video Links | `textarea` | no | one URL per line; avoids repeater JS |
| Upload Picture | file input | — | **rendered disabled + explained** (decision 3) |
| Submit | `submit` | — | |

Validation: native HTML only (`required`, `type=email|tel|url|date`). No custom
validator in v1 — the browser does it, which is also the accessible path.

## Architecture (FORM-CONTRACT-compliant)

```
JoinForm.astro  ──calls──▶  submitForm(payload): Promise<FormResult>
                                    │
                                    ▼
                          adapters/mock.ts   (v1, default)
                          adapters/worker.ts (Phase 2)
```

- `apps/web/src/lib/forms/submit-form.ts` — the mandated interface + `FormResult`
  (`{ status: 'ok' } | { status: 'unavailable' } | { status: 'error'; message }`).
- `apps/web/src/lib/forms/adapters/mock.ts` — returns `unavailable`; never `ok`.
- `apps/web/src/lib/forms/adapters/worker.ts` — Phase 2 stub (own endpoint).
- Adapter selected by one registry, mirroring the Tina loader pattern.
- Unit test with the mock adapter — required by `FORM-CONTRACT.md`'s validation
  method (proves the UI needs no live environment).

## The honesty rule (binding)

A submit in v1 must **never** show a success/confirmation state. `unavailable`
renders an honest notice: online applications are not open yet, plus the club's
real working channels (WhatsApp / Facebook / email from `contact-data`). No
"thanks, we'll be in touch" while data is discarded — that is the exact
anti-pattern the repo already refused to ship.

## Accessibility (contract-bound)

- Real `<label>` per control, `for`/`id` paired; required state conveyed in text,
  not by colour alone.
- `aria-describedby` for format hints (phone country code, video-link format).
- On failed submit: an error summary region that receives focus and lists each
  failing field (WCAG error-identification pattern).
- Disabled upload field is programmatically disabled **and** carries a visible
  explanation — never a control that looks live but does nothing.
- Contrast, focus rings, reduced-motion behaviour per `ACCESSIBILITY-CONTRACT.md`
  + `MOTION-CONTRACT.md`; tokens-only CSS values.
- Heading order: one `h1`, sequential `h2`s, no skipped levels.

## Visual

Design-system reuse only — `PageBanner`, `Section`, `SectionHeader`, `Button`,
existing approved tokens. No new tokens unless the form provably needs one
(tokens-first: source JSON → `tokens:build`, never hand-edit generated CSS).
Finish-gate criterion: unmistakably UKBT, not a generic contact form.

## Copy + data protection

Copy is EDITORIAL-classified (proposal, owner-approved wording), not a
TRUTH-SENSITIVE org claim. Because exact DOB is retained and the club develops
young players, the form carries:

- an age/guardian attestation line, and
- a privacy-consent line pointing at a privacy-notice stub.

This is preparation, not a live obligation: with the mock adapter no personal
data is transmitted, so the binding obligation arrives with the Phase 2 endpoint
(UK GDPR children's-data handling, lawful basis, retention, parent/guardian
attribution). Stub only in v1 — no fake legal text.

## Verification (all three sign-offs required)

- Unit: `submitForm` with mock adapter (the contract's stated method).
- Playwright: form renders; required fields block submit; unavailable-state notice
  appears and no success state is shown; keyboard-only completion; axe zero
  violations; upload control disabled + explained.
- `pnpm deploy:verify` full chain fresh green; then Design-division sign-offs:
  visual, copy, usability (player journey), plus the honesty rule as an explicit
  gate criterion.

## Risks

- A v1 submit loses the applicant's typed data unless we warn first — mitigated by
  a visible pre-submit notice that online applications are not yet open, so the
  honesty rule holds even before the click.
- `noindex` currently on `/join/` stays; flipping it is a content/SEO decision
  for Phase 2, not a silent side effect here.
