# Cloudflare Tooling — CURRENT_STATE — 2026-09-17

> Base: `3fe59ff` HEAD `ukbt-tina-hardening` (+ uncommitted fixes, see CHANGES.md)
> Evidence classes: FACT / VERIFIED / UNKNOWN — never upgraded.

## 1. Wrangler version — VERIFIED

- `npx wrangler --version` → `4.126.0` — VERIFIED (matches root `package.json:49` `wrangler@4.126.0` pinned range).

## 2. Authentication — FACT (blocked locally, not needed in CI)

| Surface | State | Evidence |
|---|---|---|
| Local env `CLOUDFLARE_API_TOKEN` | **absent** | `Get-ChildItem Env:` filtered `*CLOUDFLARE*`/`CF_*` → 0 hits — VERIFIED |
| Local env `CLOUDFLARE_ACCOUNT_ID` | **absent** | same command, 0 hits — VERIFIED |
| `.env` / `.dev.vars` in repo | **absent** | glob `{.dev.vars,.env,.env.*}` → only `.env.example` + `CLAUDE.md`/`AGENTS.md` — VERIFIED |
| `npx wrangler kv namespace list` | **auth ERROR** | `In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable` — VERIFIED (3 runs: `17:35`, `17:39`, `17:48`) |
| CI (`ci.yml`) `CLOUDFLARE_API_TOKEN` | **not required** | workers-deploy job removed 2026-09-10 (`ci.yml` NOTE: "production deploys via git-connected Workers Builds ... deleted rather than re-credentialed"); `env:` carries only `PUBLIC_TINA_CLIENT_ID` + `TINA_TOKEN` — FACT |
| `--temporary` claim URL | **rejected** | Would bind a temp account unrelated to `ukbt-uk-bangla-tigers` — forbidden by no-fabrication rule — INFERENCE, documented |

Local workflow (safe, no secret printed): human exports `CLOUDFLARE_API_TOKEN` (token with KV read/write on the account owning `ukbt-uk-bangla-tigers`, created per Cloudflare API-token docs) in the terminal, then `npx wrangler kv namespace list`. Never commit the value; `.env` is gitignored.

## 3. Schema warning — FACT (invalid field, fixed)

- Before: `wrangler.jsonc:59` `"redact_query_string": true` → wrangler warned `Unexpected fields found in observability field` on every invocation — VERIFIED (17:35, 17:39 runs).
- Installed schema `node_modules/wrangler/config-schema.json` `Observability` (lines 3972-4050): no `redact_query_string`, `additionalProperties: false` — FACT.
- Official docs (fetched 2026-09-17): `observability` = `enabled` + `head_sampling_rate` only — FACT.
- Verdict: field was a no-op (warned + ignored). Removed 2026-09-17; see CHANGES.md. Post-fix run (17:48): warning gone — VERIFIED.

## 4. Skills install — VERIFIED (no repo overwrite)

- `npx wrangler kv namespace list --install-skills` → `Successfully installed Cloudflare skills for: OpenCode` — VERIFIED.
- Target: global `%USERPROFILE%\.config\opencode\skills\` — 14 dirs timestamped install time (`cloudflare`, `wrangler`, `workers-best-practices`, `durable-objects`, `nextjs-on-cloudflare`, `web-perf`, `turnstile-spin`, `sandbox-*`, `agents-sdk`, `cloudflare-one*`, `cloudflare-email-service`) — VERIFIED.
- Repo: `git status` shows zero changes under `.opencode/` (tracked project skills `60fps-animation`, `accessible-animation`, etc. untouched); `AGENTS.md`/`CLAUDE.md`/`.claude/`/`.Jules/` untouched — VERIFIED.

## 5. Deployment path — FACT (unchanged)

Git-connected Workers Builds publishes on `main` merge; no local `wrangler deploy` needed for release. `wrangler.jsonc:35-43` (`nodejs_compat` added `68c672e`, SESSION KV still unpinned — see P0-1). No Tina/architecture changes in this wave.
