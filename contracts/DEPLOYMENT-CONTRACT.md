# Deployment Contract

**ID:** CONTRACT-DEPLOYMENT-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the deployment target, static-output expectations,
function boundary, and rollback posture before any deployment config
exists.

## Outputs / Frozen deployment model (source: `ARCHITECTURE-PROPOSAL-V3.md`
§12, `EV-20260826-018`)

```
HOST = Cloudflare Pages
STATIC_OUTPUT = apps/web build output (Astro `output: 'static'`)
FUNCTIONS = Cloudflare Pages Functions, available under the same project,
            NOT ACTIVATED until a real form exists (FORM-CONTRACT.md)
PREVIEW_DEPLOYMENTS = one per PR, standard Cloudflare Pages behavior
PRODUCTION_DEPLOYMENT = on merge to the default branch
CI_INTEGRATION = GitHub Actions builds and runs the full CI-CONTRACT.md
                 gate set on every PR before a preview/production
                 deployment is considered valid
```

## Environment configuration

- No environment variable carries a real secret at this stage (no secret
  is currently required by any implemented functionality).
- When a form is implemented, its Cloudflare Functions environment
  bindings are documented here as an amendment, never invented in advance.
- `.env.example` (once created) documents variable names/purposes only.

## Secrets

- No secret is committed to the repository.
- Cloudflare account/API credentials (for CI-driven deployment, if used)
  are stored in GitHub Actions secrets, never in a tracked file.
- `CI-CONTRACT.md`'s secret-scan gate is the enforcement mechanism.

## Fonts (deployment-relevant, cross-referenced from `ASSET-CONTRACT.md`)

- Lato/Montserrat (or their eventual UKBT replacements) are self-hosted
  under their OFL terms as part of the `apps/web` static output — never
  loaded from `fonts.gstatic.com` at runtime, resolving the GDPR/
  third-party-request finding (`U-18`, `knowledge/06 privacy`).

## Rollback / recovery

- Cloudflare Pages retains prior deployments; rollback is a target-the-
  previous-deployment operation, not a rebuild — this is standard
  Cloudflare Pages behavior, not a bespoke mechanism this project builds.
- A production deployment that fails a post-deploy smoke check (Stage 4
  addition, not yet implemented) is rolled back to the last known-good
  deployment rather than left live and "fixed forward" under user traffic.

## No runtime services beyond the approved architecture

- No database, no server process, no additional runtime service is
  deployed beyond: static asset hosting + (once activated) Cloudflare
  Pages Functions for the forms adapter (`FORM-CONTRACT.md`). Adding any
  other runtime service requires re-planning (`INV-009`, minimum
  defensible architecture).

## Invariants

- Static output remains portable to any static host — the
  Cloudflare-specific piece is scoped to the Functions adapter alone
  (`ARCHITECTURE-PROPOSAL-V3.md` §12), preserving `FORM-CONTRACT.md`'s
  rewrite-avoidance guarantee at the deployment layer too.
- Production deployment requires the full CI gate set to pass first — no
  direct-to-production deployment path bypassing CI exists.

## Forbidden behavior

- Committing a Cloudflare API token or account credential to the
  repository.
- Activating Cloudflare Pages Functions before a real form exists.
- Adding a runtime service (database, server process) without a new
  architecture decision record.
- Deploying to production on a red CI run.

## Validation method

- GitHub Actions workflow gates production deployment on the full
  `CI-CONTRACT.md` gate set passing.
- A future post-deploy smoke check (Stage 4) verifies the production
  deployment actually serves the expected build before considering the
  deployment complete.

## Owner

Track C. Not gated by Track B.

## Dependency

`CI-CONTRACT.md` (deployment gating). `FORM-CONTRACT.md` (Functions
activation trigger). `ASSET-CONTRACT.md` (font self-hosting).

## Change authority

Adding a runtime service beyond static hosting + Functions requires a new
architecture decision, following the same DECISION/WHY/ALTERNATIVES/
EVIDENCE/REVERSIBILITY/RISK/CONSEQUENCE format used in
`ARCHITECTURE-PROPOSAL-V3.md`.

## Evidence required

`EV-20260826-018` (Cloudflare deployment decision).

## Reversibility

MODERATE. Static output is portable; only the Functions adapter is host-
specific, and it sits behind `FORM-CONTRACT.md`'s own adapter boundary —
so even the Cloudflare-specific piece is designed to be swappable without
a UI rewrite.

## Amendment, 2026-08-27: HOST is Cloudflare Workers (static assets), not Pages

**What changed:** `HOST` above reads `Cloudflare Pages`. The actual owner
action taken this date, live in the Cloudflare dashboard (photographed and
supplied directly), was Workers Builds' "Connect to a repository" flow
against a pre-existing Worker named `uk-bangla-tigers` (created in the
account 2026-08-10, verified via the Cloudflare MCP connector's
`workers_list`/`workers_get_worker`) — production branch `main`, deploy
command `npx wrangler deploy`. That is Cloudflare Workers, a different
product from Cloudflare Pages, not a rewording of the same one.

**Why this doesn't require a new architecture decision record:** the
static-output architecture this contract exists to protect is unchanged —
`apps/web` still builds to `output: 'static'`, no adapter, no Functions,
no runtime service. Per Cloudflare's own current guidance
(`developers.cloudflare.com/workers/framework-guides/web-apps/astro/`,
queried 2026-08-27), a purely static Astro site needs no
`@astrojs/cloudflare` adapter at all under Workers — only a Wrangler
config naming an `assets.directory`. This is a delivery-mechanism
substitution (Workers' static-assets serving in place of Pages' static
hosting), not the runtime-service expansion `INV-009`/"Change authority"
above gates.

**What was added, this commit:**
- `wrangler.jsonc` **at the repository root** — `name: "uk-bangla-tigers"`
  (matches the existing Worker exactly, so `wrangler deploy` targets it
  rather than creating a new one), `assets.directory: "./apps/web/dist"`,
  no `main` entry (static-only, no Worker script needed). Originally
  placed at `apps/web/wrangler.jsonc`; moved to root after build
  `55c1d854` proved that wrong — see the correction below.
- `wrangler` as a pinned `apps/web` devDependency (Cloudflare's own
  documented convention: "Workers Builds will use the Wrangler version
  set in your package.json") + a matching
  `scripts/dependency-allowlist.json` entry.

### Correction, same date: the config was in the wrong place

Builds `2a9ae32b` (commit `754612a`) and `55c1d854` (commit `c6e0725`)
both failed. The build log — supplied by the owner, since Cloudflare
does not put it in the GitHub check output — gives the cause exactly:

```
Executing user deploy command: npx wrangler versions upload
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

Two independent faults, both in dashboard build settings, neither in the
repository's code:

1. **Build command was `None`.** Nothing ran `pnpm run build`, so
   `apps/web/dist` did not exist at deploy time.
2. **Deploy command was the bare default** (`npx wrangler versions
   upload`, the non-production variant) run from Root directory `/`.
   Wrangler resolves its config relative to the directory it runs in, so
   a config at `apps/web/wrangler.jsonc` was never found. The earlier
   recommendation above — pass `-c apps/web/wrangler.jsonc` — would have
   worked, but it required the owner to edit three dashboard fields and
   left the repository broken under Cloudflare's own defaults.

**Fix applied repository-side:** `wrangler.jsonc` moved to the repository
root with `assets.directory: "./apps/web/dist"`. Both default commands
now resolve with no flags, verified locally against the real build output
(`npx wrangler deploy --dry-run` and `npx wrangler versions upload
--dry-run`, each reading 49 files from `apps/web/dist`). This reduces the
required dashboard change from three fields to one.

**Note on what the log disproves.** The failure was *not* caused by
`main` being empty. The log shows `Scope: all 3 workspace projects` and
495 packages installed — Cloudflare cloned and installed the feature
branch, not `main`, and ran the *non-production* deploy command, which is
what Workers Builds uses for a non-production branch. The build got as
far as a successful `pnpm install --frozen-lockfile` and failed only at
the deploy step.

**What is still genuinely open:**
- **One dashboard field must still be set by the owner** (Settings →
  Build): Build command = `pnpm install --frozen-lockfile && pnpm run
  build`. Cloudflare explicitly does not honour a `build` block in the
  Wrangler config for Workers Builds
  (`developers.cloudflare.com/workers/ci-cd/builds/configuration/`), so
  this cannot be fixed from the repository. Root directory stays `/`;
  both deploy commands can now stay at their defaults.
- **`main` is still not a viable production branch**, for a reason
  unrelated to the above: it holds only `README.md`, because PR #1 (63
  commits) has never been merged and `main` has no branch protection
  (`docs/11-github-branch-protection.md`). Deployments will keep coming
  from the feature branch as preview versions until that PR merges.
- No production deploy has been executed or verified from this session.
  The `HOST` line above is left as originally written for the historical
  record; this amendment is the current truth.

## Amendment, 2026-08-27 (later same day): Worker renamed, `wrangler.jsonc` updated to match

**What changed:** the owner renamed the connected Worker, in the
Cloudflare dashboard, from `uk-bangla-tigers` to `ukbt-uk-bangla-tigers`
(confirmed via the Cloudflare MCP connector's `workers_list` — same
Worker `id.tag` `2aa808c47b0040a5a19b23aa0153ea0d` throughout, only the
`name` field and `modified_on` changed). The dashboard surfaced this
itself: a build-settings banner offered to auto-generate a PR updating
`wrangler.jsonc`'s `name` to the new value, per Cloudflare's documented
"Worker name must match `name` in the Wrangler config" build-fail mode
(`developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/#workers-name-requirement`).

Every Workers Build on every branch had been failing instantly (0-second
duration, no build steps ever ran, no log output) since the deployment
wiring landed — consistent with this exact pre-build validation failing,
not a code defect. `wrangler.jsonc`'s `name` is updated to
`ukbt-uk-bangla-tigers` in this same commit rather than waiting on
Cloudflare's auto-PR.

**Also confirmed empty in the dashboard at the same time:** the **Build
command** field showed `None` — never set to the
`pnpm install --frozen-lockfile && pnpm run build` value this contract
already called out above as owner-required. Both fixes are needed
together; the name fix alone does not make the build produce output, and
the build-command fix alone would still fail Cloudflare's pre-build name
check.

## Amendment, 2026-08-27 (third): `workers-deploy` GitHub Actions job — missing install step, then missing root-level `wrangler`

**What changed:** a second, independent deploy path exists alongside
Cloudflare's own Workers Builds — `.github/workflows/ci.yml`'s
`workers-deploy` job, which runs `cloudflare/wrangler-action@v4` on every
push to `main` after the full CI gate set passes. Investigating an
instant failure in that job (`Unable to locate executable file: pnpm`)
surfaced two stacked defects, fixed as two separate commits:

1. The job checked out the repo and downloaded the built `dist/` artifact
   but never ran `pnpm install` at all — so `pnpm`/Node were present
   (`pnpm/action-setup`, `actions/setup-node`) but no `node_modules`
   existed for `wrangler-action` to find `wrangler` in. Fixed by adding
   `pnpm install --frozen-lockfile` immediately before the deploy step.
2. With `node_modules` now present, `wrangler-action`'s own
   `pnpm exec wrangler --version` check still failed
   (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`), and its fallback install
   attempt (`pnpm add wrangler@4`) failed too
   (`ERR_PNPM_ADDING_TO_ROOT`) — verified against the actual job log, not
   assumed. Root cause: `wrangler` was declared only in
   `apps/web/package.json`, but both `wrangler-action` and Cloudflare's
   own dashboard deploy command run `pnpm exec`/`npx wrangler` from the
   **repository root** (where `wrangler.jsonc` lives, per the first
   amendment above). A devDependency declared in a workspace member is
   invisible to `pnpm exec`/`pnpm add` invoked at the workspace root; pnpm
   also refuses to silently add a dependency to the root package without
   an explicit `-w` flag neither action passes. Fixed by declaring
   `wrangler` as a root-level devDependency too (kept in `apps/web` as
   well — nothing requires removing it there), verified locally: `pnpm
   exec wrangler --version` now resolves to `4.126.0` from the repo root,
   and `npx wrangler deploy --dry-run` reads all 49 files from
   `apps/web/dist` and reports `--dry-run: exiting now` with no error.

This is the same root cause the first amendment's `DEPLOYMENT-CONTRACT.md`
prose already named for Cloudflare's own dashboard build path ("Workers
Builds will use the Wrangler version set in your package.json") without
it being fixed there yet either — `npx wrangler` silently falls back to
the latest published version when it can't find a local install, which is
why the dashboard path deployed successfully despite the same underlying
mismatch; `wrangler-action` has no such silent fallback and fails hard
instead. Declaring `wrangler` at root fixes the pinned-version gap for
both paths, not just the GitHub Actions one.

**Not yet confirmed:** the actual `workers-deploy` job run on the push
that carries this fix. Verify against the next push-to-main CI run's
"Workers deploy (GitHub Actions)" job conclusion before treating this as
resolved.

## Amendment, 2026-09-15: `@astrojs/cloudflare` activated — Worker + assets mapping (production 404)

**What changed:** `apps/web/astro.config.mjs` now sets
`adapter: cloudflare()` (`@astrojs/cloudflare` 14.2.5, production
dependency) to serve the Tina visual-editing island route
(`src/pages/tina-island/[name].ts`, `export const prerender = false` —
the ONLY on-demand production route; all other routes prerender). The
adapter relocates static output to `apps/web/dist/client/` and emits the
Worker entry at `apps/web/dist/server/entry.mjs` (plus an
adapter-generated `dist/server/wrangler.json` with `main: "entry.mjs"`,
assets `"../client"` — the generated truth this amendment mirrors).

**The incident this corrects:** the adapter was activated without
updating this contract's delivery mapping: root `wrangler.jsonc` kept
`assets.directory: ./apps/web/dist` with no `main`, serving a directory
containing only `client/` + `server/` subfolders — no `index.html`, no
`404.html`, no `_headers` at its root. Homepage (and every other route)
returned a platform-level 404; the custom 404 and `_headers` never
applied. All 15 CI gates passed because every check inspected the build
output while nothing validated the serve mapping, and Workers Builds
promoted the broken revision to production with no post-deploy smoke
check.

**Mapping now (root `wrangler.jsonc`):**
`main: ./apps/web/dist/server/entry.mjs`,
`assets: { binding: ASSETS, directory: ./apps/web/dist/client,
not_found_handling: 404-page }`. `name` stays `ukbt-uk-bangla-tigers`
(dashboard Worker); the adapter-generated `ukbt-web` name is NOT
adopted. Verified: `wrangler deploy --dry-run` reads 185 files from
`dist/client`; local `wrangler dev` serves `/` → 200,
`/definitely-nonexistent-route-ukbt-test` → 404 + custom document,
full security-header set, and `POST /tina-island/hero` → 200 island
HTML. Note: the installed adapter (v14) emits `dist/server/entry.mjs`,
NOT the `dist/_worker.js/index.js` layout in Cloudflare's current docs
(which target a newer adapter) — the generated output, not the docs
page, is authoritative here.

**Prevention added, this commit:**
- `scripts/check-deploy-mapping.mjs` (`pnpm run check:deploy-mapping`,
  wired into `deploy:verify` and a new `deploy-mapping` CI job) — fails
  pre-deploy when the configured assets dir lacks index/404/_headers,
  when adapter/on-demand routes exist without a `main` entry, or on
  duplicate/conflicting Wrangler configs. Failure-injected against the
  incident layout: FAILs on 4 rules.
- `scripts/smoke-deploy.mjs <base-url>` (`pnpm run smoke:deploy <url>`)
  — post-deploy HTTP assertions (homepage/sub-route/asset 200, custom
  404, deployed security headers, island route). FAILs 7/7 against the
  broken production revision; PASSes 6/6 against the fixed local
  Worker. MUST be run against preview before promotion and against
  production after (assignee: release operator; not yet wired as an
  automatic promotion gate — see open item below).

**Still open after this commit:**
- Production still serves the broken revision until the fixed mapping
  is deployed (rollback to last-known-good or forward-deploy, then
  `smoke:deploy` against production).
- `main` branch protection's required-checks list does not yet include
  the new `deploy-mapping` job — owner action.
- Missing Tina Cloud credentials (`PUBLIC_TINA_CLIENT_ID`/`TINA_TOKEN`)
  remain a SEPARATE tracked issue; proven unrelated to the homepage 404
  (island route renders 200 from local content with no secrets).
