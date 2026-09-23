---
name: ukbt-release-verification
description: Use for GitHub Actions, Cloudflare Workers Builds, deployment gating, production propagation, release-path verification, post-deploy smoke checks, or Tina direct-save deployment.
---

# UKBT Release Verification

Project authority: `AGENTS.md` + `wrangler.jsonc` at repo root.

## When to load
GitHub Actions, Workers Builds, deployment gating, production propagation, release-path, post-deploy smoke, Tina direct-save deployment.

## Rules
- Deployment authority is **Cloudflare Workers Builds** (`ukbt-uk-bangla-tigers`, `main → ./apps/web/dist/server/entry.mjs`, `assets → ./apps/web/dist/client`). `WORKERS_DEPLOY_VIA_CI` absent — no GH deploy path.
- `wrangler.jsonc` stays at repo root; mapping enforced by `check-deploy-mapping` (FAIL `no dist` is environmental, passes after `pnpm build`).
- `GITHUB_TOKEN` is UNUSED — leave untouched.
- Never claim deploy from static checks; require Build SHA → live SHA correlation.
- Evidence: `check-deploy-mapping`, Build log, live `curl` probe. KV `SESSION 3435716ffa0e4616b01e2b0faf96ddd5` + `nodejs_compat` pinned.

## Workflow
LOAD → DELEGATE to `cloudflare-release-auditor` → verify mapping → trace Build SHA → live probe → smoke checks → verdict.
