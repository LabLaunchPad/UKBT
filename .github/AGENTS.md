# .github — CI as infrastructure

Local rules for workflows and CI-owned config. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds CI-local detail.

## Scope

`<root>/.github/workflows/ci.yml` (single workflow), plus `CODEOWNERS`, `dependabot.yml`, `pull_request_template.md`. The workflow implements `<root>/contracts/CI-CONTRACT.md` gates.

## Role

Workflows are infrastructure, not scripts: they decide what "mergeable" and "deployable" mean. Every job is merge-blocking unless explicitly marked otherwise — a job that cannot fail the build is decorative.

## Source of Truth

- Workflow: `workflows/ci.yml` (job keys + `needs` graph below verified against it)
- Gate scripts: `<root>/scripts/` (see `scripts/AGENTS.md`)
- Contracts: `<root>/contracts/CI-CONTRACT.md`, `<root>/contracts/DEPLOYMENT-CONTRACT.md`

## Structure

20 jobs in `ci.yml`. 18 required (merge-blocking); 2 conditional-skipping by design:

| Job | Runs | Notes |
|---|---|---|
| `install` | always | Frozen lockfile; `lint`/`typecheck`/`unit-tests`/`build` need it |
| `governance-scaffold` | always | `scaffold-self-test.mjs`, no install needed (pure node) |
| `dependency-allowlist` | always | No install needed |
| `control-plane` | always | Runs `check-control-plane` + `check-release-path` + `check-content-trust` |
| `failure-injection` | always | All 7 injection suites, no install needed |
| `lint` | always | Biome, needs install |
| `typecheck` | always | `tokens:build` + `tinacms build --skip-search-index` first, then `tsc` |
| `unit-tests` | always | `pnpm test:unit` (truth gate + content schema) |
| `build` | always | `pnpm run build`; uploads `<root>/apps/web/dist` artifact once (3-day retention) |
| `deploy-mapping` | always | Needs `build`; downloads `dist`, no rebuild |
| `link-integrity` | always | Needs `build`; same artifact pattern |
| `seo-gate` | always | Needs `build`; same artifact pattern |
| `ui-gate` | always | Needs `build`; same artifact pattern |
| `security-gate` | always | Needs `build`; same artifact pattern |
| `perf-gate` | always | Needs `build`; same artifact pattern |
| `motion-gate` | always | Needs `build`; same artifact pattern |
| `visual-and-accessibility` | always | Needs `build`; Playwright chromium + `tinacms build` for the admin shell; uploads report (7-day retention) |
| `secret-scan` | always | Gitleaks, full history (`fetch-depth: 0`) |
| `smoke-verify` | push-to-`main` only, non-blocking | Post-deploy live smoke vs production (`--expect-sha`, 600s wait); cannot gate a PR by design — removal/weakening breaks `check-release-path` |
| `workers-deploy` | opt-in only | Gated deploy path: `push` + `main` + `vars.WORKERS_DEPLOY_VIA_CI == 'true'`; needs `build` + all 8 dist-gate jobs + `visual-and-accessibility` (9); deploys the same downloaded `dist` the gates verified |

## Dependencies

Pinned runner (`ubuntu-24.04`), pinned Node (`NODE_VERSION: '22'`), SHA-pinned actions. `wrangler` is a lockfile-pinned devDependency — no unpinned runner install. Never `-latest` anything here (visual determinism rule).

## Allowed

- Adding a genuinely-blocking job for a newly real gate (with the failure-injection proof first)
- Tightening timeouts, adding `needs` edges that reflect real ordering

## Protected / Generated

- `smoke-verify` push-only + non-blocking status is load-bearing (REM-002): making it PR-blocking or "fixing" its skip is a release-path change, not a CI cleanup.
- `workers-deploy` opt-in flag (`WORKERS_DEPLOY_VIA_CI`) + 9-job `needs` list: while unset, production ships via dashboard-connected Workers Builds on every `main` merge, independent of CI — `check-release-path` asserts this wiring exists.
- Concurrency `cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}`: never cancel in-flight `main` runs (would kill a mid-wait smoke run and leave a deploy unsmoked).

## Conventions

- Branch behavior: `pull_request` + `push: [main]`. PR-only Tina fallbacks (`fork-pr-client-id-fallback` / `fork-pr-token-fallback`) apply to PRs only — push builds fail closed without real secrets, which is the signal that provisioning broke.
- `dist` is built ONCE in `build` and downloaded by the 8 dist-crawling jobs — never add a second full build to a gate job.
- Gate scripts are pure Node: checkout + `dist` artifact is all they need (no `pnpm install`).
- Tina env for `build`/`typecheck`/`visual-and-accessibility`: `PUBLIC_TINA_CLIENT_ID` (vars) + `TINA_TOKEN` (secrets), with PR-only fallbacks; search stays `--skip-search-index` (see `<root>/tina/config.ts` comment).

## Validation

No local file validates this directory except reading it: CI runs on push/PR. Before touching `ci.yml`, run `node <root>/scripts/check-release-path.mjs` (asserts smoke/deploy wiring) and the affected gate locally; `check-control-plane` also asserts CI-job presence.

## Failure Modes

- Weakening a gate or job condition to get green locally — changes what "release" means; fix the site, not the workflow.
- Removing `smoke-verify` / its `needs: [build, workers-deploy]` / `--expect-sha` binding — fails `check-release-path`; the release would verify against stale or no bytes.
- Adding `pnpm run build` to a gate job instead of downloading the artifact — slow, and gates would verify different bytes than what ships.
- Workflow-wide Tina fallback (applying to push builds) — would ship an admin shell with a dead token; fallbacks are PR-only by design.
- Editing `<root>/wrangler.jsonc` paths without running `check-deploy-mapping` — platform-layer 404s behind green gates (2026-09-15 incident).

## Related

- Root `AGENTS.md` (pipeline, Tina env gotcha), `scripts/AGENTS.md` (per-script contracts), `tina/AGENTS.md` (Tina build env)
- `<root>/contracts/CI-CONTRACT.md`, `<root>/contracts/DEPLOYMENT-CONTRACT.md`
- `<root>/artifacts/adaptive-learning/` (check the index before touching deploy wiring)

## Workflow

Read the job + its script header → edit → `check-release-path` + `check-control-plane` locally → open PR and let CI (all 18 required jobs) decide. Never claim CI green from a local run.
