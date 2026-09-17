# DECISIONS
- 2026-09-18: Keep `TINA_TOKEN` name; do NOT rename to `TINA_READ_ONLY_TOKEN` (no code ref; evidence: tina/config.ts:9, TOKEN_MATRIX.md). Confidence: High.
- 2026-09-18: `SEARCH_DISABLED_BY_DESIGN`; do NOT provision `TINA_SEARCH_TOKEN` (evidence: package.json:18 --skip-search-index, ci.yml:272). Confidence: High.
- 2026-09-18: Tina secrets are BUILD-TIME only, baked by `tinacms build`; never in `wrangler.jsonc` runtime vars (evidence: tina.io Cloudflare Workers doc, DEPLOYMENT_FLOW.md). Confidence: High.
- 2026-09-18: SESSION KV pin binding=SESSION id=3435716ffa0e4616b01e2b0faf96ddd5 committed (de3bfa1); redeploy proof pending. Confidence: Medium (local gates pass; platform behavior unobserved).
- 2026-09-18 CORRECTION (red-team): P0-1 downgraded PINNED-UNVERIFIED — ID value never API/databoard-checked; deploy-mapping validates shape only, not ID existence. NO-GO on merge push until one human confirmation (KV list or dashboard screenshot). Confidence: High.
- 2026-09-18 CORRECTION: push strategy — NO-GO on pushing 19 commits to main; instead: backup feature branch push, then squash-merge fixes-only PR (8322de1, 68c672e, ddfb40f, de3bfa1-if-confirmed, 4f850ee, 64f89e6). Audit docs stay out of main.
- 2026-09-18: No push until Gate 1 passes. Rollback SHA: 67ba098.
