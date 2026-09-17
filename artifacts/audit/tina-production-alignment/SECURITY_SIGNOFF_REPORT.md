# SECURITY SIGNOFF REPORT — Tina Production Alignment (Agent 4)
Date: 2026-09-18 (UTC) | Worktree: C:\UKBT\ukbt-tina-hardening
Prior evidence verified, not redone: artifacts/audit/tina-production-alignment/SECRET_SAFETY_AUDIT.md, TOKEN_MATRIX.md, external-evidence/tinacms/TINACMS_OFFICIAL_FINDINGS.md (§1-3), external-evidence/cloudflare/CLOUDFLARE_OFFICIAL_FINDINGS.md (§2, §6), external-evidence/github/GITHUB_ACTIONS_FINDINGS.md (§A-D), docs/tina-audit/CMS_TRUST_MODEL.md.

## Exposure table

| Location | Check | Result |
|---|---|---|
| `.env.example:12` | `PUBLIC_TINA_CLIENT_ID=fe5da197-…` hardcoded | PRESENT — acceptable: public identifier by design (TINACMS findings Claim 1A; docs/tina-integration.md:61,137) |
| `.env.example:13` | `TINA_TOKEN=` value | MISSING (empty placeholder + "Never commit" comment) — PASS |
| `.env` (local) | gitignored / absent | PRESENT in `.gitignore:10-11` (`.env`, `.env.*`, `!.env.example`); file absent locally — PASS |
| `tina/config.ts:8-9` | token refs via `process.env` only | PRESENT (`PUBLIC_TINA_CLIENT_ID \|\| TINA_CLIENT_ID`, `TINA_TOKEN`) — PASS, no hardcode |
| `tina/config.ts:25` | `TINA_SEARCH_TOKEN` ref | PRESENT as optional `indexerToken` — PASS (disabled by design, package.json:18) |
| `.github/workflows/ci.yml:30-31` | token placement | PRESENT as `vars.PUBLIC_TINA_CLIENT_ID` + `secrets.TINA_TOKEN` refs, no values — PASS |
| `wrangler.jsonc:35-50` | runtime vars/secrets for Tina | MISSING — PASS (only `SESSION` KV id `3435716ffa0e4616b01e2b0faf96ddd5`, a non-secret identifier, not a credential) |
| `apps/web/public/admin/` | generated bundle tracked? | UNKNOWN-content, PRESENT on disk, `git status` = `??` untracked **but `git check-ignore` returns NO match** — NOT gitignored (see §1 WARNING) |
| `docs/` | hardcoded token values / full IDs | MISSING token values — PASS; truncated `fe5da197-…` only (docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md:11, docs/tina-audit/00-current-state.md:43) |
| `scripts/` | token logging (`TINA_TOKEN`, echo) | MISSING — PASS (grep `TINA_TOKEN\|TINA_CLIENT\|SESSION` in scripts/ = no hits) |
| `ci.yml` (all 348 lines) | `echo`/secret-print steps | MISSING — PASS (only `run:` build/check commands; secrets consumed via `env:`) |
| `scripts/check-security.mjs:66-72` | dist leakage gate (sourcemap/`.env`) | PRESENT — PASS |
| `ci.yml:281-290` | gitleaks secret-scan job | PRESENT — PASS |
| `apps/web/public/_headers:9` | `frame-ancestors` Tina allowlist | PRESENT (`'self' https://app.tina.io https://*.tinajs.io`) — PASS |
| `apps/web/public/_headers:9` | `connect-src` Tina origins | PRESENT (`https://app.tina.io https://*.tinajs.io` + sentry) — PASS |
| `apps/web/public/_headers:4` | `X-Frame-Options: DENY` coexistence | PRESENT alongside CSP — PASS with note (see §5) |
| `apps/web/src/pages/tina-island/[name].ts:1-5` | KV/PII in island route | MISSING — PASS (5-line `experimental_createIslandRoute`, no `Astro.session`, no PII) |
| Cloudflare dashboard Builds vars | `TINA_TOKEN` marked Secret | UNKNOWN — user-reported PRESENT, not independently verified (TOKEN_MATRIX.md:39) |
| GitHub Actions `secrets.TINA_TOKEN` scope | read-only content token | UNKNOWN live value — type VERIFIED read-only per TINACMS findings Claim 1A; dashboard scope unverified |
| CI log redaction proof | token never echoed in Actions logs | UNKNOWN — requires viewing Actions logs (SECRET_SAFETY_AUDIT.md:17, retained) |

## Per-area verdicts

1. **Secrets exposure — WARNING (not BLOCKER).** All secret values absent from repo (PASS). **Correction to prior audit:** SECRET_SAFETY_AUDIT.md:16 claimed `apps/web/public/admin/` "gitignored" — VERIFIED FALSE this task: directory exists, is `??` untracked, and `git check-ignore` matches only `.env` and `tina/__generated__/`, not `admin/`. Generated bundle (which bakes `TINA_TOKEN` at build per TINACMS findings Claim 3A) is therefore one `git add -A` away from accidental commit. Fix: add `apps/web/public/admin/` (or `**/public/admin/`) to `.gitignore`.
2. **Token placement — PASS.** `TINA_TOKEN`/`PUBLIC_TINA_CLIENT_ID` appear ONLY as build-time inputs (GitHub Actions `vars`/`secrets`, Cloudflare Builds build vars) and NEVER as `wrangler.jsonc` runtime `vars`/bindings — matches Tina Cloudflare-Workers doc "build-time only… nothing to add again as a runtime variable" (TOKEN_MATRIX.md:35-36; CLOUDFLARE findings §2.4).
3. **Build-time leakage — PASS with UNKNOWN residual.** No echo/set-x/token-logging in `ci.yml` or `scripts/`; `check-security.mjs` + gitleaks gate cover dist/history. Residual UNKNOWNs: live CI-log redaction and Cloudflare Secret-vs-Variable marking (dashboard human step).
4. **Admin authentication — PASS with condition.** TinaCloud model: `token` = read-only content token (TINACMS findings Claim 1A), search token = separate write token (unused, Claim 1B); `/admin` login-walled, pre-login API 401, no public write (CMS_TRUST_MODEL.md:5-18,31-39). Condition: TinaCloud App direct-push bypass vs 18 required checks stays UNKNOWN until first observed TinaCloud commit (CMS_TRUST_MODEL.md:16-18,43-46).
5. **Headers — PASS with WARNING (docs).** `_headers:9` correctly widens `frame-ancestors` to Tina origins while keeping `X-Frame-Options: DENY` (`_headers:4`) as legacy fallback — precedence claim is MEDIUM per CLOUDFLARE findings §6.3 (Cloudflare docs show coexistence, spec ranks CSP first). `check-security.mjs:50-52` enforces `frame-ancestors` presence. WARNING: `docs/tina-integration.md:139` still prints stale `frame-ancestors 'none' https://app.tina.io …` (self-contradictory) — fix to match `_headers:9`.
6. **KV permissions — PASS.** `SESSION` binding (`wrangler.jsonc:45-50`) is `@astrojs/cloudflare` adapter artifact; no `Astro.session` read/write, no PII in KV path (island route is 5 lines; CLOUDFLARE findings §3.3). KV id in repo is an identifier, not a secret.

## Signoff statement

**CONDITIONAL PASS — no BLOCKERs.** Security posture is sound for production subject to three conditions: (1) add `apps/web/public/admin/` to `.gitignore` (accidental-commit risk, §1); (2) correct `docs/tina-integration.md:139` CSP line to the `_headers:9` value (§5); (3) human verifies Cloudflare Builds `TINA_TOKEN` is type Secret (not Variable) and confirms branch-protection behavior on the first TinaCloud save commit (§3–§4 UNKNOWNs). CI-log redaction spot-check recommended at next `tinacms build` run.
