# Cloudflare Tooling — CHANGES — 2026-09-17

> One concern per commit. No deployment, no Tina changes, no architecture changes.

## Change 1 — Remove unsupported `observability.redact_query_string` (APPLIED)

**Problem:** Every `wrangler` invocation warned `Unexpected fields found in observability field: "redact_query_string"`.

**Evidence:**
- Installed `wrangler@4.126.0` `config-schema.json` `Observability` (3972-4050): no such property, `additionalProperties: false` — FACT.
- Official docs 2026-09-17: observability = `enabled` + `head_sampling_rate` only — FACT.
- Warning reproduced pre-fix (17:35, 17:39 runs); absent post-fix (17:48 run) — VERIFIED.

**Risk:** low. Field was warned + ignored (no-op); removal changes no enforced behavior. Security posture unchanged — recorded in `docs/security/query-log-redaction.md` 2026-09-17 amendment; dashboard-side verification remains a human step (UNKNOWN until confirmed).

**Minimal fix:** `wrangler.jsonc` — deleted `"redact_query_string": true` + replaced its comment with unsupported-field note; `docs/security/query-log-redaction.md` — prepended amendment section. No other files.

**Validation:** `npx wrangler kv namespace list` → warning gone, auth error only (expected); `node scripts/check-deploy-mapping.mjs` → PASS; `node scripts/check-security.mjs` → PASS. See VERIFICATION.md.

**Rollback:** `git revert <sha>` — re-adds a warned-and-ignored line; safe either way.

## Change 2 — Exclude `public/` from `astro check` (APPLIED, P0-3 fix)

**Problem:** `deploy:verify` OOMs (`exit 134`, heap 8072MB with 8192 cap) inside `astro check` while processing `public/admin/assets/cynefinDiagram…js` — the 5.5MB generated Tina admin bundle.

**Evidence:** OOM trace path (`FINAL_READINESS_REPORT.md` A8) + `apps/web/public/admin/index.html` 2290B + `assets/` 100+ chunks + `apps/web/tsconfig.json:10` `include: ["**/*"]` with no `public` exclusion — FACT. `public/` holds only static assets + gitignored build output (no source) — FACT (`git check-ignore`, build pipeline).

**Risk:** low. Excluding gitignored build output from type-checking is hygiene, not gate weakening — all `src/` still checked.

**Minimal fix:** `apps/web/tsconfig.json` `exclude` += `"public"` with comment. JSONC syntax validated (`ConvertFrom-Json` after comment-strip → `exclude=dist,public,node_modules,…`).

**Validation:** syntax PASS; `check-deploy-mapping` + `check-security` PASS post-change. Full `astro check`/`deploy:verify` re-run required on CI high-mem runner (sandbox OOM history) — recorded UNKNOWN until then. See `DEPLOY_VERIFY_MEMORY_ANALYSIS.md`.

**Rollback:** `git revert <sha>` — one line.

## Not changed (evidence-backed deferrals)

| Item | Verdict |
|---|---|
| SESSION KV pin | BLOCKED — no `CLOUDFLARE_API_TOKEN`, id UNKNOWN, never fabricated (P0-1) |
| `tinaAdminDevRedirect` | NOT_REQUIRED — `vite.js apply:"serve"` dev-only (prior audit) |
| `SITE_URL` env | N/A — hardcoded `astro.config.mjs:15` |
| Skills into repo | NOT APPLIED — installer targeted global config; repo untouched |
