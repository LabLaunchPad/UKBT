# Join Form Phase 2 (Endpoint) — C0 Design Doc

> Status: PROPOSAL (C0 spec delta), not approved. No code in this doc.
> Locked owner decisions: endpoint first (uploads stay gated, no R2),
> delivery = email to club inbox, nothing persisted on Cloudflare.
> Grounding: `docs/superpowers/specs/2026-09-26-join-form-design.md`,
> FORM-CONTRACT.md AMENDMENT 01, EV-20260926-008, EV-20260926-010
> (wrangler 4.141 ships email routing/sending CLI scopes).

**Goal:** Turn the honest `unavailable` form into a working application
channel: validated submit → club inbox → success UI, with a complete
privacy notice — without changing the UI contract or persisting PII.

**Non-goals (C3, separate program):** R2 photo uploads, upload validation,
quota/abuse for files, any KV/D1/R2 writes, `noindex` flip before the
`ok` path is proven live.

## C1 — Endpoint

- New on-demand POST route (second after `tina-island`; proposed path
  `/api/apply/` — lowercase, no trailing slash per ROUTE-CONTRACT).
  Requires a ROUTE-CONTRACT amendment + EV record **before** code.
- `adapters/worker.ts`: POSTs the existing payload (name, DOB, nationality,
  residency, phone, email, stats link, video links, consent + ageAttestation
  ticks — picture stays gated) to the route; `setFormAdapter` wiring only.
- Server-side Zod validation mirroring the native rules; consent and
  age-attestation enforced server-side (a client tick is a claim, not a
  proof). Invalid → `error` with field-level message; never silent drop.
- Success UI on `ok` (closes the final-review note that v1 has no success
  state); `error`/`unavailable` states keep the real-channels notice.
- Rate limiting: Cloudflare Rate Limiting rule, dashboard, owner-side
  (free-plan limits apply — no capacity claim here).

## Sending path (decision needed at C0 approval)

- **Recommended: Cloudflare Email Sending** — stays in-stack (no new
  vendor, PII stays with us per the owner decision); wrangler 4.141
  carries the `email_routing`/`email_sending` scopes. Needs sending
  enabled + secrets provisioned — owner-side, like all secrets.
- Rejected: third-party email API as primary (against the own-endpoint
  spirit; acceptable only as a fallback if Cloudflare sending proves
  unavailable — to be evidenced, not assumed).
- Rejected: store-then-review (owner chose email; nothing persisted).

## C2 — Notice + flip

- Full `/privacy/` text: lawful basis, exactly what is collected (including
  DOB), emailed-not-stored, inbox retention, children's-data handling,
  contact channel. Real text only — no invented DPO, no copied template
  claims. Written at C2, reviewed under content-trust.
- `noindex` on `/join/` stays until the `ok` path is verified from a live
  browser with a real inbox receipt; the flip is its own explicit step.

## Verification (C1/C2 exit)

1. Live-browser submit → application arrives in the club inbox.
2. `ok`-path e2e green (mock + live-shape); invalid payloads rejected
   server-side with messages.
3. Code audit: no KV/R2 writes, no PII in logs (invocation-log redaction
   is dashboard-side per the `wrangler.jsonc` comment).
4. Privacy notice complete; consent ticks carried end-to-end (already are
   in the v1 payload).

## What approval of this C0 unlocks

C0 approval = permission to write the ROUTE amendment + C1 code.
No code lands before that approval; uploads (C3) are never in scope here.
