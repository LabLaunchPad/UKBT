# BLOCKERS
- P0-2 HITL: needs human TinaCloud /admin login + Save + SHA capture. Runbook: artifacts/audit/tina-hardening/TINA_HITL_RUNBOOK.md. Worktree missing Playwright MCP config (copy from C:\UKBT\UKBT-main\opencode.json + restart OpenCode).
- P0-3 deploy:verify: needs CI secrets or injected local env for `tinacms build`; OOM fix applied, full run unproven.
- Cloudflare "Error fetching GitHub User or Organization details": dashboard state UNKNOWN; persists per user report.
- Push: needs explicit human approval + Gate 1 checklist.
- 2026-09-18: SESSION ID `3435716ffa0e4616b01e2b0faf96ddd5` HUMAN-CONFIRMED present in Cloudflare KV dashboard (user statement) — P0-1 value upgraded UNKNOWN → OBSERVED-verified-by-owner. de3bfa1 cleared to GO.
- 2026-09-18: User authorized merge of recommended PR/commits with verifications. Executing: backup branch push → fixes-only cherry-pick PR → CI green → squash-merge.
