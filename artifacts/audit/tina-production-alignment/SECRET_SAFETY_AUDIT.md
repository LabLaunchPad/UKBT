# SECRET_SAFETY_AUDIT — Phase 5
Date: 2026-09-18

## Rules
Never output values. Only PRESENT / MISSING / UNKNOWN. Check GitHub Actions refs, .env examples, committed files, logs, admin bundle.

## Checks

| Location | Check | Result |
|----------|-------|--------|
| `.env.example:9` TINA_TOKEN= | Empty placeholder, comment "SECRET — set in local .env (gitignored), GitHub Actions secrets, Cloudflare Workers Builds. Never commit." | **PASS** — correctly empty |
| `.env` (local) | gitignored? | .gitignore contains `.env` — **PASS** (verify) |
| `tina/config.ts:9` token ref | `process.env.TINA_TOKEN` — not hardcoded | **PASS** |
| `.github/workflows/ci.yml:31` TINA_TOKEN | `TINA_TOKEN: ${{ secrets.TINA_TOKEN }}` — secret ref, not value | **PASS** |
| `wrangler.jsonc` | No TINA_TOKEN in file (only SESSION KV) | **PASS** — do not add |
| `apps/web/public/admin/` | Generated bundle gitignored, not committed | **PASS** — untracked per `git status` |
| Logs | No token echo in CI logs? | UNKNOWN — requires viewing Actions logs for `tinacms build` stderr (should not print token) |
| `packages/truth` etc | No secret refs | **PASS** |

## Findings
- No secret exposure found in repo.
- Prior advice to add TINA_TOKEN to wrangler.jsonc env_vars would be **miswiring + potential exposure via Worker env inspection** — correctly avoided. Build-time only is correct per https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers § Environment variables "These are build-time only. tinacms build bakes the client ID and token into the generated client, so there's nothing to add again as a runtime variable." (webfetch 2026-09-17 verified).
- Do not add TINA_READ_ONLY_TOKEN or TINA_SEARCH_TOKEN unless code changes to consume them.

## Unknowns
- Whether Cloudflare Workers Builds Variables and Secrets correctly mark TINA_TOKEN as Secret (encrypted) not Variable — user reports Secret PRESENT, Variable PUBLIC_TINA_CLIENT_ID — matches best practice. Needs dashboard screenshot for VERIFIED.
- Whether GitHub Actions secrets.TINA_TOKEN has correct read-only scope (vs search scope) — TinaCloud dashboard distinguishes Content token vs Search token. Repo needs Content (read-only) token for current build. Search token not needed.

## Recommendation
Keep current secret handling. Only fix docs to clarify search disabled and fallback name.
