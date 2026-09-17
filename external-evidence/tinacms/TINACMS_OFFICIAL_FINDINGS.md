# TinaCMS Official Findings — T2 Evidence Synthesized from https://tina.io/docs/ only

> **Classification:** T2 (Official Documentation Evidence)  
> **Retrieval Date:** 2026-09-18 (UTC)  
> **Fetch Method:** `default.webfetch` markdown extraction  
> **Evidence Scope:** Only `https://tina.io/docs/` and `https://tina.io/pricing` (pricing linked from docs). No blogs, forums, or inferred sources.  
> **Repo T1 cross-refs:** `tina/config.ts:9`, `tina/config.ts:22`, `package.json:18`, `.github/workflows/ci.yml:30-31`  
> **Note on failed fetches:** see § 9 — `llms.txt` discovery attempted for 404s.

All claims below are quoted or paraphrased with Source URL. No invention.

---

## 1) Token Model — `clientId` vs `TINA_TOKEN` vs `TINA_SEARCH_TOKEN` (`indexerToken`)

### Claim 1A: `clientId` is the TinaCloud project identifier; `token` is the read-only Content token
**Claim:** `defineConfig` field `clientId` (TinaCloud project ID) and `token` (read-only Content token) are both *Required for TinaCloud*. Content tokens provide read-only access to project content.
**Source:** https://tina.io/docs/reference/config — "clientId: The `clientId` from TinaCloud. Required for **TinaCloud**" ; "token: Your read only token from TinaCloud. Required for **TinaCloud**" + https://tina.io/docs/tinacloud/dashboard/projects — "Content tokens provide read-only access to your project's content. Search tokens provide write access to the TinaCloud search API." ; https://tina.io/docs/tinacloud/overview — "Ensure ClientId and Token are Passed to the Config" section.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:8-9` aligns: `clientId: process.env.PUBLIC_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || null` and `token: process.env.TINA_TOKEN || null`. Repo correctly separates public clientId from secret token. `ci.yml:30-31` correctly exposes `PUBLIC_TINA_CLIENT_ID` as `vars` (non-secret) and `TINA_TOKEN` as `secrets`. Consistent with model.
**Confidence:** High

### Claim 1B: `TINA_SEARCH_TOKEN` maps to `search.tina.indexerToken` — a distinct *write* token for search indexing
**Claim:** Search requires `search.tina.indexerToken` (string, REQUIRED when using TinaCloud search). It is obtained from dashboard Tokens tab and corresponds to `TINA_SEARCH_TOKEN` env var. Search tokens "allow clients to update the TinaCloud hosted search index."
**Source:** https://tina.io/docs/reference/search/overview — "The only required element ... is the `search.tina.indexerToken` field. This can be obtained from the TinaCloud dashboard for the project." ; https://tina.io/docs/tinacloud/dashboard/projects — "Search tokens provide write access to the TinaCloud search API" + Tokens Tab description ; https://tina.io/docs/reference/config — search.tina examples.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:22` aligns: `indexerToken: process.env.TINA_SEARCH_TOKEN || undefined`. Correct token-type separation. No conflation with `TINA_TOKEN`. If `TINA_SEARCH_TOKEN` unset, search config is undefined and indexing is skipped — matches `--skip-search-index` usage in `package.json:18`.
**Confidence:** High

### Claim 1C: Astro naming is `PUBLIC_TINA_CLIENT_ID`, Next naming is `NEXT_PUBLIC_TINA_CLIENT_ID`
**Claim:** For Astro deployments (Cloudflare Workers path), the build-time variable is `PUBLIC_TINA_CLIENT_ID` (Astro `PUBLIC_` prefix). For Next.js it is `NEXT_PUBLIC_TINA_CLIENT_ID`.
**Source:** https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers — " `PUBLIC_TINA_CLIENT_ID` is your client ID. Astro uses the `PUBLIC_` prefix, not Next.js's `NEXT_PUBLIC_`." + Next section lists `NEXT_PUBLIC_TINA_CLIENT_ID`; https://tina.io/docs/reference/config — Common Environment Variables table lists `NEXT_PUBLIC_TINA_CLIENT_ID`.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:8` handles both: `PUBLIC_TINA_CLIENT_ID || TINA_CLIENT_ID`. Repo is Astro-based (`apps/web` Astro + `output: static` with Cloudflare adapter), so `PUBLIC_` is correct. Using `NEXT_PUBLIC_` would be mismatched here; repo avoids that. `ci.yml:30` uses `PUBLIC_TINA_CLIENT_ID` — correct for Astro on Cloudflare Workers.
**Confidence:** High

---

## 2) Environment Variable Behaviour — `process.env.*` in `tina/config.ts`

### Claim 2A: `process.env.*` inside `tina/config.ts` is evaluated at build/dev time, not runtime
**Claim:** Branch, clientId, and token values passed via `process.env.*` in `defineConfig` are resolved when `tinacms dev` or `tinacms build` runs. Example repo configs show `branch: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || process.env.HEAD || ...` and docs note these are injected via host env.
**Source:** https://tina.io/docs/reference/config — `branch` field "The base branch to pull content from. Required for TinaCloud." + Environment Variables section ; https://tina.io/docs/tinacloud/overview — "Configuring the branch — ... most will provide an environment variable ... `NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF` ... `HEAD` is equivalent on Netlify" ; https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers — branch resolved from host git env vars `WORKERS_CI_BRANCH` / `CF_PAGES_BRANCH`.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:4` aligns with official pattern but extends chain: `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'`. This covers Cloudflare Workers Builds (`WORKERS_CI_BRANCH`), Pages (`CF_PAGES_BRANCH`), and manual `TINA_BRANCH`. Correctly fails-closed to `main`. No hard-coded branch.
**Confidence:** High

### Claim 2B: Only `.env` files are picked up by Tina build; `.env.local` variants are NOT loaded
**Claim:** "TinaCMS's build process only picks up variables from `.env` files. Variables defined in `.env.local`, `.env.development`, or other dotenv variants are **not** loaded by the TinaCMS build."
**Source:** https://tina.io/docs/reference/config — Environment Variables > `.env` File Support ; same note repeated at https://tina.io/docs/tinacloud/overview — "If you're loading ... TinaCMS's build process will only pickup `.env` files (not `.env.local` or `.env.development`)."
**Date:** 2026-09-18
**Repo impact:** Repo's `.env.example` should document `TINA_TOKEN`, `PUBLIC_TINA_CLIENT_ID`, `TINA_SEARCH_TOKEN` in plain `.env` for local dev. Developers using `.env.local` will see `null` clientId/token and silent fallback unless CI/host vars are set. Repo's `defineConfig` fallback to `null/undefined` correctly surfaces missing vars at build rather than masking.
**Confidence:** High

---

## 3) Build-Time Embedding — `tinacms build` Bakes Secrets into Admin Bundle

### Claim 3A: The admin is a statically built SPA; env vars are embedded at build time
**Claim:** "The TinaCMS admin is a **statically built SPA**. Environment variables are embedded into the admin's JavaScript at build time (during `tinacms build` or `tinacms dev`). They are not read at runtime. ... a variable must be present when the build runs — setting it afterwards has no effect."
**Source:** https://tina.io/docs/reference/config — Build-Time Embedding section ; https://tina.io/docs/tinacloud/overview — "The TinaCMS admin is a statically built SPA — environment variables are embedded into its JavaScript at build time... Any variable ... must: (1) use the `TINA_PUBLIC_` or `NEXT_PUBLIC_` prefix, and (2) be configured in hosting provider ... so it's available when `tinacms build` runs."
**Date:** 2026-09-18
**Repo impact:** `package.json:18` `tinacms build --skip-cloud-checks --skip-search-index` correctly precedes `astro build`. Secrets embedded are `TINA_TOKEN` (not exposed in admin JS — site-build-only) and `PUBLIC_TINA_CLIENT_ID` (public). Repo must ensure CI sets these *before* the `tinacms build` step — `ci.yml:30-31` does (`vars.PUBLIC_TINA_CLIENT_ID`, `secrets.TINA_TOKEN`). Post-build rotation requires rebuild. Matches docs.
**Confidence:** High

### Claim 3B: Only allow-listed prefixes are exposed in admin bundle
**Claim:** "For security, only a subset ... are included in the admin build." Allowed patterns: `TINA_PUBLIC_*`, `NEXT_PUBLIC_*`, `NODE_ENV`, `HEAD`. Any other `process.env` access inside admin (custom field components, `beforeSubmit`) will be `undefined`. Advisory references Feb 2023 security update.
**Source:** https://tina.io/docs/reference/config — Admin-Exposed Variables table + quoted paragraph ; https://tina.io/docs/tinacloud/overview — same allowlist note referencing Feb 2023 advisory.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:8-9` uses `PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` inside config (not admin-side code). `TINA_TOKEN` is documented as "Site build only — not exposed in admin" — repo correctly does not use `TINA_PUBLIC_` prefix for it. If custom field components need secrets, they must be `TINA_PUBLIC_*` and still get embedded at build — repo should avoid leaking `TINA_TOKEN` via admin code.
**Confidence:** High

### Claim 3C: Cloudflare Workers build-time vars are baked into generated client; no runtime vars needed (except SSR case)
**Claim:** "`tinacms build` needs TinaCloud credentials at build time ... Add them wherever you build: for git-based builds, under Worker's Settings | Build | Variables and Secrets ... These are build-time only. `tinacms build` bakes the client ID and token into the generated client, so there's nothing to add again as a runtime variable."
**Source:** https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers — Environment variables section (Astro + Next sections).
**Date:** 2026-09-18
**Repo impact:** Repo's Workers deployment via `wrangler.jsonc` + git-connected Workers Builds must set build vars (`PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_SEARCH_TOKEN` if search enabled) under Build Variables. Runtime vars not needed unless OpenNext SSR reads them at request time — not applicable to `output: static` Astro site but relevant if `output: server` for TinaIsland islands.
**Confidence:** High

---

## 4) Admin SPA Behaviour — `public/admin` Generation

### Claim 4A: `tinacms build` generates admin at `/admin/index.html` (configured via `build.outputFolder` / `publicFolder`)
**Claim:** Tina creates a static admin build accessible at `/admin/index.html`. Docs show "This (and the editor) can be accessed at the `/admin/index.html` route" and "update your deployment configuration so TinaCMS admin gets built alongside your site ... through `<your-site>/admin`." Config ref defines `build.outputFolder` and `build.publicFolder`.
**Source:** https://tina.io/docs/using-tina-editor — Accessing the CMS section ; https://tina.io/docs/tinacloud/overview — Deploying your site (with the TinaCMS admin) ; https://tina.io/docs/reference/config — `build` Options section (example shows `outputFolder: 'admin', publicFolder: 'public'`) ; https://tina.io/docs/frameworks/astro — "admin lives at `http://localhost:4321/admin/index.html`".
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:10-13` sets `build.outputFolder: 'admin'` and `publicFolder: 'apps/web/public'` — aligns. Output lands at `apps/web/public/admin` then shipped via Astro static assets / Cloudflare Worker assets. `apps/web` e2e `visual-and-accessibility` job runs `tinacms build --skip-cloud-checks --skip-search-index` before `test:e2e` to ensure `public/admin` exists — matches docs requirement. Misalignment would be `outputFolder` outside `publicFolder`.
**Confidence:** High

### Claim 4B: Dev admin is at `localhost:4321/admin/index.html` for Astro (or host port), prod at site origin `/admin`
**Claim:** Astro starter admin reachable at `http://localhost:4321/admin/index.html` in dev; TinaCloud Site URL(s) must include allowed origins.
**Source:** https://tina.io/docs/frameworks/astro — Running TinaCMS section ; https://tina.io/docs/tinacloud/dashboard/projects — Site URL(s) section.
**Date:** 2026-09-18
**Repo impact:** Repo's `apps/web` Astro dev server (`pnpm dev` → `astro dev` wrapped by `tinacms dev -c`) exposes admin at same path. Site URL config in TinaCloud project must allowlist both `http://localhost:4321` and production `https://ukbanglatigers.co.uk` (or current prod domain). Not a code file but deployment config.
**Confidence:** High

---

## 5) Visual Editing Requirements — `data-tina-field` (`tinaField()`), `TinaIsland`, Islands

### Claim 5A: Click-to-edit requires `data-tina-field` stamped via `tinaField()` helper; must be on HTML elements
**Claim:** "We can implement this with the `data-tina-field` API" — `tinaField()` returns string identifying form field; stamped as `data-tina-field={tinaField(object, 'fieldName')}` on HTML elements (not React components like `TinaMarkdown`). Works with `_content_source` metadata injected in edit mode via `useTina` (React) or `requestWithMetadata()` (Astro).
**Source:** https://tina.io/docs/contextual-editing/tinafield — The Click-To-Edit API (Basic Usage, Custom Components sections) ; https://tina.io/docs/contextual-editing/astro — Add field-level click-to-edit section ("`tinaField()` returns a string ... Stamp it on any element you want clickable").
**Date:** 2026-09-18
**Repo impact:** Repo uses `@tinacms/astro` pattern, not React `useTina`. `tinaField()` helpers imported from `@tinacms/astro/tina-field` (or re-export). Pages must stamp `data-tina-field` on editable DOM nodes after wrapping query result with `requestWithMetadata()`. Without this, visual editing overlay cannot focus fields. Repo loaders at `apps/web/src/lib/tina/loaders.ts` should pipe through `requestWithMetadata()` and components should call `tinaField()`.
**Confidence:** High

### Claim 5B: Astro islands require `TinaIsland`, island registry, and `tina-island/[name].ts` endpoint (`prerender = false` + SSR adapter)
**Claim:** Astro visual editing does NOT use `useTina()`. Instead: (1) `tina()` integration in `astro.config.mjs` + SSR adapter + `output: 'server'` (simplest) or `output: 'static'` with wrapper, (2) data loaders wrap queries with `requestWithMetadata()`, (3) island registry maps region → fetcher/component/wrapper, (4) one generic route `src/pages/tina-island/[name].ts` with `export const prerender = false` via `experimental_createIslandRoute(islands)`, (5) page wraps region with `<TinaIsland name wrapper [primary]>` and bridge re-renders via POST on each keystroke. Production without admin parent: middleware injects nothing, HTML byte-identical to Tina-free build (except one-line bootstrap on `TinaIsland` pages when `output: static`).
**Source:** https://tina.io/docs/contextual-editing/astro — entire page (Install, Wire the integration, Data loaders, Island registry, Per-island endpoint, Use editable regions, Static-site editing sections) ; https://tina.io/docs/frameworks/astro — Enabling Visual Editing + Make existing pages editable + Project Structure.
**Date:** 2026-09-18
**Repo impact:** Repo docs (`docs/tina-integration.md`, `AGENTS.md` overview) describe exactly this architecture: `tina()` in `astro.config.mjs`, `TinaIsland` component, `data-tina-field`, `src/pages/tina-island/[name].ts`. Loading pattern at `apps/web/src/lib/tina/islands.ts` must match registry shape; missing `prerender = false` or missing SSR adapter breaks per-island POST refresh. Verified `AGENTS.md` mentions `@astrojs/cloudflare` is production dependency for this reason. Correct.
**Confidence:** High

### Claim 5C: Bridge is at `/admin/bridge.js` (staged by `tina()` integration); visual editing needs SSR adapter for `/tina-island/*` route
**Claim:** "`tina()` ... stages the vanilla-JS bridge as static asset at `/admin/bridge.js`" ; "You need an SSR adapter. The per-island refresh endpoint (`/tina-island/[name]`) runs at request time on every keystroke. Set `adapter` ... `@astrojs/node` / `@astrojs/vercel` / `@astrojs/netlify` / `@astrojs/cloudflare`."
**Source:** https://tina.io/docs/contextual-editing/astro — Wire the integration section ; https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers — Check visual editing section ("... exercises the on-demand `/tina-island/*` route running inside the Worker. If it errors, confirm `nodejs_compat` is set.") ; https://tina.io/docs/frameworks/astro — same.
**Date:** 2026-09-18
**Repo impact:** Repo's `wrangler.jsonc` must enable `nodejs_compat` for `node:async_hooks` used by island route. The adapter-generated route requires Cloudflare adapter — `@astrojs/cloudflare` present in `apps/web/package.json` satisfies. Bridge path `/admin/bridge.js` must not be blocked by CSP or asset handling.
**Confidence:** High

---

## 6) TinaCloud Free Plan Limitations — 2 Users, 100MB, No Editorial Workflow

### Claim 6A: Free plan is 2 users, 2 roles, 1 project, 100MB asset cap
**Claim:** Pricing page lists Free tier: "Includes 2 users, 2 roles, and community support." Plan comparison table: Free row shows 2 included users, user limit 2, 2 roles, 1 project (inferred from Team listing 1 Project and Free listing truncated but consistent across docs), Asset Size cap 100 MB.
**Source:** https://tina.io/pricing — Plans & Pricing section + Plan Comparison table (Free $0 Forever row: 2 users, 2 roles, Asset Size cap 100 MB). `llms.txt` also frames TinaCloud as hosted service with free tier.
**Date:** 2026-09-18
**Repo impact:** Repo's `docs/tina-integration.md` / `AGENTS.md` correctly notes Free plan: "2 users, 2 roles, 1 project, 100MB assets" — matches official pricing. No overstatement of limits. Must enforce 2-user expectation in operational docs. Attempting 3rd editor will require plan upgrade.
**Confidence:** High (Medium for 1-project count — table truncated in extracted markdown but strongly implied by per-project billing unit and starter behavior; cross-checked with dashboard docs "1 project" in Team context).

### Claim 6B: Editorial Workflow is NOT included on Free plan; requires Business/Enterprise (or Team Plus+ in current pricing)
**Claim:** Docs state "The Editorial Workflow feature is available on select paid plans." Add-branch page notes "> For a more advanced branching and Pull-Request workflow, checkout TinaCloud's Editorial Workflow (only available on Business and Enterprise plans)." Pricing Plan Comparison: Editorial Workflow column shows X for Free/Team/Team Plus, check for Business/Enterprise (with "AI Features Coming Soon"). Drafts docs also scope editorial workflow to paid.
**Source:** https://tina.io/docs/drafts/editorial-workflow — header banner "> The Editorial Workflow feature is available on select paid plans." ; https://tina.io/docs/tinacloud/branching — callout about Editorial Workflow only on Business/Enterprise ; https://tina.io/pricing — Plan Comparison row Editorial Workflow (only Business+Enterprise checked) ; https://tina.io/docs/tinacloud/dashboard/projects — no editorial workflow on free project setup.
**Date:** 2026-09-18
**Repo impact:** Repo correctly states Free: "NO editorial workflow" (`AGENTS.md` line "Free plan: 2 users, 2 roles, 1 project, 100MB assets, NO editorial workflow"). Saves directly to protected branch (`main`) without draft PRs — repo must protect `main` via rulesets allowing TinaCloud app bypass or accept direct commits. No branching UI expected on Free.
**Confidence:** High

---

## 7) Search Requirements — When `TINA_SEARCH_TOKEN` Needed, `--skip-search-index` Effect

### Claim 7A: Search requires `search.tina.indexerToken`; without it search indexing is skipped
**Claim:** "The only required element ... when using TinaCloud search is `search.tina.indexerToken` ... This can be obtained from the TinaCloud dashboard." And "Search is not currently supported in self-hosted TinaCMS."
**Source:** https://tina.io/docs/reference/search/overview — Configuration section ; https://tina.io/docs/tinacloud/dashboard/projects — Tokens Tab types.
**Date:** 2026-09-18
**Repo impact:** `tina/config.ts:20-27` sets `search.tina.indexerToken: process.env.TINA_SEARCH_TOKEN || undefined`. If undefined, Tina build will not attempt search indexing — aligns. If team wants search, must provision search token in TinaCloud and set env. Otherwise field-level `searchable` flags irrelevant.
**Confidence:** High

### Claim 7B: Production build auto-creates and uploads search index per branch; dev auto-indexes locally on changes
**Claim:** "When search is configured and site is being built for production using `build` command, the search index will be automatically created and uploaded to TinaCloud. Each Git branch has a separate search index." "When ... running locally with `dev` ... content will be automatically indexed at startup. Any changes to local content will also trigger updates to the (local) search index."
**Source:** https://tina.io/docs/reference/search/overview — Building the search index > Production / Development sections.
**Date:** 2026-09-18
**Repo impact:** With `TINA_SEARCH_TOKEN` set, `pnpm run build` would by default index. Repo's `package.json:18` passes `--skip-search-index` (alias `--skip-search-indexing` per CLI docs) to deliberately skip indexing at main build time, deferring to `tinacms search-index` separately. This matches docs: "Building the search index can be skipped by passing the `--skip-search-index` cli option ... Then the `search-index` command can be run separately."
**Confidence:** High

### Claim 7C: `--skip-search-index` (`--skip-search-indexing`) skips indexing; `tinacms search-index` can run separately
**Claim:** CLI `tinacms build` option `--skip-search-indexing` (alias `--skip-search-index`) disables automatic search index build/upload. Alternative command `tinacms search-index` builds and uploads index independently. Docs also note `--content=local` implicitly skips search indexing.
**Source:** https://tina.io/docs/reference/search/overview — Production note about `--skip-search-index` + separate `search-index` command ; https://tina.io/docs/cli-overview — `tinacms build` Options (`--skip-search-indexing`) + `tinacms search-index` section ; https://tina.io/docs/reference/config — referenced in build-time note.
**Date:** 2026-09-18
**Repo impact:** `package.json:18` uses `tinacms build --skip-cloud-checks --skip-search-index`. This is intentional per repo performance: repo notes search not required for initial editorial layer. If search needed later, remove flag or run `npx tinacms search-index` post-deploy. Current usage is valid and documented.
**Confidence:** High

---

## 8) Git-Backed Workflow — Commit on Save

### Claim 8A: TinaCloud is Git-backed; saves commit directly to GitHub branch and trigger redeploy
**Claim:** "TinaCloud provides ... Git integration ... The Data Layer is synced with GitHub ... Any changes saved by editors will be committed to the configured branch in GitHub ... The save button adds any changes into your content files." + Workers deployment: "After a deploy, open `/admin` ... edit a post, and save. The save commits to GitHub, which triggers a redeploy."
**Source:** https://tina.io/docs/tinacloud — What is TinaCloud (Git integration) + Data Layer paragraph ; https://tina.io/docs/introduction/faq — Prod Mode "Any changes that are saved by your editors will be committed to the configured branch in your GitHub repository." ; https://tina.io/docs/using-tina-editor — Making Changes ("The **save** button adds any changes into your content files.") ; https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers — Check visual editing section ; https://tina.io/docs/tinacloud/troubleshooting — branch indexing & GitHub app commit behavior.
**Date:** 2026-09-18
**Repo impact:** Repo's `tina/config.ts:4` branch resolution (`WORKERS_CI_BRANCH` / `CF_PAGES_BRANCH` / `GITHUB_BRANCH`) ensures save targets the branch being built/deployed. Without it, preview deploys would edit `main`. Workers Builds redeploys on GitHub push — matches "git-backed" editorial path. Branch protection must allow TinaCloud app to commit or use Editorial Workflow (unavailable on Free) — hence repo needs branch rulesets bypass for app. Commit author is TinaCloud app unless Git co-authoring enabled (`tina.io/docs/tinacloud/git-co-authoring`).
**Confidence:** High

### Claim 8B: `tina/tina-lock.json` must be committed for TinaCloud indexing; not generated by build alone
**Claim:** Prerequisites: "Make sure ... all changes are pushed (including `tina/tina-lock.json`). This file is generated by running `tinacms dev` locally — it must be committed and pushed for TinaCloud to index your content." Troubleshooting: "`The specified branch ... has not been indexed` — ensure `tina/tina-lock.json` exists and is committed ... generated when you run `tinacms dev` locally — it is **not** generated by `tinacms build` alone."
**Source:** https://tina.io/docs/tinacloud/overview — Prerequisites ; https://tina.io/docs/tinacloud/troubleshooting — How to resolve errors caused by unindexed branches.
**Date:** 2026-09-18
**Repo impact:** Repo should ensure `tina/tina-lock.json` is tracked (not gitignored) and committed. Missing file causes Data Layer sync failures and "Unable to find record" or branch not indexed errors. Repo's `tina/config.ts` generation path must keep this in sync.
**Confidence:** High

---

## 9) Fetch Coverage & 404 Handling (llms.txt Discovery)

### Mandatory URLs — Status
| URL | Status | Note |
|-----|--------|------|
| https://tina.io/docs/reference/config | 200 — fetched | Core Evidence for build/env/token model |
| https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers | 200 — fetched | Astro Cloudflare build vars, branch handling |
| https://tina.io/docs/reference/search/overview | 200 — fetched | Search indexerToken + skip flag |
| https://tina.io/docs/tinacloud/dashboard/projects | 200 — fetched | Tokens tab (Content vs Search), project setup |
| https://tina.io/docs/tinacloud/overview | 200 — fetched | Going to Production, env embedding |

### Supplemental Fetches — Status
| URL | Status | Use |
|-----|--------|-----|
| https://tina.io/docs/contextual-editing/overview | 200 | Visual editing intro |
| https://tina.io/docs/contextual-editing/react | 200 | useTina hook contrast |
| https://tina.io/docs/contextual-editing/astro | 200 | Astro islands architecture (authoritative for repo) |
| https://tina.io/docs/frameworks/astro | 200 | Astro setup, tina() integration |
| https://tina.io/docs/contextual-editing/tinafield | 200 | data-tina-field API |
| https://tina.io/docs/features/data-fetching | 200 | Content API overview |
| https://tina.io/pricing | 200 | Free plan 2 users/100MB/no workflow |
| https://tina.io/docs/cli-overview | 200 | --skip-search-indexing, search-index command |
| https://tina.io/docs/drafts/editorial-workflow | 200 | Editorial workflow paid-only |
| https://tina.io/docs/using-tina-editor | 200 | /admin/index.html SPA, save-to-Git |
| https://tina.io/docs/tinacloud/troubleshooting | 200 | Git-backed commit & lock file |
| https://tina.io/llms.txt | 200 | Index discovery |
| https://tina.io/docs/tinacloud | 200 | TinaCloud overview |
| https://tina.io/docs/introduction/faq | 200 | Prod vs local mode, GitHub-backed saves |
| https://tina.io/docs/tinacloud/branching | 200 | Branch switching vs editorial workflow |
| https://tina.io/docs/tinacloud/pricing | 404 | Not a valid docs path — pricing lives at `/pricing` |
| https://tina.io/docs/editorial-workflow | 404 | Canonical is `/docs/drafts/editorial-workflow` (fallback used) |
| https://tina.io/docs/reference/content-api-overview | 404 | Canonical is `/docs/features/data-fetching` (fallback used) |
| https://tina.io/docs/advanced/data-tina-field | 404 | Canonical is `/docs/contextual-editing/tinafield` (fallback used) |
| https://tina.io/docs/r/cloud-config | 404 | Not present — covered via `/docs/reference/config` |
| https://tina.io/blog/hugo-tina-astro | 404 | Not relevant — Astro guide used instead |

**Discovery via `llms.txt`:** Fetched `https://tina.io/llms.txt` (200) to enumerate authoritative doc paths. Canonical paths for visual editing and editorial workflow were located there and refetched successfully. No claims rely on 404 URLs — each has a 200 fallback noted above.

---

## 10) Summary Alignment Table

| Repo File | Repo Value | Official Requirement | Verdict |
|-----------|------------|----------------------|---------|
| `tina/config.ts:4` branch | `TINA_BRANCH \|\| GITHUB_BRANCH \|\| WORKERS_CI_BRANCH \|\| CF_PAGES_BRANCH \|\| 'main'` | Branch required for TinaCloud; Cloudflare uses `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH`, Vercel `NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF`, Netlify `HEAD` | **Aligned** — superset chain covers Cloudflare Workers correctly |
| `tina/config.ts:8` clientId | `PUBLIC_TINA_CLIENT_ID \|\| TINA_CLIENT_ID` | Astro uses `PUBLIC_TINA_CLIENT_ID`, Next uses `NEXT_PUBLIC_TINA_CLIENT_ID` | **Aligned** — correct prefix for Astro |
| `tina/config.ts:9` token | `TINA_TOKEN` (read-only content token) | `token` read-only content token from dashboard | **Aligned** |
| `tina/config.ts:22` indexerToken | `TINA_SEARCH_TOKEN` | `search.tina.indexerToken` write token for search | **Aligned** — optional, correctly undefined when absent |
| `package.json:18` build flags | `tinacms build --skip-cloud-checks --skip-search-index` | `--skip-cloud-checks` skips TinaCloud checks ; `--skip-search-index` skips search indexing (then `search-index` separately) | **Aligned** — valid per CLI docs |
| `ci.yml:30-31` env wiring | `PUBLIC_TINA_CLIENT_ID: vars...` + `TINA_TOKEN: secrets...` | ClientId public var, Token secret; both required at build time (`tinacms build` bakes them) ; Cloudflare Workers build vars needed | **Aligned** |
| `tina/config.ts:10-13` build | `outputFolder: 'admin'`, `publicFolder: 'apps/web/public'` | Admin is static SPA at `/admin/index.html` built alongside site | **Aligned** |
| Visual editing (islands) | `@tinacms/astro` + `TinaIsland` + `data-tina-field` + `tina-island/[name].ts` + `nodejs_compat` | Astro requires `tina()` integration, SSR adapter, `requestWithMetadata()`, island registry, `tinaField()` stamping | **Aligned per AGENTS.md/docs/tina-integration.md** — implementation to be verified T1 |

---

## 11) Open / Unresolved (Do NOT Invent)

- Asset cap 100 MB is confirmed from pricing table; per-project repo count for Free inferred but not verbatim in fetched pricing markdown snippet — marked Medium confidence above.
- Exact file path for search index storage and retention period not documented in fetched pages — not claimed.
- Self-hosted search not supported (FAQ §6) — noted but not conflated with TinaCloud search.

---

*Evidence class T2 — all claims traceable to URLs above retrieved 2026-09-18. T1 repo citations are cross-references only, not evidence for doc claims.*
