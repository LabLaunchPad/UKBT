# Validation, SEO/AEO/GEO & Accessibility Model

**Stage:** 1 · Covers discovery items 8, 9, 14 (item 10 in `ARCHITECTURE-PROPOSAL.md`).

---

## 8. SEO / AEO / GEO model

### `REQUIREMENT` — binding regardless of framework

| # | Requirement |
|---|---|
| R1 | Every route has a unique, non-templated `<title>` and meta description |
| R2 | Every route has a canonical URL |
| R3 | One `<h1>` per route; heading levels never skip |
| R4 | `sitemap.xml` and `robots.txt` generated from the real route table, never hand-maintained |
| R5 | Open Graph + Twitter card metadata on every route |
| R6 | schema.org JSON-LD emitted **only from typed content that passed the truth gate** |
| R7 | No broken internal links; no orphan routes |
| R8 | Semantic HTML — landmarks, lists, `<time>`, `<address>` — not `<div>` soup |
| R9 | Images carry explicit dimensions (CLS) and meaningful `alt` |
| R10 | URLs are stable and human-readable; any change ships a redirect |

### AEO / GEO — the requirement people skip

Answer engines and generative engines **quote** pages as authority. Therefore:

| # | Requirement |
|---|---|
| R11 | Every factual claim on a page traces to an evidence record — the same gate as `CONTENT-TRUTH-MODEL.md § 0` |
| R12 | Structured data must agree with visible page content; never richer than what a reader can see |
| R13 | Answer-shaped content (FAQ, about, contact) is directly quotable and dated |
| R14 | No claim is made in JSON-LD that is not made in the DOM |

**R6 and R14 exist to close a specific bypass:** hand-authored JSON-LD would let
an unsourced claim reach search and answer engines without ever passing the truth
gate. That is the highest-leverage route by which invented facts escape, because
the output is machine-read and rarely reviewed by a human.

`UNKNOWN`: target keywords, geography, competitor set, existing domain
authority, and whether the domain has history to preserve (U-11, U-15). No
keyword or locality assumption has been made.

### `PROPOSED` mechanics
Astro's sitemap integration; JSON-LD generated from content collections;
per-route metadata typed and required at the type level so a missing title is a
compile error rather than a review finding.

---

## 9. Accessibility model

### `REQUIREMENT` — WCAG 2.2 Level AA

Proposed as the target because it is the defensible baseline for a UK
community-facing organization, and because retrofitting accessibility is far more
expensive than building to it. **It has not been confirmed as a client
requirement** (U-08) — but it is treated as binding until someone with authority
says otherwise, because the failure direction is asymmetric.

| # | Requirement |
|---|---|
| A1 | Every interactive element reachable and operable by keyboard alone |
| A2 | Visible focus indicator on every focusable element — never `outline: none` without a replacement |
| A3 | Text contrast ≥ 4.5:1; large text and UI components ≥ 3:1 |
| A4 | Correct semantics and landmarks; ARIA only where native HTML cannot express it |
| A5 | Meaningful `alt`; decorative images get `alt=""` deliberately |
| A6 | Forms have real labels, programmatic error association, no colour-only error signalling |
| A7 | `prefers-reduced-motion` honoured |
| A8 | Page language declared; language changes marked (relevant if U-13 resolves to bilingual) |
| A9 | Content reflows to 320px with no horizontal scroll; usable at 200% zoom |
| A10 | Skip-to-content link |
| A11 | No keyboard trap in any interactive component |

### Verification discipline — `REQUIREMENT`

Automated tooling catches roughly a third of real accessibility defects. So:

- axe runs on **every** route in CI — necessary, never sufficient;
- keyboard traversal is verified explicitly in Playwright, not assumed;
- **a screenshot is never accessibility evidence.** Rejecting that inference is
  adversarial case ADV-005 and gap G17.

---

## 14. Validation / release gates

### Gate set — `PROPOSED` mechanics, `REQUIREMENT` that they exist and block

| # | Gate | Blocks merge | Blocks deploy |
|---|---|---|---|
| G1 | Install / lockfile integrity (frozen lockfile) | ✅ | ✅ |
| G2 | TypeScript typecheck | ✅ | ✅ |
| G3 | Lint / format | ✅ | ✅ |
| G4 | Unit + integration tests | ✅ | ✅ |
| G5 | Content schema validation | ✅ | ✅ |
| G6 | **Truth / provenance gate** | ✅ | ✅ |
| G7 | **Placeholder detection** (production build) | ✅ | ✅ |
| G8 | Build succeeds | ✅ | ✅ |
| G9 | Route + internal link integrity | ✅ | ✅ |
| G10 | SEO metadata completeness | ✅ | ✅ |
| G11 | Accessibility (axe, all routes) | ✅ | ✅ |
| G12 | E2E (Playwright) | ✅ | ✅ |
| G13 | Secret scan | ✅ | ✅ |
| G14 | Git cleanliness / no uncommitted generated files | ✅ | ✅ |

### Rules — `REQUIREMENT`

1. **A gate is never weakened to obtain PASS.** Not skipped, not
   `continue-on-error`, not narrowed in scope, not marked non-required. (G10 in
   the gap register; ADV-006.)
2. **A check that did not run did not pass.** Every receipt records the exact
   command and its exit code. Claiming a result without an exit code is
   fabrication, which is the single most serious process failure available here.
3. **Flaky ≠ pass.** Reproduce, classify, record. Retrying until green is
   prohibited (ADV-011, G09).
4. **Release status:** `PASS` only if all required gates pass and no blocker
   remains · `BLOCKED` if evidence is insufficient · `FAIL` if a required gate
   fails.
5. Gates are only meaningful once Stage 4 exists. **Until then there is nothing
   to run, and saying so is the honest answer** — not a reason to report PASS.

### Receipts

`schemas/receipt.schema.json` (mirrored at `contracts/schemas/`). Required:
`task_id`, `baseline_sha`, `commands[{command, exit_code}]`, `changed_files`,
`acceptance[{criterion, result}]`, `verdict`. Receipts live in
`artifacts/receipts/`. Secrets are redacted before persistence
(`docs/06-security-protocol.md`).

---

## Bootstrap self-check — `VALIDATION_RESULT`

The only checks that can meaningfully run at Stage 1 were run, for real:

| # | Check | Command | Exit | Result |
|---|---|---|---|---|
| 1 | Scaffold integrity | `node scripts/scaffold-self-test.mjs` | `0` | **PASS** — `{"status":"PASS","required_files":23}` |
| 2 | Invented-fact scan | `grep -rniE '\b(founded in\|established in\|winners of\|champions of\|our players\|squad list\|shirt number\|has won)\b' --include='*.md' --include='*.json' --include='*.yaml' .` | `0` | **PASS** — 3 hits, all self-referential: `prompts/11` reviewer note, this table's own command string, and the explicit counter-examples in `CONTENT-TRUTH-MODEL.md:38`. Zero are assertions about UKBT |
| 3 | Year-literal scan | `grep -rnoE '\b(19\|20)[0-9]{2}\b' --include='*.md' .` (filtered) | `0` | **PASS** — 3 hits: `2025` = the Adelux template's own version date (a template fact, attributed as such); `2015`/`2023` = the counter-examples at `CONTENT-TRUTH-MODEL.md:38`. Zero UKBT dates |
| 4 | Application-code delta | `find . -name '*.ts' -o -name '*.tsx' -o -name '*.astro' -o -name '*.jsx' -o -name 'package.json' -o -name '*.css'` | `0` | **PASS** — count `0`. No application code, no manifest, no dependency |
| 5 | Third-party payload absent | `find . -iname '*adelux*' -o -iname '*.woff2'` | `0` | **PASS** — count `0`. The unlicensed reference template is not in the repository (BL-02) |
| 6 | Secret scan | `grep -rniE '(api[_-]?key\|secret\|password\|token\|BEGIN .* PRIVATE KEY)\s*[:=]\s*[A-Za-z0-9/_+-]{12,}' .` | `0` | **PASS** — no matches |

Checks 2 and 3 are deliberately reported with their hit counts rather than as a
bare "no match". A scan that matches its own documentation is working; a scan
reported as clean when it produced output would be the exact fabrication
`docs/06` and `CLAUDE.md` prohibit.

**Not run, because they do not exist yet:** install (G1), typecheck (G2), lint
(G3), unit and integration tests (G4), content schema validation (G5), the truth
gate (G6), placeholder detection (G7), build (G8), route and link integrity (G9),
SEO completeness (G10), accessibility (G11), E2E (G12), git-cleanliness (G14).

Reporting any of those as `PASS` would be fabrication. There is no build system,
so there is nothing to run — and saying so is the honest answer, not a gap to be
papered over with an optimistic status line.
