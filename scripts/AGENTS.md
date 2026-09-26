# scripts — gate scripts + build finalization

Local rules for the release-gate scripts. Root governance (`AGENTS.md`, `CLAUDE.md`) still applies in full — this file only adds directory-local detail.

## Scope

Node gate scripts (`check-*`, `test-*-failure-injection`) that decide PASS/FAIL over built output or CI wiring, plus build-finalization scripts (`stamp-csp`, `build-sw`, `generate-sitemap`) that stamp shipped bytes. Pure Node, no workspace deps — CI gate jobs run them on checkout + the `dist` artifact, no install.

## Role

Proves the release is shippable. `deploy:verify` (18 steps, `<root>/package.json:42`) chains them fail-closed (`&&`): any non-zero exit stops the pipeline. Editing a gate script changes release semantics — treat it as a contract change, not a refactor.

## Source of Truth

- Pipeline order: `<root>/package.json:42` (`deploy:verify`); web build chain: `<root>/apps/web/package.json:9`
- Gate contracts: `<root>/contracts/CI-CONTRACT.md`, `<root>/contracts/DEPLOYMENT-CONTRACT.md`, `<root>/contracts/SEO-CONTRACT.md`, `<root>/contracts/MOTION-CONTRACT.md`
- Allowlist data: `dependency-allowlist.json` (same directory)
- CI wiring: `<root>/.github/workflows/ci.yml`

## Structure

29 scripts + `dependency-allowlist.json`:

| Script | Purpose | Invoked by (root command) | Gate? Release semantics? | Exit contract |
|---|---|---|---|---|
| `scaffold-self-test.mjs` | Governance scaffold self-test | `pnpm check:governance-scaffold` | Yes — step 1 of `deploy:verify` | exit 0/1 (no STATUS line) |
| `check-control-plane.mjs` | AI control-plane self-audit (contracts/knowledge/gates/CI wiring present) | `pnpm check:control-plane` | Yes — step 2 | `CONTROL_PLANE_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-dependency-allowlist.mjs` | Fails on unlisted or `permanently_blocked` deps | `pnpm check:deps` | Yes — step 3 | exit 0/1 (no STATUS line) |
| `check-deploy-mapping.mjs` | `<root>/wrangler.jsonc` `main`/`assets.directory` vs real `<root>/apps/web/dist/client/` + `<root>/apps/web/dist/server/entry.mjs` | `pnpm check:deploy-mapping` | Yes — step 9; editing it redefines what "deployable" means | `DEPLOY_MAPPING_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-release-path.mjs` | `ci.yml` smoke/deploy wiring intact (REM-002; asserts run-steps, not comments) | `pnpm check:release-path` | Yes — step 10 | `RELEASE_PATH_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-content-trust.mjs` | Tina field classification + JSON-LD truth-sourcing (REM-004) | `pnpm check:content-trust`; also runs inside `<root>/apps/web` build | Yes — step 11; also build-blocking | `CONTENT_TRUST_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-deploy-failure-injection.mjs` | Proves deploy-mapping fails on known-bad topologies (fixtures under OS temp dir, `UKBT_CHECK_ROOT`) | `pnpm test:failure-injection` (9 suites) | Yes — step 12; editing it weakens the proof without touching the gate | `FAILURE_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-perf-failure-injection.mjs` | Proves perf gate fails on budget violations | `pnpm test:failure-injection` | Yes — step 12 | `PERF_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-seo-failure-injection.mjs` | Proves SEO + link gates fail on known-bad topologies | `pnpm test:failure-injection` | Yes — step 12 | `SEO_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-smoke-failure-injection.mjs` | Proves smoke gate fails closed (local fixture server, never production) | `pnpm test:failure-injection` | Yes — step 12 | `SMOKE_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-content-trust-injection.mjs` | Proves content-trust fails on each bypass class | `pnpm test:failure-injection` | Yes — step 12 | `CONTENT_TRUST_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-security-failure-injection.mjs` | Proves security gate fails on known-bad header/leak topologies | `pnpm test:failure-injection` | Yes — step 12 | `SECURITY_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-release-path-failure-injection.mjs` | Proves release-path gate fails on known-bad `ci.yml` topologies | `pnpm test:failure-injection` | Yes — step 12 | `RELEASE_PATH_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-ui-failure-injection.mjs` | Proves UI gate fails on each defect class (h1/order/alt/stale/focus/faq-sink/raw-sink) | `pnpm test:failure-injection` | Yes — step 12 | `UI_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `test-motion-failure-injection.mjs` | Proves motion gate fails on each defect class (duration/easing/all/scroll/VT/router/fade) | `pnpm test:failure-injection` | Yes — step 12 | `MOTION_INJECTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-internal-links.mjs` | Internal-href integrity over built `dist` (regex, no parser dep by design) | `pnpm check:links` | Yes — step 13 | exit 0/1 (no STATUS line) |
| `check-seo.mjs` | SEO defects over built `dist` (+ JSON detail) | `pnpm check:seo` | Yes — step 14 | `SEO_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-ui.mjs` | Headings/focus/events/images (P0 FAIL, judgment WARN) | `pnpm check:ui` | Yes — step 15 | `UI_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-motion.mjs` | `MOTION-CONTRACT.md` static enforcement | `pnpm check:motion` | Yes — step 16 | `MOTION_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-security.mjs` | `_headers` policy + leakage (http subresources, sourcemaps, sensitive files); recomputes CSP hashes independently of `stamp-csp` | `pnpm check:security` | Yes — step 17 | `SECURITY_STATUS = PASS \| FAIL` + exit 0/1 |
| `check-perf.mjs` | Transfer-weight budgets over built `dist` (raw bytes = conservative) | `pnpm check:perf` | Yes — step 18 | `PERF_STATUS = PASS \| FAIL` + exit 0/1 |
| `smoke-deploy.mjs` | Post-deploy HTTP assertions vs live URL (`--expect-sha`, bounded wait) | `pnpm smoke:deploy`; CI `smoke-verify` | No — post-deploy, outside `deploy:verify` | `SMOKE_STATUS = PASS \| FAIL` + exit 0/1 (exit 2 on usage error) |
| `generate-sitemap.mjs` | Derives sitemap from built `dist` (sitemap==canonical by construction) | `pnpm sitemap`; also runs inside `<root>/apps/web` build | Build step (shapes shipped bytes), not a gate | exit non-zero on failure |
| `stamp-csp.mjs` | Stamps `__UKBT_CSP_SCRIPT_HASHES__` in built `_headers`; prunes VCS-hygiene files | `<root>/apps/web` build only (no root command) | Build finalization — editing it changes the shipped CSP | exit non-zero on failure |
| `build-sw.mjs` | Stamps `__UKBT_BUILD_ID__` in `dist/sw.js` (`dev` fallback when git absent) | `<root>/apps/web` build only (no root command) | Build finalization — editing it changes cache namespaces | exit non-zero on failure |
| `check-tina-field-parity.mjs` | Tina visual-editing field-mapping contract guard (no credentials/browser needed) | No root command, no CI job — run `node <root>/scripts/check-tina-field-parity.mjs` directly | No — advisory; editing it changes what parity means but gates nothing by itself | `TINA_FIELD_PARITY_STATUS = PASS \| FAIL` + exit 0/1 |
| `build-parity-matrices.mjs` | Generates `<root>/artifacts/ui/PAGE-PARITY-MATRIX.md` from measured data | Manual (parity harness, see `<root>/artifacts/ui/PARITY-HARNESS.md`) | No | log line on write |
| `compare-geometry.mjs` | Diffs measured vs reference geometry, per-page/viewport table | Manual (parity harness) | No | exit non-zero on P0 mismatch |
| `convert-images-to-webp.sh` | One-off JPEG→WebP migration (sharp / ImageMagick / cwebp; run from root) | Manual, bash (not node) | No | `set -e` |

`check-tina-field-parity.mjs` stays advisory (no CI job): it depends on TinaCloud
live-index state (Area B), so gating on it would fail PRs on cloud state, not repo truth.

## Dependencies

None — pure Node stdlib by design (see `check-internal-links.mjs` header: a parser dep would need an allowlist entry for a one-file check). `dependency-allowlist.json` is data consumed by `check-dependency-allowlist.mjs`, not code.

## Allowed

- New gate rules inside existing `check-*` scripts (rule + failure detail + injection case proving it fails)
- New `test-*-failure-injection.mjs` cases for new bypass classes (fixtures under OS temp dir via `UKBT_CHECK_ROOT`, never the repo)
- Tightening budgets/thresholds with measured justification

## Protected / Generated

- Nothing in this directory is generated — all scripts + the allowlist JSON are hand-maintained source.
- `dependency-allowlist.json` additions are policy decisions (see `<root>/contracts/REPOSITORY-CONTRACT.md` dependency-addition policy); adding an entry to silence the gate is gate weakening.

## Conventions

- Fail closed: `process.exit(failures.length === 0 ? 0 : 1)`; `*_STATUS = PASS | FAIL` last line for machine parsing.
- Crawl built output (`<root>/apps/web/dist/` or `dist/client/`), never source — a renamed route must fail the way a visitor hits it.
- Injection suites run the real gate against fixture trees via `UKBT_CHECK_ROOT` — never mutate the repo to test a gate.
- A case passes only when the verdict matches the expectation (PASS for good, FAIL + expected rule for bad).

## Validation

From repo root (`<root>/package.json:42`, 18 steps — exact order, `&&`-chained):

```
check:governance-scaffold → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → check:release-path → check:content-trust → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf
```

Single gate: `node <root>/scripts/<name>.mjs`. Single injection suite: `node <root>/scripts/test-<name>-failure-injection.mjs`.

## Failure Modes

- `tokens:build` skipped before typecheck/build — generated output stale; tokens-first always.
- Build without Tina env (`PUBLIC_TINA_CLIENT_ID` / `TINA_TOKEN`) fails closed at `tinacms build` — PR builds use CI fallbacks (see `.github/AGENTS.md`); never bake a fallback into a script.
- Gate edited to pass locally (loosened rule, added allowlist entry, deleted injection case) — release semantics changed silently; fix the site, not the gate.
- Testing a gate by editing the repo instead of fixtures — contaminates the tree under test; use `UKBT_CHECK_ROOT` temp trees.
- Stale `dist` (built before the last source change) — gates pass on old bytes; rebuild, then gate.

## Related

- Root `AGENTS.md` (pipeline, Tina env gotcha), `.github/AGENTS.md` (CI job wiring), `apps/web/AGENTS.md` (build chain, budgets)
- `<root>/contracts/CI-CONTRACT.md`, `<root>/contracts/DEPLOYMENT-CONTRACT.md`
- `<root>/artifacts/ui/PARITY-HARNESS.md` (manual parity scripts)

## Workflow

Edit script → run it directly → run its injection suite (if a gate) → `deploy:verify` for release. Gate change + matching injection proof ship together.
