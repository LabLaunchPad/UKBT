# TinaCMS Final Verification — Open Claims (T2)

> **Date:** 2026-09-18 (UTC)
> **Method:** `default.webfetch` markdown extraction from `https://tina.io/docs/` + `https://tina.io/pricing`; one `default.websearch` for exact-name absence check.
> **Prior research:** `external-evidence/tinacms/TINACMS_OFFICIAL_FINDINGS.md` (read first; this file verifies, not redoes).
> **Rule:** one entry per claim: URL checked, verdict (SUPPORTED / REFUTED / UNCLEAR), one-line project impact citing `repo file:line`.

---

## Claim 1 — `token` in `defineConfig` is the read-only content token; `TINA_TOKEN` is the canonical env name

- **URLs checked:**
  - https://tina.io/docs/reference/config (Common Environment Variables table: "`TINA_TOKEN` — Site build only — Read-only token for TinaCloud (not exposed in admin)"; field def: "`token` — Your read only token from TinaCloud. Required for TinaCloud.")
  - https://tina.io/docs/tinacloud/overview ("Ask you for a Read Only Token: Can be found in the Tokens tab… `token: process.env.TINA_TOKEN`")
  - https://tina.io/docs/tinacloud/dashboard/projects (Tokens Tab: "Content tokens provide read-only access to your project's content.")
- **Date:** 2026-09-18
- **Verdict:** SUPPORTED
- **Project impact:** `tina/config.ts:9` (`token: process.env.TINA_TOKEN || null`) matches the canonical name and read-only semantics — keep as-is.

## Claim 2 — An official `TINA_READ_ONLY_TOKEN` env name exists

- **URLs checked:**
  - https://tina.io/docs/reference/config (env table lists `TINA_TOKEN`, no `TINA_READ_ONLY_TOKEN`)
  - https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers (Astro: `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `SITE_URL`; Next: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` — no third token name)
  - `default.websearch site:tina.io "TINA_READ_ONLY_TOKEN"` → zero exact-name hits (only `TINA_TOKEN` / "Read Only Token" prose, e.g. backend-init "Ask you for a Read Only Token")
- **Date:** 2026-09-18
- **Verdict:** REFUTED (absence confirmed across env reference, Workers deploy doc, and site-scoped exact-name search)
- **Project impact:** `tina/config.ts:9` correctly uses `TINA_TOKEN` — do not introduce `TINA_READ_ONLY_TOKEN` anywhere.

## Claim 3 — `tinacms build` bakes clientId+token into the bundle; no runtime secret needed on Workers

- **URLs checked:**
  - https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers ("These are build-time only. `tinacms build` bakes the client ID and token into the generated client, so there's nothing to add again as a runtime variable.")
  - https://tina.io/docs/reference/config (Build-Time Embedding: "statically built SPA… not read at runtime… must be present when the build runs")
- **Date:** 2026-09-18
- **Verdict:** SUPPORTED (with documented exception: OpenNext/Next SSR that reads creds at request time needs runtime vars too — not applicable to this static Astro site)
- **Project impact:** `package.json:18` build order is correct — set `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN` as Workers Build variables only, no runtime secret needed.

## Claim 4 — Visual editing for Astro requires: `tina()` integration, `data-tina-field`/`tinaField`, island route with `prerender = false`

- **URLs checked:**
  - https://tina.io/docs/contextual-editing/astro (Wire the integration: `tina()` stages middleware + `/admin/bridge.js`; click-to-edit: "`tinaField()` returns a string… Stamp it on any element"; static editing: "Keep `export const prerender = false` on `src/pages/tina-island/[name].ts`"; SSR adapter required)
  - https://tina.io/docs/frameworks/astro (5-item wiring list: schema field, `requestWithMetadata()`, island registry, `src/pages/tina-island/[name].ts` with `prerender = false`, `<TinaIsland>` + `tinaField()`)
- **Date:** 2026-09-18
- **Verdict:** SUPPORTED (all three sub-requirements individually confirmed)
- **Project impact:** Any Astro page missing `tina()` registration, `tinaField()` stamps, or `prerender = false` on the island route will silently lose visual editing — verify per-page wiring, not just `tina/config.ts`.

## Claim 5 — TinaCloud Free limits relevant to this repo (users, assets, no editorial workflow, no search requirement)

- **URLs checked:**
  - https://tina.io/pricing (Free $0: 2 included users, user limit 2, 2 roles; comparison table: Editorial Workflow blank for Free/Team, checked for Team Plus/Business/Enterprise; Asset Size cap 100 MB all tiers)
  - https://tina.io/docs/drafts/editorial-workflow ("> The Editorial Workflow feature is available on select paid plans.")
- **Date:** 2026-09-18
- **Verdict:** SUPPORTED (nuance: Free row header says "2 users, 2 roles"; Team Plus already includes Editorial Workflow — the gate is Free/Team vs Team Plus+, not Business-only)
- **Project impact:** Free plan means max 2 editors and saves commit straight to the protected branch (`tina/config.ts:4` `main` fallback) — branch protection must allow the TinaCloud app or every save fails.

## Claim 6 — `--skip-search-index` fully removes the need for `TINA_SEARCH_TOKEN` / `indexerToken`

- **URLs checked:**
  - https://tina.io/docs/reference/search/overview ("The only required element… is `search.tina.indexerToken`"; "Building the search index can be skipped by passing the `--skip-search-index` cli option… Then the `search-index` command can be run separately")
  - https://tina.io/docs/cli-overview (`tinacms build` option `--skip-search-indexing`; separate `tinacms search-index` command; `--content=local` also skips indexing)
- **Date:** 2026-09-18
- **Verdict:** SUPPORTED (nuance: canonical flag is `--skip-search-indexing`; `--skip-search-index` is the accepted alias used in `package.json:18`)
- **Project impact:** `tina/config.ts:22-25` (`indexerToken: … || undefined`) + `package.json:18` (`--skip-search-index`) means `TINA_SEARCH_TOKEN` must stay unset — provisioning it would re-enable indexing uploads on build.
