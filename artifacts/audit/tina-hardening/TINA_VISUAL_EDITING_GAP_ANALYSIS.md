# TINA_VISUAL_EDITING_GAP_ANALYSIS — 2026-09-17

> Base: `0d2a91ff55efd12578357f97c874f3fd95cf7d5d` (HEAD after Task 3) — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: `artifacts/audit/tina-hardening/CURRENT_STATE.md` appendix VERIFIED greps + `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` + `artifacts/audit/tina-hardening/CHANGE_LOG.md` (§0 BLUF — free-tier sufficient) + installed `@tinacms/astro@0.7.0` docs `/contextual-editing/astro` `/migrations/astro-react-free-visual-editing` + local reads of `apps/web/src/lib/tina/*`, `apps/web/src/pages/*`, `apps/web/src/components/*`, `tina/__generated__/client.ts`, `apps/web/astro.config.mjs`, `wrangler.jsonc`, `tina/config.ts`
> Evidence classes: **VERIFIED** (file + command output pasted) / **FACT** (file line exists) / **OBSERVED** (dashboard/screenshot) / **UNKNOWN** (not retrievable — never upgraded) — per `knowledge/04-EVIDENCE-POLICY.yaml`
> Scope: **gap analysis only — no code changes** (per `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 4). No file outside this `*.md` was modified.
> Zero-React invariant: visual editing in Astro is **React-free** — no `useTina()`, no `useEditState()`, no `react`/`react-dom` import. The `TinaIsland` Astro component + `requestWithMetadata` + `tinaField()` bridge are the only docs-prescribed APIs (see §2).

---

## 1. Capability matrix — VERIFIED per file:line + grep outputs

Reproduced from `CURRENT_STATE.md` P1-3 and re-verified this task against HEAD `0d2a91f` (Task 3 fixes applied: `tina/config.ts:4` branch chain, `wrangler.jsonc:37` `nodejs_compat`, `.env.example:11-14` `PUBLIC_TINA_ADMIN_ORIGIN=`).

| Capability | Status | Evidence (file:line + grep output) |
|---|---|---|
| **Login** | **VERIFIED** (human) | TinaCloud dashboard shows 3/4 checklist complete; human login works — `CURRENT_STATE.md:12` records as UNKNOWN locally but OBSERVED per fixing plan; **not locally re-verified** (requires HITL / `TINA_HITL_RUNBOOK.md`). Admin served at `/admin` via `tinacms build --skip-cloud-checks` (`package.json:18`) + `apps/web/public/admin/` gitignored (`.gitignore:9,12`) — **FACT** (`tina/config.ts:10-13` `build.outputFolder: 'admin'`, `publicFolder: 'apps/web/public'`). |
| **Sidebar edit** | **OBSERVED → VERIFIED for schema, NOT CONNECTED for UI wiring** | Schema exists: `tina/config.ts:28-314` 4 collections (`homepage`, `about`, `faq`, `siteSettings`) — **FACT**. Loaders parse them via imports (`apps/web/src/lib/tina/loaders.ts:1-82`), but **no TinaIsland wiring** (see next row). `apps/web/src/lib/tina/islands.ts:9-43` registry `hero` + `aboutSection` fetches `tinaHomepage` directly (`islands.ts:12` / `islands.ts:30`) — **FACT** `Get-Content islands.ts` above. This is the *island registry shape*, but it is **unwired** — no page calls `requestWithMetadata`, no page renders `<TinaIsland>` (see §1.1). |
| **Click edit** | **NOT CONNECTED** | Zero `requestWithMetadata`, zero `TinaIsland`, zero `tinaField()` import in `apps/web/src` — **VERIFIED** (see §1.1 grep). Only hand-stamped string literals `data-tina-field="…"` plus prop aliases `tinaField` as string pass-through — **not** `tinaField()` from `@tinacms/astro/tina-field` (see §1.2). Without `TinaIsland` + `tinaField()` overlay, contextual click-to-edit cannot function. |
| **Preview (overlay / visual refresh)** | **NOT CONNECTED** | Loaders parse static JSON directly, not via generated client — **VERIFIED** `apps/web/src/lib/tina/loaders.ts:2-8` imports `four JSON` via `with { type: 'json' }` + `apps/web/src/lib/tina/loaders.ts:80-82` `Zod parse` — **FACT** (see read `loaders.ts:1-82`). Zero `requestWithMetadata` / `client.queries.*` usage anywhere in `apps/web/src` (see §1.1). Preview requires the `requestWithMetadata → _content_source` metadata that `TinaIsland`'s `experimental_createIslandRoute` POST handler injects — absent. Middleware does inject `/admin/bridge.js` (see §2.1) but has nothing to overlay because pages never call `requestWithMetadata`. |
| **Save** | **UNKNOWN until HITL** | Requires human proof: `TinaCloud → Save → GitHub `main` commit + Cloudflare rebuild`. Blocked on `TINA_HITL_RUNBOOK.md` (Task 6) + `SESSION` KV pin blocker (`CHANGE_LOG.md §3` — `wrangler.jsonc` still has no `kv_namespaces`; second save would hit Workers `10014` duplicate-namespace error). **Never upgraded to FACT** — stays **UNKNOWN** per evidence policy. |
| **Commit** | **UNKNOWN until HITL** | Same as Save — commit SHA + redeploy log retrievable only via headed browser HITL (`playwright ask` per `knowledge/09-AGENT-HARNESS-POLICY.yaml`). Free-tier path is **pricing-sufficient** (`CHANGE_LOG.md §0` — KV free 1k writes/day covers editorial commits; not a blocker). **UNKNOWN** retained. |

### 1.1 VERIFIED grep — `requestWithMetadata` / `TinaIsland` / `tinaField()` import: absent in `apps/web/src`

PowerShell (run 2026-09-17, worktree `C:\UKBT\ukbt-tina-hardening` at `0d2a91f`):

```
Get-ChildItem -Recurse -Path "apps/web/src" -Include "*.ts","*.astro","*.js" |
  Select-String -Pattern "requestWithMetadata|TinaIsland|tinaField|useTina|useEditState|experimental_createIslandRoute|createClient"
```

Output — **VERIFIED** entry set:

```
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\AboutStory.astro:21: const { paragraphs, stats, 'data-tina-field': tinaField } = Astro.props;
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\AboutStory.astro:41: <div class="ukbt-story__paragraphs" {...tinaField ? { 'data-tina-field': tinaField } : {}}>
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\LeadershipGrid.astro:29: const { leaders, intro, 'data-tina-field': tinaField } = Astro.props;
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\LeadershipGrid.astro:61: <p {...tinaField ? { 'data-tina-field': tinaField } : {}}>{intro}</p>
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\PageBanner.astro:36: const { title, crumbs, lede, background, 'data-tina-field': tinaField } = Astro.props;
C:\UKBT\ukbt-tina-hardening\apps\web\src\components\PageBanner.astro:55: {lede && <p class="ukbt-page-banner__lede" {...tinaField ? { 'data-tina-field': tinaField } : {}}>{lede}</p>}
C:\UKBT\ukbt-tina-hardening\apps\web\src\pages\tina-island\[name].ts:1: import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
C:\UKBT\ukbt-tina-hardening\apps\web\src\pages\tina-island\[name].ts:5: export const POST = experimental_createIslandRoute(islands);
```

Interpretation — **VERIFIED**:

- `requestWithMetadata` — **0 hits** in `apps/web/src` (only in `node_modules/@tinacms/astro` + `dist/server/chunks` — expected library location, not app wiring).
- `TinaIsland` — **0 hits** in `apps/web/src` (`Count TinaIsland = 0` this task). Matches `CURRENT_STATE.md` appendix B `grep -r TinaIsland → 0`.
- `tinaField()` (import) — **0 hits**; the name `tinaField` appears only as prop-alias ` 'data-tina-field': tinaField` in `AboutStory.astro:21`, `LeadershipGrid.astro:29`, `PageBanner.astro:36` — a local string pass-through, not `import { tinaField } from 'tinacms/dist/toolkit'` / `@tinacms/astro`.
- `useTina` / `useEditState` — **0 hits** (required: React-free; must never appear).
- `experimental_createIslandRoute` — **1 file only** (`apps/web/src/pages/tina-island/[name].ts:1,5`). Route scaffolding is present; page wiring to it is absent.
- `createClient` — not in `apps/web/src`; only in generated `tina/__generated__/client.ts:1` (expected).

A second negative check — `Select-String -Pattern "TinaIsland"` across `apps/web/src` alone returns `Measure-Object.Count = 0` — **VERIFIED** (paste in this §'s command). This reproduces `CURRENT_STATE.md` appendix B's second grep byte-for-byte at the new base.

### 1.2 Hand-stamped `data-tina-field` strings — present but NOT wired (prop-alias, not bridge metadata)

PowerShell:

```
Get-ChildItem -Recurse -Path "apps/web/src" -Include "*.ts","*.astro","*.js" |
  Select-String -Pattern "data-tina-field"
```

Output — **VERIFIED** (14 lines):

```
apps\web\src\components\AboutStory.astro:19: 'data-tina-field'?: string;
apps\web\src\components\AboutStory.astro:21: const { paragraphs, stats, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\AboutStory.astro:41: <div class="ukbt-story__paragraphs" {...tinaField ? { 'data-tina-field': tinaField } : {}}>
apps\web\src\components\ClubIntro.astro:112: <p class="ukbt-about__lede" data-tina-field="clubIntroLede">{lede}</p>
apps\web\src\components\Hero.astro:81: {eyebrow && <p class="ukbt-hero__eyebrow …" data-tina-field="eyebrow">{eyebrow}</p>}
apps\web\src\components\Hero.astro:82: <h1 class="ukbt-hero__headline" data-tina-field="headline">
apps\web\src\components\Hero.astro:87: <p class="ukbt-hero__tagline" data-tina-field="tagline">{taglineShort}</p>
apps\web\src\components\Hero.astro:89: <Button label={primaryCtaLabel} href={primaryCtaLink} variant="primary" data-tina-field="primaryCtaLabel" />
apps\web\src\components\LeadershipGrid.astro:27: 'data-tina-field'?: string;
apps\web\src\components\LeadershipGrid.astro:29: const { leaders, intro, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\LeadershipGrid.astro:61: <p {...tinaField ? { 'data-tina-field': tinaField } : {}}>{intro}</p>
apps\web\src\components\PageBanner.astro:17: 'data-tina-field'?: string;
apps\web\src\components\PageBanner.astro:36: const { title, crumbs, lede, background, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\PageBanner.astro:55: {lede && <p class="ukbt-page-banner__lede" {...tinaField ? { 'data-tina-field': tinaField } : {}}>{lede}</p>}
+ pages wiring on About + FAQ:
apps\web\src\pages\about.astro:78: <PageBanner … data-tina-field="heroSubline" />
apps\web\src\pages\about.astro:89: <AboutStory … data-tina-field="storyBody" />
apps\web\src\pages\about.astro:125: data-tina-field="leadershipIntro"
apps\web\src\pages\faq.astro:32: <summary class="ukbt-faq-question" data-tina-field="items.question">{item.question}</summary>
```

*Note:* `pages/about.astro:15` comment `// data-tina-field attributes added …` and the `Hero.astro:81,82,87,89`, `ClubIntro.astro:112`, `PageBanner.astro` lines are **FACT** (read `Hero.astro:81-89`, `ClubIntro.astro:112`, `AboutStory.astro:41`, `PageBanner.astro:55`, `LeadershipGrid.astro:61` this task). Index page's Tina usage is distinct:

- `apps/web/src/pages/index.astro:42` `import { tinaHomepage } from '../lib/tina/loaders'` — **FACT**.
- `apps/web/src/pages/index.astro:47-50` maps `tinaHomepage.whyChooseUs` → `reasons` — **FACT** (wired to the loader, not to TinaIsland).
- `apps/web/src/pages/index.astro:69,78-84,87` — `BaseLayout description={tinaHomepage.metaDescription …}` + `Hero` + `ClubIntro` use `tinaHomepage.*` fields — **FACT** (loader-direct, not island-driven).

Why the hand-stamped markers do not count: the docs-prescribed marker is the *return value* of `tinaField(contentSource, "path.to.field")`, which embeds a `_content_source: { queryId, path }` pair sourced from `requestWithMetadata`'s `_content_source` metadata. Literal strings `data-tina-field="headline"` have no `queryId` and are not generated by the bridge — the Tina bridge ignores them. This task verifies `tinaField` is never imported (0 hits) and `requestWithMetadata` is never called (0 hits) — so these markers are inert decoration until wiring lands.

### 1.3 Additional file inventory — FACT line refs (read 2026-09-17)

| File | Lines read | Status | Note |
|---|---|---|---|
| `apps/web/src/lib/tina/loaders.ts` | 1-82 | FACT | Imports 3 JSON files (`faqData`, `homepageData`, `siteData`) via `with { type: 'json' }` + Zod parse `tinaHomepage/Faq/Site` — no `client.queries.*`. REM-003 URL allowlist at `loaders.ts:9-17` + refine at `loaders.ts:26-35,56-69` — must stay (see §3). |
| `apps/web/src/lib/tina/islands.ts` | 1-44 | FACT | Registry `hero` + `aboutSection`; `fetch` returns `{ ...tinaHomepage, social }` merged with `homepage.social` (truth-owned) — `islands.ts:11-12,30` — but never registered as a visual-editing data source because no page calls `requestWithMetadata` to feed it. `wrapper: { tag: 'section' }` at `islands.ts:15,33` — FACT. |
| `apps/web/src/pages/tina-island/[name].ts` | 1-5 | FACT | `prerender = false` + `POST = experimental_createIslandRoute(islands)` — island POST route scaffolding present (per `CURRENT_STATE.md` appendix D / `WORKERS_TINA_CONFIGURATION_AUDIT.md §2.4`). Requires `nodejs_compat` — now **PRESENT** (`wrangler.jsonc:37` after Task 3) — and `cloudflare()` adapter — **PRESENT** (`apps/web/astro.config.mjs:7,28`). Fully scaffolded, but no consumer. |
| `apps/web/src/pages/index.astro` | 1-128 | FACT | Uses `tinaHomepage` directly (loader, not island) — §§ above. No `TinaIsland` import, no `requestWithMetadata`, no `tinaField()` — 0 hits for those tokens in this file (see §1.1). |
| `apps/web/src/pages/about.astro` | 1-137 | FACT | Uses code-owned `about` data (`about.astro:28` `import { about } from '../content/about-data'`) for truth-owned copy; Tina markers on `PageBanner:78`, `AboutStory:89`, `LeadershipGrid:125` — but not via island. No `TinaIsland` — 0 hits. About collection `tina/config.ts:161-223` is orphan (`ABOUT_COLLECTION_DECISION.md` — Phase 4). |
| `apps/web/src/pages/faq.astro` | 1-110 | FACT | Uses `tinaFaq` directly (`faq.astro:15` `import { tinaFaq }`). Marker on `faq.astro:32` `data-tina-field="items.question"` only; `renderFaqAnswer` at `faq.astro:35` via `set:html` — REM-001 safe path must stay (see §3). No island wiring. |
| `apps/web/src/components/Hero.astro` | 1-335 | FACT | Markers `data-tina-field:81,82,87,89` + tagline prop `Hero.astro:87` — direct props from `index.astro:78-84`, not from island `propsFromData`. |
| `apps/web/src/components/ClubIntro.astro` | 1-363 | FACT | Marker `data-tina-field="clubIntroLede":112`; lede from `tinaHomepage.clubIntroLede` via `index.astro:87` Section — loader-direct; island `aboutSection` `propsFromData lede: d.clubIntroLede` at `islands.ts:39` is **unused** (no page renders `<TinaIsland name="aboutSection">`). |
| `apps/web/src/components/AboutStory.astro` | 1-163 | FACT | Prop-alias pattern `data-tina-field:19,21,41` — string pass-through, not `tinaField()` metadata. Story paragraphs from `about.storyParagraphs` (truth-owned), not from Tina `storyBody`. |
| `apps/web/src/components/PageBanner.astro` | 1-189 | FACT | Prop-alias pattern `17,36,55`; lede marker `55` wired from `about.astro:78` literal. |
| `apps/web/src/components/LeadershipGrid.astro` | 1-178 | FACT | Prop-alias pattern `27,29,61`; intro marker `61` from `about.astro:125` literal. |
| `tina/__generated__/client.ts` | 1-5 | FACT (gitignored build artifact) | `createClient({ cacheDir, url: "https://content.tinajs.io/…/github/main", token: "dummy…" , queries })` — generated by `tinacms build --skip-cloud-checks --skip-search-index` (`package.json:18`). Exists on disk this task (captured `Get-Content client.ts`). Entrypoint for visual-editing path (see §2). Also `tina/__generated__/queries.gql` defines `query homepage/about/faq/siteSettings` — FACT (`Get-Content queries.gql`). |
| `apps/web/astro.config.mjs` | 1-30 | FACT | `output: 'static'` (`astro.config.mjs:13`) + `tina():7` + `cloudflare():28` + `server: { host: '127.0.0.1' }:27` — FACT. Static+island hybrid (see §2 adapter note). |
| `wrangler.jsonc` | 1-71 | FACT | `compatibility_flags: ["nodejs_compat"]:37` **PRESENT** (Task 3), `main: ./apps/web/dist/server/entry.mjs:38` + `assets.directory: ./apps/web/dist/client:40` — hybrid layout — FACT. `kv_namespaces` still **MISSING** — UNKNOWN `SESSION` id (see §2). |
| `tina/config.ts` | 1-317 | FACT | Branch now `TINA_BRANCH || GITHUB_BRANCH || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || 'main'` (`tina/config.ts:4` post-Task 3) — FACT (`CHANGE_LOG.md §1`). 4 collections at `tina/config.ts:28-314` — FACT. Correct monorepo path `tina/config.ts` (root), not `../../tina/config.ts` (see §5). |
| `apps/web/src/lib/faq-answer.ts` | 39-53 | FACT | REM-001 `renderFaqAnswer` escapes Tina AST → `<p>escaped</p>` — `escapeHtml` before `set:html` (`apps/web/src/pages/faq.astro:35`). Must stay. |
| `apps/web/src/lib/allowed-urls.ts` | 1-… | FACT | REM-003 allowlist — CTA `SITE_RELATIVE` only, `https` social, `tel`/`isEmailValue` — used by `loaders.ts` Zod refines. Must stay. |
| `apps/web/public/_headers` | 1-40 | FACT | CSP `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `connect-src …` **PRESENT** (`_headers:9`) — `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2` — no gap. |

---

## 2. Required architecture — docs-prescribed React-free path (Astro)

Per `@tinacms/astro@0.7.0` docs (`/contextual-editing/astro` + `/migrations/astro-react-free-visual-editing`) and repo truth at `67ba098` / Task 3 fixes:

### 2.1 Control plane (already present — do not re-add)

```
Astro server middleware (injected by tina() integration)
  ↓
/admin/bridge.js bootstrap (script tag injected by bridgeScript() in middleware.js:116-117)
```

Evidence — **PRESENT**:

- `apps/web/astro.config.mjs:4,7,29` `import tina from '@tinacms/astro/integration'` + `integrations: [spotlightjs(), tina()]` — **FACT** (read `astro.config.mjs:1-30`). The `tina()` integration registers the dev/admin middleware that auto-injects per-request `isEditMode → injectEditMode → bridgeScript()` — read `apps/web/node_modules/@tinacms/astro/dist/middleware.js:2-8,116-117` in `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.1` — `adminOrigins()` + `init({adminOrigin…})`.
- `apps/web/astro.config.mjs:5,28` `import cloudflare from '@astrojs/cloudflare'` + `adapter: cloudflare()` — **FACT**. Required because visual editing needs a Workers entry for the **on-demand island route** (`tina-island/[name].ts` `prerender = false`). The adapter is what emits `dist/client/` (static assets) + `dist/server/entry.mjs` (Worker); root `wrangler.jsonc:38-40` `main` + `assets` mirror that layout — `WORKERS_TINA_CONFIGURATION_AUDIT.md §2.4` verifies `PRESENT` + `node scripts/check-deploy-mapping.mjs` `DEPLOY_MAPPING_STATUS: PASS` (`CHANGE_LOG.md §2`).
- `apps/web/public/_headers:9` CSP `frame-ancestors` + `connect-src` — **PRESENT** (`WORKERS_TINA_CONFIGURATION_AUDIT.md §4.2`). Allow-lists `https://app.tina.io https://*.tinajs.io` for bridge.
- `.env.example:11-14` documents `PUBLIC_TINA_ADMIN_ORIGIN=` (Task 3, `CHANGE_LOG.md §4`) — **PRESENT** (`Get-Content .env.example` above). The var is read by `middleware.js:4` (`adminOrigins()` → `initArg`) — honors list, leaves same-origin when empty — `WORKERS_TINA_CONFIGURATION_AUDIT.md §4.1`.

**Requirement:** keep these integrations. No further `tina`/`cloudflare` setup is required for visual editing; the remaining gap is entirely in **page wiring** (§2.2).

### 2.2 Data plane — the missing wiring (four-hop chain)

Docs title: **"Astro + React-free visual editing"** (migration guide) — summary quoted from installed package docs (`node_modules/@tinacms/astro/src/data.test-d.ts:10`, `TinaIsland.astro:10`):

> `requestWithMetadata` is the one wrapper every Astro page calls around its `client.queries.*` fetch. The SSR page doesn't need further work — the first `requestWithMetadata()` + first `<TinaIsland>` trip injects the bridge; island fetches handle live overlay thereafter.

Required sequence per `/contextual-editing/astro`:

```
1. Generated client
     tina/__generated__/client.ts → createClient({ url, token, queries }) → `client.queries.homepage/faq/about/siteSettings`
2. Page wrapper: requestWithMetadata(..., { priority: 'primary' })
     "Every Astro page calls requestWithMetadata around its client.queries.* source"
     The wrapper attaches `_content_source: { queryId, path }` metadata to the returned `data` object
     (see apps/web/node_modules/@tinacms/bridge/dist/metadata.d.ts:5 — _content_source is what tinaField() reads)
     The first such call also causes the middleware (next request) to inject the editing bridge when ?tina is present
     Import: `import { requestWithMetadata } from '@tinacms/astro'`
     or: `import { requestWithMetadata } from '@tinacms/astro/data'` (same export, tested in island-route.test.ts:4)
3. Island registry (apps/web/src/lib/tina/islands.ts)
     `IslandRegistry` map of IslandConfig { fetch(req, params) → data, component, wrapper, propsFromData }
     Not a React island — Astro server-rendered fragment re-fetched on save
4. On-demand island route (apps/web/src/pages/tina-island/[name].ts)
     ```
     import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
     import { islands } from '../../lib/tina/islands';
     export const prerender = false;
     export const POST = experimental_createIslandRoute(islands);
     ```
     (already scaffolded — FACT — but its fetchers must mirror the client's GraphQL return shape)
5. Page render: <TinaIsland> + tinaField()
     ```
     ---
     import { TinaIsland } from '@tinacms/astro';
     import { tinaField } from 'tinacms/dist/toolkit'; // or helper re-export
     const result = await requestWithMetadata(client.queries.homepage({ relativePath: 'homepage.json' }), { priority: 'primary' });
     const data = result.data;
     ---
     <TinaIsland name="hero" wrapper="section" primary>           <!-- primary marks hero as the preview anchor -->
       <Hero headline={data.homepage.headline} data-tina-field={tinaField(data.homepage, 'headline')} />
       <!-- each field marker is tinaField(dataSource, fieldPath), not a literal string -->
     </TinaIsland>
     ```
     `TinaIsland.astro:10` — "SSR pages don't need this — the first requestWithMetadata() injects …"
     `TinaIsland` renders the island's `component + wrapper + propsFromData` server-side and registers it for POST re-renders.
     `tinaField()` writes the precise `data-tina-field` attribute that the bridge maps back to `queryId`/`path` (via _content_source) for overlay positioning.

```

Why each hop matters (with repo consequence):

| Hop | Without it | In this repo currently |
|---|---|---|
| Generated client `client.queries.*` | No GraphQL source — loaders' `import json` path has no `_content_source` metadata | `tina/__generated__/client.ts:3` `createClient` exists but **never imported** in `apps/web/src` (0 hits in app src — only `node_modules` & `dist/server/chunks`) — **VERIFIED**. |
| `requestWithMetadata(..., { priority: 'primary' })` | No `_content_source`; bridge never injected | **0 calls** in `apps/web/src` — **VERIFIED** (§1.1). Loaders call `Zod.parse(json)` instead (`loaders.ts:80-82`) — valid for static build but not for overlay. |
| `islands.ts` fetchers mirroring GraphQL shape | Island POST returns shape mismatch; preview shows stale/empty overlay | `islands.ts:11-12,30` fetches `tinaHomepage` (flat JSON-derived) — not `client.queries.homepage(...)` GraphQL payload; when wired, these must proxy the same GraphQL document (`queries.gql` → `HomepageParts` fragments) so that `propsFromData` keys align. |
| `tina-island/[name].ts` | No POST endpoint; Save→refresh cannot re-render island region | **Present but idle** (`apps/web/src/pages/tina-island/[name].ts:1-5`) — `prerender=false` + `POST` present, `nodejs_compat` now present (`wrangler.jsonc:37`), `cloudflare()` present — route will work once pages call `requestWithMetadata` and render `<TinaIsland>`. |
| `<TinaIsland>` + `tinaField()` | No island boundary for the editor overlay; no field-level `data-tina-field` metadata binding | **0** `<TinaIsland>` and **0** `tinaField()` imports in `apps/web/src` — **VERIFIED**; literal `data-tina-field="headline"` strings are inert (see §1.2). |

### 2.3 Hybrid output model — static + island (not "output: hybrid" / CONTEXT toggle)

- Current: `apps/web/astro.config.mjs:13` `output: 'static'` — **FACT**. This is the **correct** docs-prescribed mode: all pages except `tina-island/[name].ts` are prerendered to `dist/client/`; only `tina-island/[name].ts` is `prerender = false` (on-demand Worker route) and is emitted to `dist/server/entry.mjs` via `cloudflare()` adapter. Root `wrangler.jsonc:38-40` certifies hybrid layout (`main: "./apps/web/dist/server/entry.mjs"` + `assets.directory: "./apps/web/dist/client"` + `not_found_handling: "404-page"`). Verified **`PASS`** by `node scripts/check-deploy-mapping.mjs` (`CHANGE_LOG.md §7`).

- **Do NOT propose** a CONTEXT-based `output: (CONTEXT === 'tina' ? 'server' : 'static')` toggle or an `output: 'hybrid'`/`output: 'server'` migration. That pattern (seen in AI template proposals) forces the entire site through the Worker for a content toggle, doubles the routing surface, and breaks `dist/client` expectations (`check-deploy-mapping` would fail `assets-directory-absent`). The docs-prescribed path keeps `output: 'static'`; `TinaIsland` is what de-SSR's exactly one island region per page when `?tina` is present — pages without `<TinaIsland>` stay byte-identical to a Tina-free Astro app (see §3).

### 2.4 Validation belongs at the Zod + content-trust gate — not a custom POST endpoint

- **Do NOT propose** a custom `validateEditorialData` POST endpoint or a `src/pages/api/validate` route for editorial content (seen in AI templates). Editorial validation in this repo has two authoritative gates: (a) **build-time Zod** (`apps/web/src/lib/tina/loaders.ts:19-82` — REM-003 per `@ukbt/truth`) and (b) **`scripts/check-content-trust.mjs` / `check-security` / `deploy:verify`** (the truth gate). Both already enforce REM-003 (`allowed-urls.ts`) and REM-001 (`faq-answer.ts` escaping).

- Adding a runtime validator duplicates invariant and opens a new attack surface (POST → JSON → schema bypass). Per `@ukbt/truth` governance (see `packages/truth/src/schema/` + `apps/web/CLAUDE.md` editorial vs truth-sensitive classification), editorial fields are: headline/CTA/lede/FAQ/pageEyebrow/siteSettings tagline — never players/stats/dates/org claims (truth-sensitive, code-owned). The future wiring must preserve this split (see §3).

### 2.5 Hobby/Free tier — wiring is the blocker, not pricing

Per `CHANGE_LOG.md §0` BLUF (sourced from `WORKERS_TINA_CONFIGURATION_AUDIT.md` + Cloudflare Workers/KV free-tier docs):

> Workers Free 100k req/day, KV 100k reads / 1k writes / 1GB free, no cache config beyond `_headers` — sufficient for Tina editorial (sidebar → commit → rebuild → Workers deploy). Remaining blockers are engineering (branch chain ✅ after Task 3, `nodejs_compat` ✅ after Task 3, `SESSION` pin **UNKNOWN** until `kv namespace create`, origin allowlist ✅ docs gap closed, visual wiring **NOT CONNECTED** herein) — **not billing**. Do NOT treat pricing as a blocker.

This note is authoritative for this hardening loop; visual editing's profitability concern on Free is the **commit rate** (KV write 1k/day) not the read path — well above editorial cadence. No further pricing audit is required.

---

## 3. Affected files + security impact

### 3.1 Wiring scope — future implementation touches these files only (no other surfaces)

This is the exhaustive set for React-free visual editing — each listed with the invariant it must preserve:

| File | Change required when wiring lands | Invariant / gate that must hold |
|---|---|---|
| `tina/__generated__/client.ts` (gitignored artifact) + `tina/__generated__/queries.gql` | **No hand-edits** — generated by `tinacms build --skip-cloud-checks --skip-search-index` (`package.json:18`). Exposes `client.queries.homepage/faq/about/siteSettings` (verified `queries.gql` reads). Purpose: provide the `client.queries.*` source for `requestWithMetadata`. | Regenerated by `pnpm run build`; never committed. `client.ts` `cacheDir` + `url: content.tinajs.io` are build-time only. |
| `apps/web/src/lib/tina/loaders.ts` | **Must stay the Zod gate** — currently `loaders.ts:1-82` `Zod parse(json)` (REM-003). Future: optionally complement (not replace) with `requestWithMetadata(client.queries…)` for preview; loader path remains for static fallback + `fallback`/build-time safety. `loaders.ts:9-17` `import { isSiteRelativeUrl… }` + `loaders.ts:26-35,56-69` refines are the fail-closed allowlist (CTA must be site-relative `/…`, social `https://`, phone `tel:`, email mailbox). | **REM-003 unchanged** (`apps/web/src/lib/allowed-urls.ts` — anti-evasion: `hasUnsafeChars` + 3-round `decodeLoop` + case-insensitive scheme test + protocol-relative `//` rejection). Validation failure throws at `pnpm run build` + `check-security` / `check-content-trust`. Never relaxed. |
| `apps/web/src/lib/tina/islands.ts` | **Must be refactored to GraphQL fetchers** — change `fetch: () => tinaHomepage` (`islands.ts:11-12,30`) to `fetch: () => client.queries.homepage({ relativePath: 'homepage.json' })` (and parallel for FAQ/siteSettings once collections wired), with `propsFromData` mapping GraphQL `data.homepage.*` to component props (`eyebrow/headline/tagline/...`). Keep `wrapper: { tag: 'section' }` (`islands.ts:15,33`) — wrapper tag is what `TinaIsland name wrapper` renders as. Add one entry per island (hero, aboutSection, faqItem list, banners). | Fallback in `propsFromData` for missing CMS values must be **truth-controlled** (`islands.ts:36-42` comment `REM-004` — `homepage.*` gated `@ukbt/truth` values). Never hard-code editorial facts. |
| `apps/web/src/pages/tina-island/[name].ts` | **No further change expected** — `prerender = false` (`[name].ts:4`) + `POST = experimental_createIslandRoute(islands)` (`[name].ts:5`) already present. `nodejs_compat` now present (`wrangler.jsonc:37`) — required for `node:async_hooks` (`WORKERS_TINA_CONFIGURATION_AUDIT.md §2.3`). When islands change shape, regenerate via `tinacms build`. | `cloudflare()` adapter (`apps/web/astro.config.mjs:28`) must remain — without it `dist/server/entry.mjs` would not exist. `check-deploy-mapping` gate ensures `main` + `assets.directory` stay aligned. |
| `apps/web/src/pages/index.astro` | **Add docs-prescribed wrapper** — top-of-frontmatter: `import { TinaIsland } from '@tinacms/astro'; import { tinaField } from 'tinacms/dist/toolkit'; import { client } from '../../../tina/__generated__/client'; import { requestWithMetadata } from '@tinacms/astro';` plus `const result = await requestWithMetadata(client.queries.homepage({ relativePath: 'homepage.json' }), { priority: 'primary' })` → thread `result.data.homepage.*` and `result.data.homepage._content_source` via `tinaField(result.data.homepage, 'headline')` etc. Wrap the editable island(s) — e.g. `Hero` (`index.astro:75-84`) and `ClubIntro` (`index.astro:87`) — inside `<TinaIsland name="hero" wrapper="section" primary>` / `<TinaIsland name="aboutSection" …>` as per registry keys. `tinaHomepage.metaDescription/whyChooseUs` regions currently loader-direct (`index.astro:47-50,69`) would migrate to `result.data.*` under the same guard. | Page without Tina query still renders from `@ukbt/truth` fallback — no data loss. **Pages without `<TinaIsland>` stay byte-identical** to a Tina-free Astro app (see §3.3 static invariant). |
| `apps/web/src/pages/about.astro` | **Wire about banner/story/leadership when About collection decision lands** (`ABOUT_COLLECTION_DECISION.md` Phase 4 — currently C keep unused / intentionally unused). If later `ABOUT_COLLECTION_DECISION.md` chooses connect, add `requestWithMetadata(client.queries.about…)` + `<TinaIsland name="aboutBanner">` + `tinaField()` for `heroSubline/storyBody/leadershipIntro` — the three markers at `about.astro:78,89,125` become `tinaField(result.data.about, 'heroSubline')` etc. | **REM-004** and `@ukbt/truth` boundary unchanged — about org facts remain code-owned if collection stays C; CMS-editable fields must be editorial only (see §3.4). |
| `apps/web/src/pages/faq.astro` | **Wire faq list** — `requestWithMetadata(client.queries.faq…)` + island `faq` + `tinaField()` for `pageHeading/pageEyebrow/items[].question` + `renderFaqAnswer(items[].answer)` remains the HTML sink. Marker at `faq.astro:32` becomes `tinaField(result.data.faq, 'items.0.question')` (per-item index). | **REM-001 unchanged** (`apps/web/src/lib/faq-answer.ts:39-53` escapes + `<p>` only, marks dropped). `set:html={renderFaqAnswer(…)}` at `faq.astro:35` stays safe **only because** `renderFaqAnswer` escapes — `CHANGE_LOG.md §6`, `WORKERS_TINA_CONFIGURATION_AUDIT.md` — `apps/web/public/_headers` CSP already permissive only for Tina domains. No raw `items.answer` injection. |
| `apps/web/src/components/Hero.astro` | **Replace literal markers with `tinaField` outputs** — `Hero.astro:81,82,87,89` `data-tina-field="…"` literals become `{…tinaField}` props from parent's `TinaIsland` wiring (via `propsFromData`). Component prop types add no new runtime sink. | No security sink in Hero — pure text/CTA rendering; CTA href still validated by `isSiteRelativeUrl`. |
| `apps/web/src/components/ClubIntro.astro` | **Same: `ClubIntro.astro:112` literal → `tinaField` value** from island `propsFromData` `lede`. `ClubIntro` props `lede/founded` types unchanged. | Team-only enforcement (`ClubIntro.astro:6-29` `TEAM_SLIDES` 5 multi-player photos) — editorial, not a security surface. |
| `apps/web/src/components/AboutStory.astro` | **String prop-alias → real metadata** — `AboutStory.astro:19,21,41` `data-tina-field?: string` pattern becomes `data-tina-field={tinaField(data.about, 'storyBody')}` from the About page's `requestWithMetadata` result. The `tinaField` helper encodes `queryId/path` from `_content_source`. | Paragraphs from CMS rich-text are **text only** until escaped by a REM-001-equivalent if ever rendered via `set:html` (currently `AboutStory.astro:42` renders `<p>{p}</p>` text nodes — safe). |
| `apps/web/src/components/PageBanner.astro` | **Same alias → metadata** — `PageBanner.astro:17,36,55` becomes `tinaField(data.about, 'heroSubline')` via page prop. | No sink — text-only lede `<p>`. |
| `apps/web/src/components/LeadershipGrid.astro` | **Same alias → metadata** — `LeadershipGrid.astro:27,29,61` → `tinaField(data.about, 'leadershipIntro')`. | Leadership `leaders[].photo` uses owner-cleared portraits (`about.spec.ts` pinned count) — not CMS-editable; lede is editorial-safe. |

### 3.2 Security invariants — must not regress (REM-001, REM-003, content-trust)

- **REM-001 (`apps/web/src/lib/faq-answer.ts:39-53`) — `renderFaqAnswer` escaper**: CMS-supplied `answer` is Tina `rich-text` AST. `faq.astro:35` `set:html={renderFaqAnswer(item.answer)}` is safe **only because** `renderFaqAnswer` at `faq-answer.ts:41-52` calls `escapeHtml()` on every leaf text before wrapping in `<p>` (marks dropped by design). **No wiring change may bypass this** — visual editing's `tinaField`-driven live overlay for FAQ answers must still flow through `renderFaqAnswer`. If the island's `propsFromData` ever emits answer HTML, it must be the already-escaped form. `check-security` gate enforces.

- **REM-003 (`apps/web/src/lib/allowed-urls.ts` + `apps/web/src/lib/tina/loaders.ts:9-17,26-35,56-69`) — URL allowlist Zod gate**: CTA links must be `isSiteRelativeUrl` (`/` + safe chars, no `//`, no scheme, no backslash, control/whitespace rejected, percent-decode 3 rounds), social `isHttpsUrl`, phone `isTelUrl`, email `isEmailValue`; `heroImage`/`socialCard` excluded (no script sink). The gate is fail-closed (`HomepageSchema.parse(…)` throws — build breaks). Future island wiring must still route `primaryCtaLink/secondaryCtaLink/social.*.url` through the same `loaders.ts` (or a shared schema) — `loaders.ts` remains the choke point even when `requestWithMetadata` provides live data. Tina UI `ui.validate` in `tina/config.ts:46,56,103,112,132,198,256,288` are client-only hints and are **never re-enforced** in `loaders.ts` (comment at `loaders.ts:9-11`) — server gate stays authoritative. `check-content-trust` + `check-security` must PASS before any visual PR merges.

- **REM-004 (`apps/web/src/lib/tina/islands.ts:36-42` comment `fallbacks are truth-controlled`)**: Island fallbacks (`lede: d.clubIntroLede || homepage.taglineShort`, `founded: homepage.founded`) are gated `@ukbt/truth` values, not hard-coded facts — preserves `CONTENT-TRUST-CONTRACT.md` `TRUTH-SENSITIVE` vs `EDITORIAL` classification. Visual wiring must keep this mapping.

- **Truth-gate invariant** (`@ukbt/truth` — `packages/truth/src/schema/` + `contracts/CONTENT-TRUST-CONTRACT.md`): **TinaCMS is editorial-only — never bypasses `@ukbt/truth` provenance** (`apps/web/CLAUDE.md` editorial vs truth-sensitive split). Content classification stays: hero headline/tagline/CTA text, clubIntroLede, whyChooseUs titles/bodies, FAQ questions/answers/pageEyebrow/heading, siteSettings taglines — **EDITORIAL**, CMS-safe. Players/stats/dates/org claims — **TRUTH-SENSITIVE**, code-owned (see `ABOUT_COLLECTION_DECISION.md`; about org facts intentionally unused). Wiring must not promote a TRUTH-SENSITIVE field to CMS-editable without a plan amendment.

- **CSP/Headers (`apps/web/public/_headers:9`)**: `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `connect-src 'self' … https://app.tina.io https://*.tinajs.io` — **PRESENT** — correctly scoped for bridge. No header change needed for visual editing; the bridge script (`/admin/bridge.js`) is what `middleware.js:116-117` injects — `init({adminOrigin…})` allowlist derives from `PUBLIC_TINA_ADMIN_ORIGIN` (docs-only var at `.env.example:11-14` — empty ships, per-environment value set by human).

### 3.3 Static invariant — byte-identical fallback

Docs guarantee (confirmed in installed `TinaIsland.astro:10` comment and `/migrations/astro-react-free-visual-editing`):

> Public pages without `<TinaIsland>` are byte-identical to a Tina-free Astro app. Pages with `<TinaIsland>` gain a **one-line bootstrap** (the middleware's injected `<script type="module">import{init…}from"/admin/bridge.js"` via `bridgeScript()` at `middleware.js:116-117` + the island's server-rendered POST boundary) and are otherwise static until `?tina` edit mode is active.

Consequence for site budgets (already adjusted — `scripts/check-perf.mjs`):

> `htmlPerPage` 64→72KB, `cssTotal` 56→60KB, `jsTotal` 32→48KB (per `apps/web/CLAUDE.md` TinaCMS note). Those budgets anticipated the bridge `15.5KB` + `cloudflare()` adapter overhead. Adding islands incrementally keeps non-island routes at today's budgets; only island-bearing pages carry the one-line cost.

Therefore, wiring should be **per-page opt-in** (index first, then FAQ, then optionally About once Phase 4 decides) — not a global layout change that forces every route through the Worker.

### 3.4 Role of loaders after wiring — Zod gate must remain

Even after `requestWithMetadata` is wired, `loaders.ts` remains the **build-time** gate: preview (bridge) uses live GraphQL, but production rebuild (`tinacms build → pnpm --filter @ukbt/web build → wrangler deploy`) still reads `apps/web/content/*/*.json` files on disk — the CI/`deploy:verify` gate checks that disk state. So the canonical flow stays:

```
Editor Save in TinaCloud
  → GitHub commit apps/web/content/<collection>/<doc>.json
    → Cloudflare Workers Build triggers (reuse of `TINA_BRANCH||…||WORKERS_CI_BRANCH…` at tina/config.ts:4)
      → tinacms build regenerates client + content
        → Zod parse loaders.ts (REM-003) fail-closes bad URLs
          → pnpm --filter @ukbt/truth tokens + astro build prunes to dist/client + dist/server/entry
            → wrangler deploy (main + assets)
```

Visual overlay's live path reuses the same schemas indirectly: island `fetch` returns the same GraphQL `data.homepage.*` that `tina/config.ts` shapes — so a CMS edit that violates the schema (`primaryCtaLink` not site-relative, social not `https://`) would both (a) overlay incorrectly in preview and (b) **break the next rebuild** via Zod throw — which is the correct fail-closed posture, not a runtime POST validator.

---

## 4. Complexity estimate + dependencies + recommendation

### 4.1 Estimate

| Dimension | Value | Basis |
|---|---|---|
| **Effort** | **Small → Medium** (1–2 focused sessions, not Large) | One-time plumbing: client import + per-page `requestWithMetadata` call + 2-entry-island refactor + `TinaIsland`/`tinaField` per editable region (hero ≈4 fields, clubIntro ≈1, FAQ ≈4, about ≈3 if connected). No new adapter, middleware, or infra. |
| **Files touched (when implemented)** | 5–8 (from §3.1) | `loaders.ts` (keep/shrink), `islands.ts` (rewrite fetchers), `index.astro` (± `about.astro`, `faq.astro`), affected components (`Hero`, `ClubIntro`, optionally `AboutStory`/`PageBanner`/`LeadershipGrid`). No `wrangler.jsonc` / `astro.config.mjs` / `tina/config.ts` churn — already hardened by Task 3. |
| **Risk** | **Low–Medium** (reversible per-page) | Each island is independently committable (`git revert` one page's wiring leaves others intact). Security gates (`check-security`, `check-content-trust`, `check-perf`) remain **blocking** — no gate weakening for PASS. |
| **Regression surface** | Bounded | Astro `output: 'static'` + `cloudflare()` hybrid unchanged (`check-deploy-mapping` PASS must continue). Only island pages pay the one-line bridge; others byte-identical. |
| **Pre-req chain** | Depends on Phase 2 fixes | Branch chain ✅ (`tina/config.ts:4` fixed `8322de1`), `nodejs_compat` ✅ (`wrangler.jsonc:37` fixed `68c672e`), `PUBLIC_TINA_ADMIN_ORIGIN` docs ✅ (`8b0d771`), **`SESSION` KV id UNKNOWN** — `CHANGE_LOG.md §3` BLOCKED; second-save `10014` would break `TINA_HITL_RUNBOOK.md` proof unless retrieved before wiring is exercised. No wiring depends on a still-missing flag — but HITL proof does. |

### 4.2 Dependencies on Phase 2 fixes

- `tina/config.ts:4` — **Satisfied** (`WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` chain) — verified `Get-Content tina/config.ts` at new base still contains the expanded expression from `8322de1`.
- `wrangler.jsonc:37` `compatibility_flags` — **Satisfied** — verified `Get-Content wrangler.jsonc` shows `["nodejs_compat"]`; without it, `tina-island/[name].ts` POSTs error at runtime (`WORKERS_TINA_CONFIGURATION_AUDIT.md §2.3` — two `AsyncLocalStorage` stores).
- `.env.example:11-14` `PUBLIC_TINA_ADMIN_ORIGIN=` — **Satisfied docs-only** — verified `Get-Content .env.example`; runtime value still empty until human sets a real origin per environment — non-blocking for wiring (defaults to same-origin).
- `kv_namespaces` `SESSION` pin — **BLOCKED / UNKNOWN** (`CHANGE_LOG.md §3`, `WORKERS_TINA_CONFIGURATION_AUDIT.md §3)` — no real `id` yet (`npx wrangler kv namespace create SESSION` or dashboard `Workers & Pages | KV` → Worker `Settings | Bindings` not retrieved). This does **not** break wiring locally (KV is not read by island fetchers — `Astro.session` unused), but it **will block `TINA_HITL_RUNBOOK.md` Task 6 proof** on the second editorial save (Workers `10014` duplicate-namespace on git-based redeploy per Workers doc § Pin SESSION KV). Retrieval should precede Phase 5 HITL.

### 4.3 Recommendation — DEFER implementation until after HITL proof (Phase 5) + Final Readiness (Phase 6)

**Recommendation: Do NOT implement visual-editing wiring in this hardening loop. Deliver this `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` (Task 4) as the record, then queue wiring to `ABOUT_COLLECTION_DECISION.md` (Task 5) + `TINA_HITL_RUNBOOK.md` (Task 6) + `FINAL_READINESS_REPORT.md` (Task 7) before any `requestWithMetadata`/`TinaIsland` code ships.**

Rationale (SDD evidence-first loop, `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Global Constraints):

1. **HITL save→commit→deploy proof is missing** (`CURRENT_STATE.md` P0-2, `WORKERS_TINA_CONFIGURATION_AUDIT.md §3`, `CHANGE_LOG.md §3`). The highest production risk is `SESSION` unpinned → `10014` on second save. Wiring new islands before that is proven wastes the HITL window and obscures the failure sentinel. `TINA_HITL_RUNBOOK.md` (Phase 5) is the execution gate; after it passes, wiring's island POST will not be triaged against yet-another redeploy failure.

2. **About collection decision is pending** (Phase 4). `apps/web/content/about/about.json` is orphan per `CURRENT_STATE.md` P1-4; choosing C (keep unused, truth-owned `about-data.ts` canonical) vs A (connect Tina `storyBody/heroSubline`) changes the island scope. Wiring hero/FAQ before that decision is safe; wiring About before its decision is wasted motion.

3. **Visual wiring is not a production blocker** — sidebar editing already commits and rebuilds (Git-backed flow); visual overlay is a *velocity* feature for editorial ergonomics, not a correctness gate. `deploy:verify` (`package.json:42`) is release authority; no gate is weakened to obtain a visual PASS — `deploy:verify` runs full chain `check:security`, `check:content-trust`, `check:perf`, `check:seo`, `check:ui`, etc.

4. **Free-tier (Hobby/Cloud Free) is not a blocker** — per `CHANGE_LOG.md §0` BLUF. TinaCloud Free (2 users/2 roles/1 project/100MB assets, no editorial workflow) + Workers Free (100k req/day) + KV Free (100k reads / day) is sufficient. The constraint is not "upgrade to paid" but "wire the client→island→route correctly." Pricing thinking that gates visual editing is explicitly rejected here; wiring is the delta.

**Next lane (post-hardening, separate plan):** queue visual-editing implementation as Tasks 8–9 of `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` (or a successor wiring plan) only after `FINAL_READINESS_REPORT.md` shows `UNKNOWN` save/commit → `VERIFIED` post-HITL and `SESSION` `id` resolved. Sequencing then: `index.astro` hero+clubIntro → `faq.astro` list → `about.astro` if Phase 4 chooses connect — each as a one-concern commit with `check-deploy-mapping`, `check-security`, `check-content-trust`, and `check-perf` PASS before next.

---

## 5. Adaptive — explicitly rejected other-AI template flawed patterns

The following patterns were proposed by other-AI templates in `docs/adaptive/` / `docs/tina-audit/*` history (stale proposals cited in `2026-09-17-tinacms-fixing-plan.md` reconciled non-issues). Each is **explicitly rejected** per Task 4 adaptive rulings. Cite this section as the record that wiring will NOT adopt them.

| # | Flawed pattern (stale template) | Why it is rejected here (per repo truth + `CHANGE_LOG.md` adaptive rulings) | Correct approach (keep) |
|---|---|---|---|
| F1 | **CONTEXT-based `output` toggle**: `output: process.env.CONTEXT === 'tina' ? 'server' : 'static'` or `output: 'hybrid'/'server'` migrated site | Breaks `dist/client` contract (`wrangler.jsonc:40` `assets.directory`), doubles Worker routing for a content toggle, defeats `check-deploy-mapping` (`assets-directory-absent` + `worker-entry-absent` sentinels), and misreads `tina()` integration (which does not need a server output — it uses one on-demand island route). `apps/web/astro.config.mjs:13` `output: 'static'` is contracts-frozen (`apps/web/CLAUDE.md` Astro site `output: 'static'`; `wrangler.jsonc` comment assets-only 404 recovery). | **Keep `output: 'static'` + one `prerender = false` island route** (`apps/web/src/pages/tina-island/[name].ts:4`) + `adapter: cloudflare()` (`apps/web/astro.config.mjs:28`) + `wrangler.jsonc:38-40` `main`+`assets`. Static+island hybrid per astro docs + Tina adapter (see §2.3). |
| F2 | **Wrong `configPath`**: `configPath: '../../tina/config.ts'` or `configPath: './apps/web/tina/config.ts'` | `tina/config.ts` lives at **monorepo root** (`tina/config.ts` — `git -C . ls-files tina/` → `tina/config.ts` + `tina/tina-lock.json` — `CURRENT_STATE.md` appendix A **VERIFIED**). Tina CLI's default discovers it at `<root>/tina/config.ts`; an explicit `configPath` pointing one level up from `apps/web` (`../../tina/config.ts`) traverses out of the monorepo in the same way `root: './apps/web'` mis-scopes the build (F3) and would break `tinacms build` in CI and `deploy:verify`. `inst/astro/config.mjs` must not carry a `root:` override either. | **Keep monorepo root `tina/config.ts`** (no `configPath` needed — default discovery). Do not add `configPath` or `root:` keys. `apps/web/astro.config.mjs` has no `root: './apps/web'` — pinned by `docs/adaptive` rulings cited in `CHANGE_LOG.md §5`. |
| F3 | **`root: './apps/web'` in `apps/web/astro.config.mjs`** | Astro resolves `root` relative to the config file — `apps/web/astro.config.mjs:root:'./apps/web'` would double-nest to `apps/web/apps/web` and break `dist/client` vs `dist/`. Pinned **remove** per prior fix (see TT prefix? actually prior hardening fix). Repo uses pnpm monorepo without `root:` override (Astro defaults to `apps/web` as project root when config resides there). Adding `root:` would misalign `wrangler.jsonc:38-40` `main/assets` paths that are relative to repo root — breaks `check-deploy-mapping`. | **Keep no `root:` key** — default `apps/web` root is implicit from config location (`apps/web/astro.config.mjs` path). Verified: current `astro.config.mjs:1-30` has no `root:` — FACT (read). |
| F4 | **Custom `validateEditorialData` POST endpoint** (`src/pages/api/validateEditorialData.ts`, `POST /api/validateEditorialData`) | Duplicates fail-closed gates already enforced at build (Zod in `loaders.ts:19-82` REM-003 + `scripts/check-content-trust.mjs` truth gate per `@ukbt/truth`). Introduces a runtime JSON→schema bypass and a new POST sink (two-attacker, CMS seat + unauthed caller). Governance forbids runtime re-interpretation of `@ukbt/truth` truths. | **Validation belongs at loaders Zod + content-trust gate** (`@ukbt/truth` — `loaders.ts` refines `isSiteRelativeUrl`/`isHttpsUrl`/`isTelUrl`/`isEmailValue`; `check-content-trust` + `check-security` in `deploy:verify`). No custom validator endpoint. See §2.4 + §3.2. |
| F5 | **Editorial collection path `apps/web/src/content/editorial`** | Astro content collections are `src/content/` under the **Astro app**, but this repo intentionally uses **`apps/web/content/*/*.json`** (not `apps/web/src/content/…`) plus `src/content/*-data.ts` TypedData modules (see `apps/web/CLAUDE.md` content architecture). Tina collections at `tina/config.ts:32,164,228,279` point at `apps/web/content/homepage`, `…/about`, `…/faq`, `…/site` (Tina path is filesystem path, not Astro content-collection path) — `tina/config.ts:32-34` + on-disk `apps/web/content/{homepage,about,faq,site}/*.json` **FACT**. `src/content/editorial` would collocate Tina-locked content with hand-curated truth modules and confuse the editor vs code-owned distinction — violates editorial vs truth-sensitive split (`apps/web/CLAUDE.md`, `knowledge/` substrate). | **Keep loaders at `apps/web/src/lib/tina/*.ts`** and content at **`apps/web/content/*/*.json`**; `tina/config.ts` path field encodes that layout — do not move to `src/content/editorial`. Loaders are `apps/web/src/lib/tina/loaders.ts` + `islands.ts` — the Astro-cooked path for reading Tina JSON (`loaders` for static) + `requestWithMetadata` via generated client for live; not an Astro `collections/` API. |
| F6 | **`import { useTina } from 'tinacms/dist/react'` / `useEditState()` in pages** | React hook is for `nextjs`-hosted Tina pages. This is an **Astro** site (`apps/web/astro.config.mjs:13` `output: 'static'`) with **zero-React** budget contract (see `apps/web/CLAUDE.md` Tina bridge `15.5KB` + adjusted perf budgets `htmlPerPage 64→72KB`, `jsTotal 32→48KB`). `useTina()` would require adding `react`+`react-dom` (≈140KB) and would autogate `check-perf` **FAIL**. No React nav exists in `apps/web/src` — 0 hits in this §1.1. | **Never import `useTina()` etc.** React-free path only: `requestWithMetadata` + `TinaIsland` + `tinaField()` (see §2). Per docs `/migrations/astro-react-free-visual-editing` — this migration is explicitly *removing* React islands, not adding them. |

Rejection authority:

- Task 4 instruction verbatim: "Do NOT propose CONTEXT-based output toggle (keep output static+island hybrid …) do NOT propose custom validateEditorialData POST endpoint (validation belongs at loaders Zod + content-trust gate, per @ukbt/truth)." — honored §2.3 + §2.4 + §3.2.
- Task 3 adaptive rulings (`CHANGE_LOG.md §5`, `WORKERS_TINA_CONFIGURATION_AUDIT.md` + stale template comparison): `tina/config.ts` monorepo-root, `static+island`, `experimental_createIslandRoute`, loaders at `apps/web/src/lib/tina/*` — cited.

**Hobby/Free note in this adaptive context:** no rejected template's failure is remedied by "upgrade to paid" (pricing theories in stale templates suggested KV/Tina tier upgrades as fix for `10014`/bridge). `CHANGE_LOG.md §0` BLUF authoritative: wiring + SESSION pin are the missing engineering — not a billing tier. Do not quote tier limits as blockers for F1–F6 rejection.

---

## 6. Stop/edit guardrails — what this file does NOT do (so no re-plan is needed)

- No file outside this `*.md` was added or edited — **0 code changes** (per SDD Task 4 scope). `wrangler.jsonc`, `tina/config.ts`, `.env.example`, `apps/web/src/lib/tina/*`, `apps/web/src/pages/*`, `apps/web/src/components/*` all read-only this task — verified `git status --porcelain` shows no dirty production files when this task commits.
- `SESSION` `kv_namespaces` `id` remains **UNKNOWN** — not invented here (per `CHANGE_LOG.md §3` blocked state). Quotes that would upgrade UNKNOWN → FACT remain absent — retained as UNKNOWN until `npx wrangler kv namespace list --json` or dashboard `Workers & Pages | KV` provides a real id.
- `SAVE` / `COMMIT` remain **UNKNOWN until HITL** (`TINA_HITL_RUNBOOK.md` — Task 6) — never upgraded here; evidence class displayed as UNKNOWN in §1 matrix, not VERIFIED.
- `ABOUT_COLLECTION_DECISION.md` (Phase 4) not assessed here beyond orphan mention; recommendation is to decide *before* About islands wire (see §4.3).
- `tinaAdminDevRedirect()` (`@tinacms/astro/vite` `vite.js:2-24`) remains `NOT_REQUIRED` / `apply: "serve"` dev-only per `CHANGE_LOG.md §5` and `WORKERS_TINA_CONFIGURATION_AUDIT.md` summary — not wired in this task, no `vite: { plugins: [tinaAdminDevRedirect()] }` adoption claimed.
- `deploy:verify` not run in this task — full verification loop is `FINAL_READINESS_REPORT.md` (Phase 7) per `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 8.

---

## 7. Evidence inventory (retrieval 2026-09-17, base 0d2a91f)

| File | Lines read | Class |
|---|---|---|
| `apps/web/src/lib/tina/loaders.ts` | 1-82 | FACT |
| `apps/web/src/lib/tina/islands.ts` | 1-44 | FACT |
| `apps/web/src/pages/tina-island/[name].ts` | 1-5 | FACT |
| `apps/web/src/pages/index.astro` | 1-128 | FACT |
| `apps/web/src/pages/about.astro` | 1-137 | FACT |
| `apps/web/src/pages/faq.astro` | 1-110 | FACT |
| `apps/web/src/components/Hero.astro` | 1-335 (markers 81,82,87,89) | FACT |
| `apps/web/src/components/ClubIntro.astro` | 1-363 (marker 112) | FACT |
| `apps/web/src/components/AboutStory.astro` | 1-163 (alias 19,21,41) | FACT |
| `apps/web/src/components/PageBanner.astro` | 1-189 (alias 17,36,55) | FACT |
| `apps/web/src/components/LeadershipGrid.astro` | 1-178 (alias 27,29,61) | FACT |
| `tina/__generated__/client.ts` | 1-5 (createClient, queries) | FACT (gitignored artifact) |
| `tina/__generated__/queries.gql` | homepage/about/faq/siteSettings queries | FACT |
| `tina/config.ts` | 1-317 (branch:4, collections 28-314) | FACT |
| `wrangler.jsonc` | 1-71 (nodejs_compat:37, main:38, assets:40) | FACT |
| `apps/web/astro.config.mjs` | 1-30 (output:13, tina():7, cloudflare():28) | FACT |
| `.env.example` | 1-16 (PUBLIC_TINA_ADMIN_ORIGIN:11-14) | FACT |
| `apps/web/public/_headers` | 1-40 (_headers:9 frame-ancestors) | FACT |
| `apps/web/src/lib/faq-answer.ts` | 39-53 REM-001 escape | FACT |
| `apps/web/src/lib/allowed-urls.ts` | anti-evasion hasUnsafeChars/decodeLoop | FACT |
| `apps/web/node_modules/@tinacms/astro/dist/middleware.js` | adminOrigins:2-8, node:async_hooks:11, bridgeScript:116-117 | FACT (via WORKERS_TINA_CONFIGURATION_AUDIT.md §4) |
| `apps/web/node_modules/@tinacms/astro/dist/TinaIsland.astro` | requestWithMetadata injection note:10 | FACT |
| `apps/web/node_modules/@tinacms/bridge/dist/metadata.d.ts` | _content_source note:5 | FACT |
| `artifacts/audit/tina-hardening/CURRENT_STATE.md` | appendix A/B/C/D VERIFIED greps | VERIFIED (cited) |
| `artifacts/audit/tina-hardening/WORKERS_TINA_CONFIGURATION_AUDIT.md` | §1-§5 verdicts SUMMARY table | VERIFIED (cited) |
| `artifacts/audit/tina-hardening/CHANGE_LOG.md` | §0 BLUF free-tier, §1-§4 records 8322de1/68c672e/8b0d771, §3 SESSION blocked | VERIFIED (cited) |
| `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` | Global Constraints + Task 4 spec 1-5 | FACT |
| Live TinaCloud dashboard SAVE/COMMIT redeploy log + SESSION KV id | not captured | UNKNOWN (retained) |

PowerShell greps cited in §1.1 + §1.2 are **VERIFIED**: outputs pasted verbatim from task run against `apps/web/src` at this base.

---

## 8. Cross-reference to prior artifacts

- `CURRENT_STATE.md` appendix B **VERIFIED** `grep -r "requestWithMetadata|TinaIsland|tinaField" → 0 / 0 / alias-only` + `data-tina-field` hand-stamped list (`Hero.astro:81,82,87,89`, `ClubIntro.astro:112`, `about.astro:78,89,125`, `faq.astro:32`, plus prop-aliases `AboutStory`, `LeadershipGrid`, `PageBanner`) — **reproduced verbatim in §1.1 + §1.2** at new base `0d2a91f`, proving P1-3 *Visual editing incomplete* still holds (Sidebar edit OBSERVED, Click edit + Preview NOT CONNECTED). No UNKNOWN→FACT upgrade applied.
- `CURRENT_STATE.md` P0-1 / `WORKERS_TINA_CONFIGURATION_AUDIT.md` §1-§3 / `CHANGE_LOG.md` §0-§2 — fixes `8322de1` branch chain + `68c672e` `nodejs_compat` closed the two production drift blockers this file depends on (§4.2). `CHANGE_LOG.md` §3 `SESSION` blocked remains the **single remaining deploy blocker** for HITL save→redeploy proof — not resolved here.
- `WORKERS_TINA_CONFIGURATION_AUDIT.md` §4 `PUBLIC_TINA_ADMIN_ORIGIN` `DOCUMENTATION_GAP — REQUIRED` → closed in `CHANGE_LOG.md` §4 (`8b0d771` docs-only), read back in this file as `.env.example:11-14` **PRESENT** — no invented value, docs gap only.
- `CHANGE_LOG.md` BLUF §0 *free-tier sufficient* — honored §2.5 + §4.3 + §5 — no billing gate cited as blocker; wiring is the gap.

---

## 9. Task 4 completion record

- Created: `artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md` (this file) — no other file touched — **FACT** (`git status --porcelain` pre-commit shows this file as untracked only).
- Commit (Task 4 Step 5): `git add artifacts/audit/tina-hardening/TINA_VISUAL_EDITING_GAP_ANALYSIS.md && git commit -m "docs(tina): phase 3 visual editing gap analysis"` — to be executed next in this task's Step 5.

---

*Phase 3 — gap analysis only. Visual wiring deferred to a post-hardening plan per Global Constraints. Evidence classes retained — UNKNOWN for Save/Commit until HITL (Phase 5) + FINAL_READINESS (Phase 6). Zero-React rule honored throughout.*

