# ISSUES — Ranked P0-P3 (Phase 3 + 7 synthesis)
Date: 2026-09-18

## Search Feature Decision (Phase 3)

**Evidence:**
- tina/config.ts:20-27 has search block with `indexerToken: process.env.TINA_SEARCH_TOKEN`
- package.json:18 `tinacms build --skip-cloud-checks --skip-search-index`
- ci.yml visual job:272 `pnpm exec tinacms build --skip-cloud-checks --skip-search-index`
- docs/tina-audit/CMS_TRUST_MODEL.md:39 "Search token: unused (--skip-search-index; no search UI)."

**Official Tina search requires:** `search: { tina: { indexerToken: TINA_SEARCH_TOKEN } }` + UI consumer. Absent here.

**Decision:** **SEARCH_DISABLED_BY_DESIGN — PASS.** Do NOT provision TINA_SEARCH_TOKEN. Do not add secret. Keep --skip-search-index flags. Add clarifying comment in tina/config.ts to prevent future assumption.

---

## Ranked Issues

### P0 — Blocks deploy:verify / production readiness

| ID | Title | Evidence | Impact if ignored |
|----|-------|----------|-------------------|
| P0-1 | SESSION KV now pinned — verify redeploy still succeeds on second save | wrangler.jsonc de3bfa1 pinned SESSION 343571...; pre-pin second save would hit Workers 10014 duplicate-namespace error. No post-pin deploy proof yet. | Second editor Save would have failed; now fixed but unverified until next GitHub push triggers Workers Builds SUCCESS. |
| P0-2 | HITL Save→GitHub commit→Workers rebuild not proven | TINA_HITL_RUNBOOK.md exists, receipt BLOCKED (artifacts/audit/tina-hardening/TINA_HITL_EXECUTION_RECEIPT.md P0-2 UNKNOWN). No commit SHA, no deploy log. | Checklist 4/4 unverified; production save flow remains UNKNOWN per evidence policy. |
| P0-3 | Build fails locally without injected secrets (expected) but CI/Workers Builds injection unverified | 2026-09-18 `pnpm deploy:verify` FAILED at tinacms build "Missing clientId, token" — correct fail-closed, but proves local shell missing. Remote injection PRESENT per user statements, not API-verified. | Treating UNKNOWN as PASS would mask mis-wiring; next main push must show `tinacms build` success in Actions + Workers Builds logs. |

### P1 — Correctness / Trust

| ID | Title | Evidence | Fix |
|----|-------|----------|-----|
| P1-1 | Token naming docs drift: .env.example missing TINA_CLIENT_ID fallback, missing TINA_SEARCH_TOKEN note | CODE has fallback (tina/config.ts:8) and search dead code; docs omit. TOKEN_MATRIX flags. | Clarify .env.example: add comment fallback + search disabled note. No rename. |
| P1-2 | Cloudflare token location misconception: prior advice to put TINA_TOKEN in wrangler.jsonc env_vars | Tina docs: build-time baked, not Worker runtime. DEPLOYMENT_FLOW.md proves A-like on Workers. | Keep TINA_TOKEN only in Builders Variables and Secrets (Cloudflare) + GitHub Actions secrets. Never wrangler env_vars. |
| P1-3 | Tina naming assumption TINA_READ_ONLY_TOKEN — no code ref | Grep zero hits. Blind rename would break build. | Do NOT rename. Keep TINA_TOKEN. If alias desired, add code fallback `TOKEN || TINA_READ_ONLY_TOKEN` with migration, not rename. |

### P2 — Visual editing wiring (not P0 until P0s closed)

| ID | Title | Evidence |
|----|-------|----------|
| P2-1 | INLINE_EDITING wiring CODE PRESENT but runtime UNPROVEN | Hero.astro + ClubIntro have data-tina-field, islands.ts hero/aboutSection defined, tina-island/[name].ts prerender false. Not exercised. |
| P2-2 | CSP frame-ancestors allow Tina origins | wrangler/docs updated to allow app.tina.io, *.tinajs.io — verify _headers matches. |

### P3 — Hygiene

| ID | Title |
|----|-------|
| P3-1 | wrangler.jsonc indentation drift after de3bfa1 (main line indented differently vs assets) — fixed in this audit's working copy? Verify formatting before PR. |
| P3-2 | .gitignore for apps/web/public/admin generated bundle untracked — correct, keep. |

## Stop Conditions Triggered?
- secret exposure: NONE found
- CMS bypasses truth gates: NO — loaders use Zod + allowlist validators
- static architecture change: NO
- paid feature required for visual editing: NO — click-to-edit works on Free per docs

## Next Action Order (mirrors audit prompt)

1. Token alignment docs fix (P1-1) → minimal commit
2. Verify SESSION redeploy on next main push (P0-1)
3. HITL admin save test (P0-2)
4. deploy:verify full gate proof (P0-3 depends on 1+3)
5. Visual editing wiring proof (P2-1)
6. Production readiness sign-off
