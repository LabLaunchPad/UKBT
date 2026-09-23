---
description: GitHub → Cloudflare production path audit — Workers Builds, bindings, propagation, gating
agent: cloudflare-release-auditor
---

Delegate to `cloudflare-release-auditor` subagent. Scope: $ARGUMENTS (empty = main HEAD).

Tasks:
1. Verify `wrangler.jsonc` at repo root (`main` + `assets.directory`), `scripts/check-deploy-mapping.mjs`, and that `WORKERS_DEPLOY_VIA_CI` is absent (Builds authority).
2. Resolve `main` HEAD SHA via `git rev-parse HEAD`, then correlate: GH commit → CI workflow run → Cloudflare Workers Build → live SHA (curl probe + response headers).
3. Check KV binding `SESSION` id `3435716ffa0e4616b01e2b0faf96ddd5`, no duplicate `wrangler.jsonc` under `apps/web/`, and secret hygiene (`GITHUB_TOKEN` unused).
4. Run `pnpm deploy:verify` subset if requested via $ARGUMENTS (e.g. `quick` = mapping + headers only).
5. Return Build SHA, deploy link, live SHA, binding verdict, and PASS/FAIL.

Never claim deploy from static checks alone; live probe is mandatory.
