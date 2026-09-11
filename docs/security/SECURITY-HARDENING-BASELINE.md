# Security Hardening Baseline (P0/P1) — frozen 2026-09-11

Forensic starting point for the P0/P1 hardening task. No changes applied
at freeze time; every value below was observed, not assumed.

## Freeze point

- `main` HEAD: `1adec57` (Merge PR #48)
- Audit basis HEAD from forensic review: `1adec57` (same; 9a5de98 superseded)
- Worktree: clean except pre-existing owner-side state (untracked raw
  image drops + `opencode.json`; one pre-existing unstaged deletion
  `gallery-02.webp` — all untouched by this task)
- Date: 2026-09-11

## Open PRs at freeze

- #49 `fix/security-headers-tightening` — COOP/CORP + CSP tightening
  (authored, unmerged; must not be duplicated by this task)
- #24, #23, #22 — stale Claude-authored PRs (verify-cloudflare-autodeploy,
  ux-operating-system, anti-slop-ui-scaling-policy); predate this task

## Security findings carried in (forensic audit)

- F-01 public IP corpus (decision pending — NOT changed in this task)
- F-02 `main` unprotected (API 404) — Phase 1
- F-03 `/design-system/` → 200 live — Phase 2
- F-05 no SECURITY.md, Dependabot off — Phases 4–5
- F-06 `redact_query_string: false` + persistent logs — Phase 3
- F-07 vitest critical + vite/style-dictionary/sharp/js-yaml highs,
  all dev-only — Phase 5
- Secrets: none found (gitleaks CI + push protection + scans) — Phase 6

## Controls in place at freeze

- gitleaks full-history CI job; secret scanning + push protection ON
- SHA-pinned least-privilege Actions; no `pull_request_target`
- Security gate (`check:security`), `.gitignore` covers `.env`/`dist`
- Sentry DSN env-only; no client Sentry strings in HTML

## Production state at freeze

- Routes probed: `/` 200, `/about/` 200, `/players/` 200,
  `/club-captain/` 200, `/design-system/` 200, `/captain/` 404
  (the prompt's `/captain/` does not exist; canonical is `/club-captain/`)
- Headers: HSTS `max-age=31536000` (no subdomain flag),
  CSP pre-PR49 text (see live probe), `Server: cloudflare`,
  no COOP/CORP yet, no `X-Powered-By`
- CI on main: red, solely on performance budgets (css 57.7KB accepted
  deviation + 2 pre-existing image overweights) — latest runs
  34601510518, 34599301061, 34585345085 all `failure` on perf only

## Planned changes (this task only)

1. Branch protection (or OWNER ACTION REQUIRED)
2. Remove `/design-system/` from production build (404)
3. `redact_query_string: true` + `docs/security/query-log-redaction.md`
4. `SECURITY.md` (placeholder contact, no private data)
5. Dependency patches where safe + Dependabot config
6. Secret re-verification; dist leak audit; fingerprint notes
7. Headers/PR49 compatibility check (no duplication)
8. Preview + private-migration readiness docs
9. Full test battery; PWA gate verdict; final report — NO MERGE
