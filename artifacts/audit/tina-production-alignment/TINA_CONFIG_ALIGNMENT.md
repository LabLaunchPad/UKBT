# TINA_CONFIG_ALIGNMENT — Verify tina/config.ts vs Official Model (Phase 2)
Date: 2026-09-18

## File Under Audit
`tina/config.ts` (317 lines) — defineConfig()

## Official Model (Tina docs: tina.io/docs/reference/config, tinacloud/deployment-options/cloudflare-workers)

Required:
- `branch` — git branch for content commits
- `clientId` — TinaCloud project clientId
- `token` — read-only/content token (baked at build)
- `build.outputFolder`, `build.publicFolder` — admin generation
- `media.tina` — media config
- `schema.collections` — content model
- Optional: `search` only if search enabled with indexerToken

## Alignment

| Field | Repo Value | Official Expectation | Verdict |
|-------|------------|----------------------|---------|
| `branch` | `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'` (line 4) | Should resolve to deploy branch; Tina Cloudflare Workers docs: use `WORKERS_CI_BRANCH` or `CF_PAGES_BRANCH` chain. Repo does. | **PASS** |
| `clientId` | `PUBLIC_TINA_CLIENT_ID || TINA_CLIENT_ID || null` (line 8) | Official: `clientId` string; Astro convention is PUBLIC_TINA_CLIENT_ID; fallback to TINA_CLIENT_ID is tolerated compat. | **PASS** with WARNING: document fallback in .env.example (currently missing TINA_CLIENT_ID mention) |
| `token` | `TINA_TOKEN || null` (line 9) | Official: `token` read-only token. Repo uses correct name TINA_TOKEN, not TINA_READ_ONLY_TOKEN. | **PASS** |
| `build.outputFolder` | `admin` (line 11) | Must be `admin` (Tina expects public/admin). | **PASS** |
| `build.publicFolder` | `apps/web/public` (line 12) | Must match Astro public dir. Repo is monoreop correct (public/admin = apps/web/public/admin). | **PASS** |
| `media.tina.publicFolder` | `apps/web/public` (16) | Must match publicFolder. | **PASS** |
| `media.tina.mediaRoot` | `media` (17) | Repo mediaRoot `media` → apps/web/public/media. Consistent with 100MB cap docs. | **PASS** |
| `search.tina.indexerToken` | `TINA_SEARCH_TOKEN \|\| undefined` (22) + `stopwordLanguages: [eng]` (23) + `indexBatchSize 100`, `maxSearchIndexFieldLength 100` (25-26) | Official search requires `search.tina.indexerToken` when enabled, otherwise omit search. Repo HAS search block but build disables indexing via --skip-search-index. | **WARNING**: search config exists but never exercised. Not a BLOCKER. Either keep as dead code (harmless) or remove to reduce confusion. Keep --skip-search-index. |
| `schema.collections` | 4 collections: homepage (/, hero,CTA, whyChooseUs), about (/about), faq (/faq), siteSettings (site-wide) — all allowedActions create/delete false where appropriate, routers correct | Must have at least 1 collection; Tina starter typically has homepage/about. Repo exceeds minimum, correctly routes. | **PASS** |
| Schema field validation | String lengths, isTitle, required, link validators (startsWith /, javascript: block), email/phone/url validators, image alt requirements | Best practice: validate editorial input. Repo does extensively (lines 46,58-60,86,102,114-116,133-135,196-199,258,291-292,302-303) | **PASS** |

## Issues Found

- **WARNING — Search dead code**: `search` block present (lines 20-27) while `package.json:18` uses `--skip-search-index` and docs/tina-audit CMS_TRUST_MODEL says search token unused. Official search needs `search: { tina: { indexerToken } }` ONLY when enabled. Keeping both is not broken (indexerToken undefined → indexing skipped anyway, plus flag skips), but it invites assumption that TINA_SEARCH_TOKEN is required. Recommend: keep as-is OR add comment `// Search disabled by design — see --skip-search-index in package.json; do not provision TINA_SEARCH_TOKEN` to make intent explicit. Do not add secret.
- **WARNING — .env.example incomplete**: Documents PUBLIC_TINA_CLIENT_ID, TINA_TOKEN, TINA_BRANCH, PUBLIC_TINA_ADMIN_ORIGIN but omits TINA_CLIENT_ID fallback and TINA_SEARCH_TOKEN (intentionally omitted? but should document as not needed). Fix docs to match code chain.

## Overall
**PASS** — tina/config.ts aligns with official TinaCloud Cloudflare Workers model. No BLOCKER. Branch chain, clientId fallback, token name, build/media paths, schema all correct. Search is intentionally disabled; do not provision TINA_SEARCH_TOKEN.

## Validation Command
`pnpm run build` with PUBLIC_TINA_CLIENT_ID+TINA_TOKEN set should succeed; without them should fail closed (observed 2026-09-18 failure "Missing clientId, token" — correct fail-closed behavior).
