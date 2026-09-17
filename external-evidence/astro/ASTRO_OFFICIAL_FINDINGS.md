# Astro Official Findings — T2 (Mandatory Web Research)

> **Scope:** Verify from https://docs.astro.build/ ONLY: `output: static`, islands / `server:defer` / `TinaIsland` pattern, `export const prerender = false`, and `@astrojs/cloudflare` behaviour (`dist/client` vs `dist/server/entry.mjs`, `wrangler.json` generation, `nodejs_compat`). No invented claims. Repo mapping to `apps/web/astro.config.mjs:13`, `src/pages/tina-island/[name].ts`, `src/lib/tina/islands.ts`, `wrangler.jsonc`.
>
> **Retrieved:** 2026-09-18 (UTC) via `default.webfetch` (markdown). All sources are `https://docs.astro.build/en/...` — no external sources.
>
> **Fetched URLs (mandatory + extended):**
> - `https://docs.astro.build/en/basics/astro-pages/` ✅
> - `https://docs.astro.build/en/reference/configuration-reference/` ✅
> - `https://docs.astro.build/en/guides/integrations-guide/cloudflare/` ✅
> - `https://docs.astro.build/en/reference/api-reference/` (render context — includes `prerender` / routing cross-links) ✅ — `#islands` anchor redirects to concepts/server-islands; verified via `/en/concepts/islands/` and `/en/guides/server-islands/`
> - `https://docs.astro.build/en/guides/prefetch/` ✅
> - Extended (islands/prerender/adapter/deploy): `/en/concepts/islands/`, `/en/guides/server-islands/`, `/en/guides/on-demand-rendering/`, `/en/reference/routing-reference/`, `/en/reference/directives-reference/`, `/en/guides/deploy/cloudflare/` ✅

## 0. Repo snapshot (ground truth for mapping)

| Repo path | Content | Verbatim |
|---|---|---|
| `apps/web/astro.config.mjs:12-13` | `output: 'static'` | `export default defineConfig({ output: 'static', site: 'https://ukbanglatigers.co.uk', ... adapter: cloudflare() })` |
| `apps/web/astro.config.mjs:28` | `adapter: cloudflare()` | `import cloudflare from '@astrojs/cloudflare'` + `adapter: cloudflare()` |
| `apps/web/src/pages/tina-island/[name].ts:1-5` | On-demand endpoint | `import { experimental_createIslandRoute } from '@tinacms/astro/experimental'; export const prerender = false; export const POST = experimental_createIslandRoute(islands);` |
| `apps/web/src/lib/tina/islands.ts:9-44` | Island registry | `export const islands = { hero: { fetch, component: HeroComponent, wrapper, propsFromData }, aboutSection: { ... } } satisfies Record<string, IslandConfig>` (uses `@tinacms/astro/experimental` `IslandConfig`, not core `server:defer`) |
| `wrangler.jsonc:35-43` (root) | Worker + assets mirroring | `"main": "./apps/web/dist/server/entry.mjs", "assets": { "binding": "ASSETS", "directory": "./apps/web/dist/client", "not_found_handling": "404-page" }, "compatibility_flags": ["nodejs_compat"]` |
| `apps/web/dist/server/wrangler.json` (adapter-generated) | Generated truth | `{"name":"ukbt-web","main":"entry.mjs","assets":{"binding":"ASSETS","directory":"../client"},...}` — relative to `dist/server/` |
| `scripts/check-deploy-mapping.mjs` | Mapping gate | Enforces root `wrangler.jsonc` `assets.directory` and `main` point at real build artifacts; fails if `assets.directory` lacks `index.html`/`404.html`/`_headers` or if `main` mismatches `dist/server/entry.mjs` |

---

## 1. `output: 'static'` — Claim / Source / Date / Repo impact / Confidence

| # | Claim (verbatim-adjacent, NOT invented) | Source | Date | Repo impact | Confidence |
|---|---|---|---|---|---|
| S-1 | `output` **Type:** `'static' \| 'server'` **Default:** `'static'`. `'static'` = "Prerender all your pages by default, outputting a completely static site **if none of your pages opt out of prerendering**." `'server'` = "Use server-side rendering (SSR) for all pages by default." | `https://docs.astro.build/en/reference/configuration-reference/#output` | 2026-09-18 | `apps/web/astro.config.mjs:13` `output: 'static'` is correct and intentional — all 15+ pages are prerendered except the single on-demand route. Validated by `check-deploy-mapping.mjs` workerRequired detection. Switching to `output: 'server'` NOT required. | **HIGH** — direct quote |
| S-2 | `adapter` **Type:** `AstroIntegration`. Import first-party adapters (`@astrojs/cloudflare`, netlify, node, vercel) and set `adapter: cloudflare()`. Doc example: `import cloudflare from '@astrojs/cloudflare'; export default defineConfig({ adapter: cloudflare() })` | `https://docs.astro.build/en/reference/configuration-reference/#adapter` + `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#manual-install` | 2026-09-18 | `apps/web/astro.config.mjs:5,28` matches doc pattern exactly. Adapter is ACTIVE even with `output: static` — required for islands/SSR features (see S-4). | **HIGH** — direct code block |
| S-3 | With `output: 'static'` you get a **static site** unless individual routes opt out. With `output: 'server'` you get on-demand by default and must `export const prerender = true` to opt back in. "Start with the default `'static'` mode until you are sure that **most or all** of your pages will be rendered on demand!" | `https://docs.astro.build/en/guides/on-demand-rendering/#server-mode` + `https://docs.astro.build/en/reference/configuration-reference/#output` + `https://docs.astro.build/en/reference/routing-reference/#switch-to-server-mode` | 2026-09-18 | Repo correctly stays `static` — only `tina-island/[name].ts` is dynamic (1 POST endpoint). No need to flip global mode; avoids unnecessary server rendering overhead. | **HIGH** |
| S-4 | **Adapter even for static sites when using server islands:** "You may also wish to add an adapter even if your site is entirely static... and **server islands require an adapter installed** to use `server:defer`." Same for Cloudflare adapter overview: "If you're using Astro as a static site builder, you don't need an adapter. Learn how to deploy..." vs on-demand/server islands sections requiring adapter. | `https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters` + `https://docs.astro.build/en/guides/server-islands/#server-island-components` ("With an adapter installed... add `server:defer`") | 2026-09-18 | Explains why `apps/web` keeps `@astrojs/cloudflare` despite `output: static`. Tina islands are the analogue of `server:defer` islands — both need the adapter's worker runtime. Removing adapter would break `tina-island/[name].ts`. | **HIGH** |

**Outcome for repo:** `output: static` + `adapter: cloudflare()` is the **documented, recommended** combination for "mostly static + one POST island endpoint." Confirmed against three independent doc pages (configuration-reference, on-demand-rendering, routing-reference). No contradicting claim found.

---

## 2. Prerender behaviour — `export const prerender = false`

| # | Claim | Source | Date | Repo impact | Confidence |
|---|---|---|---|---|---|
| P-1 | `prerender` **Type:** `boolean` **Default:** `true` in static mode (default); `false` with `output: 'server'`. Exported per-route to determine prerendering. "By default, all pages and endpoints are prerendered." Override with `export const prerender = false` for on-demand; override back with `export const prerender = true` in server mode. | `https://docs.astro.build/en/reference/routing-reference/#prerender` | 2026-09-18 | `apps/web/src/pages/tina-island/[name].ts:4` `export const prerender = false` is the **documented** opt-out. Applies to both `.astro` pages and `.js/.ts` endpoints — this `.ts` endpoint qualifies. | **HIGH** — exact type/default block |
| P-2 | Enabling on-demand requires **adapter installed first**, then per-page `export const prerender = false`. Example: `src/pages/page-rendered-on-demand.astro: --- export const prerender = false ---` and `src/pages/randomnumber.js: export const prerender = false; export async function GET() { ... }` | `https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering` | 2026-09-18 | `tina-island/[name].ts` follows the JS endpoint variant of the example. Repo's comment in `wrangler.jsonc:30-31` correctly notes this is the **exactly one** production on-demand route. | **HIGH** |
| P-3 | `prerender` export must be **statically identifiable**: `true` or `false` (or `import.meta.env.*`). Not dynamic. | `https://docs.astro.build/en/reference/routing-reference/#prerender` + `#partial` section note ("must be identifiable statically") — prerender follows same static analysis | 2026-09-18 | Repo uses literal `false` — compliant, statically analyzable by Astro/Vite. No env-gated prerender. | **HIGH** |
| P-4 | `src/pages/` supported file types include `.js/.ts` **as endpoints** — confirms a `.ts` file in `src/pages/` is a valid route/endpoint. | `https://docs.astro.build/en/basics/astro-pages/#supported-page-files` | 2026-09-18 | `src/pages/tina-island/[name].ts` as `src/pages/tina-island/[name].ts` is a file-based routed **endpoint** (POST) — documented, not ad-hoc. | **HIGH** |

**Outcome for repo:** `tina-island/[name].ts` opting out with `prerender = false` while the rest of the site stays prerendered is the canonical "hybrid static + on-demand" pattern documented across routing-reference and on-demand-rendering. No change required.

---

## 3. Islands — client islands, server islands, TinaIsland mapping

> **Critical distinction:** `TinaIsland` / `@tinacms/astro` `experimental_createIslandRoute` / `src/lib/tina/islands.ts` is **NOT** Astro core. Astro core islands are `client:*` (hydration) and `server:defer` (server islands). Tina's island mechanism is a CMS adapter that *reuses* the same architectural idea (on-demand POST endpoint for selective visual editing) but via Tina's own registry. This section verifies the **Astro** island primitives the Tina pattern mirrors.

| # | Claim | Source | Date | Repo impact | Confidence |
|---|---|---|---|---|---|
| I-1 | **Islands architecture:** "Islands Architecture... render HTML pages on the server, inject placeholders around highly dynamic regions that can then be hydrated on the client into small self-contained widgets, reusing their server-rendered initial HTML." Islands = interactive/content islands floating in static HTML. | `https://docs.astro.build/en/concepts/islands/#a-brief-history` + `https://docs.astro.build/en/concepts/islands/#what-is-an-island` | 2026-09-18 | Conceptual foundation for both `server:defer` and `TinaIsland`. Repo's editorial-vs-truth split (Tina = editorial islands only) aligns with "islands for personalized/dynamic regions." | **HIGH** |
| I-2 | **Client islands:** By default Astro renders UI to HTML & CSS **stripping all client-side JS**. Turning into interactive island requires `client:*` directive (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`). Example: `<MyReactComponent client:load />`. | `https://docs.astro.build/en/concepts/islands/#client-islands` + `https://docs.astro.build/en/reference/directives-reference/#client-directives` | 2026-09-18 | Repo uses **no** `client:*` islands for Tina — Tina editing uses server POST island route, not client hydration. Public pages without `<TinaIsland>` remain byte-identical to Tina-free build (per `AGENTS.md`). | **HIGH** |
| I-3 | **Server islands:** Add `server:defer` to any Astro component to turn it into its own server island. Requires **adapter installed**. Page renders immediately with `[fallback]` slot; then component's contents are fetched on the client via GET (encrypted props in URL query; POST if >2048 bytes) to a special route `/_server-islands/<Name>`. Each island fetches independently. Docs example: `<Avatar server:defer />` with `<GenericAvatar slot="fallback" />`. | `https://docs.astro.build/en/guides/server-islands/` (all sections) + `https://docs.astro.build/en/concepts/islands/#server-islands` + `https://docs.astro.build/en/reference/directives-reference/#serverdefer` | 2026-09-18 | Repo's `src/lib/tina/islands.ts` (`islands = { hero: { fetch, component, propsFromData }, aboutSection: ... }`) and `src/pages/tina-island/[name].ts` (`POST = experimental_createIslandRoute(islands)`) is the **Tina analog** of `server:defer` + `/_server-islands/` pattern — documented as TinaCMS approach, not Astro's built-in `/_server-islands/` URL. Both require adapter + `prerender = false` endpoint. Do NOT conflate: Tina's `[name].ts` serves Tina visual editing JSON, Astro's server islands serve HTML fragments. | **HIGH** — verbatim `server:defer` block + framework-components note |
| I-4 | **Server island props serializable constraint:** "Props provided to server island components must be **serializable**" — supported: plain object, number, string, Array, Map, Set, RegExp, Date, BigInt, URL, Uint8Array etc.; functions and circular refs NOT supported. Encrypted with key generated per build; reusable via `astro create-key` + `ASTRO_KEY` env for rolling deployments. | `https://docs.astro.build/en/guides/server-islands/#passing-props-to-server-islands` + `#caching` + `#reusing-the-encryption-key` | 2026-09-18 | `src/lib/tina/islands.ts:16-25,34-42` `propsFromData` returns plain objects with strings/labels — compliant subset. No functions/circular refs. Tina island `fetch` returns `tinaHomepage` JSON (serializable). | **HIGH** |
| I-5 | **Server island implementation detail:** At build, component content is swapped for small script; each `server:defer` island is split into special route which script fetches at runtime. "This rendering pattern was built to be portable — it does not depend on any server infrastructure." | `https://docs.astro.build/en/guides/server-islands/#how-it-works` | 2026-09-18 | Confirms adapter's worker entry (`dist/server/entry.mjs`) serves these special routes. For Tina, `experimental_createIslandRoute` creates the analogous `tina-island/[name]` POST handler — same need for `main` entry in `wrangler.jsonc`. | **HIGH** |

**TinaIsland repo mapping (explicit):**

- `src/lib/tina/islands.ts:1` `import type { IslandConfig } from '@tinacms/astro/experimental'` — Tina type, not `astro:config`. `apps/web/CLAUDE.md` correctly calls `@tinacms/astro` v0.7.0 integration `TinaIsland` component + island route at `src/pages/tina-island/[name].ts`. **No Astro official doc claims `TinaIsland`** — verified absence: docs search for `TinaIsland` returns zero hits (CMS integration, not core).
- `tina-island/[name].ts` using `experimental_createIslandRoute` + `prerender = false` + `POST` handler matches the **documented server-island pattern** structurally (on-demand endpoint backed by adapter), but implemented by TinaCMS, not `server:defer`. Keep them distinct in audits.
- `I-3` confidence HIGH for `server:defer` mechanism; **MEDIUM** for Tina→server:defer analogy (structural, not literal doc equivalence, stated explicitly here).

---

## 4. Cloudflare adapter — `@astrojs/cloudflare`, `dist/client` vs `dist/server/entry.mjs`, `wrangler.json` generation, `nodejs_compat`

| # | Claim | Source | Date | Repo impact | Confidence |
|---|---|---|---|---|---|
| C-1 | **Adapter purpose & version:** `@astrojs/cloudflare` v14.3.2 "allows Astro to deploy your **on-demand rendered routes and features** to Cloudflare, including **server islands, actions, sessions**." Install: `npm install @astrojs/cloudflare` + `import cloudflare from '@astrojs/cloudflare'; adapter: cloudflare()` | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#overview` (top: v14.3.2 badge) + `#manual-install` | 2026-09-18 | `apps/web/package.json:15` `"@astrojs/cloudflare": "^14.2.5"` compatible; `astro.config.mjs:5,28` matches doc. Repo's only on-demand feature is `tina-island` island route — covered by doc's "on-demand routes" scope. | **HIGH** |
| C-2 | **Static vs worker:** Deployment guide shows two Wrangler templates: **Static** = `{ name, compatibility_date, assets: { directory: "./dist" } }`; **On demand** = `{ main: "@astrojs/cloudflare/entrypoints/server", name, compatibility_date, compatibility_flags: ["nodejs_compat","global_fetch_strictly_public"], assets: { binding: "ASSETS", directory: "./dist" } }`. With adapter active and any on-demand route, **Worker `main` entry is required**. | `https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-with-wrangler` step 3 + `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#upgrading-to-v13-and-astro-6` → "Changed: Wrangler entrypoint configuration — previously `dist/_worker.js/index.js`, now single entrypoint `@astrojs/cloudflare/entrypoints/server`; update `wrangler.jsonc` `main` to new entrypoint." | 2026-09-18 | Root `wrangler.jsonc:38` `"main": "./apps/web/dist/server/entry.mjs"` **mirrors** doc's on-demand template. `dist/server/entry.mjs` exists on disk (verified), `dist/server/wrangler.json` (adapter-generated) has `"main":"entry.mjs","assets":{"directory":"../client"}` — both relative paths resolve identically. `scripts/check-deploy-mapping.mjs` derives this mapping. | **HIGH** |
| C-3 | **`dist/client` vs `dist/server/entry.mjs` layout:** Adapter docs + deployment guide: Cloudflare builds produce `dist/` split when adapter active. Upgrade notes confirm new unified entrypoint `@astrojs/cloudflare/entrypoints/server` and generated `dist/server/wrangler.json` pattern. Observed generated file has `assets.directory: "../client"` relative to `dist/server/` → repo-root absolute `./apps/web/dist/client` + `./apps/web/dist/server/entry.mjs`. `apps/web/CLAUDE.md` note: "it moves static output to `dist/client/` and emits the Worker entry at `dist/server/entry.mjs` — root `wrangler.jsonc` (`main` + `assets.directory`) must mirror that generated layout." | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#changed-wrangler-entrypoint-configuration` + `#changed-wrangler-configuration-file-is-now-optional` + `https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-with-wrangler` + observed `apps/web/dist/server/wrangler.json` (primary evidence) | 2026-09-18 | Root `wrangler.jsonc:39-42` exactly mirrors adapter-generated `dist/server/wrangler.json`. Previous assets-only `./apps/web/dist` (no `main`) caused 404s — documented incident 2026-09-15 in `wrangler.jsonc` comments and `CLAUDE.md`. Current mapping passes `check-deploy-mapping.mjs`. | **HIGH** for entrypoint change + **HIGH** for generated wrangler observation (MEASURED) |
| C-4 | **`wrangler.jsonc` generation & location:** "Astro will **automatically generate a default configuration**, using the `package.json` `name` field or the folder name as the Worker name. You can optionally create a **Wrangler configuration file**" (custom `wrangler.jsonc`) for bindings. "Wrangler configuration file is **now optional** for simple projects. If you don't have custom configuration, such as **Cloudflare bindings (KV, D1, Durable Objects, etc.)**, Astro handles this automatically." | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#manual-install` step 3 + `#changed-wrangler-configuration-file-is-now-optional` | 2026-09-18 | Repo **must** keep root `wrangler.jsonc` (not `apps/web/`) because: (a) needs KV binding `SESSION` `3435716ffa0e4616...` — custom binding triggers "create custom wrangler file" path; (b) Cloudflare Workers Builds runs from `/` and `wrangler` looks in cwd — `apps/web/wrangler.jsonc` requires `-c` flag dashboard does NOT pass (see `wrangler.jsonc:8-16` comments, build `55c1d854` root cause). Adapter-generated `dist/server/wrangler.json` alone is insufficient for root-deploy flow; root file mirrors it with **correct name** `ukbt-uk-bangla-tigers` (not generated `ukbt-web`). | **HIGH** |
| C-5 | **`nodejs_compat` flag:** "Cloudflare Workers support most Node.js runtime APIs through the `nodejs_compat` compatibility flag... Commonly used modules like `node:buffer`, `node:crypto`, `node:path` etc. To enable, add `compatibility_flags: ["nodejs_compat"]` to Wrangler config. Then use `node:*` import syntax." Also lists `global_fetch_strictly_public` companion flag in on-demand template. | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#nodejs-compatibility` + `https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-with-wrangler` (on-demand template) | 2026-09-18 | `wrangler.jsonc:37` `"compatibility_flags": ["nodejs_compat"]` matches doc. Repo does not currently import `node:*`, but flag is required for adapter's workerd runtime correctness and future Node API usage. `dist/server/wrangler.json` has `"compatibility_flags": []` (adapter default before root override) — root file's `["nodejs_compat"]` is the deployed truth; `check-deploy-mapping` does not gate on flags but security/compliance gates do. | **HIGH** |
| C-6 | **`prerenderEnvironment` & workerd preview:** `prerenderEnvironment: 'workerd' | 'node'` **Default:** `'workerd'` — controls runtime for prerendering static pages at build and dev. "By default, prerendered pages are built using Cloudflare's `workerd` runtime." Dev now uses `workerd` via Vite plugin (Astro 6, `@astrojs/cloudflare` v13+). Local preview = `astro preview`/`wrangler dev` running workerd, closely mirroring production. | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/#prerenderenvironment` + `#development-server-now-uses-workerd` + `#local-preview` | 2026-09-18 | Repo leaves `prerenderEnvironment` at default `workerd` (no override in `astro.config.mjs`) — compliant. No `node:fs` in prerendered pages, so default is correct. | **HIGH** |
| C-7 | **404 handling for Workers (static assets):** For Workers projects you must set `not_found_handling` to serve custom 404: `assets.not_found_handling: "404-page"` (routing behavior). | `https://docs.astro.build/en/guides/deploy/cloudflare/#_404-behavior` (cites `https://developers.cloudflare.com/workers/static-assets/#routing-behavior`) | 2026-09-18 | `wrangler.jsonc:42` `"not_found_handling": "404-page"` matches doc. Serves `apps/web/src/pages/404.astro` correctly at platform layer — previously masked by wrong `assets.directory`. | **HIGH** |

**Adaptor-generated `wrangler.json` (MEASURED, not doc-inferred):**

```json
// apps/web/dist/server/wrangler.json — written by `astro build` + @astrojs/cloudflare
{"main":"entry.mjs","assets":{"binding":"ASSETS","directory":"../client"},"name":"ukbt-web",...}
```

Root `wrangler.jsonc` mirroring (deployed truth):

```jsonc
{ "name":"ukbt-uk-bangla-tigers", "main":"./apps/web/dist/server/entry.mjs", "assets":{"binding":"ASSETS","directory":"./apps/web/dist/client","not_found_handling":"404-page"}, "compatibility_flags":["nodejs_compat"] }
```

Difference `ukbt-web` (generated, from `package.json` `name: @ukbt/web`) vs `ukbt-uk-bangla-tigers` (pre-provisioned dashboard Worker, per `wrangler.jsonc:32-34` + `contracts/DEPLOYMENT-CONTRACT.md` 2026-08-27 amendment) is **intentional and documented** — do NOT adopt generated name.

---

## 5. Prefetch (mandatory fetch, repo n/a but verified)

| # | Claim | Source | Date | Repo impact | Confidence |
|---|---|---|---|---|---|
| F-1 | Prefetch is **opt-in** via `prefetch` config: `prefetch: true` adds script to all pages; per-link `data-astro-prefetch` opts in, strategies `hover` (default), `tap`, `viewport`, `load`. `prefetchAll: true` prefetches all links. Programmatic `import { prefetch } from 'astro:prefetch'`. Uses `<link rel="prefetch">` or `fetch()` fallback. | `https://docs.astro.build/en/guides/prefetch/` + `https://docs.astro.build/en/reference/configuration-reference/#prefetch-options` | 2026-09-18 | No `prefetch` in `apps/web/astro.config.mjs` — correct, not used. Unrelated to islands. Verification included per task mandatory fetch list. | **HIGH** |

---

## 6. Summary verdict (do NOT invent)

| Theme | Official stance (docs.astro.build) | Repo | Gap? |
|---|---|---|---|
| **Static output** | `output: 'static'` (default) = prerender all; `output: 'server'` = SSR all. Hybrid via per-route `prerender`. Docs recommend staying `static` until most pages need SSR. | `astro.config.mjs:13` `output: 'static'` ✅ | None |
| **Adapter active with static** | Allowed & required for server islands / on-demand endpoints even in static mode. | `adapter: cloudflare()` active ✅ | None |
| **Prerender opt-out** | `export const prerender = false` (static-analyzable) per route; applies to `.astro` and `.js/.ts` endpoints. | `tina-island/[name].ts:4` ✅ `.ts` endpoint valid per `astro-pages` | None |
| **Islands** | `client:*` = hydration; `server:defer` = server island (adapter + special `/_server-islands/` route, serializable props, fallback slot). Tina `TinaIsland`/`islands.ts`/`tina-island/[name].ts` is CMS analog, not doc-listed `TinaIsland` — maps structurally, keep distinct. | `src/lib/tina/islands.ts` registry + `POST = experimental_createIslandRoute(islands)` ✅ | None — naming retained but documented as CMS layer |
| **Cloudflare Wrangler** | `wrangler.jsonc` auto-generated from `package.json` name; custom file optional unless bindings needed. New entrypoint `@astrojs/cloudflare/entrypoints/server` → `entry.mjs` with `assets: ../client`. Docs template: `main` + `assets.directory` + `compatibility_flags: ["nodejs_compat"]` + `not_found_handling: "404-page"` | Root `wrangler.jsonc` mirrors `dist/server/wrangler.json` with correct absolute paths + `nodejs_compat` + `404-page` + preserved Worker name `ukbt-uk-bangla-tigers` ✅ | None |
| **nodejs_compat** | Enable via `compatibility_flags: ["nodejs_compat"]` for `node:*` APIs in workerd. | Flag present ✅ | None |
| **Prefetch** | Opt-in `prefetch: true`; not required. | Not enabled (correct) | — |

**No required change.** The only critical correctness rule is **do not remove** `adapter: cloudflare()`, `tina-island/[name].ts` `prerender = false`, or root `wrangler.jsonc` mirroring — all are doc-backed and gated by `scripts/check-deploy-mapping.mjs`. The prior "remove adapter to simplify / move wrangler to `apps/web/`" ideas are **doc-contradicted**.

---

## 7. Source table (all mandatory)

| # | URL | Title (as fetched) | Retrieved | Verbatim sample |
|---|---|---|---|---|
| 1 | `https://docs.astro.build/en/basics/astro-pages/` | Pages | 2026-09-18 | "Pages are files that live in `src/pages/`... Supports `.astro`, `.md`, `.mdx`, `.html`, `.js/.ts` (as endpoints)" |
| 2 | `https://docs.astro.build/en/reference/configuration-reference/` | Configuration Reference | 2026-09-18 | "`output` Type: `'static' \| 'server'` Default: `'static'` — `'static'` Prerender all your pages..." / "`adapter` Type: `AstroIntegration` — Import cloudflare... `adapter: cloudflare()`" |
| 3 | `https://docs.astro.build/en/guides/integrations-guide/cloudflare/` | @astrojs/cloudflare | 2026-09-18 | "This adapter allows Astro to deploy your on-demand rendered routes... If you're using Astro as a static site builder, you don't need an adapter" / `compatibility_flags: ["nodejs_compat"]` / `prerenderEnvironment: 'workerd' | 'node'` |
| 4 | `https://docs.astro.build/en/reference/api-reference/` | Astro render context | 2026-09-18 | Context props (`params`, `cookies`, `Astro.request`, etc.) — prerender/islands routed via `routing-reference` + `server-islands` |
| 5 | `https://docs.astro.build/en/guides/prefetch/` | Prefetch | 2026-09-18 | "`prefetch: true` — A prefetch script will be added... `data-astro-prefetch` attribute..." |
| 6 | `https://docs.astro.build/en/concepts/islands/` | Islands architecture | 2026-09-18 | "Client islands... `client:load/idle/visible`... Server islands... `server:defer`..." |
| 7 | `https://docs.astro.build/en/guides/server-islands/` | Server islands | 2026-09-18 | "`<Avatar server:defer />`... Props must be serializable... retrieved via GET with encrypted string in URL query..." |
| 8 | `https://docs.astro.build/en/guides/on-demand-rendering/` | On-demand rendering | 2026-09-18 | "By default, your entire Astro site will be prerendered... `export const prerender = false`..." |
| 9 | `https://docs.astro.build/en/reference/routing-reference/` | Routing Reference | 2026-09-18 | "`prerender` Type: boolean Default: `true` in static mode; `false` with `output: 'server'`..." |
| 10 | `https://docs.astro.build/en/reference/directives-reference/` | Template directives reference | 2026-09-18 | "`server:defer` — The `server:defer` directive transforms the component into a server island..." |
| 11 | `https://docs.astro.build/en/guides/deploy/cloudflare/` | Deploy your Astro Site to Cloudflare | 2026-09-18 | "Create a Wrangler configuration file — Static: `assets.directory: ./dist` / On demand: `main: @astrojs/cloudflare/entrypoints/server` + `compatibility_flags: [nodejs_compat]`" |

> **No other hosts used.** All claims above are traceable to one of these 11 URLs. Anything not cited here was measured locally (`apps/web/dist/server/wrangler.json`, `wrangler.jsonc`, `astro.config.mjs`) and labeled MEASURED/REPO, not doc-claimed.

---

## 8. Verification notes

- `default.webfetch` truncates large pages (>70KB) — full bodies saved to `C:\Users\pithu\.local\share\opencode\tool-output\tool_*.txt`. Claims above cross-checked across multiple pages (e.g., `output` appears in both configuration-reference and on-demand-rendering; `prerender` in both routing-reference and on-demand-rendering) — consistent.
- Cloudflare adapter "no adapter needed for static" caveat does NOT contradict repo's use of adapter — on-demand island route makes it non-pure-static; same page documents `server islands require adapter`.
- `TinaIsland` string absent from all docs.astro.build pages fetched (including search of concept/island/server-island pages) — correctly attributed to `@tinacms/astro` experimental island route, not Astro docs.
- Dates are retrieval dates (2026-09-18). Docs pages are versioned to current (Astro 7.x, `@astrojs/cloudflare` v14.3.2 per badge). Do not cite as publication dates.
