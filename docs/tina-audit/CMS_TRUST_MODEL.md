# CMS Trust Model — TinaCMS Cloud on UKBT (Phase 6)

Status: implemented wiring + verified mechanics; human-owned unknowns stay OPEN.

## Who can edit

TinaCloud dashboard collaborators (owner-managed; HD-001: enumerate seats in
TinaCloud Collaborators tab). Login at `/admin` via TinaCloud auth; pre-login
API calls are denied (observed: `identity.tinajs.io` 401 pre-session).

## Who can publish

Any collaborator seat: Free tier has NO editorial workflow (vendor-confirmed
in dashboard UI). Saves commit DIRECTLY to GitHub (vendor-documented) —
this answers HD-002's mechanism half: CMS commits do NOT traverse PRs or the
18 PR checks. Whether branch protection's direct-push rules admit the
TinaCloud App is UNKNOWN — verify on the first observed TinaCloud commit
(owner action post-merge).

## What protects CMS-originated changes

- `pnpm build` (CI + Workers Builds + local) enforces: loaders URL allowlist
  (REM-003, throws), truth gate T1–T8 (throws), `check-content-trust.mjs`
  (classification/structured/exempt — wired into `apps/web` build by this
  change, precisely so dashboard builds cannot skip it).
- NOT enforced on the CMS path: PR review (0 approvals required live),
  approval lifecycle (all content pending_review), placeholder output scan,
  human fact-check of prose (owner responsibility per content-trust policy).
- Post-merge smoke observes health + identity (REM-002), not content truth.

## Token scope / secrets

- Build: `TINA_TOKEN` (Content Readonly) + `PUBLIC_TINA_CLIENT_ID` (public).
  Required present, fail-closed when absent. Provisioned ONLY via environment
  (local `.env`, GitHub Actions secrets, Cloudflare env) — never committed
  (secret-scan covers history; `.env` gitignored).
- Browser: client ID + user session only; no token ships (verified: no token
  refs in admin bundle scope beyond login flow; token lives in build env).
- Search token: unused (`--skip-search-index`; no search UI).

## Branch permissions

`main`: 18 required checks, enforce_admins, 0 approvals. TinaCloud App
commits are direct pushes — if the App holds bypass allowance, CMS edits skip
all 18 checks (residual, HD-002). Detection: post-merge smoke + CI on main
(still runs) + audit of commit authorship (owner).

## What was NOT created

No unrestricted admin token (read-only minimum), no public write access
(login-walled), no branch-protection bypass, no weakened CSP/headers, no
gate deletions (5 scoped carve-outs for generated `admin/**`, each with
rationale + unchanged enforcement on site content).
