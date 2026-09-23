# P0 Remediation Baseline — 2026-09-22

Phase A baseline (read-only). No application-code edits. No CI re-runs.

## Git

- HEAD: `e544985322376dead374106f3b9c5f1b58e43614`
- Branch: `main`
- Status (`git status --short`, untracked only, no modified tracked files):
  ```
  ?? .agents/
  ?? artifacts/tina-20-iteration-plan.md
  ?? artifacts/tina-free-tier-audit-2026-09-19.md
  ?? artifacts/ukbt-20-iteration-deep-plan.md
  ?? docs/superpowers/
  ?? skills-lock.json
  ```
- Log: `e544985322376dead374106f3b9c5f1b58e43614 2026-09-20 01:01:28 +0600 Merge pull request #95 from LabLaunchPad/fix/tina-contract-alignment`

## CI

- Run id (main, latest): `35463035934` (`2026-09-19T19:01:31Z`, overall `failure`)
- Workers-deploy conclusion: `skipped` (`Deploy to Cloudflare Workers (gated)`)
- Smoke conclusion: `failure` (`Post-deploy smoke (live production)`)
- CI smoke log: live BUILD_ID `e544985` matched expected `e544985`; favicon `200`; CSP+nosniff present; then `SMOKE_STATUS = FAIL` with observed `403` on `GET /`, `GET /about`, 404 probe, `POST /tina-island/hero`, `GET /admin/` (observed responses, no cause labelled)
- `PUBLIC_TINA_ADMIN_ORIGIN` = `https://ukbanglatigers.co.uk` (updated `2026-09-19T19:26:48Z`)

## Live (fresh, 2026-09-22T17:27:31–32Z UTC)

- Live BUILD_ID: `e544985` (from `GET /sw.js`: `const BUILD_ID = 'e544985';`; prefix-matches HEAD; deployment identity only)
- `GET /` → `200` (`CF-Cache-Status: HIT` observed; cache HIT ≠ stale)
- `GET /about` → `307` (`Location: /about/`); `GET /about/` → `200`
- `GET /definitely-nonexistent-route-ukbt-test` → `404`
- `POST /tina-island/hero` → `403` (single probe; observed response only, no cause labelled)
- `GET /admin/` → `200` (contains `<div id="root"></div>`)
- `GET /favicon.svg` → `200`

## Delta vs CI-time smoke

CI-time (2026-09-19) smoke observed `403` on all five rules; fresh live (2026-09-22) observes `200` on `/`, `/about/`, `/admin/`, `404` on the 404 probe, and `403` only on `POST /tina-island/hero`. No cause inference made.

Full evidence: `.superpowers/sdd/2026-09-22-p0-evidence/task-0-report.md`
