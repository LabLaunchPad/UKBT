# TinaCMS Production Alignment — CURRENT_STATE (Phase 0)
Date: 2026-09-18
Worktree: C:\UKBT\ukbt-tina-hardening | HEAD de3bfa1 | main 67ba0988 | 18 ahead, 0 behind, local-only
Mode: Evidence-first audit — no code changes until Phase 7 approved

## Grounding Truth vs Prior Assumptions

Prior analysis incorrectly introduced `TINA_READ_ONLY_TOKEN` as repo standard.
**FACT from code** (`tina/config.ts:4,8,9,22`): repo consumes exactly:
- `branch`: `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'`
- `clientId`: `PUBLIC_TINA_CLIENT_ID || TINA_CLIENT_ID || null`
- `token`: `TINA_TOKEN || null`
- `search.tina.indexerToken`: `TINA_SEARCH_TOKEN || undefined`

No reference to `TINA_READ_ONLY_TOKEN` exists in code, config, CI, .env.example, or docs. See TOKEN_MATRIX.md.

## What Exists (FACT/VERIFIED)

- Tina integration: `@tinacms/astro 0.7.0`, `tinacms 3.14.0`, `@tinacms/cli 3.0.0`, `@astrojs/cloudflare 14.2.5`, `astro 7.2.8` (apps/web/package.json:18-22)
- Build: `tinacms build --skip-cloud-checks --skip-search-index && pnpm --filter @ukbt/truth tokens:build && pnpm --filter @ukbt/web build` (root package.json:18; ci.yml:144; visual job 271)
- tina/config.ts: 4 collections (homepage→/, about→/about, faq→/faq, siteSettings), media root apps/web/public/media, build output admin→apps/web/public
- Adapter: Astro `output: static` + `@astrojs/cloudflare` (adapter: cloudflare()) + root `wrangler.jsonc` (main ./apps/web/dist/server/entry.mjs, assets ./apps/web/dist/client, kv_namespaces SESSION 3435716ffa0e4616b01e2b0faf96ddd5) — de3bfa1 P0-1 VERIFIED
- Deployment: Cloudflare Workers git-connected Builds (ci.yml header 306-312, DEPLOYMENT-CONTRACT amendment 2026-08-27). NOT Pages.
- CI env: `PUBLIC_TINA_CLIENT_ID=vars.PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN=secrets.TINA_TOKEN` (ci.yml:30-31). No TINA_SEARCH_TOKEN wired.
- .env.example: PUBLIC_TINA_CLIENT_ID=fe5da197..., TINA_TOKEN=, TINA_BRANCH=main, PUBLIC_TINA_ADMIN_ORIGIN= (line 8-14). No TINA_SEARCH_TOKEN documented.
- Search: `search.tina.indexerToken` defined but **disabled at build** via --skip-search-index and --skip-cloud-checks (package.json:18, ci.yml visual job). No UI consumer requires search.

## Evidence Classification

| Item | Class | Source |
|------|-------|--------|
| Token names consumed by code | VERIFIED | tina/config.ts:4,8,9,22 |
| TINA_READ_ONLY_TOKEN in repo | FACT (absent) | grep code/docs/env/CI — zero hits |
| SESSION KV pin | VERIFIED | wrangler.jsonc:44-50, check:deploy-mapping PASS |
| Build disables search | VERIFIED | package.json:18, ci.yml:271 |
| CI only uses PUBLIC_TINA_CLIENT_ID+TINA_TOKEN | VERIFIED | ci.yml:30-31 |
| Cloudflare vars set (GITHUB_TOKEN, PUBLIC_TINA_CLIENT_ID, TINA_TOKEN) | OBSERVED (user statement 2026-09-18) | user dashboard report — not independently verified |
| GitHub Actions secrets/vars | OBSERVED (user: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, TINA_TOKEN, PUBLIC_TINA_CLIENT_ID) | user statement — not verified via API |
| GITHUB_TOKEN rotates / scopes | UNKNOWN | requires dashboard verification |
| /admin built and served | UNKNOWN until build proof | no recent dist evidence |
| Save→GitHub commit flow | UNKNOWN | P0-2 HITL not executed |

## Prior Hardening (18 commits ahead)
- SESSION KV pin (de3bfa1), redact removal (acc5c76), public/ tsconfig exclude (ddfb40f), tooling audits, HITL runbook/receipt, memory analysis (99151f1), revalidation (1bc0824)

## Blocker
- Recent deploy:verify FAILED at `tinacms build` with "Missing clientId, token" (evidence: pnpm build error 2026-09-18). Indicates CI/local env TINA_TOKEN or PUBLIC_TINA_CLIENT_ID not injected in that shell — does not prove GitHub secrets missing, proves local shell missing.

## Stop Condition
No token rename, no new secrets, no architecture change until Phases 1-7 complete. Only evidence-backed minimal fixes per remediation plan.
