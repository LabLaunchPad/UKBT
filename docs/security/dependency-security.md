# Dependency security — P0/P1 hardening record (2026-09-11)

## `pnpm audit` at freeze

1 critical (vitest file-read/RCE when UI server exposed), 4 high
(vite fs-deny bypass, style-dictionary prototype pollution, sharp
libheif RCE chain, js-yaml merge-key DoS), ~7 moderates (esbuild,
vite traversal, launch-editor, opentelemetry, qs ×2, vitest-mocker ×2).

## Classification: all DEV-ONLY / BUILD-TIME, zero production runtime

- The shipped artifact is static HTML/CSS/JS with **zero runtime
  `dependencies`** in any workspace package (only devDependencies).
- Nothing audited executes in production: vite/vitest serve local dev
  and CI only; style-dictionary runs once at build over our own
  committed token files (attacker-controlled input impossible);
  sharp/js-yaml/qs/otel run inside build tooling over trusted inputs.
- Production severity of every item: NONE. Hygiene severity: real —
  hence patched, not ignored.

## Patches applied (this task)

Direct ranges in `packages/truth/package.json`:
- `vitest ^2.1.8 → ^4.1.11` (installed 4.1.11; fixes critical
  GHSA-5xrq-8626-4rwp AND the mocker moderate GHSA-82fw-gwwq-j7x9)

Transitive floors via root `pnpm.overrides` (parents pin vulnerable
ranges; each floor is the advisory's patched version, nothing newer —
revisit/remove once parents widen their own ranges):
- `sharp ^0.35.4`, `qs ^6.16.0` (both installed patched, audit-clean).
  No vite override: astro's own range resolves the site builder to
  vite 8.3.0, which builds green and is audit-clean.

## Attempted but REVERTED (evidence-led, not assumed)

- `style-dictionary ^5.4.4`: v5's `size/rem` transform throws on the
  repo's legitimate `clamp(...)` token values
  (`geometry.hero.minHeight` + 1 more), silently dropping tokens from
  the generated CSS — a behavior change with visual-regression risk,
  violating this task's no-visual-change rule. Reverted to `^4.3.3`
  (4.4.0). Residual HIGH documented below.
- `@opentelemetry/core ^2.8.0` override: broke the build — v2's
  removed `VERSION` export is still imported by the installed vite 8
  instance's module runner. Reverted. Residual moderate documented.

## Compatibility evidence (OBSERVED, not assumed)

- `pnpm test:unit`: 21/21 pass on vitest 4
- `pnpm tokens:build` clean on style-dictionary 4 (no warnings)
- Full site build + Playwright battery re-run in Phase 12
- `pnpm audit` after: critical + vite/sharp/js-yaml/esbuild/qs
  items cleared; **2 residuals remain, both dev-only with no
  production path:**
  - style-dictionary HIGH (prototype pollution): exploitable only via
    malicious token input; our tokens are first-party committed files
    under branch protection + review. Advisory itself rates this shape
    LOW. Revisit when a v5-compatible token config is separately
    approved (visual-change risk belongs in its own task).
  - opentelemetry moderate (header-size DoS): dev-tooling transitive
    only; Node's 16KB header cap mitigates externally per the advisory
    itself; no server runtime ships.
- Allowlist gate unaffected (names-only; no new dependencies added)

## Automation

`.github/dependabot.yml`: monthly schedule, 5-open-PR cap, `main`
target. Security updates arrive via Dependabot alerts without weekly
version-churn noise. (Enabling Dependabot security updates itself is a
repo setting — OWNER ACTION if not already on.)
