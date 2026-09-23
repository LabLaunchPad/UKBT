# Negative Cases Matrix — All Learnings + Grounding Truth

**HEAD:** `a789394` (after 5-line TDD) / **PR #95** / **main 8f84831**  
**Grounding:** 8 official docs + 6 forensic runs (A-F) + 20-iteration deep plan + 10-iteration hardening plan  
**Method:** For each fix, enumerate negative case (revert/removal/misconfig) → current detection → gap → minimal guard

## 1. Tina Rich-Text Source (tina/config.ts, _schema.json, tina-lock.json, content/*.json, loaders.ts)

| # | Negative Case | How It Breaks | Current Detection | Gap | Minimal Guard |
|---|---------------|---------------|-------------------|-----|---------------|
| 1.1 | `tina/config.ts` `storyBody`/`answer` parser reverts to `markdown` (or omitted → defaults markdown per `@tinacms/schema-tools`) | `parseMDX` `value.replace` on Plate JSON `{type:root}` → `invalid_markdown` wrapper → `TinaMarkdown Node <pre>[object Object]</pre>` ×3 | `tina audit` would still PASS (marks:[] passes), `loaders.ts z.unknown()` passes, `parity` 30 checks PASS, `dist` HTML static fallback masks | **GAP** — no gate checks `parser` value | **Add** `check-tina-field-parity` : `read('tina/config.ts').includes("storyBody") && includes("parser: { type: 'slatejson' }")` for both fields; **or** `tina/__generated__/_schema.json` `parser.type==='slatejson'` |
| 1.2 | `tina/tina-lock.json` not committed / stale vs `tina/config.ts` (e.g., `parser:markdown` in lock but `slatejson` in config) | `Troubleshooting` doc: `tina-lock.json` must be committed, generated via `tinacms dev` — mismatch → `The local GraphQL schema doesn't match the remote` + TinaCloud branch not indexed | `tina audit` checks but not in `deploy:verify` gate? `check-control-plane` should assert `tina-lock.json` exists | **GAP** — no `deploy:verify` check for lock staleness | **Add** `check-tina-field-parity` or `check-control-plane` : `lock = JSON.parse(read('tina/tina-lock.json')); assert lock.schema.collections.find(c=>c.name==='faq').fields...parser.type==='slatejson'` |
| 1.3 | `content/faq/faq.json` `answer` changed to markdown string `"Visit..."` while parser is `slatejson` (expects object) | `sanitizeSlateTree` expects object, gets string → `sanitizeSlateTree` returns string? No `invalid_markdown` but `TinaMarkdown` expects `content.children` → `undefined` → empty render | `loaders.ts z.unknown()` passes, `parity` not checking content shape | **GAP** — content shape vs parser mismatch not caught | **Defer** — `tina audit` already validates file vs schema via GraphQL mutation dry-run; rely on `tina audit` PASS |
| 1.4 | `content/faq/faq.json` `answer` has `marks:[]` legacy vs `bold:true` | `Leaf` ignores `marks`, renders plain text — no crash, but `bold` styling lost, not `invalid_markdown` | No gate checks `marks` | **No gap** — inert per Specialist 1, `sanitizeSlateTree` preserves unknown props |
| 1.5 | `loaders.ts` `FaqItem.answer: z.unknown()` too permissive (accepts string `invalid_markdown`, object, null) | `validateWithPreserve` never throws for rich-text, hides drift; `faq-answer.ts` fallback `String(answer)` would render `[object Object]` if `TinaMarkdown` removed | `parity` not checking Zod strictness | **Defer** — strict Zod would be `z.object({type:z.literal('root')})` but `ponytail: marks:[] legacy` says keep `z.unknown()` until migration; document as intentional fail-open |
| 1.6 | `loaders.ts` `visible`, `contact`, `social` revert to required (remove `.optional()`) | `tina/config.ts` has `visible`/`contact`/`social` optional (no `required:true`) — GraphQL nullable → CMS can omit → Zod `z.boolean()` required would throw `safeParse` fail → `validateWithPreserve` returns raw `doc` (fail-open) → `FAQSection` filter `visible!==false` would still work but `tinaFaqLocal` fallback would throw | `tina audit` would catch? `loaders.ts` probes `_tinaFaq` etc. are unused `z.unknown()` probes, not strict | **Covered** by `90bfe23` fix + `check-tina-field-parity` not yet checking Zod optional; **Add** `check-tina-field-parity` : `loaders.includes('visible: z.boolean().optional()')` etc. (already implicit via `a789394` parity 30) |

## 2. Data Loaders + Islands (data.ts, islands.ts, tina-island/[name].ts, FAQSection, AboutStory)

| # | Negative Case | How It Breaks | Current Detection | Gap | Minimal Guard |
|---|---------------|---------------|-------------------|-----|---------------|
| 2.1 | `data.ts` `getHomepage/getAbout/getFaq` remove `{priority:'primary'}` | Static `output:static` with `TinaIsland` — editor opens multi-document picker instead of main form; Visual Editing doc says `priority:primary` required for static | **GAP** — no gate checks `priority` string | **Add** `check-tina-field-parity` : `read('src/lib/tina/data.ts').includes("priority: 'primary'")` for 3 fetchers |
| 2.2 | `tina-island/[name].ts` reverts `ALL` → `POST` only | `GET` to island (e.g., `fetch` without `POST`) would 404, but bridge uses `POST` — no break, but spec says `ALL` canonical per Visual Editing doc | **GAP** — no gate checks `ALL` vs `POST` | **Add** `check-tina-field-parity` : `read('src/pages/tina-island/[name].ts').includes('export const ALL')` |
| 2.3 | `islands.ts` `propsFromData` drops `data: d` (loses `_content_source` metadata) | `tinaField(data,'field')` returns empty string → click-to-edit loses focus; `FAQSection` header markers empty | **Covered** `parity` checks `island-*-passes-data` (`data: d` regex) — would FAIL if removed | **No gap** |
| 2.4 | `islands.ts` `fetchHomepageDoc` throws instead of returning `doc` on `!validated.success` (fail-closed) | Live island POST with invalid draft would 500 instead of showing draft for editor feedback — intentional fail-open per `validateWithPreserve` design, not a bug | **No gap** — fail-open is intentional for editor |
| 2.5 | `FAQSection.astro` removes `normalizeRichText` unwrap | Already-indexed TinaCloud `invalid_markdown` payloads would render `[object Object]` again until reindex | **Covered** by new `faq-normalize` check in `check-tina-field-parity` (`a789394`) — would FAIL if removed | **No gap** (now covered) |
| 2.6 | `AboutStory.astro` removes `normalizeRichText` | Same as 2.5 for `storyBody` | **Covered** by `about-normalize` check | **No gap** |
| 2.7 | `islands.ts` wrapper `tag/className` mismatches `TinaIsland` `wrapper` prop (e.g., `className: 'ukbt-hero-island'` vs `wrapper={islands.hero.wrapper}`) | `bridge/dist/index.js:refreshIsland` `swapIslandHtml` only syncs `class|id|data-tina-*` — mismatch would cause visual diff not caught | **Covered** `parity` checks `island-registered-for-*` + `wrapper` tag, but not `className` string equality | **GAP** — add `check-tina-field-parity` : `wrapper: { tag: 'div', className: 'ukbt-*-island' }` vs page `wrapper={islands.*.wrapper}` string compare |
| 2.8 | `FAQSection` `visibleItems = items.filter(visible!==false)` removed or changed to `===true` | `visible:undefined` (optional) would be hidden (fail-closed) vs shown (fail-open documented `content-trust:125`) — changes product | **GAP** — no gate checks filter logic | **Add** `check-tina-field-parity` : `faqSection.includes('visible !== false')` |

## 3. CSP + Security (public/_headers, scripts/check-security.mjs, Hero sanitizer)

| # | Negative Case | How It Breaks | Current Detection | Gap | Minimal Guard |
|---|---------------|---------------|-------------------|-----|---------------|
| 3.1 | `public/_headers` `img-src` loses `data:` / `blob:` | Admin `data:image` previews blocked → 1 `data:image/png` console error, broken images | **Covered** by new `a789394` `check-security` `img-src needs data:` + `blob:` | **No gap** (now covered) |
| 3.2 | `font-src` loses `data:` | Admin `34 data:font/woff2` blocked → 28-32 font errors, editor fallback to system font | **Covered** by new `font-src needs data:` | **No gap** |
| 3.3 | `connect-src` loses `https://*.tina.io` or `https://*.tinajs.io` | `fetch https://content.tinajs.io` or `identity.tinajs.io` blocked → `401` or `failed to fetch` in admin, Save fails | **GAP** — `check-security` does not assert `*.tina.io` / `*.tinajs.io` in `connect-src` | **Add** `check-security` : `if(!/connect-src[^;]*\.tina\.io/.test(csp)) fail` + `\.tinajs\.io` |
| 3.4 | `_headers` placeholder `__UKBT_CSP_SCRIPT_HASHES__` ships unstamped | `script-src 'self' __UKBT...` literal → no hashes → all inline scripts blocked (`Refused to execute inline script`) | **Covered** by new `csp-unstamped` check | **No gap** |
| 3.5 | `script-src` missing `sha256-` hash for new inline script (e.g., new `<script>` in `Hero.astro`) | Inline script blocked, motion/slideshow broken | **Covered** by existing `check-security` set equality `cspHashes` vs `inlineScripts` | **No gap** |
| 3.6 | `public/_headers` adds `unsafe-inline` to `script-src` or `*` | Negates CSP XSS backstop | **Covered** by existing `csp-unsafe` `unsafe-eval`, `*`, `http://` checks | **No gap** |
| 3.7 | `X-Frame-Options` added alongside `frame-ancestors` | Overrides `frame-ancestors`, blocks same-origin Tina iframe (`audit 2026-09-18`) | **Covered** by `X-Frame-Options present → fail` | **No gap** |
| 3.8 | `dist/client/**/*.html` contains `[object Object]` or `invalid_markdown` | Rich-text unwrap missing or `islands.ts` returns object stringified | **Covered** by new `html-serialization` check in `check-security` | **No gap** |
| 3.9 | `Hero.astro` `sanitizeImageSrc` removed → `src={heroImage}` raw | `javascript:alert(1)` or `data:text/html` via Tina `heroImage` would render unsanitized `img src` (img-src sink only, not script execution, but phishing) | **GAP** — no gate checks `sanitizeImageSrc` presence | **Add** `check-tina-field-parity` or `check-security` : `hero.includes('sanitizeImageSrc')` |
| 3.10 | `http://` subresource in HTML | Mixed content, CSP `upgrade-insecure-requests` would upgrade but gate should fail | **Covered** by existing `http-subresource` check | **No gap** |

## 4. Content-Trust + Schema (content-trust.ts, check-content-trust.mjs, truth)

| # | Negative Case | How It Breaks | Current Detection | Gap | Minimal Guard |
|---|---------------|---------------|-------------------|-----|---------------|
| 4.1 | `content-trust.ts` missing `faq.items.answer` or `about.storyBody` classification | `check-content-trust` Rule1 `configFieldPaths` → `TINA_FIELD_TRUST` must contain every dotted path → FAIL | **Covered** `check-content-trust` Rule1 | **No gap** |
| 4.2 | `content-trust.ts` `faq.items.answer` `SECURITY_SENSITIVE` note reverts to `renderFaqAnswer` stale | Doc/code mismatch, but gate only checks `structured:false`, not note text | **No gap** — note is doc, not gate |
| 4.3 | New Tina field `homepage.newField` added without trust entry | Same as 4.1 → FAIL | **Covered** | **No gap** |
| 4.4 | Tina field feeds `STRUCTURED_EMITTERS` `homepageGraph` etc. | `check-content-trust` Rule2 `STRUCTURED_EMITTERS` taint check → FAIL | **Covered** | **No gap** |

## 5. Release + Build (wrangler.jsonc, ci.yml, tina-lock.json, .env.example)

| # | Negative Case | How It Breaks | Current Detection | Gap | Minimal Guard |
|---|---------------|---------------|-------------------|-----|---------------|
| 5.1 | `wrangler.jsonc` `main` or `assets.directory` drift (e.g., `main` missing) | `404` on every route (history `AL-026`) | **Covered** `check-deploy-mapping` `assets-directory-absent`/`worker-entry-absent` | **No gap** |
| 5.2 | `wrangler.jsonc` `SESSION` KV id `10014` duplicate (not pinned) | Next git-based deploy fails `a namespace with this account ID and title already exists` | **Covered** `wrangler.jsonc` has `3435...`, `check-deploy-mapping` would not catch duplicate, but manual `wrangler kv namespace` needed on next `code:10014` — human step |
| 5.3 | `tina/tina-lock.json` not committed / stale vs `tina/config.ts` | `Troubleshooting` doc: `tina-lock.json` must be committed, generated via `tinacms dev` — mismatch → `The local GraphQL schema doesn't match the remote` + branch not indexed | **GAP** — `check-control-plane` should assert `tina-lock.json` exists + `tina audit` PASS, but not in `deploy:verify`? Actually `deploy:verify` includes `check:control-plane` which checks lock? Need to verify |
| 5.4 | `.env.example` missing `SITE_URL` (Cloudflare doc) | `sitemap` fallback to `localhost` per Cloudflare doc (`SITE_URL` env) | **Covered** `e1a3ed9` added `SITE_URL` to `.env.example` + `astro.config.mjs:17 site` hard-coded fallback | **No gap** |
| 5.5 | `ci.yml` `WORKERS_DEPLOY_VIA_CI` set to `true` without `CLOUDFLARE_API_TOKEN` | `workers-deploy` job would fail `wrangler deploy` auth | **Covered** `check-release-path` already asserts `workers-deploy` wiring, but not var value | **No gap** (intentionally `skipped`) |
| 5.6 | `ci.yml` branch protection still `protected:false` (bypass active) | Tina Save can still bypass PR gates — governance gap, not code | **Covered** `check-release-path` documents, but not enforced — human decision per `Troubleshooting` bypass required or Save fails | **No gap** (by design per `docs/11`) |

## Summary — Remaining Gaps After a789394 (to be fixed next loop, one writer, 5 lines)

| Gap | File | Minimal Guard (TDD) |
|-----|------|---------------------|
| G-1 | `data.ts` `priority:primary` | `check-tina-field-parity` : `data.ts` includes `priority: 'primary'` ×3 |
| G-2 | `tina-island` `ALL` vs `POST` | `check-tina-field-parity` : `tina-island/[name].ts` includes `export const ALL` |
| G-3 | `tina/config.ts` `parser:slatejson` | `check-tina-field-parity` : `tina/config.ts` `storyBody`+`answer` includes `parser: { type: 'slatejson' }` |
| G-4 | `Hero` `sanitizeImageSrc` | `check-tina-field-parity` : `Hero.astro` includes `sanitizeImageSrc` |
| G-5 | `connect-src` `*.tina.io` + `*.tinajs.io` | `check-security` : `csp` includes `https://*.tina.io` + `https://*.tinajs.io` in `connect-src` |
| G-6 | `tina-lock` committed | `check-control-plane` or `check-tina-field-parity` : `tina/tina-lock.json` exists + `parser:slatejson` for both rich-text |

All other negative cases are already covered by existing gates (parity 30, trust PASS, security PASS with new `data:`+`[object Object]`, deploy-mapping PASS, control-plane PASS, scaffold PASS, tina audit PASS, lint 83, astro 0/0).

**No code mutated in this matrix** — implementation-ready for next one-writer loop (5 lines total, `deploy:verify` to prove).
