# TinaCMS Fixing Plan — checklist 4/4, deploy safety, visual editing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take TinaCloud project "UK Bangla Tigers" from setup-checklist 3/4 to 4/4 (first editor commit lands on GitHub and redeploys), close the deploy-safety gaps the Workers doc exposes, and wire React-free visual editing per the Astro docs.

**Architecture:** Keep the proven Git-backed editorial flow (sidebar form editing → commit → rebuild → redeploy on Cloudflare Workers); fix config/deploy gaps first, perform the human-owned first commit, then layer the docs-prescribed visual-editing path (`requestWithMetadata` loaders → island registry → `<TinaIsland>` → `tinaField`) without touching the truth gate.

**Tech Stack:** TinaCMS 3.14 / `@tinacms/astro` 0.7.0 (installed, FACT) / Astro 7.2 / Cloudflare Workers (`@astrojs/cloudflare` 14.2, `output: 'static'` + one on-demand route) / pnpm 10 / Node 22.

**Spec:** TinaCloud dashboard state in screenshot (Client ID `fe5da197-…`, 4 Site URLs, step 4 unchecked) + `docs/tina-integration.md` + Tina docs fetched 2026-09-17 (`/tina-folder/overview`, `/reference/config`, `/reference/collections`, `/reference/fields`, `/reference/templates`, `/reference/types/image`, `/reference/media/repo-based`, `/frameworks/astro`, `/contextual-editing/astro`, `/migrations/astro-react-free-visual-editing`, `/tinacloud/deployment-options/cloudflare-workers`, `/tinacloud/deployment-options/cloudflare-pages`).

## Global Constraints

- Node ≥22, pnpm ≥10 (`package.json:6-10`).
- Biome style: single quotes, semicolons, 2-space indent.
- TinaCMS is editorial-only: never bypass `@ukbt/truth`, provenance gate, SEO/a11y/perf/security/deployment contracts.
- `TINA_TOKEN` is secret: local `.env` + CI/Cloudflare secret stores only; never chat/docs/commits.
- Human owns TinaCloud login/credentials; agent never handles them (HITL runbook: `artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`).
- UNKNOWN stays UNKNOWN; `deploy:verify` (`package.json:42`) is the release authority; no gate weakening for PASS.
- One concern per PR; no merges without re-approval.

---

## File map (what changes, and why)

| File | Change |
|---|---|
| `tina/config.ts:4` | Branch chain += `WORKERS_CI_BRANCH`, `CF_PAGES_BRANCH` (Workers doc: preview deploys otherwise edit `main`) |
| `wrangler.jsonc` | Verify/add `compatibility_flags: ['nodejs_compat']` + pin `kv_namespaces` SESSION id (Workers doc: island route needs it; unpinned SESSION breaks 2nd deploy = the redeploy step 4 triggers) |
| `.env.example` | Document `PUBLIC_TINA_ADMIN_ORIGIN` (honored by installed middleware, `middleware.js:4`) |
| `apps/web/astro.config.mjs` | Add `tinaAdminDevRedirect()` dev plugin (docs `/frameworks/astro`); keep `tina()` + `cloudflare()` |
| `apps/web/src/lib/tina/loaders.ts` | Route reads through generated client + `requestWithMetadata` (docs `/contextual-editing/astro`); keep Zod gate as the fail-closed choke point |
| `apps/web/src/lib/tina/islands.ts` | Keep registry; fetchers return `requestWithMetadata` results |
| `apps/web/src/pages/index.astro`, `about.astro`, `faq.astro` | Wrap editable regions in `<TinaIsland>` (`primary` on main region); required for static-output editing |
| `apps/web/src/components/Hero.astro`, `ClubIntro.astro`, `AboutStory.astro`, `PageBanner.astro`, `LeadershipGrid.astro` | Replace hand-stamped `data-tina-field="…"` strings with `tinaField()` output |
| `tina/config.ts` (siteSettings) | Add `ui.global: true` (Collections doc: site-wide single doc belongs under Site heading) |
| Image fields in `tina/config.ts` | Add `accept: 'image'` narrowing (Image doc) |
| About collection | HUMAN DECISION: wire behind truth gate OR delete collection + `apps/web/content/about/about.json` (currently orphaned: zero `tinaAbout` refs in `src`, FACT) |

## Reconciled non-issues (do NOT "fix")

- **Cloudflare Pages doc:** explicitly says Astro → Workers, not Pages. UKBT is already on Workers (`wrangler.jsonc` + dashboard). No migration; Pages doc only confirms current target.
- **`SITE_URL` (Workers doc):** zero refs in repo; `astro.config.mjs:15` hardcodes `site`, sitemap derives from it. N/A for this stack.
- **Root `build` missing `tinacms build`:** FALSE — `package.json:18` prepends `tinacms build --skip-cloud-checks --skip-search-index`; CI regenerates at `ci.yml:271`. Stale `docs/tina-audit/*` claims otherwise; trust current files.
- **`tina/__generated__/` committed:** FALSE — `git ls-files tina/` shows only `config.ts` + `tina-lock.json`; `.gitignore` covers `__generated__/`. Matches docs.
- **`apps/web/public/admin/` missing:** FALSE — exists on disk (build artifact, gitignored). Matches docs.
- **FAQ rich-text vs `renderFaqAnswer`:** COMPATIBLE — `faq-answer.ts:39-53` already walks Tina AST `{children:[{children:[{text}]}]}` and escapes; marks dropped by design (REM-001).
- **X-Frame-Options: DENY vs admin iframe:** `_headers` also sets `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io`, which takes precedence in modern browsers; `connect-src` already allows Tina hosts. No change.

---

### Task 1: Precondition sweep (no code)

**Files:** none (read-only evidence).

**Interfaces:**
- Consumes: TinaCloud dashboard (human), Cloudflare dashboard (human).
- Produces: go/no-go for Task 6 (step-4 commit).

- [ ] **Step 1: Confirm GitHub write access for the TinaCloud project.** Human opens TinaCloud → project → Configuration and verifies the GitHub connection has commit access to `LabLaunchPad/UKBT` on `main`. If saves later 403, this is the cause. Record FACT or BLOCKED.
- [ ] **Step 2: Confirm SESSION KV + compat flags dashboard-side.** Human checks Workers & Pages → Worker → Settings: note whether a SESSION KV namespace already exists (copy its ID for Task 3) and whether `nodejs_compat` is set. Record both.
- [ ] **Step 3: Confirm local admin serves.** Run: `pnpm run build` (root; requires `.env` with `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`), then serve `apps/web/dist/client` and open `/admin/index.html`. Expected: admin SPA loads, collections list shows Homepage / About / FAQ / Site settings.
- [ ] **Step 4: Commit nothing.** This task changes no files. If any step fails, file the blocker and stop.

### Task 2: Branch chain fix

**Files:**
- Modify: `tina/config.ts:4`

**Interfaces:**
- Consumes: Workers doc editing-branch chain.
- Produces: `branch` resolves correctly on Workers Builds previews.

- [ ] **Step 1: Edit the branch line.**

```ts
branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main',
```

- [ ] **Step 2: Regenerate lockfile.** Run from root: `pnpm exec tinacms dev -c "echo lockfile-check"` (or `pnpm run build`); confirm `git status --porcelain tina/` shows at most `tina-lock.json` modified, and the diff touches only branch metadata.
- [ ] **Step 3: Commit.**

```bash
git add tina/config.ts tina/tina-lock.json
git commit -m "fix(tina): resolve editing branch on Workers Builds previews"
```

### Task 3: Wrangler safety (nodejs_compat + SESSION pin)

**Files:**
- Modify: `wrangler.jsonc` (only after Task 1 Step 2 evidence).

**Interfaces:**
- Consumes: SESSION namespace ID from Task 1.
- Produces: second-deploy-safe Worker config.

- [ ] **Step 1: Add compat flag.** Insert `"compatibility_flags": ["nodejs_compat"],` after `"compatibility_date"`. Rationale: Workers doc states the visual-editing route needs it for `node:async_hooks`.
- [ ] **Step 2: Pin SESSION KV.** If Task 1 found an existing namespace ID, add `"kv_namespaces": [{ "binding": "SESSION", "id": "<id-from-dashboard>" }]`; if none exists, create one via `npx wrangler kv namespace create SESSION` and pin the returned ID. Never invent the ID (UNKNOWN until dashboard/CLI returns it).
- [ ] **Step 3: Validate mapping.** Run: `node scripts/check-deploy-mapping.mjs`. Expected: PASS (config still mirrors adapter output).
- [ ] **Step 4: Commit.**

```bash
git add wrangler.jsonc
git commit -m "fix(deploy): pin SESSION KV and nodejs_compat for Tina island route"
```

### Task 4: Admin-origin docs + dev redirect

**Files:**
- Modify: `.env.example`, `apps/web/astro.config.mjs`

**Interfaces:**
- Consumes: installed middleware behavior (`PUBLIC_TINA_ADMIN_ORIGIN` read at `middleware.js:4`).
- Produces: documented cross-origin admin; bare `/admin` works in dev.

- [ ] **Step 1: Document the variable in `.env.example`.**

```
# TinaCMS cross-origin admin (Workers preview URL + custom domain are
# different origins from the editor). Read by @tinacms/astro middleware;
# comma-separate multiple origins. Empty = same-origin only.
PUBLIC_TINA_ADMIN_ORIGIN=
```

- [ ] **Step 2: Add dev redirect plugin in `apps/web/astro.config.mjs`.**

```mjs
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
```

Add `vite: { plugins: [tinaAdminDevRedirect()] }` to `defineConfig` (dev-only redirect `/admin` → `/admin/index.html`; no production effect). Verify the subpath export exists in installed 0.7.0 first: `node -e "import.meta.resolve('@tinacms/astro/vite')"` from `apps/web/`.
- [ ] **Step 3: Typecheck.** Run: `pnpm --filter @ukbt/web typecheck`. Expected: PASS.
- [ ] **Step 4: Commit.**

```bash
git add .env.example apps/web/astro.config.mjs
git commit -m "fix(tina): document admin origin, redirect /admin in dev"
```

### Task 5: Editor UX hardening (global settings, media accept)

**Files:**
- Modify: `tina/config.ts` (siteSettings `ui`, image fields, faq `items` list).

**Interfaces:**
- Consumes: Collections/Image/Fields docs.
- Produces: stricter, better-organized editor with identical stored shapes.

- [ ] **Step 1: Mark siteSettings global.** In the `siteSettings` collection add `ui: { allowedActions: { create: false, delete: false }, global: true }`. Stored JSON unchanged; editor moves it under the Site heading.
- [ ] **Step 2: Narrow image fields.** Add `accept: 'image'` to `heroImage`, `aboutImage`, `managementImage`, `socialCard`. Pre-existing non-image values are untouched (docs); only future picks are restricted.
- [ ] **Step 3: Bound the FAQ list.** Add `ui: { min: 1, itemProps: … }` keeping the existing `itemProps`; `min: 1` greys out delete on the last item so the page can never save with zero answers.
- [ ] **Step 4: Rebuild + verify lockfile diff is shape-only.** Run `pnpm run build`; `git diff tina/tina-lock.json` must show no field renames/removals.
- [ ] **Step 5: Commit.**

```bash
git add tina/config.ts tina/tina-lock.json
git commit -m "fix(tina): global site settings, image accept, faq min bound"
```

### Task 6: Checklist step 4 — the first TinaCloud commit (HITL)

**Files:** content JSON changed by the editor (expected: one file, e.g. `apps/web/content/site/siteSettings.json` footer tagline tweak).

**Interfaces:**
- Consumes: go/no-go from Task 1; Browser MCP runbook (`artifacts/audit/browser-mcp/SETUP_AND_HITL_RUNBOOK.md`).
- Produces: commit on `main` authored by TinaCloud + redeploy + 4/4 checklist evidence.

- [ ] **Step 1: Human logs in.** Agent drives the headed browser to `<configured-site-url>/admin` (use the `workers.dev` Site URL from the screenshot if prod domain admin is unverified); HUMAN types credentials. Agent never touches them.
- [ ] **Step 2: Human makes one harmless edit.** Suggested: `Site settings → Footer tagline` append ` (edited via TinaCloud <date>)`. Nothing truth-sensitive.
- [ ] **Step 3: Save and capture the commit.** Human clicks Save; agent (or human) records the resulting `main` commit SHA from GitHub, and confirms the Cloudflare redeploy triggered by that commit succeeds (watch for the SESSION-namespace `10014` error — Task 3 should have prevented it; if it appears, stop and fix Task 3).
- [ ] **Step 4: Run trust gate on the edited content.** Run: `node scripts/check-content-trust.mjs && pnpm run check:seo`. Expected: PASS (editor input stayed inside editorial bounds).
- [ ] **Step 5: Record evidence.** Append SHA + redeploy status to `artifacts/audit/tina-verification/`; TinaCloud checklist should read 4/4. No code commit from this task (the commit is TinaCloud's).

### Task 7: About-collection decision (human gate)

**Files (option A — wire):** `apps/web/src/lib/tina/loaders.ts` (+ about Zod schema), `apps/web/src/pages/about.astro`.
**Files (option B — remove):** delete `tina/config.ts` about block, `apps/web/content/about/about.json`; regenerate lockfile.

**Interfaces:**
- Consumes: content-trust policy (about story holds org facts).
- Produces: no orphaned collection either way.

- [ ] **Step 1: Human decides.** Context: `about.json` has real copy (heroSubline, 2-paragraph storyBody AST) but zero consumers; `about.astro` renders code-owned `about-data`. Recommendation: **Option B (remove)** — the story asserts org facts (founding, trophies) that belong behind `@ukbt/truth`, and homepage/faq/site already cover editorial needs. Option A is only correct if the owner accepts Tina copy being display-gated by truth validation on every build.
- [ ] **Step 2a (Option B): Remove and regenerate.** Delete the `about` collection block from `tina/config.ts`; delete `apps/web/content/about/about.json`; run `pnpm run build`; confirm `git status` shows no other content changes. Commit: `git add tina/config.ts tina/tina-lock.json apps/web/content/about && git commit -m "fix(tina): remove unwired about collection (truth-owned copy)"`.
- [ ] **Step 2b (Option A): Wire behind the gate.** Add `tinaAbout` Zod export to `loaders.ts` (fields mirror the collection; `storyBody: z.unknown()` rendered ONLY via a `renderAboutStory`-style escaper, same REM-001 pattern as `faq-answer.ts`); switch `about.astro` to consume it; keep `about-data` for truth-owned stats. Verify with `check-content-trust` PASS. Commit accordingly.

### Task 8: Visual-editing data layer (generated client + requestWithMetadata)

**Files:**
- Modify: `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/lib/tina/islands.ts`
- Use: `tina/__generated__/client.ts` (already generated, gitignored — import it, do not commit it).

**Interfaces:**
- Consumes: collection names `homepage`, `faq`, `siteSettings` (+ `about` iff Task 7 chose A).
- Produces: `tinaHomepage/tinaFaq/tinaSite` resolved through `requestWithMetadata` (overlay-aware, form-payload-stamped), Zod gate unchanged.

- [ ] **Step 1: Failing check first.** Add a temporary assertion script (or vitest) that imports each loader result's accompanying `{ id, query }` metadata and fails: current loaders export bare parsed objects, so `loaderMeta.tinaHomepage.id` is undefined. Run it, observe FAIL.
- [ ] **Step 2: Rewrite loaders on the generated client.** Pattern per route (docs `/contextual-editing/astro`):

```ts
import { requestWithMetadata } from '@tinacms/astro';
import { client } from '../../../tina/__generated__/client';
const homepageResult = await requestWithMetadata(() => client.queries.homepage({ relativePath: 'homepage.json' }), { priority: 'primary' });
export const tinaHomepage = HomepageSchema.parse(homepageResult.data.homepage);
```

Keep every Zod schema exactly as-is (REM-003 refinements stay the choke point). `relativePath` values must match files on disk (`homepage.json`, `faq.json`, `siteSettings.json` — verify with `Get-ChildItem apps/web/content/*/`).
- [ ] **Step 3: Update island fetchers** in `islands.ts` to consume the new loader results (same projected shapes; `propsFromData` unchanged).
- [ ] **Step 4: Re-run the Step-1 check.** Expected: PASS (metadata present, parsed values byte-identical to pre-change JSON — diff page HTML before/after via `pnpm run build` + compare `dist/client/index.html`).
- [ ] **Step 5: Commit.**

```bash
git add apps/web/src/lib/tina/loaders.ts apps/web/src/lib/tina/islands.ts
git commit -m "feat(tina): overlay-aware loaders via requestWithMetadata"
```

### Task 9: `<TinaIsland>` regions + click-to-edit markers

**Files:**
- Modify: `apps/web/src/pages/index.astro`, `faq.astro` (+ `about.astro` iff Task 7A); `Hero.astro`, `ClubIntro.astro`, `AboutStory.astro`, `PageBanner.astro`, `LeadershipGrid.astro`.

**Interfaces:**
- Consumes: registry entries `hero`, `aboutSection` (+ new `faq`, `about` entries as needed).
- Produces: clickable regions in the editor; static HTML gains only the one-line island bootstrap on edited pages (docs-prescribed trade-off).

- [ ] **Step 1: Register missing islands.** Add `faq` (fetcher: `tinaFaq`, component: the FAQ section markup extracted or the page fragment) and any page lacking an entry. `wrapper.tag` must equal the element `<TinaIsland wrapper>` will emit.
- [ ] **Step 2: Wrap regions in pages.** Example (`index.astro` hero):

```astro
---
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
---
<TinaIsland name="hero" wrapper="section" primary>
  <Hero ... />
</TinaIsland>
```

`primary` on each page's main region (docs: static pages can't auto-detect it).
- [ ] **Step 3: Replace hand-stamped markers with `tinaField()`.** In each component replace `data-tina-field="headline"` with `data-tina-field={tinaField(loaderResult, 'headline')}` importing `tinaField` from `@tinacms/astro/tina-field`. Coarse-grained markers (whole body/region) preferred over per-node.
- [ ] **Step 4: Verify in dev.** `pnpm dev`; open `/admin/index.html#/~/`; click headline/button/FAQ question: field highlights and sidebar form opens; typing re-renders the region via `/tina-island/<name>`. If `<head>` lacks `<div data-tina-form>` payloads, `tina()` middleware isn't running — recheck Task 4.
- [ ] **Step 5: Confirm production parity.** `pnpm run build`; pages WITHOUT `<TinaIsland>` byte-identical to pre-change; pages with it differ only by the bootstrap line. Commit.

```bash
git add apps/web/src/pages apps/web/src/components apps/web/src/lib/tina/islands.ts
git commit -m "feat(tina): island regions and click-to-edit markers"
```

### Task 10: Full gate + release evidence

**Files:** receipts under `artifacts/receipts/` per repo convention.

- [ ] **Step 1: Run the authority.** `pnpm run deploy:verify` fresh. Expected: PASS with no open blocker; perf budgets already account for the Tina bridge (15.5KB) per `scripts/check-perf.mjs` — if island bootstrap tips any page over, that is a finding, not a waiver (no gate weakening).
- [ ] **Step 2: Record visual-editing receipts.** `HEAD_SHA`, viewport snapshots (1440×900 + 390×844), a11y/interaction results for an edit round-trip, TinaCloud 4/4 screenshot reference.
- [ ] **Step 3: Update living docs in place.** `docs/12-roadmap-and-open-items.md` (Tina items → done with SHAs); `docs/tina-integration.md` status line (Astro 7 + `@tinacms/astro` 0.7.0 verified versions; branch-chain + KV notes). Do not fork second status docs.

---

## Self-review (run by planner, 2026-09-17)

1. **Spec coverage:** /tina folder & lockfile → reconciled non-issues; config determinism/branch → Task 2; collections/global → Task 5; fields/validation (existing `ui.validate` kept) → untouched; templates (none used; no MDX embeds in schema) → N/A noted, Custom-MDX pattern deferred until a rich-text template exists; image/media repo-based config → correct (`publicFolder apps/web/public`, `mediaRoot media`), narrowed in Task 5; visual editing Astro + migration (React-free) → Tasks 8–9; click-to-edit API → Task 9 Step 3; router (`ui.router` already on homepage/about/faq) → kept; Workers deploy (adapter, wrangler root, SESSION KV, nodejs_compat, editing branch, env, check-visual-editing) → Tasks 1–4, 6, 10; Pages doc → reconciled N/A. Step-4 blocker → Task 6 with preconditions in Tasks 1–3. Gaps: none found.
2. **Placeholder scan:** no TBD/TODO/later; every code block is literal content; failing-check-first steps name the exact command and expected signal; commit messages exact.
3. **Type consistency:** names (`tinaHomepage`, `tinaFaq`, `tinaSite`, `tinaAbout`, islands `hero`/`aboutSection`/`faq`) match existing files; new imports use installed subpaths (`@tinacms/astro`, `/tina-field`, `/TinaIsland.astro`, `/vite`) with a resolve-check step before use.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-17-tinacms-fixing-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
