# TINACMS_REMEDIATION_PLAN — Phase 7 (Safe, Evidence-Backed, No Immediate Code Change)
Date: 2026-09-18
Mode: Plan only — execute one concern per commit after approval. No token rename without migration.

## Grounding Truth Report (summary)

**FACT:** Repo consumes `PUBLIC_TINA_CLIENT_ID || TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_SEARCH_TOKEN (optional)`, branch chain. No `TINA_READ_ONLY_TOKEN`. Build is `tinacms build --skip-cloud-checks --skip-search-index` (search disabled). Deployment is Workers git-connected Builds (not Pages), wrangler at root, adapter cloudflare(), SESSION KV 343571... pinned. Secrets are build-time baked, not Worker runtime. Visual editing code present (data-tina-field, islands, tina-island prerender false), runtime UNKNOWN until HITL.

Confidence: 90% per critique — uncertainty only around private dashboard verification (requires screenshots/API name-only checks).

## Ranked Issues (from ISSUES.md)

P0-1 SESSION redeploy proof pending, P0-2 HITL not executed, P0-3 deploy:verify blocked on secret injection proof. P1-1 docs drift, P1-2 worker runtime misconception, P1-3 naming.

## Minimal Remediation — One Concern Per Commit

### Change 1: Docs alignment — clarify token fallback + search disabled
- **Problem:** .env.example omits TINA_CLIENT_ID fallback and TINA_SEARCH_TOKEN note; invites assumption to add TINA_READ_ONLY_TOKEN.
- **Evidence:** tina/config.ts:8 fallback, :22 search, TOKEN_MATRIX.md, TINA_CONFIG_ALIGNMENT.md WARNING.
- **Risk:** Low — docs only. No code change.
- **Change:** Edit .env.example add commented `TINA_CLIENT_ID=` fallback note + commented `# TINA_SEARCH_TOKEN= (not needed — --skip-search-index; see tina/config.ts search disabled)` + add `TINA_SEARCH_TOKEN` to SEARCH_DISABLED note. Also update docs/tina-integration.md env table to add footnote.
- **Validation:** `pnpm check:security PASS`, `pnpm lint PASS`, `git diff` shows docs only.
- **Rollback:** `git revert` single commit.

### Change 2: Code comment for search disabled intent
- **Problem:** search block exists while build skips it — future dev may provision unnecessary secret.
- **Evidence:** package.json:18, ci.yml:272, tina/config.ts:20-27.
- **Risk:** Low — comment only.
- **Change:** Add comment above search in tina/config.ts: `// Search disabled by design — build uses --skip-search-index, no search UI; do not provision TINA_SEARCH_TOKEN unless search enabled per https://tina.io/docs/reference/search/overview`
- **Validation:** `pnpm typecheck PASS`, `pnpm build` with existing secrets still passes.
- **Rollback:** revert.

### Change 3: Verify SESSION redeploy (no code, verification only)
- **Problem:** P0-1 pin done but not proven on second save.
- **Evidence:** wrangler.jsonc de3bfa1, ISSUES P0-1.
- **Change:** No code. Trigger main push (e.g., this audit merge) and observe Workers Builds Deployments log SUCCESS not 10014. Record screenshot excerpt + wrangler `kv namespace list` name-only verification if token available.
- **Validation:** `check:deploy-mapping PASS` already; add deployment log evidence to CHANGE_LOG.
- **Rollback:** N/A.

### Change 4: HITL proof (human-in-the-loop, not automated)
- **Problem:** P0-2 Save→commit→deploy unproven.
- **Evidence:** TINA_HITL_RUNBOOK.md, receipt BLOCKED.
- **Change:** No code. Human performs TINA_HITL_RUNBOOK Flow Steps 1-5 headed ask session (verify `opencode.json` playwright `ask` config copied to worktree + restart). Record Evidence checklist: TinaCloud Site URL, before/after snapshots, sentinel `(edited via TinaCloud <date>)`, GitHub SHA, Cloudflare deploy status.
- **Validation:** `check-content-trust + check-seo PASS` after save, sentinel visible on production.
- **Rollback:** `git revert HEAD~1` of content commit if needed.

### Change 5: Confirm deploy:verify full gate
- **Problem:** P0-3 deploy:verify currently fails locally due to local missing env — expected. Need CI/Workers proof.
- **Evidence:** 2026-09-18 pnpm deploy:verify fail at tinacms build (correct fail-closed).
- **Change:** No code unless verify shows real failure. After Changes 1-2 merged, push to main, watch GitHub Actions `build` job logs for `tinacms build` success, then `check:deploy-mapping` etc. separately verify single command with injected env: `PUBLIC_TINA_CLIENT_ID=... TINA_TOKEN=... pnpm run build` locally if human provides one-time env injection (never committing values).
- **Validation:** `pnpm deploy:verify` PASS (exit 0) in CI.
- **Rollback:** N/A.

## Execution Order (per critique)

```
Audit (this dir) ↓
Token alignment docs (Change 1-2) ↓
SESSION KV verification (Change 3, push) ↓
HITL admin save test (Change 4, human) ↓
deploy:verify (Change 5) ↓
Visual editing wiring proof (VISUAL_EDITING_STATUS) ↓
Production readiness sign-off
```

## Stop Conditions (re-affirm)

Stop if secret exposure, CMS bypasses truth gates, static architecture changes, paid feature required. None triggered.

## Exact Next Execution Step (after plan approval)

**Implement Change 1 only** — edit .env.example (and docs/tina-integration.md footnote) in a single commit `docs(tina): clarify token fallback + search disabled`. Run `pnpm check:security && pnpm check:content-trust && pnpm check:deploy-mapping && pnpm lint`. Push for review. Do NOT implement Change 2-5 until Change 1 merged and P0-1 redeploy observed.

## No New Secrets Rule

Do NOT create `TINA_READ_ONLY_TOKEN`, `TINA_SEARCH_TOKEN`, or duplicate `TINA_TOKEN` as Variable. Keep `TINA_TOKEN` as Secret (GitHub Actions secrets + Cloudflare Workers Builds Variables and Secrets). Do NOT add to wrangler.jsonc.
