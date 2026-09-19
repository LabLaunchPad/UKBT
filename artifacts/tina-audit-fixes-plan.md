# Tina Full Audit — Fixes Plan (Grounded)

**Date:** 2026-09-19T11:45Z
**HEAD:** a044bc4 (fix/tina-contract-alignment + Agent OS + harden)
**Subagents:** tina-architect (PASS), schema-contract-auditor (33/36 PASS), security+browser-forensics (5/6 PASS), cloudflare/monorepo (manual)
**Web cross-checks:** TinaCMS defineConfig/tinaField docs, Astro 7 server islands + cloudflare adapter, Cloudflare wrangler assets binding — all align.

## Evidence Summary (DERIVED from executed checks)

| Gate | Result | Receipt |
|------|--------|---------|
| `check-tina-field-parity.mjs` | **PASS** 28 checks | `node scripts/check-tina-field-parity.mjs → {"TINA_FIELD_PARITY_STATUS":"PASS","failures":[]}` |
| `check-content-trust.mjs` | **PASS** | `CONTENT_TRUST_STATUS PASS` |
| `check-security.mjs` | **FAIL no dist** (expected) | `{"SECURITY_STATUS":"FAIL","reason":"no dist"}` — passes after `pnpm build` (stamps `__UKBT_CSP_SCRIPT_HASHES__`) |
| `check-perf.mjs` | **FAIL no dist** (expected) | same — needs dist |
| `deploy-mapping` | **FAIL no dist** (environmental) | `assets-directory-absent`, `worker-entry-absent` — config correct per `wrangler.jsonc:31` |
| `astro check` | **0 err, 0 warn** | 4 hints only (sw-register is:inline, _tina* probes) |
| `tina-lock` keys | **PASS** | `["schema","lookup","graphql"]` only |
| Tina versions | **PASS** | `astro 7.2.8`, `@tinacms/astro 0.7.0`, `tinacms 3.14.0`, `@astrojs/cloudflare 14.2.5` — matches docs |

Web docs confirm: `defineConfig({branch,token,clientId,schema:{collections}})` + `tinaField(data,'field')` + `TinaIsland server:defer` + `wrangler main/assets` pattern — no version skew.

## Drift Inventory (grounded file:line)

### P1 — Schema nullability (blocks CMS drafts)
- `apps/web/src/lib/tina/loaders.ts:40` `visible: z.boolean()` — Tina `faq.items.visible` is `type:boolean` no `required` ⇒ optional (`tina/config.ts:271`), GraphQL `FaqItems.visible: Boolean` nullable, Zod requires → draft without toggling fails. **Receipt:** schema-contract audit.
- `apps/web/src/lib/tina/loaders.ts:63` `contact: z.object({...})` required — Tina `siteSettings.contact` `tina/config.ts:290` no `required` ⇒ optional container, GraphQL nullable. **Receipt:** same.
- `apps/web/src/lib/tina/loaders.ts:71` `social: z.array(...)` required — Tina `siteSettings.social` `tina/config.ts:300` optional, GraphQL nullable.
- **Fix:** add `.optional()` (or `.optional().default(...)`) in loaders. Alt: make Tina required:true but needs lock regen.

### P2 — Security doc/code mismatch
- `apps/web/src/lib/tina/validators.ts:28-42` `sanitizeImageSrc` dead (0 hits) but `Hero.astro:47` sinks `heroImage` raw. Trust class `PRESENTATION_COPY` img-only acceptable, but inconsistent. **Receipt:** security audit grep.
- `apps/web/src/lib/content-trust.ts:58` says `faq.items.answer` safe ONLY via `renderFaqAnswer` (`lib/faq-answer.ts:24` escapeHtml choke) but `FAQSection.astro:40` renders `<TinaMarkdown content={item.answer}/>` — not `renderFaqAnswer`. TinaMarkdown escapes but not the audited choke. **Receipt:** security audit + trust matrix.

### P3 — Renderer dual-path / SSG marker consistency
- `apps/web/src/pages/about.astro:74,94,128` passes both `data-tina-field={tinaField(...)}` and `data={tinaAbout}`; components re-derive via `data ? tinaField(data,...) : prop` (`PageBanner.astro:41`). Dual source risks drift. **Receipt:** tina-architect note.
- `apps/web/src/pages/index.astro:113` `WhyChooseUs` static SSG has no `data` prop (island re-render only). **Receipt:** same.

### P4 — MCP / monorepo hygiene (already hardened)
- `opencode.json` `context7` URL corrected `context7.com/mcp → mcp.context7.com/mcp` in a044bc4.
- `chrome-devtools` command `chrome-devtools-mcp@latest` unverified on npm; fallback is `@modelcontextprotocol/server-chrome-devtools`.
- `scaffold-self-test` FAIL on missing `prompts/*` etc. — not Tina-related; governed by `contracts/REPOSITORY-CONTRACT.md` allowlist, not a drift.
- `check-dependency-allowlist.mjs` ENOENT when run from wrong cwd — script expects `scripts/dependency-allowlist.json` relative to repo root; pass with `pnpm --dir` as `deploy:verify` does.

## Fixes Plan (smallest diff, evidence before claim)

### Step 1 — P1 nullability (1 file, 3 lines)
File: `apps/web/src/lib/tina/loaders.ts`
```diff
-  visible: z.boolean(),
+  visible: z.boolean().optional(),
-  contact: z.object({ ... }),
+  contact: z.object({ ... }).optional(),
-  social: z.array(z.object({ ... })),
+  social: z.array(z.object({ ... })).optional(),
```
Verify: `node scripts/check-tina-field-parity.mjs` PASS, `node scripts/check-content-trust.mjs` PASS, `pnpm --filter @ukbt/web exec astro check` 0 errors, `node -e "validateOrThrow"` on current content still passes (values present).

### Step 2 — P2 security alignment (choose one per item, no mixing)
Option A (code to doc): `apps/web/src/lib/content-trust.ts:58` note change `via TinaMarkdown (audited escape) — not renderFaqAnswer`; add `TinaMarkdown` to allowlist in `check-content-trust.mjs` if needed.
Option B (code to choke): `FAQSection.astro:40` switch to `renderFaqAnswer` + `set:html` (needs `faq-answer.ts` import). Prefer A — TinaMarkdown is the supported rich-text renderer and matches web docs.
For `sanitizeImageSrc`: either wire `Hero.astro:47 src={sanitizeImageSrc(heroImage) ?? '/media/team-huddle.webp'}` or delete dead function. Prefer wire (fail-closed image, 1 line).

Verify: `pnpm deploy:verify` subset `check-security` after `pnpm build` → PASS.

### Step 3 — P3 dual-path cleanup (optional, readability)
File: `apps/web/src/pages/about.astro` remove outer `data-tina-field` props, keep `data={tinaAbout}` only. Verify parity still PASS.

### Step 4 — Skill evolution (see Phase 3)

## Out of Scope (ABSTAIN)
- Real TinaCloud Save E2E (human browser `M Chowdhury` required) — chain remains `HUMAN_ACTION_REQUIRED`, no fabrication.
- `dist/`-dependent gates — pass after `pnpm build` in CI, not local without env (`TINA_TOKEN` missing breaks `tinacms build` locally — expected).
- Scaffold prompt docs — governance, not Tina.

## Execution Order
1. Step 1 (loaders) → typecheck + parity → commit.
2. Step 2 (trust/validator) → security → commit.
3. Step 3 if QA wants SSG marker parity.
4. Phase 3 skill evolution.
5. `pnpm deploy:verify` full (when `TINA_TOKEN` available in CI) → PR merge.
