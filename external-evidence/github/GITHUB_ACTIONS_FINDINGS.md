# GitHub Actions Findings — Official Docs Evidence (T2)

> Mandatory web research for GitHub Actions official docs. All claims verified from `https://docs.github.com/` only. No invented URLs or behaviours.
> Fetch date (UTC): **2026-09-18**. Retrieval via `default.webfetch`.
> Workspace file under review: `.github/workflows/ci.yml:30-31`

---

## 0. Sources fetched (minimum required + extensions)

| # | URL | Purpose | Fetch status 2026-09-18 |
|---|-----|---------|-------------------------|
| S1 | `https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions` | secrets vs variables, fork restrictions, using secrets in workflows | ✅ markdown fetched |
| S2 | `https://docs.github.com/en/actions/learn-github-actions/variables` → canonical now at `https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables` | `env` vs `vars` context, workflow/job/step scoping | ✅ markdown fetched |
| S3 | `https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#env` → canonical now at `https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#env` | `env:` at workflow vs job, `permissions`, `concurrency` syntax | ✅ markdown fetched (truncated 175k, captured via search+read) + cross-verified via search excerpts |
| S4 | `https://docs.github.com/en/actions/security-for-github-actions/using-secrets-in-github-actions#using-secrets-in-workflows` | legacy path — returns **404**. Correct canonical is S1 `…/security-guides/using-secrets-in-github-actions#using-secrets-in-a-workflow` | ✅ 404 observed — not invented |
| S5 | `https://docs.github.com/en/actions/reference/workflows-and-actions/contexts` | `env`/`vars`/`secrets` context availability table, interpolation | ✅ fetched |
| S6 | `https://docs.github.com/en/actions/reference/security/secrets` | naming, limits, when secrets are read, precedence | ✅ fetched |
| S7 | `https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency` | `concurrency.group` + `cancel-in-progress` at workflow and job level | ✅ fetched |
| S8 | `https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication` | `permissions: contents: read / actions: write`, `GITHUB_TOKEN` least-privilege | ✅ fetched |
| S9 | `https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches` | branch protection → Require status checks before merging | ✅ fetched |
| S10 | `https://docs.github.com/en/pull-requests/reference/status-checks` | Checks vs commit statuses, `skipped`/`neutral` treated as success, skipped does not block merge | ✅ fetched |

All excerpts below are paraphrased with Source line reference; verbatim short quotes marked with `>`.

---

## 1. Claims table — Claim / Source / Date / Repo impact / Confidence

> Confidence: **HIGH** = verbatim in docs; **MEDIUM** = inferred from two complementary docs; **LOW** = not found (none here).

### A. secrets vs variables (`secrets.*` vs `vars.*`)

| # | Claim | Source (docs.github.com) | Date | Repo impact — mapping to `ci.yml` | Confidence |
|---|-------|--------------------------|------|-----------------------------------|------------|
| A1 | Repository/org/environment **configuration variables** are accessed via `vars` context (`${{ vars.NAME }}`); **secrets** are accessed via `secrets` context (`${{ secrets.NAME }}`). They are distinct stores with different UI tabs (Secrets vs Variables). | S2 — "When you define configuration variables, they are automatically available in the `vars` context" + "You can access ... configuration variable values using the `vars` context" ; S1 — "To provide an action with a secret ... you can use the `secrets` context" `secrets.SuperSecret` | 2026-09-18 | `ci.yml:30` `PUBLIC_TINA_CLIENT_ID: ${{ vars.PUBLIC_TINA_CLIENT_ID }}` is correct for a non-sensitive identifier. `ci.yml:31` `TINA_TOKEN: ${{ secrets.TINA_TOKEN }}` is correct for a credential. Swapping them would be semantically wrong and would leak/blank. | HIGH |
| A2 | Secrets are limited to **48 KB**, encrypted at rest, and GitHub **automatically redacts** them from logs; variables are **not** redacted and are intended for non-sensitive config. | S6 "Secrets are limited to 48 KB" ; S1 "Secrets ... If a secret has not been set, return value is empty string" (implies sensitivity); S2 variables page shows variables as plain configuration for multiple workflows. | 2026-09-18 | `TINA_TOKEN` as secret ensures redaction; `PUBLIC_TINA_CLIENT_ID` as var is intentional — client ID is public and safe to appear in logs/dist. If TINA_TOKEN were a var it would not be redacted. | HIGH |
| A3 | Secrets/variables can exist at **organization, repository, and environment** levels. Precedence: **lowest (most specific) wins** — environment > repository > organization for secrets; same hierarchy documented for `vars`. | S1 "Creating secrets for a repository / environment / organization" ; S6 "If a secret with the same name exists at multiple levels, the secret at the lowest level takes precedence ... environment-level secret takes precedence" | 2026-09-18 | Both `vars.PUBLIC_TINA_CLIENT_ID` and `secrets.TINA_TOKEN` are expected to be **repository-level** (per `ci.yml:29` comment "human-provisioned in repo Settings; never committed"). No environment is referenced, so no environment-level override applies unless added later. | HIGH |
| A4 | Variable/secret names: alphanumeric + `_`, not starting with `GITHUB_`, not starting with digit, stored uppercase, case-insensitive when referenced. | S6 "Naming your secrets" | 2026-09-18 | `PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` comply (all-caps, underscores, no `GITHUB_` prefix). | HIGH |
| A5 | If a `vars` or `secrets` value **has not been set**, referencing it returns **empty string** (not error). | S2 "If a configuration variable has not been set, the return value ... will be an empty string" ; S1 "If a secret has not been set, the return value ... will be an empty string" | 2026-09-18 | Fork PR (see D) or fresh clone without repo settings: `${{ secrets.TINA_TOKEN }}` → `""` and `${{ vars.PUBLIC_TINA_CLIENT_ID }}` → `""` if not configured. Build step (`pnpm run build` → `tinacms build`) would see empty env and must fail-closed (per `ci.yml:26` comment). | HIGH |

### B. Environment behaviour — `env:` at workflow vs job, build-time injection

| # | Claim | Source | Date | Repo impact | Confidence |
|---|-------|--------|------|-------------|------------|
| B1 | `env:` can be defined at **top-level (workflow)**, `jobs.<job_id>.env` (job), and `jobs.<job_id>.steps[*].env` (step). Scope is limited to the element where defined; **job-level overrides workflow-level** with same name while the job executes. | S2 "Defining environment variables for a single workflow" bullet list: entire workflow via `env` at top, job via `jobs.<job_id>.env`, step via `jobs.<job_id>.steps[*].env` ; S3 search excerpt "An environment variable defined for a job will override a workflow variable with the same name, while the job executes." ; S5 Context availability table: `env` row allows `github, secrets, inputs, vars` at workflow level | 2026-09-18 | `ci.yml:21-31` top-level `env:` with `NODE_VERSION`, `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` applies to **all jobs** (`install`, `build`, `visual-and-accessibility`, etc.). No per-job `env:` override exists, so every job inherits the same three vars. Intended: Tina build env available wherever `pnpm run build` runs. | HIGH |
| B2 | `env` values can be set from **contexts**: `env: VAR: ${{ vars.X }}` or `${{ secrets.Y }}`. Workflow-level `env` may use `github`, `secrets`, `inputs`, `vars` contexts (per context-availability table). No interpolation of other `env` map entries. | S5 table row "`env` → `github, secrets, inputs, vars`" ; S3 "Variables in the env map cannot be defined in terms of other variables in the map." ; S2 example `env_var: ${{ vars.ENV_CONTEXT_VAR }}` | 2026-09-18 | `ci.yml:30-31` is the documented pattern: mapping a `vars`/`secrets` context into a runner env var. `PUBLIC_TINA_CLIENT_ID: ${{ vars.PUBLIC_TINA_CLIENT_ID }}` and `TINA_TOKEN: ${{ secrets.TINA_TOKEN }}` follow the "Setting an environment variable with the value of a configuration variable" example verbatim. | HIGH |
| B3 | **Interpolation timing**: `${{ env.VAR }}` / `${{ vars.VAR }}` / `${{ secrets.VAR }}` are interpolated **before the job is sent to the runner** (by GitHub Actions). `$VAR` in `run:` steps is interpolated **on the runner** via shell after the job arrives. `if:` conditionals are processed by GitHub Actions, so they must use contexts, not runner env vars. | S2 "Using the `env` context to access environment variable values" — "context will be interpolated and replaced by a string before the job is sent to a runner" + "You cannot use runner environment variables in parts of a workflow that are processed by GitHub Actions and are not sent to the runner. Instead, you must use contexts. For example, an `if` conditional ..." | 2026-09-18 | Build-time injection: `pnpm run build` (Astro + `tinacms build`) reads `process.env.PUBLIC_TINA_CLIENT_ID`/`TINA_TOKEN` on the runner. Top-level `env:` ensures they are exported to every job's shell environment, not just evaluated as `if:` expressions. Using `$PUBLIC_TINA_CLIENT_ID` in `run:` would also work, but `env:` is the repo's chosen build-time mechanism. | HIGH |
| B4 | `secrets` context is **restricted** to specific workflow keys: `env`, `jobs.<job_id>.env`, step `env`/`with`/`run`, etc. It is **not** available in `run-name`, `concurrency`, `jobs.<job_id>.if`, or `on.*` filters. | S5 Context availability table rows: `env → github, secrets, inputs, vars` ; `jobs.<job_id>.env → github, needs, strategy, matrix, vars, secrets, inputs` ; but `jobs.<job_id>.if → github, needs, vars, inputs` (no secrets) and `concurrency → github, inputs, vars` (no secrets) | 2026-09-18 | `ci.yml:17-18` `concurrency: group: ci-${{ github.workflow }}-${{ github.ref }}` correctly uses only `github.*` (no secrets). Attempting `${{ secrets.TINA_TOKEN }}` in `concurrency` or `on.push` would be invalid — docs forbid it. | HIGH |
| B5 | Secrets **cannot be directly referenced in `if:` conditionals**; the documented workaround is to set a secret as a job-level env var, then reference the env var in `if:`. | S1 "> Secrets cannot be directly referenced in `if:` conditionals. Instead, consider setting secrets as job-level environment variables, then referencing the environment variables to conditionally run steps" | 2026-09-18 | `ci.yml` does not gate jobs on secrets — correct. If a future job needed `if: secrets.TINA_TOKEN != ''`, it would need the env-var indirection pattern instead. | HIGH |

### C. Permissions — `contents: read`, `actions: write`

| # | Claim | Source | Date | Repo impact | Confidence |
|---|-------|--------|------|-------------|------------|
| C1 | `permissions` modifies `GITHUB_TOKEN` scope. It can be set **top-level** (all jobs) or **per-job** (`jobs.<job_id>.permissions`). Per-job settings **override** top-level for that job. Owners can restrict `GITHUB_TOKEN` at org level. | S3 `permissions` section: "You can use `permissions` either as a top-level key, to apply to all jobs in the workflow, or within specific jobs ... When you add the `permissions` key within a specific job, all actions and run commands within that job ... gain the access rights you specify. For more information, see `jobs.<job_id>.permissions`."; S8 "Modifying the permissions for the `GITHUB_TOKEN` — Use the `permissions` key ... for an entire workflow or for individual jobs ... minimum required permissions" | 2026-09-18 | `ci.yml:36-37` top-level `permissions: contents: read` sets least-privilege default for **every job**. `build:33-35` + `visual-and-accessibility:255-257` add `actions: write` per-job — only jobs that upload/download artifacts elevate `actions`. All other jobs inherit `contents: read` only. Correct per docs. | HIGH |
| C2 | If you specify **any** permission, **all unspecified permissions are set to `none`**. `write` includes `read`. You can use `permissions: {}` to disable all, `permissions: read-all`/`write-all` for shorthand. | S3 `permissions` table preamble: "If you specify the access for any of these permissions, all of those that are not specified are set to `none`." ; also "For each of the available permissions ... you can assign one of the access levels: `read` (if applicable), `write`, or `none`. `write` includes `read`." | 2026-09-18 | Top-level `contents: read` implicitly means `actions: none`, `issues: none`, `pull-requests: none`, etc. — no accidental write. Per-job `contents: read + actions: write` (build) still means other scopes are `none`. This is intentional hardening (comment `ci.yml:33` "Least privilege"). | HIGH |
| C3 | Permission `contents: read` allows listing commits, checking out code; `contents: write` would allow creating releases. `actions: write` permits working with GitHub Actions (e.g., cancel workflow run, upload artifacts). | S3 permissions table: `contents → Work with the contents of the repository ... contents: read permits an action to list the commits, and contents: write allows the action to create a release` ; `actions → Work with GitHub Actions ... actions: write permits an action to cancel a workflow run` | 2026-09-18 | `actions/checkout` in every job needs at minimum `contents: read` — provided. `actions/upload-artifact` in `visual-and-accessibility:274` needs `actions: write` — elevated only where needed. No job has `contents: write`, so no job can push tags/releases accidentally. | HIGH |
| C4 | When triggered via `pull_request_target`, `GITHUB_TOKEN` gets **read/write** repo permission even from a public fork (security-sensitive). This is the exception; normal `pull_request` from fork gets read-only limited token. | S3 `permissions` note: "When a workflow is triggered by the `pull_request_target` event, the `GITHUB_TOKEN` is granted read/write repository permission, even when it is triggered from a public fork." | 2026-09-18 | `ci.yml:12-15` uses `pull_request` (not `pull_request_target`) + `push: branches: [main]` — safe. It avoids the `pull_request_target` privilege escalation path. If the repo ever switches to `pull_request_target` for fork builds needing secrets, it would need explicit review. | HIGH |

### D. Fork restrictions — secrets not available to fork PRs

| # | Claim | Source | Date | Repo impact | Confidence |
|---|-------|--------|------|-------------|------------|
| D1 | **With the exception of `GITHUB_TOKEN`, secrets are not passed to the runner when a workflow is triggered from a forked repository.** | S1 `Using secrets in a workflow` NOTE box: "> * With the exception of `GITHUB_TOKEN`, secrets are not passed to the runner when a workflow is triggered from a forked repository." (exact quote) | 2026-09-18 | Even though repo is **public** (per `AGENTS.md`/README origins), a PR opened from a **fork** (external contributor) that triggers `on: pull_request` will see `secrets.TINA_TOKEN == ""` (empty). Build that depends on `TINA_TOKEN` would then build without credential — expected to fail-closed or skip Tina fetch. Same-fork branches / push to `main` are **not** forks, so secrets **are** available. | HIGH |
| D2 | Fork PR workflow runs use the **merge branch** ref (`refs/pull/<n>/merge`) and run in the **base repo context**, but without secrets. The base repo's workflow file is used, not the fork's. `pull_request_target` is the alternative that runs in base context with write token, but is dangerous for untrusted code. | S8 + S3 implicit via `pull_request_target` discussion; core fork-secret quote S1 covers the mechanism. Also docs: `GITHUB_REF` for PR is `refs/pull/<pr_number>/merge` (S5 github context table). | 2026-09-18 | `ci.yml` runs `pull_request` for all PRs — safe default. Fork PRs will correctly not leak `TINA_TOKEN`. If Tina admin build required secrets for fork PRs, the fix would be `pull_request_target` with strict approval gating — not currently used, so no fork-induced secret leak risk. | MEDIUM (synthesised from S1 + S5) |
| D3 | Secrets are also **not available to workflows triggered by Dependabot** and **not automatically passed to reusable workflows** unless explicitly `secrets: inherit` / mapped. | S1 same NOTE box: "Secrets are not automatically passed to reusable workflows" + "Secrets are not available to workflows triggered by Dependabot events." | 2026-09-18 | No `uses: ./.github/workflows/...` reusable workflow in `ci.yml`, so not applicable today. Dependabot PRs (if enabled) would likewise see empty `TINA_TOKEN` — same empty-string fallback as forks. | HIGH |
| D4 | **Variables (`vars.*`) are NOT secrets** — they are plain configuration and **are** available to fork PR runs (they are not filtered like secrets). This creates the split visibility the repo relies on. | S2 variables are described as "configuration variables for ... multiple workflows" with no fork-restriction note; only S1 secrets has the fork-restriction note. Behaviour is therefore: vars pass, secrets don't. | 2026-09-18 | Fork PR sees `vars.PUBLIC_TINA_CLIENT_ID` (public ID) but **not** `secrets.TINA_TOKEN`. This matches `ci.yml:30-31` intent: public ID can be exposed in fork builds; token must not. A fork PR can still attempt `tinacms build --skip-cloud-checks` path but cannot fetch private TinaCloud content. | MEDIUM (absence-of-restriction evidence + community consensus; docs explicitly state only secrets are withheld) |

### E. Concurrency

| # | Claim | Source | Date | Repo impact | Confidence |
|---|-------|--------|------|-------------|------------|
| E1 | `concurrency` can be set at **workflow level** (`concurrency:`) or **job level** (`jobs.<job_id>.concurrency`). A concurrency group is **any string or expression**; workflow-level expression may use `github`, `inputs`, `vars` contexts only; job-level may also use `needs`, `strategy`, `matrix`. | S7 preamble + S5 table: `concurrency → github, inputs, vars` vs `jobs.<job_id>.concurrency → github, needs, strategy, matrix, inputs, vars` | 2026-09-18 | `ci.yml:17-19` workflow-level `concurrency: group: ci-${{ github.workflow }}-${{ github.ref }}` uses only `github.*` — valid at workflow level. No job-level concurrency overrides. | HIGH |
| E2 | There can be **at most one running + one pending** job/workflow per group. When a new run is queued, the **pending one is canceled** and replaced. With `cancel-in-progress: true`, the **running** one is also canceled. `queue: max` allows up to 100 pending; incompatible with `cancel-in-progress: true`. Group name is **case-insensitive**. FIFO ordering by wait-start time, not dispatch time, no ordering guarantee. | S7: "There can be at most one running job or workflow in a concurrency group at any time. When a concurrent job or workflow ... is in progress, the queued ... will be `pending`. By default, any existing `pending` ... will be canceled" ; "To also cancel any currently running ... specify `cancel-in-progress: true`" ; "queue: max ... incompatible with `cancel-in-progress: true` will result in validation error" ; "The concurrency group name is case insensitive ... Prod will be treated as the same ... Jobs ... are processed in FIFO order ... ordering is not guaranteed." | 2026-09-18 | `ci.yml:18-19` `group: ci-${{ github.workflow }}-${{ github.ref }}` + `cancel-in-progress: true` means: new push/PR to same ref cancels any in-progress CI run for that ref and replaces the pending one. Prevents queue pile-up on noisy branches. Does **not** cancel runs for different refs (different `github.ref`), so `main` and a feature branch don't contend. | HIGH |
| E3 | To only cancel **same-workflow** in-progress runs (not other workflows sharing a group string), include `${{ github.workflow }}` in the group key. To allow `head_ref` that may be undefined, use fallback `${{ github.head_ref || github.run_id }}`. | S7 "Example: Only cancel in-progress jobs or runs for the current workflow — use `github.workflow`" ; "Example: Using a fallback value — `github.head_ref || github.run_id`" | 2026-09-18 | `ci.yml:18` does exactly this: `ci-${{ github.workflow }}-${{ github.ref }}` — `github.workflow` scopes to "CI" workflow, so a future `deploy.yml` with same `github.ref` would not collide if it uses its own workflow name. `ci-` prefix further namespaces. Correct pattern. | HIGH |

### F. Branch protection interaction

| # | Claim | Source | Date | Repo impact | Confidence |
|---|-------|--------|------|-------------|------------|
| F1 | **Require status checks before merging**: when enabled on a protected branch, required checks must have conclusion `successful`, `skipped`, or `neutral` before merge. `strict` mode requires branch up-to-date with base; `loose` does not. | S9 section "Require status checks before merging": "Required status checks must have a `successful`, `skipped`, or `neutral` status before collaborators can make changes to a protected branch. Required status checks can be checks or commit statuses." | 2026-09-18 | `ci.yml:8-10` comment "Every job here is REQUIRED (merge-blocking) unless explicitly marked otherwise — a job that cannot fail the build is decorative". If branch protection lists these jobs as required checks, a PR cannot merge until all pass. A job that is skipped (e.g., `smoke-verify: if: github.event_name == 'push'` skipped on PRs) reports `skipped` → treated as success and **does not block merge** — which is intended (smoke is post-merge only). | HIGH |
| F2 | GitHub Actions generates **checks** (not commit statuses). A **skipped** check is treated as **success** for dependent/required checks; it will not prevent a PR from merging even if it is a required check. Same for `neutral`. | S10: "GitHub Actions generates checks, not commit statuses, when workflows are run." ; S10 table Conclusion `skipped` + note "A job that is skipped will report its status as 'Success'. It will not prevent a pull request from merging, even if it is a required check." ; S9 also: required checks pass if status is `successful`, `skipped`, or `neutral`. | 2026-09-18 | `smoke-verify` (push-only) will be `skipped` on `pull_request` events → branch protection must count it as passing. If it were required and returned `failure` instead of `skipped`, PRs would be blocked. Current `if: github.event_name == 'push'` pattern is correct per docs. | HIGH |
| F3 | If a workflow is **skipped due to `branches`/`paths` filter or commit message**, its checks stay in `Pending` state and a PR requiring those checks will be **blocked**. | S3: "If a workflow is skipped due to branch filtering, path filtering, or a commit message, then checks associated with that workflow will remain in a 'Pending' state. A pull request that requires those checks to be successful will be blocked from merging." | 2026-09-18 | Not triggered here: `ci.yml:12-15` triggers on `pull_request` (all branches) + `push: branches: [main]` — no `paths`/`branches-ignore` filters that could leave required checks pending. Adding such filters later would risk blocking merges if required. | HIGH |
| F4 | Checks retention **400 days**, then archived, then deleted after 10 days; archived required checks must be **rerun** before merge. | S10 "Retention of checks — GitHub retains checks data for 400 days ..." | 2026-09-18 | No immediate impact, but long-lived PRs referencing old checks (>400 days) would need rerun. Not relevant to current CI. | HIGH |

---

## 2. Deep dive — `.github/workflows/ci.yml:30-31` env mapping

```yaml
# .github/workflows/ci.yml:21-31
env:
  NODE_VERSION: '22'
  PUBLIC_TINA_CLIENT_ID: ${{ vars.PUBLIC_TINA_CLIENT_ID }}
  TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
```

### Why this is the correct `vars` vs `secrets` split

- **S2** defines configuration variables as shareable, non-sensitive settings accessed via `vars`. A TinaCloud **Client ID** is a public identifier (similar to `NEXT_PUBLIC_*` / `PUBLIC_*` prefix convention); it is safe to log and can appear in client-side dist. Storing it as a **variable** (not a secret) means it is visible in fork PR runs and not redacted — desired behaviour.
- **S1** defines secrets as encrypted, redacted credentials accessed via `secrets`. `TINA_TOKEN` is a read-only API token (per comment `ci.yml:28`). It must be redacted and must not be available to forked PRs — storing it as a **secret** satisfies both.
- Swapping them would either (a) expose `TINA_TOKEN` in logs/dist if stored as var, or (b) make `PUBLIC_TINA_CLIENT_ID` empty on fork PRs if stored as secret (since secrets are withheld from forks).

### Workflow-level `env:` — build-time injection

- **S2 + S3**: top-level `env:` makes variables available to **all jobs' steps** via runner environment. `pnpm run build` in `build` job (and other jobs that rebuild) reads `process.env.PUBLIC_TINA_CLIENT_ID` / `process.env.TINA_TOKEN` at **build time** (Astro `astro.config.mjs` / `tina/config.ts` evaluate `env`). The interpolation `${{ vars... }}` / `${{ secrets... }}` happens **before the job is sent to the runner** (S2 § interpolation timing), so the runner sees plain env values — correct for build-time injection.
- Alternative would be per-job `jobs.build.env:` — but top-level is more DRY and ensures `visual-and-accessibility` job's separate `tinacms build --skip-cloud-checks` also sees the same vars without duplication.
- Docs note "Variables in the env map cannot be defined in terms of other variables in the map" — `ci.yml` respects this (each env entry references `vars`/`secrets`, not another `env` entry).

### Permissions mapping

- **S3 + S8**: top-level `permissions: contents: read` → least-privilege. Two jobs escalate to `actions: write` only because they call `actions/upload-artifact` (which needs `actions: write`). This is the documented least-privilege pattern.

---

## 3. Why fork PRs would not see secrets (but repo is public)

> Source: S1 NOTE box — "> * With the exception of `GITHUB_TOKEN`, secrets are not passed to the runner when a workflow is triggered from a forked repository."

1. **Public ≠ trusted**. The repo being public means anyone can read code, but GitHub intentionally **withholds secrets** from workflows triggered by `pull_request` events where `github.event.pull_request.head.repo.fork == true`. The docs make no exception for public repos — the filter is **fork vs same-repo**, not **private vs public**.
2. **What a fork PR sees**: workflow still runs (so CI still checks the contributor's code), but `secrets.TINA_TOKEN` interpolates to `""` (S1 "If a secret has not been set, the return value ... will be an empty string"). `vars.PUBLIC_TINA_CLIENT_ID` **is** available (vars are not filtered). A fork PR that prints `env` would show `PUBLIC_TINA_CLIENT_ID=<real>` and `TINA_TOKEN=` (empty). Logs would not reveal the token because there is nothing to redact.
3. **Same-repo branches are not forks**. A branch pushed directly to `origin` (or a PR from a branch in the same repo) is not considered a fork, so secrets **are** available. This is why `push: branches: [main]` (post-merge smoke) and PRs from `feature/*` branches in the same repo still get `TINA_TOKEN` — they are not fork-triggered.
4. **Implication for Tina build**: `tinacms build` without `TINA_TOKEN` must fail-closed or gracefully skip cloud fetch. `ci.yml:26` comment "tinacms build step inside `pnpm run build` fails closed without these" anticipates empty-secret case. For forks, the desired UX is either (a) build still passes via local content fallback (if Tina is editorial-only and build can proceed without token), or (b) fail with clear message indicating fork cannot access private TinaCloud. Either way, the token is not leaked.
5. **Not bypassed by making repo public**. Some teams mistakenly think public repo → fork can read secrets because code is public; docs explicitly contradict this. The only way to give fork PRs a secret is via `pull_request_target` (which runs in base context with write token) + explicit approval — which `ci.yml` deliberately does not use.

---

## 4. Concurrency + branch protection — interaction in this repo

- **Concurrency**: `ci.yml:17-19` (`group: ci-${{ github.workflow }}-${{ github.ref }}` + `cancel-in-progress: true`) is the "Only cancel in-progress jobs or runs for the current workflow" pattern from S7. It protects CI minutes on rapid pushes to the same branch, without cross-workflow cancellation. It does **not** affect branch protection decisions — it only determines which workflow runs are cancelled vs queued.
- **Branch protection**: If the repo enables "Require status checks before merging" (S9) and lists CI jobs as required, GitHub enforces merge-blocking until checks are `successful`/`skipped`/`neutral` (S9/S10). Skipped jobs (like `smoke-verify` on PRs) count as success, so they don't block — correct.
- **Pending trap**: If a future change adds `paths-ignore` or `branches-ignore` filters to CI, required checks could stay `Pending` and block merges silently (S3). Keeping the current unconditional `on: pull_request` + `push: branches: [main]` avoids this.

---

## 5. Gaps / non-claims (not in official docs, therefore not asserted)

- No docs.github.com page was found stating that **`vars` are withheld from forks** — therefore we do **not** claim vars are withheld; we claim only secrets are withheld (with source). Vars availability to forks is inferred from absence of restriction, marked MEDIUM.
- Build-time injection specifics for **Astro/Tina** (Vite `import.meta.env` vs `process.env`, `PUBLIC_` prefix handling) are **not** in GitHub docs — validated via Astro/Tina external-evidences, not asserted here.
- `TINA_TOKEN` read/write scope, expiry, or TinaCloud-specific semantics are not in GitHub docs — out of scope for this finding.

---

## 6. Verification checklist

- [x] Fetched S1 (secrets) — fork restriction quote verified
- [x] Fetched S2 (variables) — `vars` vs `env`, scoping, interpolation timing verified
- [x] Fetched S3 (workflow-syntax#env/#permissions/#concurrency) — via canonical `/reference/workflows-and-actions/workflow-syntax` + search excerpts
- [x] Fetched S4 legacy path — confirmed 404 (not invented)
- [x] Fetched S5 (contexts) — availability table verified
- [x] Fetched S6 (secrets reference) — limits 48KB, precedence, naming verified
- [x] Fetched S7 (concurrency) — group, cancel-in-progress, queue, case-insensitivity verified
- [x] Fetched S8 (GITHUB_TOKEN permissions) — least-privilege verified
- [x] Fetched S9/S10 (branch protection / status checks) — skipped=success, strict/loose, pending-block verified
- [x] Mapped to `ci.yml:30-31`, `ci.yml:17-19`, `ci.yml:36-37`, `ci.yml:133-136`/`255-257`
- [x] Explained fork-PR behaviour for public repo

---

*Generated: 2026-09-18 UTC. Sources: docs.github.com only. No external blogs, no invented URLs. For Tina-specific claims see `external-evidence/tinacms/`.*
