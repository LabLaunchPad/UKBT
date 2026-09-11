# Private-repository migration readiness (P0/P1 hardening, 2026-09-11)

Decision status: NOT MIGRATED in this task (owner authorization
required). This document answers the readiness questions so the owner
can decide on evidence. Target: private source + private CI, public
static artifact on Cloudflare Edge, public website unchanged.

Sources: Cloudflare Workers docs (GitHub integration, Builds
configuration, preview URLs — fetched 2026-09-11) + observed repo
state. Dashboard-only items are marked OWNER-VERIFY.

## 1. Can Cloudflare deploy from a private repository?

Yes. Workers Builds connects via the Cloudflare Workers & Pages
GitHub App, which supports private repositories. If the app was
installed while the repo was public with "only select repositories"
scope, flipping to private needs no reinstall; if installation
predates or scoping changed, reinstall/re-authorize the app against
the account/org and re-select the repository. Production deployment
(process: push to `main` → build → `wrangler deploy`) is identical
for private repos.

## 2. GitHub App permissions required?

The Cloudflare Workers & Pages app needs: repository contents (read),
commit statuses/checks (write, for build status + PR comments),
pull requests (read, for preview comments), webhooks. No admin,
no code, no secrets access required. Recommendation (already in the
docs): scope the installation to "Only select repositories" and pick
this repo alone.

## 3. Actions continue?

Yes. GitHub Actions runs identically on private repos on all plans
(minutes quotas apply on Free/Team — this repo's CI is ~15 jobs of
short Node runs; well within Free limits). No workflow change needed.
`GITHUB_TOKEN` permissions model unchanged. The gitleaks job, gates,
and Playwright suite all run as today.

## 4. Preview deployment behavior?

Workers Builds creates branch/commit preview URLs
(`<x>--<worker>.workers.dev`) for non-production branches **when
"Builds for non-production branches" is enabled** (Settings > Build >
Branch control). When enabled, **all preview URLs are public by
default**. They can be gated with Cloudflare Access (self / team /
org policy). Recommendation: before or with migration, either
disable non-production branch builds, or put an Access policy on
previews — otherwise flipping the repo private still leaves
pre-merge work publicly browsable (current F-14 exposure continues).
OWNER-VERIFY the current toggle state in the dashboard.

## 5. Secrets required?

None exist to migrate. OBSERVED: the only secret referenced anywhere
is the auto-provided `GITHUB_TOKEN`; Sentry DSN is env-configured
outside the repo; the retired `CLOUDFLARE_API_TOKEN` Action path was
deleted (deploy is git-connected, needs no token). A private repo
adds no new secret requirement.

## 6. Rollback behavior?

Trivially reversible: repository visibility flips back to public in
one setting with no code change. Production is unaffected in both
directions — the edge serves already-built static assets, never the
repo. Open PRs survive the flip (CI reruns on next push).

## 7. Developer access?

Invite collaborators per-user on the private repo (read/triage/write
as appropriate). Solo-maintainer workflow is unchanged; the branch
protection applied 2026-09-11 (PR + green CI required, force-push
and deletion blocked) works identically, and the required-approval
count should rise from 0 → 1 the day a second maintainer joins.

## 8. Dependabot behavior?

Dependabot (added `.github/dependabot.yml` in this task: monthly,
5-PR cap) and secret scanning work on private repos. Enable
"Dependabot security updates" in repo settings after migration
(OWNER-VERIFY — also outstanding on the public repo).

## 9. Existing PRs?

Survive unchanged: #22, #23, #24 (stale), #49 (headers — mergeable
on its own evidence). Post-flip, each needs one new push (or manual
rerun) to refresh CI under the new visibility; no re-creation.

## 10. Production continuity?

Zero-downtime by construction. Migration touches GitHub visibility
metadata only: no DNS, no Worker config, no asset, no header change.
The unbroken chain is: flip visibility → confirm one green CI run →
confirm production headers/content byte-identical → done.

## Suggested execution order (when authorized)

1. Screenshot/record current dashboard states (Builds branch control,
   Access, Observability, env vars).
2. Decide preview policy (disable non-prod builds OR Access-gate them).
3. Flip repo to private; confirm App still listed with correct scope.
4. Push an empty commit (or close/reopen a PR) to prove CI green.
5. Re-probe production (headers + routes) for byte-equality.
6. Delete stale branches (#22–24 either merged or closed first).
7. Raise branch-protection approvals to 1 when maintainer #2 arrives.
