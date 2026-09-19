---
description: Tina/Zod/GraphQL/lock/content parity audit — required/optional/default/nullability drift
agent: schema-contract-auditor
---

Delegate to `schema-contract-auditor` subagent. Scope: $ARGUMENTS (empty = all 4 collections).

Tasks:
1. Diff `tina/config.ts` vs `tina/tina-lock.json` (graphql) vs `apps/web/src/lib/tina/loaders.ts` (Zod) vs `apps/web/content/**/*.json` vs renderer `tinaField` usage.
2. Run `node scripts/check-tina-field-parity.mjs` (28 checks) and `node scripts/check-content-trust.mjs`; capture output.
3. Build drift matrix: field | required/optional | default | trust class | renderer coverage | verdict.
4. Flag `tina-lock.json` key violations, missing `content-trust.ts` classifications, and any hand-edited `tina/__generated__/`.
5. Return PASS/FAIL with file:line citations; fail closed on any violation.

Scope filter: $ARGUMENTS may be collection name (homepage/about/faq/siteSettings) or field path.
