# WORKERS_TINA_CONFIGURATION_AUDIT — 2026-09-17

> Base: `a355f599c3568730a0abb5447fe0a5c16cd14d64` (HEAD after Task 1) — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: Workers doc `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` (fetched 2026-09-17, sect. Editing branch / Pin SESSION KV / Environment variables / Configure for Cloudflare) + installed `@tinacms/astro@0.7.0` (`apps/web/node_modules/@tinacms/astro/dist/middleware.js`, `island-route.js`) + repo truth cited from `artifacts/audit/tina-hardening/CURRENT_STATE.md` appendix **VERIFIED** (git ls-files tina/ -> tina/config.ts+tina-lock.json, grep requestWithMetadata zero) — not re-audited here.
> Evidence classes: **MISSING** / **PRESENT** / **UNNEEDED** / **UNKNOWN** (+ **FACT**/**VERIFIED** line refs). UNKNOWN never upgraded to FACT.
> Scope: audit only — no config edits; if evidence insufficient, mark UNKNOWN and defer fix proposal to Phase 2 (`CHANGE_LOG.md`).

---

## 1. Branch isolation

### Current

- `tina/config.ts:4` — `branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || 'main',` — **FACT** (read 2026-09-17; matches `CURRENT_STATE.md:P0-1` excerpt). No reference to `WORKERS_CI_BRANCH`, `CF_PAGES_BRANCH`, `VERCEL_GIT_COMMIT_REF`, or `HEAD` anywhere in `tina/config.ts` (**FACT** via `Select-String` in this task — zero hits for those tokens) and no branch env forwarding in `.github/workflows/ci.yml` (**FACT** — file `ci.yml:21-31` sets only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`; grep `TINA_BRANCH|GITHUB_BRANCH|WORKERS|CF_PAGES` returns only `branches: [main]` at `ci.yml:15`).
- `.env.example:10` — `TINA_BRANCH=main` — **FACT**. No `GITHUB_BRANCH`, no `WORKERS_CI_BRANCH`, no `CF_PAGES_BRANCH` documented there either.

### Required chain per Workers doc

Workers doc § **Editing branch** (fetched markdown):

> "TinaCMS reads and writes content on the branch resolved in `tina/config.ts`, which comes from the host's git environment variable. On Cloudflare that's `WORKERS_CI_BRANCH` (Workers Builds) or `CF_PAGES_BRANCH` (Pages). Add them to the chain"

The doc's concrete chain — as restated by the hardening plan ground truth — is the canonical resolver pattern:

```
GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"
```

(Task prompt verbatim: `GITHUB_BRANCH || VERCEL_GIT_COMMIT_REF || WORKERS_CI_BRANCH || CF_PAGES_BRANCH || HEAD || "main"`; the starter template `config.ts` referenced as "already reads both" for `WORKERS_CI_BRANCH`+`CF_PAGES_BRANCH`.) The repo's current chain covers only `GITHUB_BRANCH` from that set (plus `TINA_BRANCH` local override, which the starter / CI does not remove).

### Comparison

| Token | In current `tina/config.ts:4` | Required per Workers doc chain | Notes |
|---|---|---|---|
| `TINA_BRANCH` | PRESENT | PRESENT (local override before host vars) | Retained — manual branch pin, documented in `.env.example:10` |
| `GITHUB_BRANCH` | PRESENT | PRESENT | GitHub Actions provides it; Workers Builds does *not* |
| `VERCEL_GIT_COMMIT_REF` | MISSING | PRESENT per chain | Vercel-only; **UNNEEDED** for this Cloudflare deployment, but harmless to include for portability |
| `WORKERS_CI_BRANCH` | MISSING | PRESENT | Cloudflare **Workers Builds** injects this — this repo's production host (`wrangler.jsonc:35` name `ukbt-uk-bangla-tigers`, Cloudflare Workers static assets; `ci.yml` no longer deploys via `wrangler deploy` — git-connected Builds do) — so preview branches resolve from it |
| `CF_PAGES_BRANCH` | MISSING | PRESENT | Pages host var; future-proofing + doc-cited chain; no cost |
| `HEAD` | MISSING | PRESENT per chain (git `HEAD` ref) | Convention in Tina docs templates; maps to `process.env.HEAD` |
| `main` fallback | PRESENT (`'main'`) | PRESENT (`"main"`) | OK |

### Impact

Workers doc states verbatim: *"Without them the branch falls back to `main`, so a preview or non-`main` deploy would edit `main` while the site builds from your branch."* On this repo that is a real risk: production is on Workers Builds (not Pages) — every PR preview build checked out at e.g. `feat/x` still resolves Tina's editing branch to `main`, so a content editor opening the preview Worker's `/admin` would commit to `main` while previewing `feat/x`. The `ci.yml` branch env propagation gap compounds nothing at runtime (Workers Builds sets its own env), but it does mean local `pnpm run build` and the CI `build` job also fall through to `main` unless `TINA_BRANCH` is explicitly exported — which `.env.example:10` does provide for local, but CI does not set `TINA_BRANCH` in `env:` (**FACT** `ci.yml:21-31`).

### Verdict

**REQUIRED** — branch chain expansion is required.

- Evidence: `tina/config.ts:4` line cited above vs. Workers doc § Editing branch chain; `ci.yml:15-31` shows no `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` forwarding; installed middleware does not remediate this (it reads only `PUBLIC_TINA_ADMIN_ORIGIN`, not branch vars).
- Scope of required fix (not implemented here): append `|| process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH` (and optionally `|| process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD`) to the branch expression in `tina/config.ts:4`, mirroring the starter template already cited by the Workers doc. Lockfile side-effect is shape-only (touches `tina/tina-lock.json` only), assessed in `CURRENT_STATE.md` as low regression risk. Proposing/implementing is deferred to Task 3 (`CHANGE_LOG.md`), per global constraint "one concern per commit."

### What was NOT claimed

- No claim that this currently broke production — production `main` builds happen to have the fallback produce the correct branch (`main`). The failure mode is isolated to non-`main`/preview editing, which is **UNOBSERVED** (no preview deployment log retrieved) and therefore recorded as INFERENCE for customer impact, not as VERIFIED breakage.

---

## 2. Runtime compatibility

### 2.1 `wrangler.jsonc` — current bindings snapshot

Read `wrangler.jsonc:1-71` (**FACT**, 2026-09-17; same bytes as `CURRENT_STATE.md` appendix D inventory):

```json
{
  "name": "ukbt-uk-bangla-tigers",
  "compatibility_date": "2026-09-14",
  "main": "./apps/web/dist/server/entry.mjs",
  "assets": { "binding": "ASSETS", "directory": "./apps/web/dist/client", "not_found_handling": "404-page" },
  "observability": { ... }
}
```

`Select-String -Path wrangler.jsonc -Pattern "compatibility|kv|SESSION|binding"` (**VERIFIED** this task):

```
wrangler.jsonc:36:  "compatibility_date": "2026-09-14",
wrangler.jsonc:39:    "binding": "ASSETS",
```

No `compatibility_flags`, no `kv_namespaces`, no `SESSION` token — confirmed **VERIFIED** (negative grep), matching `CURRENT_STATE.md` appendix C.

### 2.2 `compatibility_date`

- **Current:** `"2026-09-14"` — **PRESENT** (`wrangler.jsonc:36`).
- **Required:** a pinned date — Workers doc does not mandate an exact value, only that one exists; the installed adapter and `wrangler@4.126.0` accept this date, and the dashboard's "2026-09-15 production 404 recovery" comment in the file (`wrangler.jsonc:18-34`) explains its currency.
- **Verdict: PRESENT** — no change required. (Up-bumping is optional maintenance, not a Tina hardening blocker.)

### 2.3 `compatibility_flags` / `nodejs_compat`

- **Current:** absent — **MISSING** (**VERIFIED** negative grep above).
- **Required:** Workers doc § **Configure for Cloudflare** — second bullet verbatim:

> "Add a root `wrangler.jsonc` that turns on `nodejs_compat`, which the visual-editing route needs for `node:async_hooks`:"

- **Need proven by installed code** — `apps/web/node_modules/@tinacms/astro/dist/middleware.js:11` and `island-route.js:11` plus source copies in the built `middleware.js` in this audit's reads:

```
import { AsyncLocalStorage } from "node:async_hooks";
var formsStore = slot[STORE_KEY] ??= new AsyncLocalStorage();
```

and second store:

```
import { AsyncLocalStorage as AsyncLocalStorage2 } from "node:async_hooks";
var requestStore = slot2[STORE_KEY2] ??= new AsyncLocalStorage2();
```

Island route uses the same two stores to propagate `request` + `forms` through `AstroContainer.renderToString`. Without `nodejs_compat`, Workers have no `node:async_hooks` polyfill and the `tina-island/[name].ts` handler fails at runtime (doc suggests the symptom surfaces as visual-editing POSTs erroring; middleware's `AsyncLocalStorage` is the same prerequisite).

- **Island on-demand proof:** `apps/web/src/pages/tina-island/[name].ts:4-5` (**FACT**):

```ts
export const prerender = false;
export const POST = experimental_createIslandRoute(islands);
```

`output: 'static'` in `apps/web/astro.config.mjs:13` therefore correctly requires a Worker entry (`wrangler.jsonc:37` `main: "./apps/web/dist/server/entry.mjs"` — **PRESENT**) — the adapter emits `dist/client/` + `dist/server/entry.mjs`, root config mirrors it; the "assets-only 404" recovery narrative in `wrangler.jsonc:18-30` already validates `main` being present, so `nodejs_compat` is the remaining gap.

- **Verdict: MISSING — REQUIRED** — add `"compatibility_flags": ["nodejs_compat"]` after `compatibility_date`. (Workers `nodejs_compat` flag is a single-element array per `wrangler` schema; observed in the tina-astro-starter template shipped in the doc's callout. Implementing is Task 3 concern, not this audit.)

### 2.4 `main` and `assets` mapping

- **`main`:** `wrangler.jsonc:37` `"main": "./apps/web/dist/server/entry.mjs"` — **PRESENT** — matches adapter-generated `dist/server/wrangler.json` `main: "entry.mjs"` relative convention cited in file comment (`wrangler.jsonc:22-24`); required because exactly one route (`tina-island/[name].ts`) is `prerender=false`.
- **`assets.directory`:** `wrangler.jsonc:40` `"directory": "./apps/web/dist/client"` — **PRESENT** — matches `dist/client` adapter layout; `binding: "ASSETS"` + `not_found_handling: "404-page"` — **PRESENT**.
- **Verdict: PRESENT** — no changes required. (Mapping is independently enforced by `scripts/check-deploy-mapping.mjs` in CI `deploy-mapping` job `ci.yml:147-159` → `pnpm run check:deploy-mapping`.)

### 2.5 Package-level corroboration

- `apps/web/package.json:14-18` `dependencies` includes `@astrojs/cloudflare ^14.2.5` and `@tinacms/astro ^0.7.0` — **FACT**; confirms the adapter cited by the Workers doc is installed, reinforcing the `nodejs_compat` requirement (the adapter does not itself inject `nodejs_compat` into the root `wrangler.jsonc`; the starter's `wrangler.jsonc` does, and this repo drifted from that template per `CURRENT_STATE.md` P0-1).
- `wrangler@4.126.0` in root `package.json:49` — **FACT** — supports `nodejs_compat` flags on `compatibility_date: 2026-09-14`.

---

## 3. Session KV binding

### Current binding

- `wrangler.jsonc:1-71` — **no `kv_namespaces` key at all** — **MISSING** (**VERIFIED** negative grep; cited identically in `CURRENT_STATE.md` appendix C). Therefore there is no `SESSION` binding pinned in version control.
- Dashboard / live truth: **UNKNOWN** — the Cloudflare dashboard's **Workers & Pages | KV** listing and the Worker's **Settings | Bindings** pane were not retrieved in this audit (no MCP/browser capture, no `npx wrangler kv namespace list --json` output). Whether a namespace was auto-created on the first git-based deploy therefore remains **UNKNOWN**, per evidence-class constraint.

### Workers doc requirement ( § Pin the SESSION KV namespace )

Workers doc text (fetched):

> "The `@astrojs/cloudflare` adapter adds a `SESSION` KV binding (Astro's session store) even when your site doesn't use sessions. Your first deploy creates the namespace automatically, but Cloudflare doesn't write its ID back to your repo, so the next git-based deploy tries to create it again and fails:"

and

> "Editor saves trigger a redeploy, so you would hit this on your second save. Pin the namespace ID in your root `wrangler.jsonc` so every deploy reuses it. Create one with:"

> "`npx wrangler kv namespace create SESSION` or copy the ID your first deploy already made from **Workers & Pages | KV**"

and

> "Then add it to the config:" (pattern pinning `kv_namespaces: [{ "binding": "SESSION", "id": "<id>" }]` in `wrangler.jsonc`)

Observed failure sentinel surfaced in the hardening plan's INFERENCE and in the task's doc callout: Workers error `10014` (duplicate namespace create) on the second git-based deploy.

### Production vs preview isolation

- Worker name `ukbt-uk-bangla-tigers` (`wrangler.jsonc:35`) is used for both production (`main`) and previews (Workers Builds per-branch Workers share the same `wrangler.jsonc` but are isolated at the platform layer via branch-specific deployments). Whether the platform provisions a separate `SESSION` KV per preview vs. sharing one is **UNKNOWN** without dashboard output — documented as **UNKNOWN** rather than inferred.
- What *is* known: this site **does not use Astro sessions** — only `tina-island` POSTs + static assets — so `SESSION` is an adapter-injected artifact, not a functional store. `UNNEEDED` at the application level, but **REQUIRED to pin** at the deployment level to avoid the `10014` redeploy-loop breakage that editors trigger via save → commit → rebuild (described above; would block Task 6 HITL proof).

### Verdict

| Sub-item | Current | Required | Verdict | Evidence |
|---|---|---|---|---|
| `kv_namespaces` key exists | absent | present (SESSION pin) | **MISSING — REQUIRED** (to pin) | `wrangler.jsonc:36-42` negative grep **VERIFIED** |
| `SESSION` binding pin `id` | absent | real ID from dashboard/CLI | **MISSING — but BLOCKED (UNKNOWN ID)** | No `id` can be invented; doc says `npx wrangler kv namespace create SESSION` or copy from **Workers & Pages | KV**. Until an ID is retrieved (MCP/browser or `npx wrangler kv namespace list`), the pin cannot be written without fabricating. Recorded as blocking HITL save→redeploy proof. |
| Functional need for sessions | none | none | **UNNEEDED** for app logic | No `Astro.session` usage anywhere; only adapter-injected |

**No `kv_namespaces` entry is written in this audit** — doing so with a fabricated ID would violate the global constraint "UNKNOWN stays UNKNOWN / never upgrade UNKNOWN→FACT." Task 3 must retrieve a real ID before pinning; if the dashboard is unreachable, `CHANGE_LOG.md` records the blocker instead of committing a fake value.

---

## 4. Admin origin / Headers audit

### 4.1 `PUBLIC_TINA_ADMIN_ORIGIN` — middleware.js vs `.env.example`

- **Middleware honors it:** `apps/web/node_modules/@tinacms/astro/dist/middleware.js:4` — `const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN;` — **FACT** (read dump in this task). Full reader `adminOrigins()` at `middleware.js:2-8`:

```js
function adminOrigins() {
  const env = import.meta.env;
  const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN;
  if (!raw) return null;
  const origins = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return origins.length > 0 ? origins : null;
}
```

and `bridgeScript()` at `middleware.js:116-117` propagates it to `init({adminOrigin: [...]})`:

```js
const origins = adminOrigins();
const initArg = origins ? `{adminOrigin:${JSON.stringify(origins)}}` : "";
return `<script type="module">import{init,refreshForms}from"/admin/bridge.js";init(${initArg});document.addEventListener("astro:page-load",refreshForms);</script>`;
```

- **`.env.example`:** `PUBLIC_TINA_ADMIN_ORIGIN` absent — **MISSING** (**FACT** — `Select-String ... | Select-String TINA|SITE_URL|ADMIN` shows only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`; confirmed by reading `.env.example:1-16`).
- **Workers doc:** the doc's Astro page does **not** list `PUBLIC_TINA_ADMIN_ORIGIN` in § Environment variables (only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `SITE_URL` + `NODE_OPTIONS`). Its inclusion is an *installed adapter behavior* (evidence above), not a doc-mandated deploy variable — but the per-request `isEditMode` → `injectEditMode` → `bridgeScript` path will inject `init()` with an empty origin-allowlist when the var is unset, which defaults the bridge to same-origin only.

- **Verdict: DOCUMENTATION_GAP — REQUIRED (docs-only fix)** — not a runtime `CONFIG_GAP` in the sense of a deployment 10014/branch fault, but a **documentation gap** per task rubric: `.env.example` should document `PUBLIC_TINA_ADMIN_ORIGIN=` with a comment referencing `middleware.js:4` / the bridge allowlist, so local dev and Workers Builds both make the origin contract explicit. Implementing is Task 3 (`.env.example` line addition), one concern per commit.

- **Caveat (UNKNOWN):** the actual production origin value(s) to list — `https://app.tina.io`, `https://*.tinajs.io`, plus the production site origin `https://ukbanglatigers.co.uk` vs. a custom Workers preview origin — were not retrieved from the TinaCloud dashboard's **Site URL** / **Allowed_origins** setting. The example file must therefore ship the *var name + comment* but **no invented origin value**, per evidence-class rule.

### 4.2 `apps/web/public/_headers` — frame-ancestors / connect-src

Read `apps/web/public/_headers:1-40` (**FACT**):

```
 /*
   Strict-Transport-Security: max-age=31536000
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Resource-Policy: same-origin
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self' https://*.ingest.sentry.io https://app.tina.io https://*.tinajs.io; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self' https://app.tina.io https://*.tinajs.io; upgrade-insecure-requests
```

Findings:

| Directive | Value | Status | Note |
|---|---|---|---|
| `Content-Security-Policy` `frame-ancestors` | `'self' https://app.tina.io https://*.tinajs.io` | **PRESENT** | Allows TinaCloud admin iframe embedding; narrowly scoped to Tina domains |
| `Content-Security-Policy` `connect-src` | `'self' https://*.ingest.sentry.io https://app.tina.io https://*.tinajs.io` | **PRESENT** | Required for bridge → `app.tina.io` / `*.tinajs.io` + Sentry ingest; matches doc's allowed Tina domains |
| `X-Frame-Options: DENY` | co-present with `frame-ancestors` | **PRESENT — but overridden** | Per CSP spec, `frame-ancestors` takes precedence over `X-Frame-Options` — `DENY` is ignored for any request with the CSP header, and acts only as a legacy fallback for non-CSP browsers. The combination is safe (not a CONFIG_GAP), but the intent should be documented — `frame-ancestors` is the effective allowlist. |
| `_headers` placement | `apps/web/public/_headers` → adapter copies to `dist/client/_headers` | **PRESENT** | Cloudflare static assets serve this correctly; no Workers-side header mutation needed |

No change required to `_headers` in this audit — **PRESENT** and correctly scoped. The `frame-ancestors` vs `X-Frame-Options: DENY` co-existence is noted as intentional precedence, not a gap.

### 4.3 `SITE_URL`

- Global constraint note: "Site URL is hardcoded at `apps/web/astro.config.mjs:15` (`https://ukbanglatigers.co.uk`); Workers `SITE_URL` env is N/A for this stack (reconciled non-issue)." — cited from hardening plan and `CURRENT_STATE.md` (FACT, `apps/web/astro.config.mjs:15` `site: 'https://ukbanglatigers.co.uk'`).
- Workers doc *does* list `SITE_URL` under § Environment variables ("Workers injects no deploy URL, so without it your sitemap, RSS, and OpenGraph tags fall back to `localhost`"). For this Astro static site, that concern is already addressed by the hardcoded `site` field (adapter uses it for sitemap/RSS/OG URL construction at `pnpm run build` → `node scripts/generate-sitemap.mjs`).
- **Verdict: UNNEEDED — N/A for this stack** — do not document `SITE_URL` in `.env.example` as a required deploy var; doing so would contradict the reconciled non-issue. (If a future route ever needs runtime `SITE_URL`, it surfaces as a separate gap analysis.)

### 4.4 `apps/web/astro.config.mjs` — adapter / output corroboration

- `astro.config.mjs:7,28` `tina()` integration + `cloudflare()` adapter, `output: 'static'` — **FACT** (already in `CURRENT_STATE.md` appendix D, not re-audited except cited here for admin-origin/middleware relevance: the `cloudflare()` adapter is what causes `SESSION` KV injection and requires `nodejs_compat` for `node:async_hooks` — consistent with §2.3).

---

## 5. Summary table

| Item | Current | Required | Verdict | Evidence |
|---|---|---|---|---|
| **Branch — `TINA_BRANCH`** | `process.env.TINA_BRANCH` at `tina/config.ts:4` | `process.env.TINA_BRANCH` (keep) | **PRESENT** | `tina/config.ts:4` |
| **Branch — `GITHUB_BRANCH`** | `process.env.GITHUB_BRANCH` at `tina/config.ts:4` | `process.env.GITHUB_BRANCH` | **PRESENT** | `tina/config.ts:4` |
| **Branch — `WORKERS_CI_BRANCH`** | absent | `process.env.WORKERS_CI_BRANCH` | **MISSING — REQUIRED** | `tina/config.ts:4` negative grep; Workers doc § Editing branch |
| **Branch — `CF_PAGES_BRANCH`** | absent | `process.env.CF_PAGES_BRANCH` | **MISSING — REQUIRED** | `tina/config.ts:4` negative grep; Workers doc § Editing branch (starter "already reads both") |
| **Branch — `VERCEL_GIT_COMMIT_REF`** | absent | `process.env.VERCEL_GIT_COMMIT_REF` | **MISSING — UNNEEDED** for this Cloudflare host (include only for portability) | Chain includes it but host is Workers, not Vercel |
| **Branch — `HEAD`** | absent | `process.env.HEAD` | **MISSING — UNNEEDED** (conventional, low signal) | Chain includes `HEAD`; no CI provides it here |
| **Branch — `ci.yml` branch env propagation** | no branch env in `env:` (`ci.yml:21-31` only `PUBLIC_TINA_CLIENT_ID`/`TINA_TOKEN`) | no runtime requirement (Workers injects `WORKERS_CI_BRANCH`) | **UNNEEDED** at runtime; documenting current state as **PRESENT (platform-injected)** | `ci.yml:21-31` read |
| **Runtime — `compatibility_date`** | `"2026-09-14"` (`wrangler.jsonc:36`) | pinned date | **PRESENT** | `wrangler.jsonc:36` |
| **Runtime — `compatibility_flags: ["nodejs_compat"]`** | absent | `["nodejs_compat"]` | **MISSING — REQUIRED** | `wrangler.jsonc:36-42` negative grep **VERIFIED**; Workers doc § Configure for Cloudflare + installed `middleware.js:11`/`island-route.js:11` `node:async_hooks` |
| **Runtime — `main`** | `"./apps/web/dist/server/entry.mjs"` (`wrangler.jsonc:37`) | `"./apps/web/dist/server/entry.mjs"` | **PRESENT** | `wrangler.jsonc:37`; island `prerender=false` requires it |
| **Runtime — `assets.directory`** | `"./apps/web/dist/client"` (`wrangler.jsonc:40`) | `"./apps/web/dist/client"` | **PRESENT** | `wrangler.jsonc:40` |
| **Runtime — `tina-island/[name].ts` `prerender=false` + `POST`** | `export const prerender = false; export const POST = experimental_createIslandRoute(islands)` (`island route:4-5`) | `prerender=false` + island POST | **PRESENT** | `apps/web/src/pages/tina-island/[name].ts:4-5` |
| **Session KV — `kv_namespaces` key** | absent | present | **MISSING — REQUIRED** (structural) | `wrangler.jsonc` negative grep **VERIFIED** |
| **Session KV — `SESSION` binding `id`** | absent | real ID from dashboard/CLI | **MISSING — BLOCKED (UNKNOWN ID)** | No valid `id` retrievable in this audit; cannot invent. Blocks Task 3 pin. Workers doc § Pin SESSION KV + expected `10014` on 2nd git-based deploy. |
| **Session KV — functional need** | not used | not used | **UNNEEDED** (adapter artifact) | No `Astro.session` usage |
| **Admin — `PUBLIC_TINA_ADMIN_ORIGIN` honors in middleware** | present in built `middleware.js:4` / `admin-origin.ts` (`adminOrigins()` reader + `bridgeScript` `initArg`) | present | **PRESENT** | `apps/web/node_modules/@tinacms/astro/dist/middleware.js:2-4,116-117` read |
| **Admin — `PUBLIC_TINA_ADMIN_ORIGIN` in `.env.example`** | absent (`.env.example:1-16` only `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`) | document var + comment referencing `middleware.js:4` | **MISSING — DOCUMENTATION_GAP (REQUIRED)** | `.env.example:7-10` read + `Select-String` negative |
| **Admin — `_headers` `frame-ancestors`** | `'self' https://app.tina.io https://*.tinajs.io` (`_headers:9`) | Tina admin origins allowlisted | **PRESENT** | `apps/web/public/_headers:9` |
| **Admin — `_headers` `connect-src`** | `https://app.tina.io https://*.tinajs.io` (`_headers:9`) | Tina admin + Sentry | **PRESENT** | `apps/web/public/_headers:9` |
| **Admin — `X-Frame-Options: DENY` coexistence** | present (`_headers:4`) | CSP `frame-ancestors` governs | **PRESENT (precedence note)** | `apps/web/public/_headers:4,9` |
| **`SITE_URL` env** | hardcoded `site: 'https://ukbanglatigers.co.uk'` (`astro.config.mjs:15`) | N/A per global constraint | **UNNEEDED — N/A** | `apps/web/astro.config.mjs:15`; Workers doc § Env vars vs. hardcoded site reconciled non-issue |

---

## Evidence inventory (retrieval time: 2026-09-17)

All line refs below are **FACT** (bytes on disk) or **VERIFIED** (file + command output). No UNKNOWN→FACT upgrades were performed. Dashboard/KV ID items retained as **UNKNOWN** per constraint.

| File | Lines read | Class |
|---|---|---|
| `tina/config.ts` | `1-317` incl `branch:4` `TINA_BRANCH \|\| GITHUB_BRANCH \|\| 'main'` | FACT |
| `wrangler.jsonc` | `1-71` (`compatibility_date:36`, `main:37`, `assets:38-42`) | FACT |
| `wrangler.jsonc` negative grep `compatibility_flags\|kv_namespaces\|SESSION` | only `compatibility_date` + `ASSETS` binding | VERIFIED |
| `apps/web/astro.config.mjs` | `1-30` (`site:15`, `cloudflare():28`, `tina():7`) | FACT |
| `apps/web/src/pages/tina-island/[name].ts` | `1-5` (`prerender=false:4`, `POST:5`) | FACT |
| `apps/web/node_modules/@tinacms/astro/dist/middleware.js` | `full dump` (`adminOrigins:2-8`, `node:async_hooks:11,32`, `bridgeScript:116-117`) | FACT |
| `apps/web/node_modules/@tinacms/astro/dist/island-route.js` | `full dump` (`node:async_hooks:11,25`, `rejectIfUnsafe:43-58`) | FACT |
| `.github/workflows/ci.yml` | `1-348` (`env:21-31` `PUBLIC_TINA_CLIENT_ID:30`, `TINA_TOKEN:31`, `branches:15`) | FACT |
| `.github/workflows/ci.yml` grep branch env | no `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` forwarding | VERIFIED |
| `.env.example` | `1-16` (`PUBLIC_TINA_CLIENT_ID:8`, `TINA_TOKEN:9`, `TINA_BRANCH:10`) | FACT |
| `apps/web/public/_headers` | `1-40` (`_headers:9` CSP with `frame-ancestors` + `connect-src`) | FACT |
| `package.json` | `1-51` (`build:18`, `deploy:verify:42`, `wrangler@4.126.0:49`) | FACT |
| `apps/web/package.json` | `dependencies` `@tinacms/astro@0.7.0`, `@astrojs/cloudflare@14.2.5` | FACT |
| `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` | fetched markdown (Editing branch / nodejs_compat / SESSION pin / env vars sections) | FACT (webfetch 2026-09-17) |
| `artifacts/audit/tina-hardening/CURRENT_STATE.md` | appendix VERIFIED (git ls-files, grep zero) | VERIFIED (cited, not re-audited) |
| Cloudflare dashboard **Workers & Pages | KV** + Worker **Settings | Bindings** SESSION `id` | not retrieved | UNKNOWN |
| TinaCloud dashboard **Site URL** / preview `workers.dev` origin for `PUBLIC_TINA_ADMIN_ORIGIN` value | not retrieved | UNKNOWN |

---

## Cross-reference to CURRENT_STATE.md

- `CURRENT_STATE.md` P0-1 stated: "Workers config drift — `wrangler.jsonc:36-42` missing `nodejs_compat` + SESSION KV pin, `tina/config.ts:4` missing `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` — cite `wrangler.jsonc:1-71`, `tina/config.ts:4`" — **VERIFIED appendix** confirmed via `Select-String` negative for `nodejs_compat|kv_namespaces|SESSION` and line read `tina/config.ts:4`. This audit corroborates that finding with doc authority and per-item verdicts above, without re-running the `git ls-files` / `requestWithMetadata` greps (cited verbatim from `CURRENT_STATE.md` appendix A/B per Task 2 instruction).
- `CURRENT_STATE.md` P0-2 / P1-3 / P1-4 (HITL proof missing, visual editing NOT CONNECTED, About orphan) are not in this file's scope and are deferred to `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` / `ABOUT_COLLECTION_DECISION.md`; they are not re-audited here.

---

## Risks / Blockers for Task 3

1. **Branch fix** — low risk, reversible (`git revert`), validated by `pnpm run build` shape-checking `tina-lock.json`. REQUIRED and unblocked.
2. **`nodejs_compat` fix** — low risk, reversible, validated by `node scripts/check-deploy-mapping.mjs` PASS. REQUIRED and unblocked.
3. **`PUBLIC_TINA_ADMIN_ORIGIN` docs fix** — docs-only, no runtime change; REQUIRED but the *value* is UNKNOWN (needs dashboard origin), so `.env.example` must ship empty `PUBLIC_TINA_ADMIN_ORIGIN=` + comment, not an invented domain.
4. **SESSION KV pin** — **BLOCKED** — REQUIRED structurally but the `id` is UNKNOWN. Task 3 must either run `npx wrangler kv namespace list --json` / dashboard MCP capture to obtain a real `id`, or record the blocker in `CHANGE_LOG.md` as the reason HITL save→redeploy proof cannot yet be demonstrated (second save would hit `10014` per doc). Fabricating an `id` is forbidden by evidence-class constraint and would break `wrangler deploy` more thoroughly than the missing binding does.

---

*Audit generated from HEAD `a355f599` + live Workers doc fetch. No config was modified. Facts are traceable to file:line citations above; verdicts follow the Workers doc requirements literally, not by inference.*
