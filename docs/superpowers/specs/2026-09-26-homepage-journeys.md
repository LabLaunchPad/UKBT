# Homepage journeys + pass criteria (Stage-2 Task 1)

> Spec task — changes no shipped bytes. Maps the homepage funnel **as it
> exists today** (branch `feat/homepage-redesign`, post-PR-#119 baseline)
> so the redesign directions (Task 3) and sign-offs (Task 6) have
> observable criteria to judge against. Heuristic/contract review only:
> anything needing real user data is marked UNKNOWN, never asserted.

## journey-A — prospective player: hero → academy → join

Click path as shipped today:

1. **Hero primary CTA** — `apps/web/src/pages/index.astro:92-104`
   renders `Hero.astro` inside the `hero` TinaIsland; the CTA label/link
   come from Tina EDITORIAL fields with code-owned fallbacks
   (`Hero.astro:41-42`: label `'Join the Club'`, link `'/join'`).
   Live Tina values (`apps/web/content/homepage/homepage.json:7-8`):
   label `"Join the Club"`, link `"/join/"` (canonical trailing-slash
   form). The anchor itself renders at `Button.astro:48-57`
   (`<a>` when `href` is set, trailing arrow icon decorative,
   `aria-hidden`). A second entry to the same route: the header CTA
   (`navigation-data.ts:47-50`, label `'Join the Club'`,
   href `'/join/'`, rendered by `Header.astro`).
2. **Academy band (confidence step, no navigation)** —
   `index.astro:118-120` renders
   `AcademySection.astro` with `tone` defaulting to `inverse`
   (`AcademySection.astro:20-26`) and counters built at
   `index.astro:56-60` from truth-gated stats
   (`homepage-data.ts:90-104`: `'50+'` players, `'15+'` countries,
   `'7+'` tournaments). Counters render as plain text at
   `AcademySection.astro:37-46` — no links, no CTA. The band's own
   header copy (`AcademySection.astro:23-24`: eyebrow `'Development'`,
   heading `'Not Only a Team — an Institute for Learning'`) carries the
   recruitment narrative between hero and join.
3. **Join route** — `/join/` (`apps/web/src/pages/join.astro`,
   ROUTE-CONTRACT-authorised). Reached from the hero primary CTA (step 1)
   or the header CTA; `primaryNav` (`navigation-data.ts:14-42`) carries
   no Join link by design — Join is a CTA, not a nav item.

Pass criteria (each observable, no user data required):

- **A1 — hero CTA destination + label.** Hero primary CTA links
  `/join/` and its label names the join action (`"Join the Club"` or
  equivalent). Check: rendered `href` on the homepage hero
  `.ukbt-hero__actions` anchor.
- **A2 — hero CTA keyboard + focus.** Hero primary CTA is a native
  anchor (keyboard-reachable by construction, `Button.astro:48-57`),
  with a visible `:focus-visible` ring (`Button.astro:177-179` plus the
  global rule in `styles/base.css`); on the dark hero surface the ring
  resolves gold (`Hero.astro:115`).
- **A3 — heading order intact.** Page carries exactly one `h1` (hero
  headline, `Hero.astro:90`), section headings are `h2`
  (`SectionHeader.astro:61`); no step in journey-A introduces a skipped
  level between hero and join entry.
- **A4 — academy counters legible + truthful.** The three counters show
  the gated values (`50+` / `15+` / `7+`, `homepage-data.ts:90-104`)
  in gold-on-navy (`AcademySection.astro:67-77`) — gold is text-safe
  only on the inverse band, never on light (same-file `tone` contract,
  `:20-26` + `:81-86`). Counters must not be links or buttons.
- **A5 — join reachable without search.** `/join/` is one click from
  the homepage hero (A1) AND from the persistent header CTA on every
  page (`navigation-data.ts:47-50`); neither entry may regress to a
  redirect hop (canonical trailing-slash hrefs — `navigation-data.ts:11-13`
  note).
- **A6 — task success (UNKNOWN).** Whether prospective players complete
  hero → join and understand what joining means needs real user
  observation (task-completion rate, time-on-task, post-task interview).
  UNKNOWN — no fabricated data; heuristic pass is A1–A5 only.

## journey-B — fan: tournaments → news → socials

Click path as shipped today:

1. **Tournament section → `/tournaments/`** — `index.astro:122-130`:
   `SectionHeader` CTA (`ctaLabel="All tournaments"`,
   `ctaHref="/tournaments/"`, rendered via `SectionHeader.astro:64-70`
   as a `Button` anchor) plus `TournamentGrid` showing the first gated
   fixture as the main event (`index.astro:46`: `mainEvent` =
   `Nordic Lights`, September 2026, Norway;
   `homepage-data.ts:123-138`; overflow fixture `Global T20
   Championship`, October 2026, Romania). **Gap recorded:**
   `TournamentGrid.astro:16-42` renders display-only markup — event
   names, dates and places are `<span>`/`<li>` text with **no links**,
   so the only on-homepage path to `/tournaments/` is the section-header
   CTA, and no per-event deep link exists (the tournaments page anchors
   `#upcoming` / `#completed` per `navigation-data.ts:30-39`).
2. **News (off-homepage step)** — the homepage carries **no news
   section by design** (`index.astro:18-24` comment: News is a
   structural shell with `CONTENT_STATUS = UNKNOWN`, deliberately
   omitted from the primary indexed route). The fan path to news leaves
   the homepage via the footer: `secondaryNav`
   (`navigation-data.ts:56-59`: `'Club News'` → `'/news/'`) rendered at
   `Footer.astro:43-47`, landing on `apps/web/src/pages/news.astro`;
   per-article reads live at `apps/web/src/pages/news/[slug].astro`.
3. **Socials (three on-page entries, one footer column)** — hero
   `SocialLinks` row (`Hero.astro:102-104`, `tone="on-dark"`,
   `iconsOnlyOnMobile`); `AboutCTA` follow block
   (`AboutCTA.astro:24-40`: primary `Follow on <name>` external button
   + `Also on` list, `tone="on-light"`); footer column
   (`Footer.astro:77-83`, `direction="column"`). All render from the
   same gated URLs (`homepage-data.ts:140-165`: facebook, instagram,
   tiktok, x) through one primitive (`SocialLinks.astro:65-82`: `<ul>`
   with per-link `aria-label="UK Bangla Tigers on <Name>"`,
   `rel="me noopener"`, brand display names at `:9-28`).

Pass criteria:

- **B1 — tournament CTA destination.** Tournament section header CTA
  links `/tournaments/` and is labelled as the tournaments action
  (`"All tournaments"` or equivalent). Check: rendered `href` on the
  homepage tournament `.ukbt-section-header__cta` anchor.
- **B2 — tournament CTA keyboard + focus.** Same mechanism as A2
  (native anchor, `Button.astro:48-57` + `:177-179`); on the light
  tournament surface the focus ring must remain visible against the
  background (global `:focus-visible` rule — verified visually, not
  assumed).
- **B3 — news reachable + labelled.** Footer `Club News` link points at
  `/news/` (`navigation-data.ts:57`, rendered `Footer.astro:45`) and at
  least one article slug renders from `/news/[slug].astro`. The
  homepage's *lack* of a news section is intentional
  (`index.astro:18-24`) — a direction that adds one must first clear
  the UNKNOWN-content gate, not invent articles.
- **B4 — social links correct + safe.** Every rendered social anchor
  points at its gated URL (`homepage-data.ts:140-165`), external links
  from `Button` carry `target="_blank" rel="noopener noreferrer"`
  (`Button.astro:51-52`), and each icon exposes its accessible name
  (`SocialLinks.astro:69-73`). No placeholder `#` hrefs anywhere on the
  path.
- **B5 — social touch targets.** Icon-only mobile instances keep a 24px
  minimum hit area with visually-hidden (not `display:none`) labels
  (`SocialLinks.astro:132-154`); footer text links keep `min-height:
  24px` (`Footer.astro:150-157`, `:168-177`).
- **B6 — fan-task success (UNKNOWN).** Whether fans find fixtures,
  read news and follow the club needs real user observation
  (findability, comprehension, follow-through). UNKNOWN — heuristic
  pass is B1–B5 only. The display-only tournament grid (step 1 gap) is
  a known findability risk to probe, not a verdict.

## a11y-floor — gates every journey step must clear

Applies to journey-A and journey-B alike, on the redesigned homepage.
Each item names the contract/gate behind it so Task 6 can check it
mechanically:

- **F1 — contrast.** Normal text ≥ 4.5:1 (WCAG AA,
  `contracts/ACCESSIBILITY-CONTRACT.md`). Known tripwires: gold text is
  approved on navy only (navy-on-gold button measures 7.21:1,
  `Button.astro:116-117` note; gold-on-light fails —
  `AcademySection.astro:16-18` tone contract); muted dark-surface text
  uses `neutral-100`, not `neutral-300` (`SocialLinks.astro:112-114`
  note). Any direction changing type colour re-measures.
- **F2 — keyboard + visible focus.** All journey CTAs/links are native
  anchors (no `div`-buttons); `:focus-visible` ring visible on every
  surface (button offset `Button.astro:177-179`, footer ring
  `Footer.astro:201-204`, hero gold ring `Hero.astro:115`,
  `SocialLinks` on-dark ring `SocialLinks.astro:97-102`). Brand CTA in
  the header and `Skip to content` (`#main-content`, `index.astro:78`)
  must survive the redesign.
- **F3 — reduced motion.** Two-tier model
  (`contracts/MOTION-CONTRACT.md`): instant states, soft-fade
  entrances; transform/opacity only. Baseline behaviour the redesign
  must not regress: hero crossfade resolves static (slide 1,
  `Hero.astro:165-170`), entrance `rise` keyframes are `backwards`-fill
  so no-JS renders content statically (`Hero.astro:172-183` note).
- **F4 — transfer budgets.** HTML 72KB/page, CSS 96KB total, JS 48KB
  total (`scripts/check-perf.mjs`, plan Global Constraints). The
  redesign adds no JS animation runtime and no new webfont family;
  `data-motion="reveal"` reuse (`SectionHeader.astro:56`,
  `Footer.astro:34`) over bespoke scroll JS.
- **F5 — heading + landmark order.** One `h1` per page (hero),
  sequential section headings, `main#main-content` landmark
  (`index.astro:78`), footer nav `aria-label="Footer"`
  (`Footer.astro:42`), social lists labelled (`SocialLinks.astro:49`,
  `AboutCTA.astro:39`). Spot-check with axe in Task 6; heading-level
  skips (e.g. the `h3`-led franchise/about-CTA blocks,
  `FranchiseTeaser.astro:26`, `AboutCTA.astro:22`) are recorded
  existing conditions, not new violations to copy.
- **F6 — Tina boundary.** Redesign copy changes touch EDITORIAL fields
  only (hero headline/tagline/CTAs, `homepage.json:2-11`); player
  counts, fixtures, captain identity stay code-owned via `*-data.ts` +
  truth gate (`contracts/TRUTH-CONTRACT.md`, plan Global Constraints).
  No new routes without a ROUTE-CONTRACT amendment (relevant to B3 and
  any per-event link proposal from the step-1 gap).
