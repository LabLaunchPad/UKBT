# TINACMS_DECISION_RECORD — Consensus (Phase 1b)
Date: 2026-09-18 | Agents: 1 Reality, 2 Tina, 3 Cloudflare, 4 Security, 5 QA, 6 Red Team

## Issue 1: Token naming — keep TINA_TOKEN?
- Evidence: T1 tina/config.ts:9 `process.env.TINA_TOKEN`; T2 tinacms-final-verification claim 1 SUPPORTED (TINA_TOKEN canonical), claim 2 REFUTED (TINA_READ_ONLY_TOKEN zero hits on site:tina.io).
- Options: A rename to TINA_READ_ONLY_TOKEN / B keep TINA_TOKEN / C dual-support alias.
- Decision: **B — keep TINA_TOKEN.** Reason: official name, code-consumed; rename breaks build with zero benefit. Risk: none. Rollback: N/A. Confidence: High.

## Issue 2: Search token — provision TINA_SEARCH_TOKEN?
- Evidence: T1 tina/config.ts:23-30 search block exists; T1 package.json:18 + ci.yml:272 `--skip-search-index`; T2 claim 6 SUPPORTED (skip flag removes need).
- Decision: **Do NOT provision. SEARCH_DISABLED_BY_DESIGN.** Comment added (tina/config.ts:20-22, 64f89e6-adjacent). Confidence: High.

## Issue 3: Tina secret placement — Workers runtime or build-time?
- Evidence: T2 Cloudflare Workers doc verbatim (build-time baked, nothing at runtime); T2 Cloudflare claim 4 SUPPORTED (build-only vs runtime separation).
- Decision: **Build-time only** — GitHub Actions vars/secrets + Workers Builds Variables and Secrets. Never wrangler.jsonc env_vars. Confidence: High.

## Issue 4: SESSION KV pin — merge as-is?
- Evidence: T1 wrangler.jsonc:44-50 pinned, deploy-mapping PASS (shape only); T2 claim 3 SUPPORTED (id-pinning rationale); red-team: ID value never API-verified, wrong ID breaks next deploy.
- Decision: **CONDITIONAL — NO-GO until one human confirmation** (KV list name-only output or dashboard screenshot). Then include in fixes-only PR. Confidence: High.

## Issue 5: Push strategy — 19 commits to main?
- Evidence: T1 diff 21 files +3043/-7, only 4 production-code changes; red-team REFUTED.
- Decision: **Backup feature-branch push, then squash-merge fixes-only PR to main.** Audit docs stay out of main. Confidence: High.

## Issue 6: OOM fix — exclude public/ vs memory increase?
- Evidence: T1 ddfb40f; red-team SUPPORTED (5.5MB bundle via include **/*, public/ holds no source).
- Decision: **Keep exclude.** Full deploy:verify still UNKNOWN until CI run. Confidence: High/Medium.

## Issue 7: HITL — required or replaceable by CI proof?
- Evidence: T2 save→commit→redeploy flow; red-team SUPPORTED (CI proves build, never the TinaCloud→GitHub path).
- Decision: **HITL required for P0-2.** CI-with-secrets proof runs first for P0-3. Confidence: High.
