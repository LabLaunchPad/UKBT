---
name: ukbt-security-boundary
description: Use for CMS-controlled URLs/images, Tina bridge security, CSP, origin validation, secrets, uploads, dependencies, or security regressions.
---

# UKBT Security Boundary

Project authority: `AGENTS.md` + `contracts/`; fail closed.

## When to load
CMS-controlled URLs/images, Tina bridge security, CSP, origin validation, secrets, uploads, dependency advisories.

## Rules
- Every CMS-controlled `href`/`img`/`src` must be sanitized via `apps/web/src/lib/tina/validators.ts` and classified in `content-trust.ts`. Rich-text `faq.items.answer` via `TinaMarkdown` is the audited sink (not only `renderFaqAnswer`); `content-trust.ts` must reflect the actual renderer.
- CSP `frame-ancestors self https://app.tina.io https://*.tinajs.io` only; no relaxation via scoped `_headers`. `__UKBT_CSP_SCRIPT_HASHES__` stamped post-build.
- `adminOrigin` bare `["https://ukbanglatigers.co.uk"]` — trailing slash breaks bridge strict `includes`.
- Secrets: `TINA_TOKEN` never client-exposed; `GITHUB_TOKEN` unused — do not rotate/delete.
- Run `scripts/check-security.mjs` + `pnpm audit` for every claim; `no dist` FAIL is environmental (passes after `pnpm build`).

## Workflow
LOAD → DELEGATE to `security-auditor` → sink table + CSP dump + secret scan → `check-security` → verdict (fail closed).
