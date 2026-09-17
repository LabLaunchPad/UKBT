# DEPLOYMENT_FLOW — Cloudflare Model (Phase 4)
Date: 2026-09-18

## Actual Architecture: Workers git-connected Builds (not Pages)

**FACT** — Contracts/amendments + wrangler + astro config:

- `contracts/DEPLOYMENT-CONTRACT.md` 2026-08-27 amendment: HOST = Cloudflare Workers (static assets), not Pages. Owner connected pre-provisioned Worker `ukbt-uk-bangla-tigers` via dashboard "Connect to repository".
- `wrangler.jsonc:2-16` comment: MUST stay at repo root because Workers Builds runs deploy from Root directory "/". Config has `name: ukbt-uk-bangla-tigers`, `main: ./apps/web/dist/server/entry.mjs`, `assets: { binding: ASSETS, directory: ./apps/web/dist/client, not_found_handling: 404-page }`, `compatibility_flags: [nodejs_compat]` (68c672e), `kv_namespaces: [{ binding: SESSION, id: 343571... }]` (de3bfa1), `observability` (acc5c76 fix).
- `apps/web/astro.config.mjs:13 output: static, site: https://ukbanglatigers.co.uk, adapter: cloudflare(), integrations: [tina()]` — adapter moves static to dist/client and emits Worker entry at dist/server/entry.mjs, mirrored by wrangler.jsonc (comment 18-34, verified by clean local build).
- CI `.github/workflows/ci.yml:129-144` build job runs `pnpm run build` (which is `tinacms build --skip-cloud-checks --skip-search-index && pnpm --filter @ukbt/truth tokens:build && pnpm --filter @ukbt/web build`). No wrangler deploy job since 2026-09-10 removal (note 306-312): "git-connected Workers Builds publishes on every main merge independently of CI."
- Workers Builds flow: GitHub push to main → Cloudflare pulls → Build command `pnpm run build` (must have PUBLIC_TINA_CLIENT_ID + TINA_TOKEN as **build-time** Variables and Secrets in Workers Builds) → `tinacms build` generates admin bundle to apps/web/public/admin → `astro build` emits dist/client + dist/server/entry.mjs → Workers deploys via wrangler.jsonc pin.

## Diagram

```
TinaCloud Free ──(GraphQL, clientId+token)──> tinacms build ──> apps/web/public/admin (static bundle, baked clientId+token)
        │                                              │
        │ media 100MB                                   ├─> pnpm --filter @ukbt/truth tokens:build ─> apps/web/src/styles/generated/tokens.css
        │                                              │
        └─(commit on Save)──> GitHub main ──> GitHub Actions CI (checks 15 gates, uses vars.PUBLIC_TINA_CLIENT_ID + secrets.TINA_TOKEN)
                                      │
                                      └─> Cloudflare Workers Builds (git-connected, same repo)
                                             │ Build Variables and Secrets: PUBLIC_TINA_CLIENT_ID, TINA_TOKEN, (GITHUB_TOKEN for metadata), NODE_OPTIONS if needed
                                             │ Build: pnpm run build (same as CI) → dist/client + dist/server/entry.mjs
                                             │ Deploy: wrangler.jsonc (SESSION KV 343571..., ASSETS binding) → Worker ukbt-uk-bangla-tigers
                                             └─> https://ukbanglatigers.co.uk + https://ukbt-uk-bangla-tigers.<account>.workers.dev/admin

Runtime: Worker serves static assets; on-demand route tina-island/[name].ts (prerender=false) handles visual editing POST islands inside Worker (needs nodejs_compat for node:async_hooks).
```

## Model Answer: A (Pages build-time CMS) vs B (Workers runtime) vs C (Hybrid)

- **Not B**: Tina admin is NOT fetched from Workers KV at runtime; token not in Worker env. It is baked.
- **Not pure A Pages**: Host is Workers, not Pages, but pattern same: build-time CMS → static admin bundle.
- **Correct: A-like on Workers** — Hybrid C only for island route (tina-island), which IS runtime inside Worker.

## Evidence

- `wrangler.jsonc:38` main + assets mirrors adapter generated dist (production 404 recovery 2026-09-15, verified clean local build).
- `tina/config.ts:10-13` build outputFolder admin, publicFolder apps/web/public — consistent with adapter expectations.
- `docs/tina-integration.md:139-146` Deployment Model: Workers static assets, root wrangler, output static preserved, _worker.js handles islands.

## Unknowns / Risks

- Cloudflare Workers Builds Build command exactly `pnpm run build`? Verified via dashboard? User hasn't pasted Builds settings screenshot. Should confirm Settings>Builds>Build command and Root directory.
- Workers Builds Variables and Secrets actually contain PUBLIC_TINA_CLIENT_ID/TINA_TOKEN — user states yes (2026-09-18: Type Variable PUBLIC_TINA_CLIENT_ID fe5da..., Secret TINA_TOKEN encrypted). Not verified via API; but local deploy:verify FAILED "Missing clientId, token" because local shell had no env — does not disprove Cloudflare has them.
- GitHub Actions vars/secrets effective? User reports repo has TINA_TOKEN secret + PUBLIC_TINA_CLIENT_ID var, but CI still would fail if vars not set for PRs from forks (not relevant, public repo main).

## Secret Placement Correction

- Do NOT put TINA_TOKEN/PUBLIC_TINA_CLIENT_ID in wrangler.jsonc `vars` or `env_vars` as runtime Worker bindings. Place as **Workers Builds Variables and Secrets** (Settings>Build) and **GitHub Actions vars/secrets** only.
- wrangler.jsonc should contain ONLY `kv_namespaces SESSION` (done), `assets` binding, `observability`, `compatibility_flags`. No Tina secrets.

## Next Verify

- Capture dashboard screenshots: Workers & Pages > ukbt-uk-bangla-tigers > Settings > Builds > Build configuration.
- Trigger CI push and confirm `pnpm run build` passes with injected vars (check Actions logs for tinacms build success).
