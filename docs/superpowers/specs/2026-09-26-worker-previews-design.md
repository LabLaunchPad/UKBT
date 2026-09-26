# Worker Previews — Design Doc

> Status: PROPOSAL, not approved. No code, no `wrangler.jsonc` edit, no CI
> change in this doc. Implementation needs owner approval + two contract
> amendments (DEPLOYMENT, CI) first. Grounding: EV-20260926-010.

**Goal:** Give every PR an isolated, human-openable preview URL so reviewers
see the change in a real browser — addressing the *review* side of the smoke
403 vantage problem (docs/12 item 11) without touching the smoke gate.

**Non-goals:** replacing `smoke-verify` (the gate stays enforced and
fail-closed); changing production routing; committing any preview URL as a
baseline.

## Why this shape

- Cloudflare announced Worker Previews 2026-09-22 (per-PR isolated
  environments, stable URL per PR + immutable URL per deployment, own
  logs/metrics, Access-protectable). CLI floor is wrangler >= 4.135.0 —
  satisfied: main carries 4.141.0 (PR #126).
- Our deploy path is already Workers Builds with `buildId`-stamped
  `/smoke.json` tracking HEAD — previews ride the same path, so mapping
  risk is low (to be proved by `check-deploy-mapping` in CI, not by
  assertion here).
- The GH-runner 403 is egress-vantage-specific; a preview URL opened from a
  reviewer's real browser is unaffected by it. Previews complement the
  dashboard fix in item 11, they do not substitute for it.

## Proposed implementation (on approval)

1. `wrangler.jsonc`: add a `previews` block (vars/bindings inheritance;
   no KV/D1/R2 involved, so no separate-resource binding needed). Requires
   a DEPLOYMENT-CONTRACT amendment + EV record first.
2. Workers Builds: enable automatic Previews so PRs get URL comments.
   Requires a CI-CONTRACT amendment + EV record first.
3. Decide Access protection for preview URLs (recommended: on — previews
   of unmerged content shouldn't be public; owner call).
4. Verify: open the PR preview URL from an external browser, confirm
   `/smoke.json` `buildId` matches the PR SHA; record one passing run.

## Open questions for the owner

1. Approve the two contract amendments (required before any edit)?
2. Access-protect preview URLs (recommended) or public `workers.dev`?
3. Previews build minutes/plan limits — confirm acceptable (UNKNOWN to
   engineering; no pricing claim made here).

## Exit criteria

Preview URL live on a test PR, opened externally, `buildId` matched, both
amendments merged, item 11 updated with the outcome. The smoke gate itself
is closed only by the dashboard fix, never by this workstream.
