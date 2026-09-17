# Tina production alignment research — login timeout + visual editing

Date: 2026-09-18. Sources: https://tina.io/docs/ (via fetch) first, then GitHub / web search.
Method: evidence-first, no code modified. Each finding: Claim / Source / Date / Verdict / Project impact.

## Q1 — "Authentication failed: Login attempt timed out" (first attempt fails, retry succeeds)

### Q1-1 — Official cause: a domain in the auth redirect chain is blocked/slow (VPN, firewall, proxy)
- Claim: The TinaCloud login flow redirects through several external domains (AWS Cognito, API Gateway, GitHub); if any domain in the redirect chain is blocked, login times out before completing. Fix: allow outbound traffic to all domains on the Network Requirements page (`*.tina.io` alone is insufficient). Diagnose via DevTools Network tab looking for stalled/failed requests.
- Source: https://tina.io/docs/tinacloud/troubleshooting ("How do I resolve 'Login attempt timed out' errors on a VPN or restricted network?")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: primary suspect for any timeout report is the viewer's network/VPN, not repo config — tina/config.ts contains no auth-domain configuration to change.

### Q1-2 — The sign-in redirect chain must complete within 20 seconds
- Claim: The sign-in flow must complete its full redirect chain within 20 seconds; any blocked domain in that chain causes a timeout.
- Source: https://tina.io/docs/tinacloud/network-requirements/ ("Login times out on VPN or restricted network")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: a first-attempt timeout that succeeds on retry is consistent (inference, not documented) with a slow first chain exceeding 20s and a warm/cached retry — but no official source documents this exact fail-then-succeed pattern, so treat as hypothesis only; tina/config.ts has no timeout knob.

### Q1-3 — Required allowlist spans TinaCloud, Cognito, API Gateway, GitHub, S3, PostHog, WorkOS
- Claim: Whitelisting requires `*.tina.io`, `identity.tinajs.io`, `identity-v2.tinajs.io`, `content.tinajs.io`, `assets.tinajs.io`, `*.auth.us-east-1.amazoncognito.com`, `cognito-idp.us-east-1.amazonaws.com`, `*.execute-api.us-east-1.amazonaws.com`, `s3.us-east-1.amazonaws.com`, `github.com`, `api.github.com`, `us.i.posthog.com`, `us-assets.i.posthog.com` (+ `*.workos.com` for enterprise SSO); TinaCloud runs on shared AWS Lambda pool with no stable IPs/CIDRs to allowlist.
- Source: https://tina.io/docs/tinacloud/network-requirements/ ("Required Domains")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: compare against the site's CSP in apps/web/public/_headers:9, whose connect-src only allows 'self', sentry ingest, app.tina.io and *.tinajs.io — Cognito/API-Gateway/GitHub/S3/PostHog hosts are absent there (see Q1-6).

### Q1-4 — `?origin=` / Site-URL mismatch produces a DIFFERENT error ("Invalid Site URL"), not a timeout
- Claim: When the `?origin=` URL parameter of the auth window does not match a TinaCloud Site URL, the error is "Invalid Site URL" — a distinct documented error, not "Login attempt timed out".
- Source: https://tina.io/docs/tinacloud/troubleshooting ("How do I resolve 'Invalid Site URL' errors?")
- Date: 2026-09-18
- Verdict: SUPPORTED (and REFUTED as the cause of a timeout-then-success symptom)
- Project impact: if the observed symptom is specifically timeout-then-success, Site-URL mismatch is unlikely the cause; still verify the production URL is registered as Site URL per https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers ("Finish TinaCloud setup") — no repo file controls this (dashboard setting, not tina/config.ts).

### Q1-5 — `adminAuth`/`authProvider` in config is a self-host-only concern; `PUBLIC_TINA_ADMIN_ORIGIN` is a bridge postMessage allowlist, NOT a login fix
- Claim: `authProvider` in `defineConfig` configures custom authentication for self-hosted backends (Auth.js/Clerk/bring-your-own); the `admin: { auth: { useLocalAuth } }` snippet appears only in the self-hosted TinaCloud-auth-provider guide. Separately, `PUBLIC_TINA_ADMIN_ORIGIN` (comma-separated) is read by the `@tinacms/astro` middleware and embedded inline so the visual-editing bridge validates inbound postMessage events for cross-origin admin deployments — it has no documented role in the TinaCloud dashboard login/token exchange.
- Source: https://tina.io/docs/reference/self-hosted/auth-provider/overview, https://tina.io/docs/reference/self-hosted/auth-provider/tinacloud, https://github.com/tinacms/tinacms/blob/main/packages/@tinacms/astro/README.md ("For cross-origin admin deployments… set PUBLIC_TINA_ADMIN_ORIGIN"), https://tina.io/docs/contextual-editing/astro ("Cross-origin admin")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: setting PUBLIC_TINA_ADMIN_ORIGIN (.env.example:18-20) will not fix a dashboard login timeout; tina/config.ts correctly has no admin/auth block (TinaCloud-hosted project needs only clientId/token/branch).

### Q1-6 — CSP misconfiguration can break GitHub authentication / editor loading
- Claim: TinaCMS requires CSP connect-src entries for identity/content/assets/S3/PostHog hosts; docs explicitly note "Having issues when authenticating with GitHub? It could be your CSP configuration!" and list editor-not-loading as a CSP symptom diagnosable via DevTools console violations.
- Source: https://tina.io/docs/guides/csp-configuration/ ("Required CSP Directives", "Troubleshooting", link to https://github.com/tinacms/tina.io/issues/3978)
- Date: 2026-09-18
- Verdict: SUPPORTED (as a possible contributor; REFUTED as explanation for fail-once-then-succeed — a CSP block would fail consistently, not clear on retry)
- Project impact: audit apps/web/public/_headers:9 — connect-src lacks the Cognito, API-Gateway, GitHub, S3 and PostHog hosts the CSP guide requires; frame-ancestors correctly includes app.tina.io.

### Q1-7 — Cold start, clock skew, third-party cookies, iframe, token-exchange as timeout causes
- Claim: No official Tina source found attributing "Login attempt timed out" to cold start, clock skew, third-party-cookie blocking, iframe embedding, or token-exchange failures; GitHub issue search surfaced no matching first-attempt-timeout report (nearest neighbours: #4527 TinaCloud login loop — different symptom, closed; issue creation in tinacms/tinacms is restricted, limiting search).
- Source: https://tina.io/docs/tinacloud/troubleshooting, https://tina.io/docs/tinacloud/network-requirements/, https://github.com/tinacms/tinacms/issues/4527 (login-loop, not timeout)
- Date: 2026-09-18
- Verdict: UNCLEAR (no source; do not assert)
- Project impact: none actionable in repo — do not add code/config for these hypotheses; if the symptom persists off-VPN, capture DevTools Network/HAR per Q1-1 before changing tina/config.ts or apps/web/public/_headers:9.

## Q2 — TinaCMS + Astro: what is REQUIRED for visual (click-to-edit) editing

### Q2-1 — Hand-written `data-tina-field="fieldName"` is NOT enough; the `tinaField()` helper output is required
- Claim: `tinaField()` reads `_content_source` metadata (queryId + path) stamped onto the data to construct the path the editor uses to connect element to form; the Click-To-Edit API requires the helper (`data-tina-field={tinaField(post.data.post, 'title')}`), and the Astro README states the renderer emits no `data-tina-field` attributes itself — the call site adds them via the helper at whatever granularity is wanted.
- Source: https://tina.io/docs/contextual-editing/tinafield/ ("Metadata Structure": "The tinaField helper reads this _content_source metadata…"), https://github.com/tinacms/tinacms/blob/main/packages/@tinacms/astro/README.md ("Visual editing markers"), https://tina.io/docs/contextual-editing/astro ("Add field-level click-to-edit")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: pages/components use hand-written literals (e.g. apps/web/src/pages/about.astro:78,89,125; faq.astro:32; Hero.astro:81-89; ClubIntro.astro:112) with no `tinaField` import anywhere in apps/web/src — click-to-edit cannot resolve these to form fields.

### Q2-2 — Every query must be wrapped in `requestWithMetadata()` — it stamps the metadata `tinaField()` needs
- Claim: Each route's data loader must pipe the generated-client result through `requestWithMetadata()`; that call hashes `{query, variables}` into a form id, swaps in the bridge overlay in edit mode, stamps the metadata `tinaField()` needs for click-to-focus, and records the form payload the middleware splices into `<head>`.
- Source: https://tina.io/docs/contextual-editing/astro ("Data loaders — wrap every query with requestWithMetadata"), https://tina.io/docs/frameworks/astro ("Make your existing Astro pages editable", 5-item wiring list)
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: no `requestWithMetadata` usage exists in apps/web/src — apps/web/src/lib/tina/islands.ts:11-13,29-31 return loader/static data unwrapped, so no form payloads or click-to-focus metadata exist.

### Q2-3 — `<TinaIsland>` wrapping is required (and is the ONLY path on `output: 'static'`)
- Claim: Each editable region must be wrapped in `<TinaIsland>` (wrapper prop matching the registry entry; `primary` on the page's main region); the bridge POSTs the overlay to the island endpoint on every store update and swaps the returned fragment into the DOM. On prerendered static pages the middleware never injects anything — instead `<TinaIsland>` emits the tiny in-iframe bootstrap that loads `/admin/bridge.js`; without it there is no editing on static pages. Without `primary`, the editor may land on the multi-document picker.
- Source: https://tina.io/docs/contextual-editing/astro ("Use editable regions in pages", "Static-site editing"), https://github.com/tinacms/tinacms/blob/main/packages/@tinacms/astro/README.md ("Static-site editing")
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: no `<TinaIsland>` usage exists in any page — combined with output:'static' (apps/web/astro.config.mjs:13) this means zero visual editing; apps/web/src/lib/tina/islands.ts registry entries are unreachable.

### Q2-4 — `experimental_createIslandRoute` provides the single generic per-island refresh endpoint
- Claim: One dynamic route `src/pages/tina-island/[name].ts` plus `experimental_createIslandRoute(islands)` handles every registry entry: the helper enforces same-origin POST with the TinaCMS-preview content-type, renders the registered component via Astro's container API, and wraps output in the registered wrapper so the bridge can swap it in. An SSR adapter is required because the endpoint runs at request time on every keystroke.
- Source: https://tina.io/docs/contextual-editing/astro ("The per-island endpoint — one generic route", "You need an SSR adapter" callout)
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: apps/web/src/pages/tina-island/[name].ts:5 exports `POST` only while the docs example uses `export const ALL` — the bridge issues POSTs so POST covers documented traffic, but the deviation is unverified; keep `prerender = false` (already set, line 4) and the cloudflare adapter (astro.config.mjs:28) which the Cloudflare-workers guide requires with `nodejs_compat` (https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers).

### Q2-5 — The admin collection sidebar works WITHOUT visual-editing wiring; `ui.router` only controls the link target
- Claim: By default, clicking a document in the collection list opens the full-page editor; setting `ui.router` on a collection creates a link to the visual editor instead (router returns the page path or undefined for the default editor).
- Source: https://tina.io/docs/contextual-editing/router/ ("Visual Editing Router"), https://tina.io/docs/tinacloud/troubleshooting context + https://tina.io/docs/frameworks/astro (admin at /admin works for select/save independent of visual wiring)
- Date: 2026-09-18
- Verdict: SUPPORTED
- Project impact: form-based collection editing in /admin works regardless of Q2-1–Q2-3 gaps; but tina/config.ts:40,169,233 define `ui.router` () => '/' | '/about' | '/faq' pointing at pages with no `<TinaIsland>` wiring, so those router links cannot offer live visual editing until Q2-1–Q2-3 are implemented.

## Notes
- 404s: none encountered; all URLs above resolved on 2026-09-18. (Docs code blocks render client-side, so exact snippets for the island route/`ALL` vs `POST` were corroborated across the Astro guide, the setup guide, the migration guide https://tina.io/docs/migrations/astro-react-free-visual-editing, and the package README.)
- Local measurements (grep, 2026-09-18): `TinaIsland`/`requestWithMetadata`/`tinaField`-helper imports absent from apps/web/src except apps/web/src/lib/tina/islands.ts:1 (type-only import) and apps/web/src/pages/tina-island/[name].ts:1 (route helper); `data-tina-field` literals present in about.astro, faq.astro, Hero.astro, ClubIntro.astro, PageBanner.astro, LeadershipGrid.astro, AboutStory.astro; `@tinacms/astro` is a declared dependency (apps/web/package.json:18) with `tina()` registered (apps/web/astro.config.mjs:4,7).
