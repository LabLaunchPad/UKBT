---
description: Full TinaCMS architecture audit — Tina config, islands, TinaField parity, rich text, media
agent: tina-architect
---

Delegate to `tina-architect` subagent. Scope: $ARGUMENTS (empty = full repo).

Tasks:
1. Read `tina/config.ts`, `tina/tina-lock.json`, `apps/web/src/lib/tina/islands.ts`, `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/lib/content-trust.ts`.
2. Run `node scripts/check-tina-field-parity.mjs` and `node scripts/check-content-trust.mjs` (via `cmd /c` on Windows).
3. Verify every collection field has `tinaField` in its renderer; quote `file:line` for each.
4. Check `tina-lock.json` keys (`schema,lookup,graphql` only), island CSS budget, and `requestWithMetadata` usage.
5. Classify evidence (FACT/OBSERVED/MEASURED) and return VERIFIED / BLOCKED with exact failing lines.

Never edit generated `tina/__generated__/`; never claim PASS without executed parity output.
