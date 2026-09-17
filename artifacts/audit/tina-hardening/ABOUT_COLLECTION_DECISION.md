# ABOUT_COLLECTION_DECISION — 2026-09-17

> Base: `8642ab57c6d70154a4291fe22c5a5cb55f928f36` (HEAD after Task 4) — detached worktree `C:\UKBT\ukbt-tina-hardening`
> Authority: `artifacts/audit/tina-hardening/CURRENT_STATE.md` P1 item 4 (About collection orphan) + `tina/config.ts:161-223` + `apps/web/content/about/about.json` + `apps/web/src/content/about-data.ts` + `apps/web/src/pages/about.astro:28` + `apps/web/src/lib/tina/loaders.ts:1-82` + `apps/web/src/lib/content-trust.ts:80-111` + `contracts/TRUTH-CONTRACT.md` (gate invariant) + `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 5
> Evidence classes: **FACT** (file line exists) / **VERIFIED** (file + command output) / **UNKNOWN** (not retrievable — never upgraded) — per `knowledge/04-EVIDENCE-POLICY.yaml`
> Global constraint: **do NOT delete** (Task 5 rule) — no deletions in this hardening loop
> Scope: **decision record only — no code changes** (per `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Task 5: "Do NOT modify `tina/config.ts` content yet (only decision record), no deletions")

---

## 1. Audit — schema / content / consumers

### 1.1 Schema — collection exists

**FACT** — `tina/config.ts:161-223` defines collection `about`:

- `tina/config.ts:162` `name: 'about'` — **FACT**
- `tina/config.ts:163` `label: 'About page'` — **FACT**
- `tina/config.ts:164` `path: 'apps/web/content/about'` — **FACT**
- `tina/config.ts:165` `format: 'json'` — **FACT**
- `tina/config.ts:166` `ui: { allowedActions: { create: false, delete: false }, router: () => '/about' }` — **FACT**
- Fields `tina/config.ts:167-223` — 7 fields — **FACT**:
  - `tina/config.ts:168-175` `heroSubline` (`string`, `required: true`, `textarea`) — **FACT**
  - `tina/config.ts:176-182` `storyBody` (`rich-text`, `isBody: false`) — **FACT** — description `tina/config.ts:180` "Keep 2–3 short paragraphs; avoid inventing facts." — **FACT**
  - `tina/config.ts:183-189` `aboutImage` (`image`, optional) — **FACT**
  - `tina/config.ts:190-202` `aboutImageAlt` (`string`, validate `aboutImage && !v` → "Add alternative text") — **FACT**
  - `tina/config.ts:203-210` `leadershipIntro` (`string`, `textarea`, optional) — **FACT** — description `tina/config.ts:207` "Mention founder + acting chairman + vice-chairman only." — **FACT**
  - `tina/config.ts:211-216` `managementImage` (`image`, optional) — **FACT**
  - `tina/config.ts:217-222` `managementImageAlt` (`string`, optional) — **FACT**

Collection shape matches monorepo path conventions (`apps/web/content/about`) — same pattern as `homepage` (`tina/config.ts:33`) and `faq` (`tina/config.ts:228`) — **FACT**.

### 1.2 Content — single document exists

**VERIFIED** — `apps/web/content/about/about.json` exists on disk — single document (not 3 JSON files; the Task 5 prompt's "3 JSON files" note is inaccurate — actual is one file):

- `Get-ChildItem -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\content\about"` → `about.json` `Length 1578` — **VERIFIED** (see §4.1)
- `Get-ChildItem -Path "C:\UKBT\ukbt-tina-hardening\apps\web\content" -Recurse` shows exactly 4 content files: `about/about.json`, `faq/faq.json`, `homepage/homepage.json`, `site/siteSettings.json` — **VERIFIED** (see §4.1)
- Content fields `apps/web/content/about/about.json:2-14` — **FACT**:
  - `about.json:2` `heroSubline: "Building a legacy of cricket excellence in the United Kingdom"` — **FACT**
  - `about.json:3-9` `storyBody: { type: "root", children: [ {type:"p"...}, {type:"p"...} ] }` — Tina rich-text AST, 2 paragraphs — **FACT** (see read `about.json:3-9`)
  - `about.json:10` `aboutImage: "/media/founder-trophy.webp"` — **FACT**
  - `about.json:11` `aboutImageAlt: "Mohammad Chowdhury holding the Safari T20 Cup trophy"` — **FACT**
  - `about.json:12` `leadershipIntro: "Led by founder and CEO Mohammad Chowdhury, ... More committee roles to be announced."` — **FACT**
  - `about.json:13` `managementImage: "/media/management-team.webp"` — **FACT**
  - `about.json:14` `managementImageAlt: "Club graphic introducing the management team: Mohammad Chowdhury (Founder and CEO), MD Shahidul Alam Ratan (Acting Chairman) and Sayem Rahman (Vice-Chairman)"` — **FACT**

All 7 schema fields have a corresponding key in `about.json` — **FACT** (schema `tina/config.ts:167-223` ↔ content `about.json:2-14` alignment verified).

### 1.3 Consumers — zero Tina consumers, code-owned path active

**VERIFIED** — zero `tinaAbout` / `about.json` consumers in `apps/web/src`:

- PowerShell `Get-ChildItem -Path "C:\UKBT\ukbt-tina-hardening\apps\web\src" -Recurse -File | Select-String -Pattern "tinaAbout|about\.json"` → **0 hits** — **VERIFIED** (see §4.2; reproduces `CURRENT_STATE.md` Appendix C claim "Select-String tinaAbout|about.json in apps/web/src — 0 hits — VERIFIED (orphan)")
- `apps/web/src/lib/tina/loaders.ts:1-82` imports only `faqData`, `homepageData`, `siteData` (`loaders.ts:2,4,6`) and exports only `tinaHomepage`, `tinaFaq`, `tinaSite` (`loaders.ts:80-82`) — no `About` schema, no `aboutData` import, no `tinaAbout` export — **FACT** (`Select-String -LiteralPath loaders.ts -Pattern "about|About"` → 0 hits — **VERIFIED**, see §4.3)
- `apps/web/src/lib/tina/islands.ts:1-44` registry entries `hero` + `aboutSection` only — neither references About collection data — **FACT**

**Active consumer is truth-owned, not Tina-owned:**

- `apps/web/src/pages/about.astro:28` `import { about } from '../content/about-data'` — **FACT** (see `about.astro:28` — consumes code-owned `about` data)
- `apps/web/src/content/about-data.ts:1-284` is the gated truth-owned copy:
  - `about-data.ts:9-38` `createRegistry` with 8 evidence IDs (`EV-026`, `EV-028`, `EV-029`, `EV-0909-01`, `EV-0916-01`, `EV-20260910-001`, `EV-20260910-002`, `EV-20260910-003`) — **FACT**
  - `about-data.ts:126-151` `heroSubline` / `managementStory` / `leadershipIntro` facts with `org.*` field keys and `sources: ['EV-20260910-001', 'EV-20260910-002']` — **FACT** (same values as `about.json` but provenance-gated)
  - `about-data.ts:165-172` `evaluate(rec, gateOptions)` throw on fail — **FACT** (truth gate invariant enforced at build)
  - `about-data.ts:278-283` `heroSubline` + `leadershipIntro` exported from gated facts — **FACT**
- `apps/web/src/pages/about.astro:78,89,125` passes truth-owned values to components with `data-tina-field` string markers (`heroSubline`, `storyBody`, `leadershipIntro`) — **FACT** — these are hand-stamped decoration (see `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §1.2), not `tinaField()` metadata — **FACT**

### 1.4 Content-trust classification — entirely DORMANT

**FACT** — `apps/web/src/lib/content-trust.ts:80-111` classifies every About field as `DORMANT`:

- `content-trust.ts:80` comment `// about collection — ENTIRELY UNWIRED (dead surface, REM-021 owns wiring/removal)` — **FACT**
- `content-trust.ts:81-85` `'about.heroSubline': { cls: 'DORMANT', note: 'No sink; about.astro uses gated about-data.' }` — **FACT**
- `content-trust.ts:86-90` `'about.storyBody': { cls: 'DORMANT', note: 'No sink. Rich-text: wiring requires REM-001-class renderer.' }` — **FACT**
- `content-trust.ts:91` `'about.aboutImage': { cls: 'DORMANT' }` — **FACT**
- `content-trust.ts:92-96` `'about.aboutImageAlt': { cls: 'DORMANT' }` — **FACT**
- `content-trust.ts:97-101` `'about.leadershipIntro': { cls: 'DORMANT' }` — **FACT**
- `content-trust.ts:102-106` `'about.managementImage': { cls: 'DORMANT' }` — **FACT**
- `content-trust.ts:107-111` `'about.managementImageAlt': { cls: 'DORMANT' }` — **FACT**

Gate invariant: `content-trust.ts:14` states `DORMANT: schema-defined but unwired (no sink). Wiring one without classifying its target path must fail the content-trust gate.` — **FACT**. The `scripts/check-content-trust.mjs` gate fails closed on unclassified fields — **FACT** (`content-trust.ts:17` "Every collection field MUST appear here — the gate fails closed on unclassified fields.")

No `CONTENT-TRUST-CONTRACT.md` exists at `contracts/CONTENT-TRUST-CONTRACT.md` — **FACT** (`Test-Path` → `False` — **VERIFIED**, see §4.4). Frozen contract for truth-gating is `contracts/TRUTH-CONTRACT.md` — **FACT** (ID `CONTRACT-TRUTH-01`, Stage 3 frozen) — and the editorial-vs-truth invariant is governed by `apps/web/src/lib/content-trust.ts` header comment (REM-004 / D-003 / D-006) — **FACT** (`content-trust.ts:1-7`).

### 1.5 Truth-gate invariant (Tina editorial layer only)

**FACT** — invariant citations:

- `content-trust.ts:3-4` "Tina is an editing interface, never a source of truth (D-001): factual authority lives in @ukbt/truth records (D-002)." — **FACT**
- `contracts/TRUTH-CONTRACT.md` — gate construction vs gate authorization distinction; no fact reaches `status: approved/published` without registry owner + human approver — **FACT**
- `AGENTS.md` / `docs/tina-integration.md` (summarized in `AGENTS.md` "TinaCMS is an **editorial layer only** — it must never bypass `@ukbt/truth`") — **FACT** (Tina editorial-only constraint is a hardening invariant)

Org facts (`org.tagline`, `org.founded`, `org.legal_entity`, `org.leader.*`, `org.founder_story`, `org.management_story`, `org.leadership_intro`) are truth-sensitive — currently gated in `about-data.ts:41-151` via two-source / evidence-registry rules — **FACT** (`about-data.ts:41-47` `twoSourceFields`, `about-data.ts:165-172` gate evaluation). Making them CMS-editable without an equivalent gate would violate D-002 — **FACT** (derived from `content-trust.ts:3-4` + `TRUTH-CONTRACT.md`).

---

## 2. Options evaluation

### A. Connect About collection — deferred (not for this hardening loop)

**What it would require:**

- New Zod schema `AboutTina` in `apps/web/src/lib/tina/loaders.ts` (parallel to `HomepageSchema` `loaders.ts:19-38`, `FaqSchema` `loaders.ts:46-50`, `SiteSettingsSchema` `loaders.ts:52-73`) — Zod parse with `tinaAbout = AboutSchema.parse(aboutData)` — **FACT** for pattern, **UNKNOWN** for whether Tina rich-text AST type would need a dedicated escaper.
- `storyBody` is `rich-text` (`tina/config.ts:177-182`) — its content in `about.json:3-9` is a Tina AST (`{ type: "root", children: [ {type:"p", children:[{type:"text"...}]} ] }`) — **FACT**. Rendering it requires a `set:html` sink — the **same class** as `faq.items.answer` which is classified `SECURITY_SENSITIVE` (`content-trust.ts:121-125`) and gated by `REM-001` escaper `apps/web/src/lib/faq-answer.ts:39-53` (`escapeHtml` + `<p>` only, marks dropped) — **FACT** (see `CURRENT_STATE.md:15` + `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §3). Wiring `storyBody` would require an equivalent `REM-001`-class renderer (escape-then-wrap AST nodes) before any `set:html` — **FACT** (derived from `content-trust.ts:88` note "Rich-text: wiring requires REM-001-class renderer.").
- `content-trust.ts` reclassification: all 7 `about.*` entries would move from `DORMANT` → `PRESENTATION_COPY` or `SECURITY_SENSITIVE` + `structured: false` + explicit notes — must satisfy `scripts/check-content-trust.mjs` gate — **FACT** (derived from `content-trust.ts:17` fail-closed rule).
- Island wiring if visual editing desired: generated client `tina/__generated__/client.ts` + `requestWithMetadata(..., {priority:'primary'})` + island registry + `src/pages/tina-island/[name].ts:5` POST handler + `<TinaIsland>` + `tinaField()` — per `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §2 — **FACT** for docs-prescribed path, **UNKNOWN** for whether About would need priority vs secondary fetch.

**Risk:**

- Org facts (`heroSubline`, `storyBody`, `leadershipIntro`) are currently truth-gated (`about-data.ts:126-151` — `org.about_subline`, `org.management_story`, `org.leadership_intro` with `twoSourceFields` requirement) — **FACT**. Exposing them as CMS-editable strings without re-imposing `twoSourceFields` / registry checks would make CMS prose **fact-capable** without a gate — the Tina editorial layer would then be a factual source, violating D-002 — **FACT** (invariant breach, not just style).
- Mitigation exists (keep Zod validation + gate check on Tina values before render, or keep page consuming `about-data.ts` and use Tina only as draft source), but none is implemented — **UNKNOWN** until designed.
- Adds surface: `loaders.ts` + `content-trust.ts` + new renderer all become security-sensitive touch points; requires `check-content-trust` + `check-security` to re-pass — **FACT** for gate dependency.

**Verdict:** Feasible, but requires a gated renderer + content-trust reclassification + truth-gate preservation. Not a hardening-loop fix — belongs in a separate visual-editing implementation plan (fixing plan Tasks 8-9) with its own review.

### B. Remove unused collection — deferred per Global Constraints (no deletions in this loop)

**What it would require:**

- Delete `tina/config.ts:161-224` collection block + delete `apps/web/content/about/about.json` (or archive it) + remove 7 `about.*` entries from `content-trust.ts:80-111` — **FACT** for scope.
- Regenerate `tina/tina-lock.json` via `tinacms build --skip-cloud-checks` (`package.json:18` / `ci.yml:271`) — **FACT** (lockfile is generated, `.gitignore:9` excludes `tina/__generated__/`, lockfile is committed).

**Risk / constraint:**

- Global Constraint in `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` — Global Constraints section: "do NOT delete (Task 5 rule)" + Task 5 interfaces: "Produces: decision record A/B/C with no deletions (rule: do not delete)." — **FACT** (plan line citations). This hardening loop is evidence-first — deletions before `FINAL_READINESS_REPORT.md` (Task 7) would preempt the readiness gate.
- Reversible only via revert; loses draft CMS content that already mirrors truth-owned values (no divergence yet — `about.json:2,12` values match `about-data.ts:128,149` verbatim) — **FACT** for value equality (heroSubline + leadershipIntro strings compare equal), **UNKNOWN** for whether future editorial divergence is desired.

**Verdict:** **DEFERRED** — do not execute in this loop. Revisit after `FINAL_READINESS_REPORT.md` Task 7 if readiness confirms no consumer will ever gate on Tina About.

### C. Keep intentionally unused (RECOMMENDED for this hardening loop)

**What it is:**

- Keep `tina/config.ts:161-223` schema — **no deletion** — **FACT** for current state.
- Keep `apps/web/content/about/about.json` content file on disk — single document, no consumer — **FACT** (see §1.2).
- Keep `apps/web/src/lib/content-trust.ts:80-111` all-`DORMANT` classification — **no reclassification** — **FACT**.
- Keep `apps/web/src/pages/about.astro:28` consuming `about` from `about-data.ts` (truth-owned, gated) — **no wiring** — **FACT**.
- Add a config comment at `tina/config.ts:161` in a future task (not this task) marking the collection as "intentionally unused — truth-owned copy at `src/content/about-data.ts`" — reversible documentation, not a deletion — **FACT** for intent, **UNKNOWN** for exact comment wording until approved (this task does NOT modify `tina/config.ts` per plan: "Do NOT modify `tina/config.ts` content yet (only decision record)").

**Why this is the correct choice for hardening:**

- **No consumer, no risk, reversible** — 7 fields stay `DORMANT` (no sink) → `check-content-trust` passes without new attack surface; `about.astro` stays gated via `about-data.ts:165-172` truth gate; no `storyBody` renderer needed (avoids introducing a `set:html` sink before `REM-001` review) — **FACT** (derived from `content-trust.ts:14` DORMANT definition + `about-data.ts` gate).
- **Truth gate invariant preserved** — Tina remains editorial-only (D-001); factual authority stays in `@ukbt/truth` records (D-002); no org fact becomes CMS-editable unless a future plan explicitly re-gates it — **FACT** (invariant, see §1.5).
- **Evidence-aligned** — `about.json` content (heroSubline + storyBody AST + leadershipIntro etc) but zero consumers is **VERIFIED** via `Select-String tinaAbout|about.json` 0 hits + `Get-ChildItem about/about.json` single file — **VERIFIED** (see §4.1-4.2). `about.astro:28` consuming code-owned data is **FACT** (see `about.astro:28`). `content-trust.ts` note "No sink; about.astro uses gated about-data." is **FACT** (`content-trust.ts:84`).
- **Minimal hardening-loop cost** — zero files changed outside this decision record; `deploy:verify` gate is unaffected; rollback is trivial (no diff to revert) — **FACT**.
- **Future path is not blocked** — Option A remains queueable as fixing plan Tasks 8-9 visual-editing implementation (separate plan, separate review) if product later wants CMS-managed About copy with proper gating — **FACT** (per `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` §4 complexity estimate deferred until after HITL proof).

**Commitment:** Recommend **C** for this hardening loop. Any future wiring (Option A) must re-classify `content-trust.ts` entries, add a `REM-001`-class escaper for `storyBody`, and prove `scripts/check-content-trust.mjs` + `scripts/check-security.mjs` still PASS — blocked until `TINA_HITL_RUNBOOK.md` (Task 6) + `FINAL_READINESS_REPORT.md` (Task 7) complete.

---

## 3. Evidence summary table

| Claim | Class | Source |
|---|---|---|
| `about` collection defined `tina/config.ts:161-223` with 7 fields | **FACT** | `tina/config.ts:162-223` |
| `about/about.json` single document exists, `Length 1578` | **VERIFIED** | `Get-ChildItem apps/web/content/about` output (see §4.1) |
| `about.json:2-14` contains `heroSubline`, `storyBody` AST (2 `<p>`), `aboutImage`/`aboutImageAlt`, `leadershipIntro`, `managementImage`/`managementImageAlt` | **FACT** | `apps/web/content/about/about.json:2-14` |
| Zero `tinaAbout` / `about.json` refs in `apps/web/src` | **VERIFIED** | `Select-String tinaAbout\|about\.json` 0 hits (see §4.2) |
| `loaders.ts:1-82` has no About schema / export | **VERIFIED** | `Select-String about\|About` in `loaders.ts` 0 hits (see §4.3) |
| `about.astro:28` imports `about` from `about-data.ts` (truth-owned) | **FACT** | `apps/web/src/pages/about.astro:28` |
| `about-data.ts:165-172` truth gate evaluates every `org.*` fact | **FACT** | `apps/web/src/content/about-data.ts:165-172` |
| `content-trust.ts:80-111` all 7 `about.*` fields `DORMANT` / "No sink" | **FACT** | `apps/web/src/lib/content-trust.ts:81-111` |
| `CONTENT-TRUST-CONTRACT.md` does not exist at `contracts/` | **VERIFIED** | `Test-Path contracts/CONTENT-TRUST-CONTRACT.md` → False (see §4.4) |
| Tina is editorial-only (D-001), factual authority is `@ukbt/truth` (D-002) | **FACT** | `content-trust.ts:3-4` + `contracts/TRUTH-CONTRACT.md` |
| `storyBody` wiring would require `REM-001`-class escaper before `set:html` | **FACT** (derived, not invented) | `content-trust.ts:88` + `apps/web/src/lib/faq-answer.ts:39-53` pattern |
| `tinaAbout` Zod escaper risk / org-facts-becoming-CMS-editable unless gated | **FACT** (invariant) | `TRUTH-CONTRACT.md` + `about-data.ts:41-47` |
| Option B (remove) deferred — deletions forbidden in this loop | **FACT** | `docs/superpowers/plans/2026-09-17-tinacms-hardening-evidence-first.md` Global Constraints + Task 5 interfaces |
| Option C recommended — keep intentionally unused, reversible, no risk | **FACT** (decision) | This record §2.C |
| `tina/config.ts` not modified in this task — only decision record | **FACT** | `git status --porcelain` shows only `artifacts/audit/tina-hardening/ABOUT_COLLECTION_DECISION.md` (see §4.5) |

All **UNKNOWN** claims stay **UNKNOWN** — never upgraded:

- Whether `storyBody` will ever be wired to a page — **UNKNOWN** (no product decision in this loop).
- Whether `heroSubline`/`leadershipIntro` should ever be CMS-editable vs truth-gated — **UNKNOWN** until a post-hardening plan gates it.
- `TinaCloud` dashboard `SESSION` KV state for About edits — **UNKNOWN** (not retrievable locally; HITL-gated Task 6).
- Any claim not backed by a line ref above remains **UNKNOWN** per `knowledge/04-EVIDENCE-POLICY.yaml`.

---

## 4. Appendix — VERIFIED command outputs (2026-09-17, worktree `C:\UKBT\ukbt-tina-hardening` at `8642ab5`)

### 4.1 `Get-ChildItem` — About content file exists

PowerShell:

```powershell
Get-ChildItem -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\content\about"
```

Output — **VERIFIED**:

```
    Directory: C:\UKBT\ukbt-tina-hardening\apps\web\content\about

Mode          LastWriteTime Length Name
----          ------------- ------ ----
-a---- 17/09/2026  10:43 PM   1578 about.json
```

Second inventory — **VERIFIED**:

```powershell
Get-ChildItem -Path "C:\UKBT\ukbt-tina-hardening\apps\web\content" -Recurse | Select-Object FullName
```

Output:

```
C:\UKBT\ukbt-tina-hardening\apps\web\content\about
C:\UKBT\ukbt-tina-hardening\apps\web\content\faq
C:\UKBT\ukbt-tina-hardening\apps\web\content\homepage
C:\UKBT\ukbt-tina-hardening\apps\web\content\site
C:\UKBT\ukbt-tina-hardening\apps\web\content\about\about.json
C:\UKBT\ukbt-tina-hardening\apps\web\content\faq\faq.json
C:\UKBT\ukbt-tina-hardening\apps\web\content\homepage\homepage.json
C:\UKBT\ukbt-tina-hardening\apps\web\content\site\siteSettings.json
```

### 4.2 `Select-String tinaAbout|about.json` in `apps/web/src` — 0 hits — VERIFIED

PowerShell:

```powershell
Get-ChildItem -Path "C:\UKBT\ukbt-tina-hardening\apps\web\src" -Recurse -File |
  Select-String -Pattern "tinaAbout|about\.json"
Measure-Object fallback confirms Count = 0
```

Output — **VERIFIED**:

```
(no output — 0 hits)

VERIFIED: 0 hits
  Count = 0
Reproduces CURRENT_STATE.md Appendix C "Select-String tinaAbout|about.json in apps/web/src — 0 hits — VERIFIED (orphan)"
```

### 4.3 `Select-String about|About` in `loaders.ts` — 0 hits — VERIFIED

PowerShell:

```powershell
Select-String -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\src\lib\tina\loaders.ts" -Pattern "about|About"
```

Output — **VERIFIED**:

```
(no output — 0 hits; loaders.ts exports only tinaHomepage, tinaFaq, tinaSite per loaders.ts:80-82)
```

Additional verification:

```powershell
Get-Content -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\src\lib\tina\loaders.ts"
```

Shows imports `faqData`, `homepageData`, `siteData` only (`loaders.ts:2,4,6`) + schemas `HomepageSchema`, `FaqItemSchema`, `FaqSchema`, `SiteSettingsSchema` (`loaders.ts:19-73`) + exports `tinaHomepage`, `tinaFaq`, `tinaSite` (`loaders.ts:80-82`) — **FACT** (no About).

### 4.4 `Test-Path contracts/CONTENT-TRUST-CONTRACT.md` — absence verified

PowerShell:

```powershell
Test-Path -LiteralPath "C:\UKBT\ukbt-tina-hardening\contracts\CONTENT-TRUST-CONTRACT.md"
Get-ChildItem -LiteralPath "C:\UKBT\ukbt-tina-hardening\contracts" | Select-Object Name
```

Output — **VERIFIED**:

```
False
Names in contracts/:
ACCESSIBILITY-CONTRACT.md
AI-EXECUTION-CONTRACT.md
ASSET-CONTRACT.md
CI-CONTRACT.md
COMPONENT-CONTRACT.md
CONTENT-CONTRACT.md
CSS-CONTRACT.md
DEPLOYMENT-CONTRACT.md
DESIGN-SYSTEM-CONTRACT.md
evidence-contract.md
FORM-CONTRACT.md
MOTION-CONTRACT.md
REPOSITORY-CONTRACT.md
RIGHTS-CONTRACT.md
ROUTE-CONTRACT.md
SEO-CONTRACT.md
TRUTH-CONTRACT.md
VISUAL-REGRESSION-CONTRACT.md
+ evidence-record.template.yaml, task-contract.template.yaml, schemas/, README.md

No CONTENT-TRUST-CONTRACT.md — absence VERIFIED.
Authoritative substitute is apps/web/src/lib/content-trust.ts (REM-004) + contracts/TRUTH-CONTRACT.md
```

### 4.5 `git log` base + `about.astro:28` truth-owned consumer — VERIFIED

PowerShell:

```powershell
git -C "C:\UKBT\ukbt-tina-hardening" log --oneline -6
Get-Content -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\src\pages\about.astro" | Select-Object -Skip 27 -First 2
Select-String -LiteralPath "C:\UKBT\ukbt-tina-hardening\apps\web\src\lib\content-trust.ts" -Pattern "about\."
```

Output — **VERIFIED**:

```
8642ab5 docs(tina): phase 3 visual editing gap analysis
0d2a91f docs(tina): phase 2 change log
8b0d771 docs(env): document PUBLIC_TINA_ADMIN_ORIGIN for tina bridge
68c672e fix(worker): enable nodejs_compat for tina island route
8322de1 fix(tina): resolve editing branch on Workers Builds previews
54d1fc2 docs(tina): phase 1 workers configuration audit

about.astro:28: import { about } from '../content/about-data';
about.astro:29: import { ourSponsors } from '../content/sponsors-data';

content-trust.ts about.* hits:
  81: 'about.heroSubline': { cls: 'DORMANT' ...
  86: 'about.storyBody': { cls: 'DORMANT' ...
  91: 'about.aboutImage': { cls: 'DORMANT' ...
  92: 'about.aboutImageAlt': { cls: 'DORMANT' ...
  97: 'about.leadershipIntro': { cls: 'DORMANT' ...
 102: 'about.managementImage': { cls: 'DORMANT' ...
 107: 'about.managementImageAlt': { cls: 'DORMANT' ...
```

Plus `tina/config.ts:161-223` read verified above (fields enumerated in §1.1).

---

*Generated for Task 5 Phase 4 — evidence-ranked. No deletions, no `tina/config.ts` edits. Cites `CURRENT_STATE.md` P1-4, `WORKERS_TINA_CONFIGURATION_AUDIT.md`, `CHANGE_LOG.md`, `TINA_VISUAL_EDITING_GAP_ANALYSIS.md` without upgrading UNKNOWN. Later tasks must cite this record for About wiring decisions; any future Option A must prove it preserves the truth gate.*
