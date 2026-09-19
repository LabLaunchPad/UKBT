# TinaCloud final commissioning — evidence ledger (2026-09-19)

Base: `main = 4fdb680` + uncommitted island-boundary repair (see § Defects fixed).
Statuses: `PASS | FAIL | BLOCKED_EXTERNAL`. Classifications:
`DIRECT | REPO | CI | PRODUCTION | EXTERNAL | INFERRED | PREDICTED | UNVERIFIED`.

| Gate | Claim | Exact observation | Source | Class | Status |
| ---- | ----- | ----------------- | ------ | ----- | ------ |
| Identity | Owner personal account | `owner.type: User`, sole collaborator | `gh api repos` | DIRECT | PASS |
| Identity | Client TinaCloud account/role | Not queryable from repo shell | — | EXTERNAL | BLOCKED_EXTERNAL |
| App | TinaCloud App installed on LabLaunchPad | `user/installations` 403; zero Tina commits | gh API + `git log` | DIRECT | BLOCKED_EXTERNAL |
| Protection | Legacy rule intact | enforce_admins true, 18 checks, force/deletion false, linear false, strict false | protection API | DIRECT | PASS |
| Ruleset | Equivalent ruleset + App bypass | `rulesets: []`; App ID unknown → not created (correct order) | gh API | DIRECT | BLOCKED_EXTERNAL |
| Creds CI | Tina vars effective | `tinacms build` green on 3 main SHAs | CI runs | CI | PASS |
| Creds CF | Workers Build vars + SITE_URL | Dashboard unseen; `SITE_URL` absent from repo | repo search | UNVERIFIED | BLOCKED_EXTERNAL |
| Schema | Config + lockfile | `tina/config.ts` branch→main; `tina-lock.json` committed | `git ls-files` | REPO | PASS |
| Visual | Field markers | parity PASS (25 checks incl. boundaries); prod FAQ 8 markers, About 3 markers with real `_content_source` ids | script + browser | REPO+PROD | PASS |
| Visual | Island/document ownership | aboutSection→homepage doc fixed; aboutHero/Story/Leadership registered; FAQ header inside island; dist HTML confirms all 7 `data-tina-island` boundaries | source + `dist/client` HTML | REPO | PASS |
| Security | Headers/CSP | `SECURITY_STATUS=PASS`; `/admin/*` data: font/img exception, fully stamped; XFO absent; frame-ancestors governs | check-security + browser | REPO+PROD | PASS |
| Security | Admin CSP friction | browser proved data: font/img blocked on `/admin/` pre-fix; scoped exception added, deploy-pending | browser | PROD | PASS (pending deploy) |
| CI | HEAD green | `4fdb680` 18/18 success | CI | CI | PASS |
| Deploy | Workers Builds authority | `workers-deploy` gated on absent `WORKERS_DEPLOY_VIA_CI` → skipped | ci.yml | REPO | PASS |
| Real edit/save | Client browser Save → Tina commit | No client account access; no Tina SHA exists | — | EXTERNAL | BLOCKED_EXTERNAL |
| Prod | Live routes | `/faq` `/about` 200 + markers; `/admin` loads (TinaCMS) | browser | PROD | PASS |

## Defects fixed this run (uncommitted)

1. `aboutSection` island fetched the **about** doc while serving homepage `clubIntroLede` → now fetches homepage doc (`islands.ts`).
2. `aboutSection` name collision (homepage ClubIntro vs about PageBanner) → about page uses new `aboutHero`; added `aboutStory`, `aboutLeadership` (were unregistered → island POST 404).
3. FAQ `pageHeading/pageEyebrow` rendered outside the faq island → moved inside `FAQSection`; island passes header fields + doc.
4. `PageBanner`/`AboutStory`/`LeadershipGrid` now derive markers from island `data` on re-render, static string otherwise.
5. `/admin/*` CSP `font-src`/`img-src` `data:` exception (browser-proven admin bundle blockage).
6. Parity guard extended 14→28 checks: document ownership, name uniqueness, registry coverage, header-inside-island, primary-island semantics.
7. FAQ single island marked `primary` (admin opens form, not picker); homepage hero stays primary; about multi-island intentionally unmarked.
8. Perf `cssTotal` 88→96KB re-approval (about-island CSS in island chunk, +5.6KB clean-build measured 93.6KB = CI value) + injection fixture 89→97KB.

## PUBLIC_TINA_ADMIN_ORIGIN forensic verdict (2026-09-19, production evidence)

- Installed `@tinacms/astro@0.7.0` reads the var at build time (`src/internal/admin-origin.ts`):
  comma-split, trimmed, **no trailing-slash normalization**; absent → `null` → bridge
  `init(undefined)` → default `window.location.origin` (`bridge/dist/index.js:492`).
- Bridge uses it as inbound `postMessage` allowlist AND outbound target
  (`isFromAdmin`: strict `includes(event.origin)` + `event.source === window.parent`).
- Live production HTML bakes `const adminOrigin = ["https://ukbanglatigers.co.uk/"]`
  (**trailing slash**, site-wide) → can never equal `event.origin` (origins never
  carry a slash) → bridge deaf + mute. **This var as configured breaks click-to-edit.**
- Topology (browser): `/admin/` is top-level same-origin; preview iframe will be
  same-origin. Same-origin does NOT require the var (default covers it); a wrong
  value actively breaks editing. Classification: **INCORRECT → NORMALIZE**
  (strip to bare `https://ukbanglatigers.co.uk`). NEVER `https://app.tina.io`.
  `GITHUB_TOKEN` (Cloudflare): zero consumers in code/wrangler/CI-build → UNUSED;
  leave in place, owner may remove after dashboard confirmation.

## First remaining gap

`RULESET_BYPASS_VERIFIED`: App identity unknown (`GITHUB_APP_IDENTITY = EXTERNAL_REQUIRED`) →
no Ruleset created → first real Save predicted to meet legacy `422` until owner completes
App-install verification + Ruleset-with-App-bypass (payload template in final report §9).
Rerun from `GITHUB_APP_VERIFIED`.
