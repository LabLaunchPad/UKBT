# DEPLOY_VERIFY_MEMORY_ANALYSIS — P0-3 — 2026-09-17

> Base: `3fe59ff` + uncommitted `public/` tsconfig exclude (see CHANGES.md Change 2).
> Authority: `FINAL_READINESS_REPORT.md` A8 (`tool_0b069140d001pK75hhv46z7j9Y`), `TINA_HITL_EXECUTION_RECEIPT.md`, `apps/web/tsconfig.json`, `package.json:42`, `ci.yml` runner pins.
> Evidence classes: FACT / VERIFIED / INFERENCE / UNKNOWN.

## 1. Failure — VERIFIED

- Command: `NODE_OPTIONS=--max-old-space-size=8192 pnpm run deploy:verify`
- Result: `FATAL ERROR: Reached heap limit JavaScript heap out of memory` at ~8072MB, `EXIT:134` — VERIFIED (prior phase).
- Location: `astro check` processing `public/admin/assets/cynefinDiagram…js:1:3477` — VERIFIED (trace path).
- Earlier: `pnpm --filter @ukbt/web typecheck` OOM at ~4GB default heap — VERIFIED (`CHANGE_LOG.md:353-357`).
- Meanwhile 7/7 individual gates PASS (`FINAL_READINESS_REPORT.md:15-35`) — VERIFIED. So the OOM is isolated to the `typecheck` (`astro check`) stage inside the ordered gate.

## 2. Root cause — INFERENCE from FACTs

| FACT | Source |
|---|---|
| `apps/web/tsconfig.json:10` `include: [".astro/types.d.ts", "**/*"]` with no `public` exclusion | file read 2026-09-17 |
| `apps/web/public/admin/` = generated Tina bundle: `index.html` 2290B + `assets/` 100+ chunks incl. 5.5MB `index-CcmAlrV1.js` | `TINA_HITL_EXECUTION_RECEIPT.md` (measured) |
| `public/` contains zero source files (static assets + gitignored build output) | build pipeline + `git check-ignore` |
| `astro check` follows tsconfig include → parses the 5.5MB generated bundle | OOM trace path (A8) |

`astro check` was type-checking megabytes of generated, gitignored admin JS. Heap grew past 8GB and the process died. This is build-output hygiene, not a code defect.

## 3. Options evaluated

| Option | Action | Effect | Verdict |
|---|---|---|---|
| A. Increase CI memory | `NODE_OPTIONS=--max-old-space-size=16384` on CI (`ubuntu-24.04` runners carry 16GB) | Raises ceiling; does not remove the 5.5MB parse cost | **RECOMMENDED as belt-and-braces** alongside B. No gate change. |
| B. Optimize: exclude `public/` from `astro check` | `apps/web/tsconfig.json` `exclude` += `"public"` | Removes generated bundle from type-check scope; all `src/` still checked | **APPLIED** (`CHANGES.md` Change 2). Not gate weakening: `public/` is build output, never source. |
| C. Split verification jobs | Separate CI job for `typecheck` with bigger heap | Same ceiling fix as A with more plumbing | **Fallback** if A+B insufficient. |
| D. Caching (pnpm store, `.astro` cache) | Faster runs | Reduces time, not peak heap | Hygiene only; does not fix OOM. |

## 4. Residual risk

- Full `deploy:verify` post-fix is **UNKNOWN** until a high-mem run (sandbox OOM history; local re-run would risk another 8GB hang). Required: CI run or local `NODE_OPTIONS=--max-old-space-size=16384` session.
- If OOM persists after B, escalate to C (split `typecheck` job) — do not weaken gates.

## 5. No gate weakening

`check-security`, `check-content-trust`, `check-deploy-mapping` re-ran PASS post-change. `public/` exclusion cannot hide source type errors (no source lives there — FACT). `deploy:verify` remains the release authority; no PASS claimed until a full green run.
