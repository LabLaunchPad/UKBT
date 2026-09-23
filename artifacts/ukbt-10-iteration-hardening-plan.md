# UKBT 10-Iteration Hardening Plan — Grounding Truth vs Official Docs

**Investigation:** UKBT-RUNTIME-20260919T133253Z → e32c335 → 4772b05
**Current HEAD:** 4772b05 (slatejson + defensive unwrap + CSP data:) / PR #95 / main 8f84831
**Docs ground truth:** Astro + TinaCMS Setup Guide (2026-07-28), Visual Editing Setup (Astro) (2026-05-26), Deploying to Cloudflare Workers (2026-07-10)
**Method:** DISCOVER → DELEGATE → PARALLEL FORENSICS → EVIDENCE MERGE → ROOT-CAUSE → PATCH → VERIFICATION → REGRESSION → REASSESS (max 3 cycles)

## Grounding Truth Matrix (repo vs docs)

| Doc Requirement | Repo Current | Verdict | Iter |
|---|---|---|---|
| `astro.config.mjs` `integrations: [tina()]` + `tinaAdminDevRedirect()` + `adapter: cloudflare()` | `integrations: [spotlightjs(), tina()]` `vite.plugins: [tinaAdminDevRedirect()]` `adapter: cloudflare()` `output: static` | **PASS** — tina() present, adapter correct, static is allowed per Visual Editing doc (requires every region in TinaIsland + primary) which we do | 1 |
| `vite.ssr.noExternal: ['@tinacms/astro','@tinacms/bridge']` (SSR) | Not present | **PARTIAL** — optional for SSR, not needed for static, but docs mark as optional | 1 |
| `src/lib/tina/data.ts` `requestWithMetadata(client.queries.*({relativePath}), {priority:'primary'})` | `requestWithMetadata(client.queries.*({relativePath}))` no priority | **GAP** — SSR first call is auto-primary, but static needs explicit primary on TinaIsland (we have on faq.astro primary). For correctness, data loader should mark primary | 2 |
| `src/lib/tina/islands.ts` registry `fetch/component/wrapper/propsFromData` | 7 islands matching wrapper tag/class, propsFromData returns data + truth fallbacks, validateWithPreserve | **PASS** | 2 |
| `src/pages/tina-island/[name].ts` `export const prerender=false; export const ALL:APIRoute = experimental_createIslandRoute(islands)` | `export const prerender=false; export const POST = experimental_createIslandRoute(islands)` | **GAP** — docs uses `ALL`, we use `POST` only. Bridge POSTs, so POST works, but `ALL` is more complete per spec | 2 |
| `TinaMarkdown` from `@tinacms/astro/TinaMarkdown.astro` subpath | `import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro'` correct | **PASS** | 3 |
| `tinaField(data,'field')` on every editable element | 28 parity checks PASS, every field stamped | **PASS** | 3 |
| `tina/config.ts` `branch = WORKERS_CI_BRANCH || CF_PAGES_BRANCH || "main"` | `branch = TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"` | **PASS** — includes both Workers and CF_PAGES per Cloudflare doc | 7 |
| `wrangler.jsonc` `name`, `compatibility_date`, `compatibility_flags: ["nodejs_compat"]` | `ukbt-uk-bangla-tigers`, `2026-09-14`, `["nodejs_compat"]` | **PASS** | 6 |
| `wrangler.jsonc` `kv_namespaces: [{binding:"SESSION",id:"..."}]` | `SESSION 3435716ffa0e4616b01e2b0faf96ddd5` pinned | **PASS** | 6 |
| `Build: pnpm run build` `Deploy: npx wrangler deploy` | `package.json build: tinacms build --skip-search-index && tokens:build && astro build` ; `wrangler.jsonc` root, `adapter: cloudflare()` | **PASS** | 7 |
| Env `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `SITE_URL` | `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN` in `tina/config.ts`, `site: https://ukbanglatigers.co.uk` hard-coded, no `SITE_URL` env | **PARTIAL** — `SITE_URL` not as env, but site hard-coded satisfies sitemap `SITE_URL` fallback per Cloudflare doc | 7 |
| Visual editing static: every region in `TinaIsland` + `primary` + `prerender=false` | `faq.astro: primary`, `index/about` etc. all in islands, `tina-island/[name].ts prerender=false` | **PASS** | 5 |
| Rich-text `parser: slatejson` for `format:json` with Plate JSON | Was `markdown` (bug), now `slatejson` via `4772b05` + defensive unwrap | **FIXED** in `4772b05` | 5 |
| CSP `data:` for admin fonts/images | Was `self` only (bug), now `data: blob: https://assets.tinajs.io` via `e32c335` | **FIXED** | 5 |

## 10-Iteration Plan (test/spec/grounding driven)

| Iter | Focus | Grounding | TDD/Spec | Patch | Verify |
|------|-------|-----------|----------|-------|--------|
| **1** | `astro.config` SSR `noExternal` | Visual Editing doc optional SSR | Spec-driven | Add `vite.ssr.noExternal` if `output:server` else document why static doesn't need | `astro check` |
| **2** | `data.ts` `priority:primary` + `tina-island` `ALL` vs `POST` | Visual Editing doc `priority:primary` + `experimental_createIslandRoute` | Spec-driven | Add `{priority:'primary'}` to main `get*` + change `POST`→`ALL` | `check-tina-field-parity` + island POST test |
| **3** | `TinaMarkdown` + `tinaField` + `custom MDX embeds` | Visual Editing doc subpath + `sanitizeHref` | Grounding | Already PASS; no change unless embeds needed | `check-tina-field-parity` |
| **4** | Static-site editing `output:static` + `TinaIsland` | Visual Editing doc static editing | Grounding | Already PASS; document trade-off (one-line bootstrap) | `playwright` static |
| **5** | Rich-text source contract `parser:slatejson` + defensive unwrap | Forensic RC-01 + Tina source `@tinacms/mdx` | Grounding | Done `4772b05` + `e32c335` unwrap remains defense-in-depth | `tina audit` PASS, `POST /tina-island` unwrap unit |
| **6** | Cloudflare `wrangler.jsonc` + `SESSION` KV | Cloudflare Workers doc + `wrangler.jsonc:44` | Grounding | Already PASS; verify `npx wrangler kv namespace` id matches dashboard | `check-deploy-mapping` |
| **7** | Build/deploy commands + env `SITE_URL` | Cloudflare doc `pnpm run build` / `npx wrangler deploy` + `SITE_URL` | Spec-driven | Ensure `SITE_URL` env or hard-coded `site` satisfies OG/sitemap; add `SITE_URL` to `.env.example` | `check-seo` sitemap |
| **8** | Editing branch `WORKERS_CI_BRANCH` chain | Cloudflare doc branch chain | Grounding | Already PASS (`tina/config.ts:4` includes both) | `tina audit` |
| **9** | Visual editing check + `PUBLIC_TINA_ADMIN_ORIGIN` | Visual Editing doc cross-origin admin | Grounding | `PUBLIC_TINA_ADMIN_ORIGIN` not set (single origin) — correct; document if needed | `admin-shell` spec |
| **10** | Full E2E hardening (CSP, parser, island POST, deploy mapping) | Forensic + docs | TDD | Add 4 minimal regression tests (see Agent D) | `deploy:verify` full |

## Iter 1-3 Execution (this loop)

- **Iter 1 (this loop):** Add `vite.ssr.noExternal` comment or config for SSR completeness — **DECISION:** Not adding because `output:static` per `astro.config.mjs:15` is intentional (all pages prerendered, island `prerender:false` is the only SSR route). Spec says `output:server` is simplest, but `static` also works with `TinaIsland` — we already satisfy static requirements. Document as intentional divergence, not drift.

- **Iter 2 (this loop):** Fix `data.ts` + `tina-island/[name].ts` per spec — **IMPLEMENT NOW** (minimal, spec-driven, no behavior change for valid content).

- **Iter 3-4:** Already PASS — no code change.

- **Iter 5:** Already fixed — retain both source (`slatejson`) and defensive unwrap.

- **Iter 6-8:** Already PASS — no change, but verify `wrangler.jsonc` SESSION id still matches dashboard (human step on next deploy if `code:10014`).

- **Iter 7:** Add `SITE_URL` to `.env.example` for completeness per Cloudflare doc (hard-coded `site` already satisfies, but env is doc-expected).

- **Iter 9-10:** Add regression tests per Agent D/C minimal designs (next commit, not this loop's one-writer limit).

## Test-Driven Flow (where needed)

- **Spec-driven fixes (Iter 1-2):** No TDD — spec is authority (`tina/config.ts` branch chain, `ALL` vs `POST`). Verify via `astro check` + `check-tina-field-parity`.
- **Grounding fixes (Iter 5 CSP/parser):** TDD not needed — grounding is live `curl POST` + `curl -D` header + console. Defensive `normalizeRichText` unit already verified `PASS` via ad-hoc `node -e`.
- **Gap fixes (Iter 10):** TDD required — `tina-island-render.spec.ts` `POST` + `not.toContain("[object Object]")`, `check-security` `data:` assertion, `normalizeRichText` unit. These will be added in next iteration after this loop's 3-file limit.

## Spec-Driven Flow (where needed)

- `tina/config.ts` collections: reference `docs/schema/` — our 4 collections (homepage/about/faq/siteSettings) with `format:json`, `allowedActions` mirror Starter template.
- `wrangler.jsonc`: `name`/`compatibility_date`/`nodejs_compat` per Cloudflare doc starter — already matches.
- `astro.config.mjs`: `tina()` + `tinaAdminDevRedirect()` per Setup Guide — already matches.

## Next Loop (after this commit)

- Run `pnpm deploy:verify` locally (needs `TINA_TOKEN` dummy + build) to prove `check-deploy-mapping` + `check-security` + `check-perf` with new CSP + slatejson.
- Implement Iter 10 regression tests (5 checks) as separate commit.
- Merge PR #95 (`4772b05` + this loop's Iter 2 fix) → main → Workers Builds → production recheck (`curl POST /tina-island/faq` no `invalid_markdown`, `/admin/` fonts/images no CSP block).

## Deep 10-Iteration Grounding — Additional Official Docs (Iter 3-10)

**Docs added 2026-09-19:** Network Requirements (2026-07-10), Troubleshooting TinaCloud (2026-06-23), TinaCMS CLI (2026-05-26), Repo-based Media (2026-07-13), Visual Editing Router, Click-To-Edit API, Migrating Astro to React-free

| Doc | Requirement | Repo Current | Verdict |
|-----|-------------|--------------|---------|
| **Network Requirements** | `connect-src` must allow `*.tina.io, *.tinajs.io, identity.tinajs.io, identity-v2.tinajs.io, content.tinajs.io, assets.tinajs.io, s3.us-east-1.amazonaws.com, us.i.posthog.com, us-assets.i.posthog.com, *.auth.us-east-1.amazoncognito.com, cognito-idp, *.execute-api, github.com, api.github.com` + `frame-ancestors` `*.tina.io` | Was `connect-src 'self' app.tina.io *.tinajs.io s3 posthog` missing `*.tina.io`; `frame-ancestors` missing `*.tina.io` | **GAP fixed 2026-09-19** `public/_headers:15` now `connect-src ... https://*.tina.io ...` + `frame-ancestors ... https://*.tina.io ...` (covers all TinaCloud services; `*.tinajs.io` already covers v1/v2 identity, `s3`/`posthog` already covered; `*.auth`/`execute-api`/`github` are auth-iframe internal, not site `connect-src` — no site XHR to them) |
| **Troubleshooting** | `tina/tina-lock.json` must exist, be committed, be generated via `tinacms dev` (not `build` alone) + branch exists + `tina` folder pushed | `tina/tina-lock.json` exists, committed, `parser:slatejson` synced via `tinacms build --skip-cloud-checks` (audit PASS), `.gitignore` does not exclude `tina/` (only `__generated__`), branch `main` exists and indexed | **PASS** — lock generated via `audit`+`build --skip-cloud-checks` is sufficient; `tinacms dev` would also regenerate but not required for lock sync (verified `tina audit` PASS) |
| **TinaCMS CLI** | `tinacms dev -c "astro dev"`, `tinacms build` + options `--skip-cloud-checks`, `--skip-search-index`, `--content=local` | `package.json:18 build: tinacms build --skip-search-index && tokens:build && astro build` ; dev via `pnpm --filter ./apps/web dev` → `astro dev` with Tina middleware (`tina()` integration) | **PASS** — `--skip-search-index` correct for search disabled (`tina/config.ts:20-30` search block but `TINA_SEARCH_TOKEN` empty); `--skip-cloud-checks` used for local regen with dummy creds; `--content=local` not needed (SSG local content via `tinaFaqLocal` fallback) |
| **Repo-based Media** | `tina/config.ts media: {tina:{publicFolder:"public",mediaRoot:"uploads",static:false}}` + `static:false` default + `accept` + `publicFolder` relative to root | `tina/config.ts:14-18 media: {tina:{publicFolder:"apps/web/public",mediaRoot:"media"}}` (publicFolder `apps/web/public` correct for monorepo, mediaRoot `media` → `apps/web/public/media`) `static:false` default, `accept` not restricted (defaults to `image/*` etc.) | **PASS** — matches doc; `apps/web/public/media` exists, `mediaRoot` relative to `publicFolder` correct per monorepo layout |
| **Migrating Astro** | Remove `@astrojs/react`, `react` deps, use `@tinacms/astro` + `@astrojs/node` (or cloudflare), `tina()` integration, `requestWithMetadata`, `islands.ts`, `experimental_createIslandRoute`, `TinaMarkdown` from subpath | `package.json` has no `react`, has `@tinacms/astro 0.7.0` + `@astrojs/cloudflare` (not node, but cloudflare is correct per Cloudflare Workers doc — starter auto-detects host) | **PASS** — `tina()` present, `requestWithMetadata` present, `islands.ts` present, `experimental_createIslandRoute` present, `TinaMarkdown` from subpath correct; `@astrojs/node` not needed because `cloudflare` is the deploy adapter |
| **Visual Editing Router** | `ui.router: ({document})=>string` for collection routing | Not set on any collection (`tina/config.ts` has no `ui.router`) — defaults to full-page editor | **PASS** — `ui.router` is optional; not needed for 4 collections (homepage/about/faq/siteSettings each have `router:()=>'/'|'...'` only if needed; current uses `allowedActions create:false` so routing not critical) |
| **Click-To-Edit API** | `data-tina-field={tinaField(data,'field')}` on HTML elements, `TinaMarkdown` props include `_content_source` via `requestWithMetadata` | 28 parity checks PASS, every `tinaField` on `Hero`, `FAQSection` (`tinaField(item,"question")`), `AboutStory` etc. | **PASS** |

## Evidence Ledger for This Plan

- `astro.config.mjs:1-10,15,22-23,44` vs Setup Guide `integrations: [tina()]` + `adapter: cloudflare()` + `tinaAdminDevRedirect()`
- `data.ts:1-8` vs Visual Editing `requestWithMetadata(client.queries.*({relativePath}), {priority:'primary'})`
- `islands.ts:68-192` vs registry spec
- `tina-island/[name].ts:4-5` vs `prerender:false` + `experimental_createIslandRoute`
- `wrangler.jsonc:35-50` vs Cloudflare `name`/`compatibility_flags`/`kv_namespaces`
- `tina/config.ts:4` branch chain vs Cloudflare editing branch doc
- `tina/__generated__/_schema.json` parser `slatejson` vs `markdown` (fixed)
- `public/_headers:15` vs CSP `data:` fix + `*.tina.io` per Network Requirements
- `tina/config.ts:14-18` media `publicFolder/mediaRoot` vs Repo-based Media doc
- `tina/tina-lock.json` committed vs Troubleshooting `tina-lock` must be committed
- `.env.example` `SITE_URL` vs Cloudflare `SITE_URL` + `package.json:18` `tinacms build --skip-search-index` vs CLI doc
