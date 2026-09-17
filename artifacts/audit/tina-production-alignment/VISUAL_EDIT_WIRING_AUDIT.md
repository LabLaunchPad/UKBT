# Visual-Edit Wiring Audit — TinaCMS + Astro static site

Evidence-first, no code modified. All claims cite `file:line` as read 2026-09-17.
Scope: `apps/web/src/lib/tina/islands.ts`, `apps/web/src/lib/tina/loaders.ts`,
`apps/web/src/pages/tina-island/[name].ts`, `apps/web/src/pages/index.astro`,
`apps/web/src/pages/about.astro`, `apps/web/src/components/Hero.astro` (~70–100),
`tina/config.ts`, `apps/web/astro.config.mjs`, `apps/web/public/_headers`,
plus `faq.astro`, `ClubIntro.astro`, `BaseLayout.astro` as supporting evidence.

Session-established facts re-verified: zero hits for `TinaIsland`,
`requestWithMetadata`, `tinaField(` (as a function call) anywhere in
`apps/web/src`; `experimental_createIslandRoute(islands)` + `prerender=false`
present in `[name].ts`.

## 1. Per-file findings

| File | What exists | What's missing | Evidence line |
|---|---|---|---|
| `apps/web/src/pages/index.astro` | Receives Tina data at build: `tinaHomepage` (eyebrow, headline, CTAs, heroImage, metaDescription, clubIntroLede, whyChooseUs) passed as plain props to `<Hero>` and `<ClubIntro>` | No `<TinaIsland>` wrapper anywhere; no `tinaField()` metadata; no `requestWithMetadata`; no island reference | `index.astro:42` (import loaders), `index.astro:75-84` (`<Hero>` plain props), `index.astro:87` (`<ClubIntro>` plain props), absent `<TinaIsland>` (grep: 0 hits in `src/`) |
| `apps/web/src/components/Hero.astro` | Renders Tina values with **static-string** `data-tina-field` markers: `eyebrow`, `headline`, `tagline`, `primaryCtaLabel` | Markers are inert: no `tinaField()` query wrapper, so no `_content_source` / `_sys` binding the marker to a collection document; secondary CTA, social, heroImage have no marker at all | `Hero.astro:81-82`, `Hero.astro:87`, `Hero.astro:89`; `tinaField(` = 0 hits repo-wide in `src/` |
| `apps/web/src/components/ClubIntro.astro` | Renders `tinaHomepage.clubIntroLede` via `index.astro:87` with static marker `data-tina-field="clubIntroLede"` | Same gap as Hero: static string, no `tinaField()` metadata, no `<TinaIsland>` ancestor | `ClubIntro.astro:112` |
| `apps/web/src/pages/about.astro` | Static markers on three slots: `PageBanner … data-tina-field="heroSubline"` (`about.astro:78`), `AboutStory … data-tina-field="storyBody"` (`about.astro:89`), `LeadershipGrid … data-tina-field="leadershipIntro"` (`about.astro:125`); pass-through props (`AboutStory.astro:21,41`, `LeadershipGrid.astro:29,61`, `PageBanner.astro:36,55`) forward the raw string | **Data-source divergence (stronger gap than index): about.astro never imports `../lib/tina/loaders` — it renders `about.*` from `../content/about-data` (truth gate), while the tina `about` collection lives in `apps/web/content/about/*.json`. Markers name Tina fields but the rendered values are not Tina values.** No `<TinaIsland>`, no `tinaField()` | `about.astro:27-30` (imports: `homepage`, `about`, `ourSponsors` — no loaders import, contrast `index.astro:42`, `faq.astro:15`); `about.astro:78,89,125` |
| `apps/web/src/pages/faq.astro` | Receives Tina data at build: `tinaFaq` (pageHeading, pageEyebrow, items) via `faq.astro:15`; renders `item.question` with static marker `data-tina-field="items.question"` | Marker is a bare collection-path string with no index, no `tinaField()` binding, no `<TinaIsland>`; answers (`item.answer`, rich-text via `renderFaqAnswer`) and banner/eyebrow have no markers | `faq.astro:15,18,27,32,35` |
| `apps/web/src/lib/tina/islands.ts` | Registry defines `hero` (fetch → `{...tinaHomepage, social}`, component `Hero.astro`, `propsFromData` mapping tagline/eyebrow/social/secondaryCta) and `aboutSection` (fetch → `tinaHomepage`, component `ClubIntro.astro`) | `fetch` reads **build-time parsed JSON** (`tinaHomepage` from `loaders.ts`), not a Tina client query — so even if routed, it returns static data with no `_content_source`. `propsFromData` for `hero` drops `headline`, `primaryCta*`, `heroImage` (only tagline/eyebrow/social/secondaryCta mapped) — lossy vs what `index.astro` passes | `islands.ts:3-4` (imports), `islands.ts:9-27` (hero), `islands.ts:28-43` (aboutSection) |
| `apps/web/src/lib/tina/loaders.ts` | Zod-validated build-time JSON parse: `HomepageSchema`, `FaqSchema`, `SiteSettingsSchema`; exports `tinaHomepage`, `tinaFaq`, `tinaSite` | No Tina client (`tinacms` client / `requestWithMetadata` / `useTina`); nothing here produces visual-editing metadata — pure static parse with `import … with { type: 'json' }` | `loaders.ts:1-7` (static JSON imports), `loaders.ts:80-82` (exports) |
| `apps/web/src/pages/tina-island/[name].ts` | Island POST route exists: `experimental_createIslandRoute(islands)` + `prerender=false` | Route is **unreachable dead code**: sole importer of `islands`; no page mounts `<TinaIsland name=…>` so no client ever POSTs here. Only file referencing `islands` outside `islands.ts` itself | `[name].ts:1-5`; grep `lib/tina/islands|from.*islands` → only `[name].ts:2` outside `islands.ts` |
| `apps/web/src/layouts/BaseLayout.astro` | Standard head/meta/JSON-LD/scripts; no Tina references | No Tina visual-editing bridge script, no `TinaIsland` host, no admin preview hookup — confirms zero layout-level wiring | `BaseLayout.astro` grep `tina|Tina` → 0 hits (only generic `script`/`client` words) |
| `tina/config.ts` | 4 collections (`homepage`→`/`, `about`→`/about`, `faq`→`/faq`, `siteSettings`→no router) each with `ui.router` (first three) + `allowedActions:{create:false,delete:false}`; field names match the static markers (`eyebrow`, `headline`, `tagline`, `clubIntroLede`, `heroSubline`, `storyBody`, `leadershipIntro`, `items.question`) | **Nothing visual-editing needs beyond router is defined**: no `ui.visualEditing`, no preview-URL / visual-editing URL config, no document-level preview function. Sidebar form editing works on schema alone; click-to-edit needs the page-side wiring (Q2/Q4), not more config | `tina/config.ts:38-41` (homepage router), `tina/config.ts:169`, `233`, `284` (other collections); grep `visualEditing|previewUrl|TinaAdmin` in repo → only docs/contract prose, 0 hits in `tina/` or `apps/web/src` |
| `apps/web/astro.config.mjs` | `tina()` integration registered (`integrations` includes `tina()`), `@astrojs/cloudflare` adapter active (required for the on-demand island route) | Integration alone does not mount islands — page-level `<TinaIsland>` + `tinaField()` still absent | `astro.config.mjs:4,7,28-29` |
| `apps/web/public/_headers` | CSP already permits the Tina editing frame/data path: `connect-src … https://app.tina.io https://*.tinajs.io`, `frame-ancestors 'self' https://app.tina.io https://*.tinajs.io` | Headers are necessary-but-not-sufficient: they allow the admin iframe to load the site, but with no island/metadata there is nothing to click | `_headers:9` |
| `apps/web/src/components/Footer.astro` | Bonus: `tinaSite` (footerTagline, contact) consumed — siteSettings data flows to static output | Same static pattern; no markers, no island | `Footer.astro:10,23-24` (via loaders-import grep) |

## 2. Island registry references

**`islands.ts` (`hero`, `aboutSection`) is referenced by no page.**

- Grep `lib/tina/islands|from.*islands` repo-wide: only hit outside `islands.ts`
  is `tina-island/[name].ts:2` (the route itself).
- Grep `TinaIsland` in `apps/web/src`: **0 hits**. No page mounts
  `<TinaIsland name="hero">` or `<TinaIsland name="aboutSection">`.
- Therefore the island route (`[name].ts:5`) has no client: `hero`'s
  `propsFromData` lossiness (`islands.ts:17-26`, drops headline/CTAs/heroImage)
  and `aboutSection`'s truth-fallback mapping (`islands.ts:34-42`) are
  currently unexercised dead config, not live bugs — they become live
  correctness items the moment a page mounts the island (see pilot plan step 3).

## 3. tina/config.ts — anything beyond router needed?

**No.** For TinaCMS visual (click-to-edit) editing, the config side is
sufficient as-is:

- `ui.router: () => '/' | '/about' | '/faq'` (`tina/config.ts:40,169,233`)
  tells the admin which page previews a document — present for all three
  content collections (`siteSettings` correctly has none).
- `allowedActions: { create:false, delete:false }` matches the singleton-JSON
  content model — present on all four collections.
- No `ui.visualEditing`, preview-URL builder, or extra collection flag is
  required by `@tinacms/astro` v0.7.0's island model; the missing half is
  entirely page-side (`<TinaIsland>` + `tinaField()` + client query).
  `tina/config.ts` needs **zero changes** for the pilot.

## 4. Pilot wiring plan — homepage hero only (plan only, no code)

Goal: click-to-edit on the homepage hero (`eyebrow`, `headline`, `tagline`,
`primaryCta*`, `secondaryCta*`, `heroImage`) with zero change to public-visitor
output (static HTML byte-identical without the admin frame) and the truth gate
untouched (loaders' Zod parse + URL allowlist stay the authority for what ships).

Ordered file changes:

1. **`apps/web/src/pages/index.astro`** — mount the island around the hero
   only: import `TinaIsland` from `@tinacms/astro`, replace the direct `<Hero
   …>` call (`index.astro:75-84`) with `<TinaIsland name="hero" …>`
   forwarding the same props. Everything else on the page (ClubIntro,
   WhyChooseUs, all lower sections, Header/Footer) stays exactly as-is.
2. **`apps/web/src/lib/tina/loaders.ts`** (or a new preview-query module it
   re-exports) — add the Tina client query path: `requestWithMetadata`
   (or the repo's chosen `tinacms` client helper) fetching the `homepage`
   document **with** `_content_source`/`_sys` metadata, keeping the existing
   Zod `HomepageSchema.parse` as the validation gate on the result. Static
   JSON parse remains the fallback for public builds.
3. **`apps/web/src/components/Hero.astro`** — replace the four static
   `data-tina-field="…"` strings (`Hero.astro:81,82,87,89`) with `tinaField()`
   calls against the query result (e.g. `tinaField(data, 'headline')`), thread
   the query `data` object through as a prop from the island, and extend
   coverage to the currently unmarked editable slots (secondary CTA,
   heroImage) if in scope. Presentation markup and defaults (`Hero.astro:34-37`)
   stay untouched.
4. **`apps/web/src/lib/tina/islands.ts`** — fix `hero.propsFromData`
   (`islands.ts:17-26`) to map the full hero prop surface (`headline`,
   `primaryCtaLabel/Link`, `heroImage`, `taglineShort` naming) instead of the
   current lossy subset, and switch `fetch` from static-JSON spread to the
   step-2 client query. `aboutSection` entry stays untouched (out of pilot scope).
5. **Verify, change nothing:** `tina/config.ts` (router already correct),
   `tina-island/[name].ts` (route already correct), `astro.config.mjs`
   (`tina()` already registered), `public/_headers` (CSP/frame-ancestors
   already allowlisted), `about.astro`, `faq.astro`, truth-gate packages,
   and all non-hero sections of `index.astro` — public static output for
   visitors must remain byte-identical; visual editing activates only inside
   the Tina admin iframe session.

New imports required (pilot): `TinaIsland` (in `index.astro`), `tinaField`
(in `Hero.astro`), `requestWithMetadata` or equivalent Tina client query
(in the loader/preview module). Untouched by design: truth gate
(`packages/truth`, `loaders.ts` schemas/allowlist logic), static output for
public visitors, `tina/config.ts`, `[name].ts`, `astro.config.mjs`, `_headers`.

## 5. Does the missing wiring explain "dashboard loads, no visual edit feature"?

**Yes — exactly.** Sidebar (form) editing and visual (click-to-edit) editing
are independent halves:

- Sidebar collections work on schema alone: `tina/config.ts` collections +
  JSON file paths are valid, so the Tina admin dashboard loads and form
  fields save — consistent with the reported symptom.
- Visual editing additionally requires, per page region: (a) a
  `<TinaIsland>`-mounted component served via the island route, (b)
  `tinaField()` metadata binding DOM nodes to the query document, (c) a
  client query carrying `_content_source`. **All three of (a–c) are absent
  repo-wide** (0 hits for `TinaIsland`/`requestWithMetadata`/`tinaField(` in
  `apps/web/src`); markers are static strings). The admin therefore has no
  editable nodes to overlay — "dashboard loads, no visual edit feature" is
  the expected outcome, not a config or infra failure. `_headers:9` and
  `astro.config.mjs:7,29` (integration + adapter) being already correct
  further isolates the gap to page-side wiring only.

## 6. Verdicts

| Page | Verdict | Rationale |
|---|---|---|
| index (homepage hero) | **WARNING** | Tina data flows to `<Hero>`/`<ClubIntro>` (`index.astro:42,75-87`) and markers exist (`Hero.astro:81-89`, `ClubIntro.astro:112`), but static-string markers + no `<TinaIsland>` + no metadata query = no click-to-edit. Closest to working: chosen pilot. |
| about | **BLOCKER** | Worse than index: markers exist (`about.astro:78,89,125`) but the page renders truth-gate `about.*`, not Tina values (no loaders import, `about.astro:27-30`) — wiring an island here first requires resolving the data-source divergence, else clicks would edit documents whose values never render. |
| faq | **WARNING** | Tina data flows (`faq.astro:15,27-35`) with one static marker (`faq.astro:32`); same missing island/metadata gap, plus marker lacks list index and answers are unmarked. Straightforward after the hero pilot proves the pattern. |
