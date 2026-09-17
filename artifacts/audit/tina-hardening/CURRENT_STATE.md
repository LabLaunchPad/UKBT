# CURRENT_STATE — 2026-09-17

> Base: `67ba0988ae905821ed1e0ff0924b8531aae29c9c` — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Evidence classes: **FACT** (file line exists) / **VERIFIED** (file + command output) / **OBSERVED** (screenshot/dashboard) / **INFERENCE** (deduced) / **UNKNOWN** (not retrievable) — never upgraded UNKNOWN → FACT.

## Completed (with evidence links)

| Area | Status | Evidence |
|---|---|---|
| Tina lockfile | DONE | `tina/tina-lock.json` committed — `git -C . ls-files tina/` shows it — **VERIFIED** |
| Tina schema | DONE | `tina/config.ts:28-314` 4 collections (`homepage`, `about`, `faq`, `siteSettings`), builds via `tinacms build --skip-cloud-checks` (`package.json:18`) — **FACT** |
| Tina admin login | VERIFIED | human login works (dashboard 3/4 screenshot, `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`) — **UNKNOWN** (file `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` not found on disk at this commit; screenshot ref not retrievable locally — OBSERVED claim in fixing plan, not locally VERIFIED) |
| Tina build integration | VERIFIED | root `package.json:18` prepends `tinacms build --skip-cloud-checks --skip-search-index` + `ci.yml:271` regenerates admin before e2e (`pnpm exec tinacms build --skip-cloud-checks --skip-search-index`) — **VERIFIED** (`package.json:18`, `.github/workflows/ci.yml:26-31,271`) |
| Generated artifacts | OK | `tina/__generated__/` + `apps/web/public/admin/` gitignored (`.gitignore:7-12`) — **FACT** |
| FAQ security path | OK | `apps/web/src/lib/faq-answer.ts:39-53` escapes Tina AST (`escapeHtml` + `<p>` only, marks dropped by design) — **FACT** |
| TinaCloud branch env | FACT | `tina/config.ts:4` `branch: process.env.TINA_BRANCH \|\| process.env.GITHUB_BRANCH \|\| 'main'` — **FACT** (missing `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` — see P0) |
| Astro + Cloudflare adapter | FACT | `apps/web/astro.config.mjs:7,28` `tina()` integration + `cloudflare()` adapter, `output: 'static'` — **FACT** |
| Island route | FACT | `apps/web/src/pages/tina-island/[name].ts:4-5` `export const prerender = false; export const POST = experimental_createIslandRoute(islands)` — **FACT** |
| Loaders | FACT | `apps/web/src/lib/tina/loaders.ts:1-82` static JSON imports + Zod parse, no `requestWithMetadata` — **FACT** |
| Islands | FACT | `apps/web/src/lib/tina/islands.ts:1-44` registry `hero` + `aboutSection`, fetch from `tinaHomepage` + `homepage.social`, no `requestWithMetadata` — **FACT** |
| Security headers | FACT | `apps/web/public/_headers:9` CSP includes `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` + `X-Frame-Options: DENY` — **FACT** |

## Unresolved (risk-ranked)

### P0 / Production risk

1. Workers config drift — `wrangler.jsonc:36-42` missing `nodejs_compat` + SESSION KV pin, `tina/config.ts:4` missing `WORKERS_CI_BRANCH`/`CF_PAGES_BRANCH` — cite `wrangler.jsonc:1-71`, `tina/config.ts:4`. — **VERIFIED** (grep `nodejs_compat|kv_namespaces|SESSION` in `wrangler.jsonc` returns only `compatibility_date`; `tina/config.ts:4` line confirmed). Gap matches fixing plan File map; unresolved until WORKERS_TINA_CONFIGURATION_AUDIT proves REQUIRED/NOT_REQUIRED. — **INFERENCE** for production impact (unpinned SESSION breaks 2nd deploy per Workers doc) remains INFERENCE until dashboard evidence.

2. Human edit→save→commit→deploy proof missing — checklist step 4 unchecked in screenshot. — **OBSERVED** (fixing plan spec cites TinaCloud dashboard screenshot 3/4, step 4 unchecked) — **UNKNOWN** locally (no commit SHA or redeploy log retrievable without HITL). Blocked on `TINA_HITL_RUNBOOK.md` + human action.

### P1 / Functional completeness

3. Visual editing incomplete — `grep` shows zero `requestWithMetadata`/`TinaIsland`/`tinaField` in `apps/web/src` except hand-stamped `data-tina-field` strings. — **VERIFIED** (see Appendix: `grep -r "requestWithMetadata|TinaIsland|tinaField"` shows 0 `requestWithMetadata`, 0 `TinaIsland`, only 6 lines of prop alias `'data-tina-field': tinaField` in `AboutStory.astro`, `LeadershipGrid.astro`, `PageBanner.astro` — not `tinaField()` from `@tinacms/astro/tina-field`; `data-tina-field="…"` hand-stamped strings present in `Hero.astro:81,82,87,89`, `ClubIntro.astro:112`, `about.astro:78,89,125`, `faq.astro:32` — see second grep). No visual-editing data layer wired.

4. About collection orphan — `apps/web/content/about/about.json` exists (`heroSubline`, `storyBody` AST, `leadershipIntro`, images), zero `tinaAbout` refs in `apps/web/src`. — **VERIFIED** (`apps/web/content/about/about.json` exists; `Select-String tinaAbout|about\.json` in `apps/web/src` returns 0 hits; `loaders.ts` has no About schema). Decision deferred to `ABOUT_COLLECTION_DECISION.md`.

## Evidence links

- plan: `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` — **FACT** (273 lines, reconciled non-issues Table, Tasks 1-10)
- hardening plan (this loop): `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` — **FACT** (Task 1 source)
- config: `tina/config.ts:4`, `wrangler.jsonc`, `apps/web/astro.config.mjs:7,28`, `apps/web/src/lib/tina/loaders.ts:1-82`, `apps/web/src/lib/tina/islands.ts:1-44` — **FACT**
- deploy: `package.json:18,42`, `.github/workflows/ci.yml:26,271` — **FACT**
- security: `apps/web/src/lib/faq-answer.ts:39-53`, `apps/web/public/_headers:9` — **FACT**
- components: `apps/web/src/components/Hero.astro:81-89` hand-stamped `data-tina-field` — **FACT**
- content: `apps/web/content/about/about.json`, `apps/web/content/homepage/homepage.json`, `apps/web/content/faq/faq.json`, `apps/web/content/site/siteSettings.json` — **FACT** (4 files on disk)
- env: `.env.example:8-10` `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH` — **FACT**
- missing: `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` — **UNKNOWN** (not found at `67ba0988`; fixing plan refs it as HITL source — do not infer content)

## Stop condition

If any prior assumption not reproducible, mark **UNKNOWN** and stop — do not infer.

- `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` content: **UNKNOWN** — not on disk; fixing plan claim kept as OBSERVED/UNKNOWN, not upgraded.
- TinaCloud dashboard screenshot 3/4 state: **OBSERVED** per fixing plan, **UNKNOWN** locally without HITL — do not claim 4/4.
- SESSION KV namespace ID / `nodejs_compat` dashboard value: **UNKNOWN** until Task 2 audits via `https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers` + dashboard + `node_modules/@tinacms/astro/dist/middleware.js`.
- Any claim not backed by a line ref above remains **INFERENCE** or **UNKNOWN**.

---

## Appendix — VERIFIED command outputs (2026-09-17, worktree `C:\UKBT\ukbt-tina-hardening` at `67ba0988`)

### A. `git -C . ls-files tina/`

```
tina/config.ts
tina/tina-lock.json
```

Classification: **VERIFIED** — command `git -C "C:\UKBT\ukbt-tina-hardening" ls-files tina/` reproduced above; matches reconciled non-issue "tina/__generated__/ not committed" (`.gitignore:9`).

### B. `grep -r "requestWithMetadata\|TinaIsland\|tinaField" apps/web/src`

PowerShell equivalent: `Get-ChildItem -Path "apps/web/src" -Recurse -File | Select-String -Pattern "requestWithMetadata|TinaIsland|tinaField"`

Output:

```
apps\web\src\components\AboutStory.astro:21: const { paragraphs, stats, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\AboutStory.astro:41: <div class="ukbt-story__paragraphs" {...tinaField ? { 'data-tina-field': tinaField } : {}}>
apps\web\src\components\LeadershipGrid.astro:29: const { leaders, intro, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\LeadershipGrid.astro:61: <p {...tinaField ? { 'data-tina-field': tinaField } : {}}>{intro}</p>
apps\web\src\components\PageBanner.astro:36: const { title, crumbs, lede, background, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\PageBanner.astro:55: {lede && <p class="ukbt-page-banner__lede" {...tinaField ? { 'data-tina-field': tinaField } : {}}>{lede}</p>}
```

Interpretation: **VERIFIED** — zero hits for `requestWithMetadata`, zero for `TinaIsland`, zero for `tinaField()` import (`@tinacms/astro/tina-field`). Only prop aliases named `tinaField` for passing through `data-tina-field` attribute values; not the docs-prescribed visual-editing API.

Second grep `data-tina-field` (hand-stamped markers) — VERIFIED:

```
apps\web\src\components\AboutStory.astro:19: 'data-tina-field'?: string;
apps\web\src\components\AboutStory.astro:21: const { paragraphs, stats, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\AboutStory.astro:41: <div class="ukbt-story__paragraphs" {...tinaField ? { 'data-tina-field': tinaField } : {}}>
apps\web\src\components\ClubIntro.astro:112: <p class="ukbt-about__lede" data-tina-field="clubIntroLede">{lede}</p>
apps\web\src\components\Hero.astro:81: {eyebrow && <p class="ukbt-hero__eyebrow ukbt-eyebrow ukbt-eyebrow--on-dark" data-tina-field="eyebrow">{eyebrow}</p>}
apps\web\src\components\Hero.astro:82: <h1 class="ukbt-hero__headline" data-tina-field="headline">
apps\web\src\components\Hero.astro:87: <p class="ukbt-hero__tagline" data-tina-field="tagline">{taglineShort}</p>
apps\web\src\components\Hero.astro:89: <Button label={primaryCtaLabel} href={primaryCtaLink} variant="primary" data-tina-field="primaryCtaLabel" />
apps\web\src\components\LeadershipGrid.astro:27: 'data-tina-field'?: string;
apps\web\src\components\LeadershipGrid.astro:29: const { leaders, intro, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\LeadershipGrid.astro:61: <p {...tinaField ? { 'data-tina-field': tinaField } : {}}>{intro}</p>
apps\web\src\components\PageBanner.astro:17: 'data-tina-field'?: string;
apps\web\src\components\PageBanner.astro:36: const { title, crumbs, lede, background, 'data-tina-field': tinaField } = Astro.props;
apps\web\src\components\PageBanner.astro:55: {lede && <p class="ukbt-page-banner__lede" {...tinaField ? { 'data-tina-field': tinaField } : {}}>{lede}</p>}
apps\web\src\pages\about.astro:15: // data-tina-field attributes added for visual editing in Tina admin.
apps\web\src\pages\about.astro:78: <PageBanner title="About Us" crumbs={crumbs} lede={about.heroSubline} background={bannerBackground} data-tina-field="heroSubline" />
apps\web\src\pages\about.astro:89: <AboutStory paragraphs={about.storyParagraphs} stats={storyStats} data-tina-field="storyBody" />
apps\web\src\pages\about.astro:125: data-tina-field="leadershipIntro"
apps\web\src\pages\faq.astro:32: <summary class="ukbt-faq-question" data-tina-field="items.question">{item.question}</summary>
```

### C. Additional VERIFIED checks

- `wrangler.jsonc:1-71` — no `compatibility_flags`, no `kv_namespaces`, no `SESSION` — **VERIFIED** via `Select-String` (only `compatibility_date: "2026-09-14"`).
- `git ls-files --error-unmatch tina/config.ts tina/tina-lock.json` — both tracked — **VERIFIED**.
- `apps/web/content/about/about.json` exists on disk with `heroSubline`, `storyBody` (Tina AST), `leadershipIntro` — **VERIFIED** via `Get-ChildItem apps/web/content`.
- `Select-String tinaAbout|about\.json` in `apps/web/src` — 0 hits — **VERIFIED** (orphan).

### D. File read inventory (all FACT line refs)

| File | Lines read | Class |
|---|---|---|
| `tina/config.ts` | 1-317 (4 collections, `branch:4`, `clientId:8`, `token:9`) | FACT |
| `tina/tina-lock.json` | 1 (minified, `version.fullVersion:3.0.0`) | FACT |
| `wrangler.jsonc` | 1-71 (name `ukbt-uk-bangla-tigers`, `main`, `assets`, `observability`) | FACT |
| `apps/web/astro.config.mjs` | 1-30 (`tina():7`, `cloudflare():28`, `site:15`) | FACT |
| `apps/web/src/lib/tina/loaders.ts` | 1-82 (Zod schemas, `tinaHomepage/Faq/Site`) | FACT |
| `apps/web/src/lib/tina/islands.ts` | 1-44 (`hero`, `aboutSection`) | FACT |
| `apps/web/src/pages/tina-island/[name].ts` | 1-5 (`prerender=false`, `experimental_createIslandRoute`) | FACT |
| `apps/web/src/components/Hero.astro` | 1-335 (`data-tina-field:81,82,87,89`) | FACT |
| `.env.example` | 1-16 (`PUBLIC_TINA_CLIENT_ID:8`, `TINA_TOKEN:9`) | FACT |
| `.github/workflows/ci.yml` | 1-348 (`PUBLIC_TINA_CLIENT_ID:30`, `TINA_TOKEN:31`, `tinacms build:271`) | FACT |
| `package.json` | 1-51 (`build:18`, `deploy:verify:42`) | FACT |
| `apps/web/package.json` | 1-34 (`@tinacms/astro:0.7.0:18`, `@tinacms/bridge:19`) | FACT |
| `apps/web/public/_headers` | 1-40 (CSP:9, cache matrix) | FACT |
| `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md` | 1-273 (reconciled non-issues, Tasks 1-10) | FACT |
| `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md` | not found | UNKNOWN |
| `apps/web/src/lib/faq-answer.ts` | 1-53 (`escapeHtml`, `renderFaqAnswer:39-53`) | FACT |
| `.gitignore` | 1-... (`tina/__generated__/:9`, `apps/web/public/admin/:12`) | FACT |

### E. Evidence class summary

- **FACT**: file line exists on disk at `67ba0988` (this appendix).
- **VERIFIED**: FACT + command output pasted above (`git ls-files`, `grep`).
- **OBSERVED**: dashboard screenshot 3/4 (cited by fixing plan, not locally reproduced).
- **INFERENCE**: deduced production impact (SESSION 10014 on 2nd deploy) — kept as INFERENCE.
- **UNKNOWN**: `SETUP_AND_HITL_RUNBOOK.md` content, dashboard live state, SESSION KV ID, checklist step 4 SHA — never upgraded.

---

*Generated for Task 1 Phase 0 — evidence-ranked. Later tasks must cite this file's VERIFIED appendix, not stale `docs/tina-audit/*`.*
