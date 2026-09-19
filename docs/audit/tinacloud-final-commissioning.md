# TinaCloud final commissioning — evidence ledger (2026-09-19)

Base: `main = 799a628` (PR #90 island/CSP/parity/perf fixes as `47bfea8`, PR #91 CSP
revert as `be54425`, PR #92 ledger close as `799a628`; all merged via normal
protected path, all required checks green).

## Final pass (2026-09-19, read-mostly)

- `HEAD == origin/main == 799a628`, tree clean (DIRECT, PASS).
- `SESSION_KV = PASS`: `wrangler.jsonc` at HEAD carries exactly one `kv_namespaces`
  entry (`SESSION` → `3435716ffa0e4616b01e2b0faf96ddd5`); no duplicate binding;
  runtime healthy; empty namespace acceptable per commissioning brief.
- App discovery tool coverage: available GitHub MCP tool set exposes no
  installation/App-identity endpoint; `gh` PAT probes already returned 403/401
  twice with zero Tina commits in history → `GITHUB_APP_VERIFIED = HUMAN_REQUIRED`
  (no re-probe; tool set unchanged, no new evidence).
- Pre-save gate: repo/CF/prod layers PASS with direct evidence; remaining gates
  (`TINACLOUD_PROJECT_VERIFIED`, `SINGLE_REPO_PROJECT`, `EDITORIAL_WORKFLOW_OFF`,
  `GITHUB_APP_VERIFIED`, `RULESET_VERIFIED`, legacy transition) are human/external.
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
| Deploy | `47bfea8` live | FAQ header inside island + primary marker + aboutHero/aboutStory live in production HTML | prod HTML | PROD | PASS |
| Deploy | `be54425` live | Single CSP header on `/admin/` (revert deployed); islands intact | prod headers+HTML | PROD | PASS |
| CSP revert | `/admin/*` block removed | Production emitted both global + scoped CSP (intersection = no-op); global policy unchanged; admin data: errors are cosmetic/pre-existing | prod headers | PROD | PASS |

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
  **RESOLVED 2026-09-19:** owner normalized the dashboard var; redeploy bakes
  `["https://ukbanglatigers.co.uk"]` on `/`, `/about/`, `/faq/` (curl-verified).
  `GITHUB_TOKEN` (Cloudflare): zero consumers in code/wrangler/CI-build → UNUSED;
  leave in place, owner may remove after dashboard confirmation.

## Ruleset verification (2026-09-19, API DIRECT)

- `main-tinacloud-app-bypass` (id `23692482`): active, `refs/heads/main` only.
- Rules: `deletion` + `non_fast_forward` + `required_status_checks`
  (strict false, 18/18 contexts identical to legacy baseline).
- Bypass: sole actor `Integration 47631` (TinaCloud App, discovered via API),
  mode `always`; `current_user_can_bypass: never`.
- Legacy branch protection deleted (API 404s); effective branch rules resolve
  solely from ruleset 23692482. No property weakened.
- TinaCloud project topology human-verified via dashboard screenshots: exact
  repo, `main` indexed, single-repo toggle OFF, Editorial Workflow
  structurally unavailable, bot authoring selected, App installed on
  `LabLaunchPad` with write scope limited to `LabLaunchPad/UKBT`.

## E2E closure status

- `origin/main` checked 2026-09-19: no Tina-originated commit;
  `faq.json` `pageEyebrow` still `FAQ`. Real Save + revert remain
  human-only (no credentials/session available to automation; simulation
  forbidden). Pre-save gate otherwise all PASS. Verdict pending Save:
  `HUMAN_ACTION_REQUIRED`, not `VERIFIED_E2E`.

## First remaining gap (superseded — see Ruleset verification + E2E closure status)

Previously `RULESET_BYPASS_VERIFIED` blocked on unknown App identity. Since
resolved: App install human-verified, ruleset created/verified, legacy
retired. The remaining gap is the real TinaCloud Save + revert (human-only).
