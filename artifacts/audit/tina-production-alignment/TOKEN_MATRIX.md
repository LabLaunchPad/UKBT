# TOKEN_MATRIX — Trace Real Token Flow (Phase 1)
Date: 2026-09-18

## Method
Grep code, config, CI, .env.example, docs for every Tina token name. No dashboard values printed. Class: FOUND / NOT_FOUND. Env surface: build-time vs runtime.

## Result (FACT: only these are referenced)

| Token | Exists in docs (.env.example) | Exists in code (tina/config.ts) | Used by | Required? | Environment |
|---|---|---|---|---|---|
| `PUBLIC_TINA_CLIENT_ID` | YES: .env.example:8 `fe5da197-2c26-4071-9d72-e8216d5b53d6` | YES: tina/config.ts:8 `process.env.PUBLIC_TINA_CLIENT_ID` fallback | `tina/config.ts` clientId + `tinacms build` | REQUIRED | Build-time (GitHub Actions + local + Cloudflare Workers Builds) |
| `TINA_CLIENT_ID` | NO | YES: tina/config.ts:8 fallback `TINA_CLIENT_ID` | tina/config.ts clientId fallback | OPTIONAL (compat) | Build-time |
| `TINA_TOKEN` | YES: .env.example:9 empty `TINA_TOKEN=` + comment "SECRET — set in local .env, GitHub Actions secrets, Cloudflare Workers Builds" | YES: tina/config.ts:9 `process.env.TINA_TOKEN` | `tina/config.ts` token + `tinacms build` | REQUIRED | Build-time secret. NOT runtime. Tina docs: baked into admin bundle at build, not Worker env. |
| `TINA_SEARCH_TOKEN` | NO | YES: tina/config.ts:22 `process.env.TINA_SEARCH_TOKEN` | tina/config.ts search.tina.indexerToken | NOT REQUIRED currently — see SEARCH decision | Build-time secret IF search enabled |
| `TINA_READ_ONLY_TOKEN` | NO | NO | nowhere | NOT USED | Do NOT add — would be dead secret |
| `TINA_BRANCH` | YES: .env.example:10 `TINA_BRANCH=main` | YES: tina/config.ts:4 `process.env.TINA_BRANCH` | branch resolution | OPTIONAL (defaults to main/GITHUB_BRANCH/WORKERS_CI_BRANCH/CF_PAGES_BRANCH) | Build-time |
| `GITHUB_BRANCH` | NO | YES: tina/config.ts:4 fallback | branch resolution | OPTIONAL | Build-time (GitHub Actions provides) |
| `WORKERS_CI_BRANCH` | NO | YES: tina/config.ts:4 fallback | branch resolution | OPTIONAL | Build-time (Workers Builds provides) |
| `CF_PAGES_BRANCH` | NO | YES: tina/config.ts:4 fallback | branch resolution | OPTIONAL | Build-time (Pages provides) |
| `PUBLIC_TINA_ADMIN_ORIGIN` | YES: .env.example:11-14 empty + comment allowing `https://app.tina.io,https://ukbanglatigers.co.uk` | NO direct ref in tina/config.ts — consumed by @tinacms/astro middleware (`apps/web/node_modules/@tinacms/astro/dist/middleware.js:4 adminOrigins()`) | CSP frame-ancestors + admin iframe allowlist | OPTIONAL but recommended for preview/prod diff origins | Build-time var (embedded) + runtime check |
| `GITHUB_TOKEN` | NO (not Tina) | NO | Cloudflare Workers Builds GitHub App connection — NOT code | REQUIRED for git-connected deploys if private or for metadata | Cloudflare Workers Builds Variables and Secrets (user reports PRESENT 2026-09-18) |

## Evidence Snippets

- `tina/config.ts:4` branch chain: `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'` — handles Cloudflare Workers Builds correctly (audit WORKERS_TINA_CONFIGURATION_AUDIT.md:36 PASS)
- `tina/config.ts:8` clientId: `PUBLIC_TINA_CLIENT_ID || TINA_CLIENT_ID || null` — Astro PUBLIC_ prefix required; fallback prevents silent fail if docs use TINA_CLIENT_ID
- `tina/config.ts:9` token: `TINA_TOKEN || null` — official Tina name, not TINA_READ_ONLY_TOKEN
- `tina/config.ts:20-27` search: `indexerToken: process.env.TINA_SEARCH_TOKEN` but build disables it — see SEARCH_DISABLED_BY_DESIGN
- `package.json:18` build: `tinacms build --skip-cloud-checks --skip-search-index` — proves search not exercised; no TINA_SEARCH_TOKEN needed to pass build (once clientId+token present)
- `.github/workflows/ci.yml:30-31` env: `PUBLIC_TINA_CLIENT_ID: vars.PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN: secrets.TINA_TOKEN` — matches code expectations, no extra names
- `docs/tina-integration.md:59-64` env table: PUBLIC_TINA_CLIENT_ID Yes/.env,CI; TINA_TOKEN No/CI secret / Cloudflare secret; TINA_BRANCH Yes; PUBLIC_TINA_ADMIN_ORIGIN Yes — consistent, but omits TINA_SEARCH_TOKEN (correct to omit while disabled) and TINA_CLIENT_ID fallback (should document)

## CI vs Cloudflare Placement Truth

- **Tina token is BUILD-TIME, not Workers runtime Worker env.** Per Tina docs Cloudflare Workers (https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers § Environment variables): "These are build-time only. tinacms build bakes the client ID and token into the generated client, so there's nothing to add again as a runtime variable." (verified via webfetch 2026-09-17). Static Astro + Cloudflare adapter: admin bundle lives in apps/web/public/admin, generated at build, served as static assets. Worker does not need TINA_TOKEN at request time.
- Therefore: GitHub Actions `vars/secrets` AND Cloudflare Workers Builds `Variables and Secrets` both need `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN` as **build-time** variables during the `tinacms build` step on that platform. Do NOT add them as Worker runtime secrets/bindings (wrangler.jsonc env_vars) — that would be miswired.

## Unknowns
- Whether Cloudflare Workers Builds Variables and Secrets actually contain PUBLIC_TINA_CLIENT_ID/TINA_TOKEN — user states PRESENT (2026-09-18) but not independently verified via wrangler or dashboard API.
- Whether GitHub Actions vars.PUBLIC_TINA_CLIENT_ID / secrets.TINA_TOKEN are set — user states repo has Actions secrets CLOUDFLARE_*, TINA_TOKEN and var PUBLIC_TINA_CLIENT_ID — not verified via gh API.

## Rule
Never rename TINA_TOKEN → TINA_READ_ONLY_TOKEN without migration proof. TINA_TOKEN is the official name consumed by code; aliasing would require config change + dual-support period.
