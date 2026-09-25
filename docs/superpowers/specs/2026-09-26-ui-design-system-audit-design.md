# UI Design System Skill — Audit Spec (direction A)

> Status: design approved by owner 2026-09-26 (direction A: audit + spec, zero code).
> Terminates at this spec. Any future adoption of a token category below is its
> own classified task through the RAW → CANDIDATE → ADAPTED → APPROVED lifecycle.

**Goal:** Judge the upstream `ui-design-system` skill
(`davila7/claude-code-templates`, MIT © 2025 Daniel Ávila) as an audit lens over
UKBT's approved tokens — keep the coverage checklist, reject conflicting values.

**Non-goals:** running, fixing, vendoring, or executing the upstream script
in-repo; changing any token value; touching gates, CI, or frozen contracts.

## Upstream provenance (verified 2026-09-26)

- `SKILL.md` (raw fetch): toolkit promising token generation, component docs,
  responsive calculations, handoff docs. Only `scripts/design_token_generator.py`
  (529 lines) was retrieved and executed; any sibling scripts are UNKNOWN.
- License (raw `LICENSE` fetch): MIT — vendoring would be permitted with
  attribution per `THIRD-PARTY-NOTICES.md`, but direction A vendors nothing.

## Defect log (all reproduced fresh 2026-09-26, Python 3.13, temp dir only)

- **F-1 (fatal):** `SyntaxError` line 64 — `'light': '#FBB\n\nD24'` splits a string
  literal across lines. The unmodified download does not run.
- **F-2 (fatal):** advertised `scss` format raises
  `AttributeError: ... no attribute '_export_as_scss'`. Only `json`/`css`/`summary`
  work.
- **F-3 (contract conflict):** `spring: cubic-bezier(0.68,-0.55,0.265,1.55)` is an
  overshoot easing — banned by `MOTION-CONTRACT.md` restraint list; generic
  `ease`/`easeIn` literals violate tokens-first (`packages/truth/.../motion.json`
  approves exactly 4 beziers; `check-motion.mjs` enforces).
- **F-4 (pipeline conflict):** output is flat JSON/CSS-vars, not DTCG
  (`$value`/`$type`). Style Dictionary compiles `tokens/approved/**` only
  (`CSS-CONTRACT.md`), so generator output cannot enter the pipeline untranslated.
- **F-5 (value conflicts, input `#001E3A` = verified brand primary):**
  durations 150/250/350ms vs approved 120/200/400ms; derived primary-500
  `#12263a` vs crest-sampled `#001E3A` (`color.json:5`); hard light `surface`
  vs approved `Canvas`/`CanvasText` system keywords (deliberate forced-colors
  posture, `color.json:46`); hue+180 "secondary" invented without brand basis;
  Inter/Merriweather stack vs self-hosted Lato/Montserrat (OFL).
- **F-6 (minor):** unused `brand_hsv`/`factor`; `classic` shadows omit
  `2xl`/`inner` (shape inconsistency); Python toolchain vs `scripts/` pure-Node
  policy (`scripts/AGENTS.md:7`).

## Coverage matrix (upstream category → approved file → disposition)

| Upstream | Approved | Disposition |
|---|---|---|
| colors (primary/secondary/neutral/semantic/surface) | `color.json` (brand VERIFIED crest-sampled; neutral sparse 7-step; surface system keywords) | COVERED — generator values rejected per F-5 |
| typography (families/scale/weights/textStyles) | `typography.json` (Lato/Montserrat PROPOSED; 1.25 modular DERIVED; fluid `display` clamp) | COVERED — px scale + Inter stack rejected |
| spacing (8pt px grid) | `spacing.json` (rem micro-scale + MEASURED `gap` page rhythm) | COVERED — px grid rejected; `gap.100` has no upstream counterpart |
| sizing.container | `layout.json` (maxWidth sm–xxl + `page` 1240px + gutter) | COVERED — `page`/`xxl`/`gutter` exceed upstream |
| sizing.components (button/input/icon) | `src/contracts/button|card|link|breadcrumb.contract.md` + `geometry.json` control height | COVERED by contract, not by token file — correct as-is |
| borders (radius + width) | `radius.json` (DERIVED sm–pill + MEASURED `ref*` incl. asymmetric) + `border.json` (semantic roles + widths) | COVERED — generic radii rejected; `ref*` have no upstream counterpart |
| shadows | `shadow.json` (sm/md only) | PARTIAL — deeper ramp (lg/xl/inner) is a RAW candidate **only** with real design evidence; never generator values |
| animation (durations/easings/keyframes) | `motion.json` (fast/base/slow/signature/intro/slideshow + 4 easings + distances) | COVERED for durations/easings (conflicts rejected per F-3); named keyframes are a RAW candidate only if motion-contract-compliant (transform/opacity, no spring) + evidenced |
| breakpoints (xs–2xl generic) | `breakpoint.json` (device-named 390/430/768/1024/1280/1440, MEASURED matrix) | COVERED — generic ramp rejected |
| z-index (1000+ bootstrap scale) | `z-index.json` (0–100 semantic; "never z-index: 9999") | COVERED — 1000+ scale rejected |
| meta | none (provenance is per-token `$description`) | N/A |

Net: 8.5/10 covered, 2 RAW-candidate shapes (shadow depth, named keyframes),
zero adoptions. UKBT's MEASURED page-rhythm tokens (`gap`, `ref*`, `page`,
`slideshow`) have no upstream counterpart — expected, the generator is generic.

## Lifecycle routing (if a RAW candidate is ever pursued)

`artifacts/` evidence record → `tokens/adapted/` DTCG-shaped draft →
explicit APPROVED promotion → `tokens:build` → visual-regression gate
(`IMPLEMENTED` ≠ `VERIFIED`). Never write generator values into `approved/`
directly (`CSS-CONTRACT.md` forbidden behavior; `DESIGN-SYSTEM-CONTRACT.md`
no-skip rule).

## Self-review

- Placeholders: none — every disposition cites a file:line or a reproduced run.
- Consistency: "zero code" holds throughout; F-1/F-2 fixes are described for
  upstream reporting, not applied in-repo.
- Scope: single spec, single branch, no follow-up plan (direction A terminates).
- Ambiguity: "as-is use" is answered — impossible (F-1/F-2 fatal), recorded.
