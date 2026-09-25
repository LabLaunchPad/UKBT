# Adaptive Learning — Error Catalog

Agent-agnostic. Plain Markdown, no tool hooks. Each entry follows
`prompts/07-adaptive-learning.md`: OBSERVATION → OUTCOME → CAUSE →
COUNTEREXAMPLE (scope guard against overfitting) → RULE → VERIFIED-BY →
STATUS. A rule is never broader than its evidence.

STATUS meanings: `VERIFIED` = confirmed by ≥2 independent observations
or a passing gate/test run after the fix. `PROVISIONAL` = single
observation; apply with judgment, do not generalize further.
`adversarial/` replay (prompt 08) is still open for all entries.

---

## AL-001 — Widening horizontal padding overflowed a grid column

- **Observation:** `.ukbt-header__nav a` `padding-inline` raised 15px →
  20px; the 7-item nav outgrew its `minmax(0,1fr)` column at >1439px and
  slid Home under the crest (seen on localhost screenshot).
- **Outcome:** Reverted to 15px; kept vertical target-size fix.
- **Cause:** Horizontal padding adds directly to a centered row's total
  width; grid neighbors do not yield.
- **Counterexample:** Vertical padding increases are safe here (row
  height is unconstrained); narrow viewports (≤1439px) already tighten
  to 8px by design.
- **Rule:** Never widen horizontal padding/width inside a fixed grid
  region without measuring total row width vs. the container at the
  widest supported viewport.
- **Verified-by:** localhost screenshot before/after.
- **Status:** PROVISIONAL.

## AL-002 — Plain-text data rendered where links were wanted; invalid prop passed

- **Observation:** `personalSocialPlatforms` was `string[]`, rendered as
  text; first fix attempt passed a nonexistent `rel` prop to the `Link`
  component (its Props has no `rel` — it derives `rel` from `external`).
- **Outcome:** Data reshaped to `{name, url}[]` in `captain-data.ts`;
  template uses `<Link href external>` like the adjacent list.
- **Cause:** Assumed the data shape and the component API instead of
  reading both.
- **Counterexample:** When the consumer already handles a shape (e.g.
  `statsProviders`), mirroring it beats inventing a mapping layer.
- **Rule:** Read the data module AND the receiving component's Props
  before wiring; mirror adjacent working patterns.
- **Verified-by:** typecheck 0 errors + built HTML contains all links.
- **Status:** PROVISIONAL.

## AL-003 — Edit failed on whitespace mismatch

- **Observation:** `edit` with a hand-typed `oldString` failed
  ("Could not find oldString"); the file used different indentation.
- **Outcome:** Re-read the exact lines, retried verbatim, applied.
- **Cause:** Reconstructing file text from memory instead of the read
  output.
- **Counterexample:** Small unique single-line anchors rarely mismatch;
  risk grows with block size.
- **Rule:** Derive `oldString` by copying the `read` output verbatim
  (content after the line-number prefix); prefer the smallest unique
  anchor that identifies the target.
- **Verified-by:** Immediate apply success across the session.
- **Status:** VERIFIED (repeated).

## AL-004 — win32 PowerShell 5.1 operators differ from bash

- **Observation:** `&&`, `;`, `head`, `echo $VAR`-style chains failed
  (`The token '&&' is not a valid statement separator`; `head` not
  recognized; `;` splits into separate commands).
- **Outcome:** Sequential tool calls, or `cmd /c "..."` with cmd
  syntax, `workdir` param instead of `cd`.
- **Cause:** Assuming a bash-like shell on a `win32`/PowerShell tool.
- **Counterexample:** Inside `cmd /c`, `&&` works; inside PowerShell,
  `;` separates statements (usable deliberately).
- **Rule:** On this stack: one command per call; `cmd /c` for
  cmd idioms (`&&`, `findstr`, `move`); never `head`/`tail`/`grep`
  (use read/grep tools); never `cd` (use `workdir`).
- **Verified-by:** Repeated failures then consistent success.
- **Status:** VERIFIED (repeated).

## AL-005 — pnpm/npx blocked by execution policy

- **Observation:** `pnpm build` failed: `pnpm.ps1 cannot be loaded
  because running scripts is disabled`.
- **Outcome:** Invoke via `cmd /c "pnpm ..."` (resolves `.cmd`
  shims, bypassing the `.ps1` block).
- **Cause:** PowerShell script execution policy vs npm `.ps1` shims.
- **Counterexample:** Direct `node <script>` never hits this; only
  npm-shimmed CLIs do.
- **Rule:** Run node CLIs through `cmd /c` on this box; do not change
  the machine execution policy.
- **Verified-by:** Repeated.
- **Status:** VERIFIED (repeated).

## AL-006 — Playwright fell back to a nonexistent Linux browser path

- **Observation:** All browser tests failed with `executable doesn't
  exist at /opt/pw-browsers/chromium`; `playwright.config.ts` uses
  that path whenever `CI` is unset.
- **Outcome:** Run with `CI=true` so the default cache
  (`ms-playwright/chromium-1234`, present) is used.
- **Cause:** Env-specific override written for a Linux sandbox,
  applied unconditionally off-CI.
- **Counterexample:** On CI (`playwright install chromium` runs) and
  on machines with `/opt/pw-browsers`, the default invocation is
  correct — the flag is purely local.
- **Rule:** Run browser specs locally with `CI=true`; never "fix" the
  fallback path itself without the Linux env present. With `CI=true`,
  `reuseExistingServer` is false — stop any dev server first or the
  run fails on port conflict.
- **Verified-by:** 124-env-fail → 126/126 green with `CI=true`.
- **Status:** VERIFIED.

## AL-007 — Animated layer covered the base layer with animation off

- **Observation:** Slideshow slide 2 had no base `opacity`; with
  animations disabled (repo screenshots, no-JS, old browsers) it
  rendered at full opacity over slide 1.
- **Outcome:** Base `opacity: 0` matching the 0% keyframe.
- **Cause:** Assuming the animation always runs; the resting style was
  never declared.
- **Counterexample:** One-shot finite animations with `backwards`
  fill are unaffected (fill provides the resting state).
- **Rule:** Every infinite/ambient animated layer must declare a base
  state identical to its 0%/100% keyframe, so the no-animation render
  is deterministic and correct.
- **Verified-by:** Before/after screenshots (slide 2 → slide 1).
- **Status:** PROVISIONAL.

## AL-008 — Scoped CSS descendant silently never matches across components

- **Observation:** `.ukbt-chooseus__header .ukbt-section-header`
  override in `WhyChooseUs.astro` had zero effect (measured: margins
  unchanged); same failure mode as the documented Surface case
  (`homepage.spec.ts:313`, Stage 8 red team F6).
- **Outcome:** `:global()` on the descendant half, ancestor half keeps
  local scope.
- **Cause:** Astro scopes both halves to the defining component; the
  descendant renders in another component's scope, so the selector can
  never match — with no build error.
- **Counterexample:** Single-class selectors on the component's own
  elements always match; same-file parent/child matches.
- **Rule:** Cross-component descendant styling MUST use `:global()`
  on the foreign half; a silently-dead override is the default
  hypothesis when a scoped descendant rule has no effect — verify by
  measuring computed style, not by re-reading the stylesheet.
- **Verified-by:** Repo precedent (F6) + this repeat + measured
  80px→0px trailing after the fix.
- **Status:** VERIFIED.

## AL-009 — Event bindings died on ClientRouter navigation

- **Observation:** Hamburger worked per document load, dead after the
  first client-side navigation (reproduced 390x844, zero page errors).
- **Outcome:** Document-delegated handlers + fresh node queries per
  event + once-per-document window guard + `astro:after-swap` reset
  (`Header.astro`).
- **Cause:** Listeners bound directly to elements at load; swaps
  replace the DOM while `document`/`window` persist.
- **Counterexample:** `document`-bound listeners survive swaps (but
  leak stale closures if they capture nodes — hence fresh queries).
- **Rule:** In any ClientRouter app: never cache element references at
  load for controls; delegate on `document`, guard registration with a
  `window` flag (BaseLayout pattern), reset transient UI state on
  `astro:after-swap`.
- **Verified-by:** Repro before + 9/9 interaction matrix after + repo
  drawer specs green.
- **Status:** VERIFIED.

## AL-010 — Padding-derived hit areas + negative-margin encroachment

- **Observation:** Dropdown chevrons measured 20×24 (axe
  `target-size`): 10px glyph + small padding, pulled 4px under the
  label by `margin-inline-start: -4px` ("partially obscured").
- **Outcome:** Exact 24×24 box, `padding: 0`, no negative margin,
  `flex: none`.
- **Cause:** Assuming padding + min-size compose to the minimum, and
  that overlap is free.
- **Counterexample:** Links with generous bilateral padding clear 24px
  without exact boxes; only compact icon-only controls need them.
- **Rule:** Icon-only targets get explicit 24×24 boxes; never pull a
  target under its neighbor with negative margins.
- **Verified-by:** axe fail → fix → 126/126 specs green.
- **Status:** VERIFIED.

## AL-011 — Test hardcoded a superseded asset path

- **Observation:** `pages.spec.ts:159` asserted the old captain
  portrait path after the portrait was replaced; failed.
- **Outcome:** Updated selector + comment to the new asset.
- **Cause:** Asset swap without grepping test references.
- **Counterexample:** Content assertions (counts, patterns — e.g. the
  roster test) survive asset swaps untouched.
- **Rule:** Grep `tests/` for the old path/name on ANY asset or copy
  change; prefer pattern/count assertions for sets, exact paths only
  where identity matters.
- **Verified-by:** Spec green after update.
- **Status:** PROVISIONAL.

## AL-012 — New HTML served with old CSS (stale dev server)

- **Observation:** Footer contact rows rendered unstyled (bullets,
  browser-blue links) while the markup was new; production build CSS
  provably contained the rules.
- **Outcome:** Restarted the long-running dev server + hard refresh;
  verified via `dist/` build output.
- **Cause:** Stale Vite module graph / browser CSS cache on a server
  running across dozens of edits — not a code defect.
- **Counterexample:** If `dist/` CSS lacks the rules, it IS a code
  defect — check build output first to separate the two cases.
- **Rule:** Unstyled-new-markup → check `dist/` CSS first. If present:
  restart dev, hard-refresh (Ctrl+Shift+R). Never "fix" CSS that is
  already correct in the build.
- **Verified-by:** Single instance, resolved as described.
- **Status:** PROVISIONAL.

## AL-013 — Saved upload was a screenshot, not the photo

- **Observation:** `captain-photo-new.png` (5.4MB) opened as a
  full-page homepage screenshot, not the portrait.
- **Outcome:** Stopped, reported with evidence, requested the real
  file; verified the replacement by viewing before staging.
- **Cause:** Assuming a saved upload is the intended content.
- **Counterexample:** Correct files need no check — but the check is
  seconds and the failure mode (publishing a screenshot as a
  portrait) is severe.
- **Rule:** Always VIEW supplied binary files before staging them
  into `public/`; never stage by filename/size alone.
- **Verified-by:** Single instance, caught pre-staging.
- **Status:** PROVISIONAL.

## AL-014 — Near-miss entity rename ("Uppsala Titans")

- **Observation:** Instruction listed "Uppsala Titans"; every record
  says "Uppsala Tigers".
- **Outcome:** Asked; confirmed typo; kept Tigers.
- **Cause:** One-letter-apart names are easy to misread as intent.
- **Counterexample:** Pure reorderings with identical strings need no
  confirmation.
- **Rule:** Never silently change a name/identifier on instruction
  ambiguity — one-word differences in entities are always confirmed,
  never inferred.
- **Verified-by:** Single instance.
- **Status:** PROVISIONAL.

## AL-015 — Promising a deploy without reading the needs-graph

- **Observation:** Claimed "no deploy until visual green" from memory
  of one job; the full `needs: [...]` graph (and the second deploy
  path) had to be read to state this correctly.
- **Outcome:** Read `ci.yml` `needs` + `if` lines before any deploy
  claim since.
- **Cause:** Generalizing from one job's config.
- **Counterexample:** Single-path pipelines need no graph walk.
- **Rule:** Before ANY merge/deploy statement, read the workflow's
  `needs`, `if`, and trigger lines; report all deploy paths, not the
  first found.
- **Verified-by:** Single instance (near-miss, caught by user).
- **Status:** PROVISIONAL.

## AL-016 — Monitored one deploy path, missed the live one

- **Observation:** Declared "Cloudflare NOT updated" from the skipped
  Action job while the git-integration auto-deploy had shipped;
  corrected by fingerprinting live HTML.
- **Outcome:** Verify deployments against the live URL's bytes
  (asset URLs, values), never from a single pipeline view.
- **Cause:** Stopping at the first authoritative-looking signal.
- **Counterexample:** When only one deploy path exists, the pipeline
  view suffices.
- **Rule:** A deploy claim is verified by fetching the live URL and
  matching expected fingerprints; pipeline state is supporting
  evidence, never the verdict.
- **Verified-by:** Single instance, corrected same session.
- **Status:** PROVISIONAL.

## AL-017 — Systemic 100px voids found by measuring, not eyeballing

- **Observation:** Per-section screenshots looked "fine"; programmed
  box measurement exposed 100/180px voids (lede→list, image→headline,
  main→also-coming) sharing one token (`gap-100`).
- **Outcome:** `measure-home.js` technique (scroll-settle + rect dump
  + gap arithmetic) → three fixes to `gap-5`, re-measured 50/50/50.
- **Cause:** Element-isolated captures hide inter-element rhythm
  defects by construction.
- **Counterexample:** Overlap/clipping defects DO show in isolated
  captures; spacing defects need full-page context + numbers.
- **Rule:** Spacing audits use full-page captures plus measured
  rects; never clear a spacing review on isolated screenshots alone.
  Suspect any shared gap token when voids repeat across components.
- **Verified-by:** Before/after measurements + re-read screenshots.
- **Status:** PROVISIONAL (method institutionalized here).

## AL-018 — Reveal-blank captures

- **Observation:** First capture round showed a blank header block;
  scroll-reveals hadn't fired for below-fold sections.
- **Outcome:** scrollIntoView + 900ms settle per section before
  shooting (script updated).
- **Cause:** Shooting before the page reached the state being
  asserted.
- **Counterexample:** `animations: disabled` alone does not settle
  IO-gated reveals.
- **Rule:** Capture protocol: networkidle → slow scroll top→bottom
  → per-section scrollIntoView + settle wait → shoot.
- **Verified-by:** Blank → complete captures same session.
- **Status:** PROVISIONAL.

## AL-019 — Dev-toolbar pill in captures is not a site bug

- **Observation:** Dark icon bar at the bottom-center of element
  screenshots across sections.
- **Outcome:** Identified as Astro's dev toolbar (dev-only, absent in
  production builds); ignored with a note, not "fixed".
- **Cause:** Unfamiliar chrome mistaken for content.
- **Counterexample:** Anything reproducible in `dist/` + preview is
  real; dev-only chrome never ships.
- **Rule:** Attribute viewport-fixed artifacts across captures to the
  harness/browser first; confirm against the production build before
  filing.
- **Verified-by:** Positional analysis (viewport-fixed, all sections).
- **Status:** PROVISIONAL.

## AL-020 — Approved feature vs stale test assertion

- **Observation:** `motion.spec.ts` asserts zero running animations;
  the approved hero slideshow loops by design (contract Amendment 02).
- **Outcome (planned):** Exempt the documented layer in the test
  (assert nothing ELSE runs) — a scoped update, not a revert and not
  a gate weakening. Recorded as BL-10.
- **Cause:** Feature/test drift after an approved contract exception.
- **Counterexample:** Unapproved loops are reverted, not exempted.
- **Rule:** When a contract amendment authorizes behavior a test
  forbids, update the test's scope to the amendment in the same
  change — never ship amendment and stale assertion together.
- **Verified-by:** BL-10 fix executed and green across full local
  suite (328 passed) and multiple CI runs since.
- **Status:** VERIFIED.

## AL-021 — setup-node major bump hard-fails without pnpm on PATH

- **Observation:** `actions/setup-node` v4→v5; `governance-scaffold`
  and `dependency-allowlist` jobs failed in ~10s with "Unable to
  locate executable file: pnpm" — neither job sets a `cache` input
  or runs pnpm at all.
- **Outcome:** Added `pnpm/action-setup` before `setup-node` in both
  jobs, matching every other job's step order; both green on retry.
- **Cause:** v5 probes pnpm cache handling regardless of inputs; v4
  tolerated the missing binary.
- **Counterexample:** Jobs that already installed pnpm first were
  unaffected — the breakage was order-dependent, not version-broken.
- **Rule:** After any `setup-node` major bump, check EVERY job's step
  order — `pnpm/action-setup` must precede `setup-node` everywhere,
  including script-only jobs that never run `pnpm install`.
- **Verified-by:** CI run 34473040202, both gates PASS after the fix.
- **Status:** VERIFIED.

## AL-022 — Harness race fixed in some specs, left live in others

- **Observation:** Reveal-settle fix applied to `pages`/`mobile-axe`/
  `homepage` specs; CI then failed `about.spec` + `axe.spec` with
  the identical footer ~1.06–1.12 blended-ratio signature — specs
  never touched by the fix.
- **Outcome:** Same settle block applied to `axe`/`about` (failing)
  and `design-system` (preventive); all 6 `AxeBuilder` specs now
  settle before scanning.
- **Cause:** Fixed only the specs failing that day instead of
  grepping all users of the harness first.
- **Counterexample:** A spec passing today while holding the same
  race is luck (CI timing), not coverage.
- **Rule:** When fixing a systemic test-harness race, grep ALL
  specs using the harness and fix them together in the same change.
- **Verified-by:** PR #30 CI green (Playwright 4m7s) + main run
  `34474337388` success after the fix.
- **Status:** VERIFIED.

## AL-023 — Sticky/fixed layers smear in stitched full-page captures

- **Observation:** User-supplied ~768px full-page capture showed three
  thick black bars (story heading, founder heading, after leadership
  narrative). Controlled Playwright `fullPage` reproductions at
  390/768/1024/1440 were all clean; code + compositor inventory found
  no element capable of painting them (zero `100vw`, zero blend/filter
  tricks, only 2 reveal nodes in footer).
- **Outcome:** Ruled CAPTURE ARTIFACT, not a defect — no code changed.
- **Cause:** Scroll-stitched captures (DevTools full-size, extensions)
  repaint `position:sticky/fixed` layers per band; our header is
  sticky ≤1279px plus fixed drawer/overlay layers, all near-black
  navy. Playwright `fullPage` instead resizes the viewport to content
  height (no scrolling), so it never smears.
- **Counterexample:** A bar that reproduces in Playwright `fullPage`
  mode IS real (no stitching involved) — investigate as a defect.
- **Rule:** Never file a visual defect from a third-party stitched
  capture alone — reproduce in Playwright `fullPage` first. For manual
  captures, neutralise sticky/fixed first (`position:absolute` via
  `addStyleTag` or the screenshot `style` option).
- **Verified-by:** 4/4 clean reproductions + compositor inventory +
  industry documentation (screenshotrun/Geonode 2026 guides describe
  this exact stripe signature and cause).
- **Status:** VERIFIED.

## AL-024 — object-fit:fill silently distorts brand marks

- **Observation:** WOLFFIT logo (square 1254×1254) rendered into a
  96×128 box with `object-fit: fill` → 25% stretch at every viewport.
- **Outcome (planned):** `contain` + explicit box, recorded for fix.
- **Cause:** `fill` ignores aspect ratio; nobody compared rendered vs
  natural aspect.
- **Counterexample:** `cover` crops (see AL-025) — right for photos,
  wrong for logos where every pixel matters.
- **Rule:** Logos and marks always `object-fit: contain` (or exact-AR
  boxes). Assert by measurement: rendered w/h vs natural w/h per
  viewport, not by eyeballing.
- **Verified-by:** Measured rects at 390/768/1440 + fix executed
  (contain + exact-AR box); logo renders 128x128 undistorted at all
  viewports, full e2e green.
- **Status:** VERIFIED.

## AL-025 — cover-crop severity is viewport-dependent; check the tablet band

- **Observation:** Portrait trophy photo (1000×1252) under `cover` +
  `max-height` cap: 0% crop at 390, 19% at 1440, 84% crop (704×480
  band) at 768. CTA team-huddle: 70% vertical crop at 1440 via the
  28rem cap, 0% at 390.
- **Outcome (planned):** Responsive image-slot rules, recorded for fix.
- **Cause:** Fixed caps + `cover` interact with column widths that
  change per breakpoint; the damage peaks mid-range (tablet), not at
  the extremes anyone screenshots first.
- **Counterexample:** 390 and 1440 both looked acceptable here — the
  extremes pass while the middle fails.
- **Rule:** Always inspect photographic `cover` slots at a mid-range
  viewport (768–1024) in addition to 390/1440; assert the focal
  content (face/trophy/team) stays in frame via element clips, not
  full-page thumbnails.
- **Verified-by:** Measured AR divergence per viewport + fixes
  executed (founder slot capped 28rem at 768-1025 band: 84%→~14%
  crop; CTA frame capped 48rem: 70%→~12% crop); captures inspected
  at 390/768/1440, full e2e green.
- **Status:** VERIFIED.

## AL-026 -- Cloudflare adapter activated without serve-mapping update (production 100% 404)

- **Observation:** PR #65 activated `@astrojs/cloudflare`; production
  homepage plus all routes returned platform-level 404 while all 15 CI
  gates stayed green. Custom 404 and _headers never served.
- **Outcome:** PR #66 wired root wrangler.jsonc to the generated output
  (main to dist/server/entry.mjs, assets.directory to dist/client/) and
  added pre-deploy mapping gate plus post-deploy smoke script.
- **Cause:** Adapter moved static output dist/ to dist/client/ plus
  Worker dist/server/entry.mjs; root wrangler.jsonc still served
  ./apps/web/dist with no main. No gate validated serve mapping; Workers
  Builds promotes on main-merge with no smoke check.
- **Counterexample:** Adapter upgrades that preserve the dist/ layout need
  no mapping change; the gate derives paths from generated artifacts, so
  a layout-preserving upgrade still passes without edits.
- **Rule:** Never activate, upgrade, or remove a build adapter without
  running check-deploy-mapping and smoke-deploy; green build output is
  never proof of a servable deployment.
- **Verified-by:** wrangler deploy --dry-run (185 files), wrangler dev
  runtime checks, production smoke-deploy 6/6 PASS post-merge.
- **Status:** VERIFIED.

## AL-027 -- Perf-gate diagnostics overstated budgets; global sums mask per-page cost

- **Observation:** scripts/check-perf.mjs enforced the right numbers
  (72/80/48KB) but its failure strings named superseded budgets
  (64/56/32KB), and its header claimed transfer weights while measuring
  raw bytes. Separately, css/js totals sum every file in dist/, so a new
  route's CSS raises the global total without any page getting heavier.
- **Outcome:** Strings corrected to enforced values; header documents raw
  bytes as conservative vs gzip transfer (production: 55KB HTML served
  as 8.9KB gzip). Tina bridge (15.5KB) proven admin-only in built HTML,
  zero site-wide cost. Perf failure-injection suite (7 cases) added and
  chained into test:failure-injection.
- **Cause:** Budget bumps (Stacki/Tina/adapter) updated numbers but not
  messages; metric design predates multi-route code-split CSS.
- **Counterexample:** Raw-bytes conservatism is a safe direction (PASS
  here cannot hide a transfer regression); global sums still catch
  runaway growth, just without per-page attribution.
- **Rule:** When re-approving a budget number, update every string that
  names it; read gate failures against enforced values, not messages,
  until this catalog entry confirms the fix.
- **Verified-by:** test-perf-failure-injection.mjs 7/7, check-perf.mjs
  PASS on real dist, production gzip/cache headers observed.
- **Status:** VERIFIED.

## AL-028 -- No-slash canonicals disagreed with served URLs (sitemap + redirect cluster)

- **Observation:** Semrush 2026-09-15: 11 incorrect sitemap URLs plus 144
  temporary-redirect warnings. Sitemap listed no-slash URLs while the
  platform serves trailing-slash URLs via 307; page canonicals matched
  the sitemap, not the served URL. The repo's own SEO gate enforced the
  no-slash form (canonical-trailing-slash FAIL).
- **Outcome:** Canonical architecture flipped to trailing slash
  (normalizePath appends); nav data, literals, dynamic hrefs, crumbs,
  Tina CTA links, and Header isActive updated; gates flipped (seo
  requires slash, links gate flags no-slash route hrefs); Playwright
  expectations derive from canonicalFor; 8-case SEO failure-injection
  suite added.
- **Cause:** No-slash convention predates the Cloudflare Workers adapter;
  Workers static assets 307 no-slash route URLs, and nobody re-examined
  the convention after the platform change (same class as AL-026).
- **Counterexample:** File URLs (assets, sitemap.xml, robots.txt) and the
  root keep non-slash form; fragments/queries are judged on path only.
- **Rule:** Canonical must equal served URL — verify with live HTTP, not
  convention; any adapter/hosting change re-opens the slash question.
- **Verified-by:** live /players 307 vs /players/ 200, rebuilt sitemap
  all-slash, links gate 749 checked zero drift, SEO PASS, production
  smoke post-merge.
- **Status:** VERIFIED.

## AL-029 -- loading=lazy on hidden/chrome imagery hangs capture harness

- **Observation:** Adding loading="lazy" to the off-canvas drawer crest
  hung homepage-delivery's decode wait (never intersects while closed,
  onload never fires, 30s timeout, CI + local repro). Lazy on footer
  chrome risked empty boxes in assertion-free review captures.
- **Outcome:** Reverted both; chrome imagery stays eager by convention.
  Below-fold SEOmator lazy warnings on tiny crests accepted as-is.
- **Cause:** loading=lazy defers fetch until intersection; hidden
  elements never intersect; the harness waits for every incomplete
  image.
- **Counterexample:** Content images below the fold on scrolled pages
  (ClubIntro i>0, galleries) safely use lazy — the scroll-walk reaches
  them. Only never-intersecting (drawer) and review-artifact chrome
  must stay eager.
- **Rule:** Never lazy-load imagery inside hidden/off-canvas chrome;
  keep header/drawer/footer brand marks eager unless a capture-spec
  run proves otherwise.
- **Verified-by:** CI failure + local repro, revert, motion/seo specs
  27/27 local green.
- **Status:** VERIFIED.

## AL-030 -- Eager roster grids fetched 59 images on one page load

- **Observation:** /players/ fetched 66 requests / 59 images on initial
  load; SquadCard photos had no loading attribute (browser-default
  eager). ~497KB roster thumbs + 1.9MB Uppsala squad competed with
  critical resources on content-heavy routes.
- **Outcome:** loading="lazy" on SquadCard photos (single choke point
  via SquadGrid: covers /players and /franchises/uppsala-tigers).
  Measured: 66/59 down to 40/31 initial requests/images, LCP unchanged
  (banner, 244ms). LCP-critical imagery (hero, banner, portrait) and
  chrome stay eager; hidden-chrome lazy stays forbidden (AL-029).
- **Cause:** Card component authored without loading policy; grid scale
  (40+ photos) made the default expensive.
- **Counterexample:** Above-fold card imagery and LCP candidates keep
  eager + fetchpriority; lazy is for below-fold grids only.
- **Rule:** Every image rendered in a grid/list of more than a viewport
  carries loading="lazy" unless it is the page LCP.
- **Verified-by:** request/image-count probe before/after, LCP
  unchanged, pages.spec attribute assertions unaffected, deploy:verify
  green.
- **Status:** VERIFIED.

## AL-031 -- CSS weight budget overrun from duplicated scoped motion

- **Observation:** Hero field-geometry experiment (two new CSS classes +
  two keyframes + gradient hairline) pushed CSS total 79.2KB -> 84.6KB
  (80KB limit FAIL) on first build. Perf gate sums every css file in
  dist/client/_astro (Footer 34KB + index/_name duplicates) so a
  per-component scoped block is counted twice. Minimal positioning
  alone still left 80.8KB FAIL.
- **Outcome:** Reuse existing ukbt-hero-rise keyframe via inline
  animation style (no new @keyframes), replace gradient with solid
  accent 22% opacity, remove bridge scope + legacy .ukbt-about__image
  dead rules. Result 79.9KB/80KB PASS, visual premium preserved via
  SVG geometry (6 elements, 70%/45% mobile) + hairline continuity.
  Global reduced-motion kill (0.01ms !important) already covers inline
  animations — no per-component media query needed.
- **Cause:** Scoped CSS duplication doubles cost; gradient color-mix
  strings and new keyframes are byte-heavy relative to 0.9KB headroom.
- **Counterexample:** When headroom is ample, scoped duplicates are
  harmless — the cost is proportional to how close the budget is to
  the limit. New keyframes are fine if they replace an existing one.
- **Rule:** With <2KB headroom, add motion via (1) reuse of existing
  tokens/keyframes, (2) inline token-driven animation styles, (3) removal
  of dead scoped rules in the same change; never emit new gradients or
  keyframes without first measuring dist css total.
- **Verified-by:** buildbefore 84.6KB -> after 79.9KB, perf PASS,
  motion 8/8 PASS, probe settled 1 running (crossfade only), live
  production 57221B HTML smoke PASS.
- **Status:** VERIFIED.

## AL-032 -- Trailing-slash admin origin silently breaks Tina bridge

- **Observation:** Production baked
  `const adminOrigin = ["https://ukbanglatigers.co.uk/"]` (trailing
  slash from Cloudflare Build var). Bridge `isFromAdmin` uses strict
  `includes(event.origin)` with no normalization; `event.origin` never
  carries a slash, so every inbound editor message was rejected and
  outbound `postMessage` targeted an invalid origin (dropped). Source:
  `@tinacms/astro@0.7.0` `src/internal/admin-origin.ts` (split/trim
  only) + `@tinacms/bridge` `dist/index.js` (`init` defaults to
  `window.location.origin`; `isFromAdmin` requires exact match +
  `event.source === window.parent`).
- **Outcome:** Dashboard var normalized to bare
  `https://ukbanglatigers.co.uk`; redeploy baked the correct value on
  `/`, `/about/`, `/faq/` (curl-verified). Same-origin does NOT
  require the var (default covers it); a wrong value actively breaks
  editing, so never set it to `https://app.tina.io`.
- **Cause:** Env value treated as opaque string; origins compared by
  strict equality; no trailing-slash handling anywhere in the chain.
- **Counterexample:** Bare-origin value behaves identically to unset
  in same-origin topology -- the pin is documentation, not function.
- **Rule:** Origin-valued env vars must be stored and asserted without
  trailing slash; verify via baked `const adminOrigin` in served HTML,
  never via dashboard display alone.
- **Verified-by:** live HTML grep pre/post redeploy, package source
  read, browser topology probe (`/admin/` top-level, same origin).
- **Status:** VERIFIED.

## AL-033 -- Scoped _headers CSP block cannot relax global policy

- **Observation:** Added `/admin/*` `_headers` block with `data:`
  font/img to fix admin bundle blockage. Production served TWO
  `Content-Security-Policy` headers (global + scoped); browsers enforce
  their intersection, so the relaxation was a verified no-op
  (font-src violations persisted live).
- **Outcome:** Reverted the scoped block (PR #91); global policy
  unchanged. Admin `data:` font/logo errors accepted as cosmetic,
  pre-existing limitation. Never broaden global CSP for editor
  cosmetics.
- **Cause:** Cloudflare emits every matching `_headers` rule as a
  separate header; multiple CSP headers intersect (most restrictive
  wins). A second policy can only ever tighten.
- **Counterexample:** Scoped blocks work for *adding* headers
  (e.g. Cache-Control) or *tightening*; only relaxation is
  impossible this way.
- **Rule:** Verify header changes against live response headers
  (count CSP instances), not against file content or local gates
  (check-security reads only the first CSP line).
- **Verified-by:** live header count 2 -> fix attempt -> still
  blocked -> revert -> live header count 1; PR #91 green.
- **Status:** VERIFIED.

## AL-034 -- New TinaIsland registrations duplicate scoped CSS

- **Observation:** Registering `aboutHero/aboutStory/aboutLeadership`
  islands pushed clean-build cssTotal 88KB -> 93.6KB (budget FAIL).
  Island components' scoped styles ship once in page CSS and again in
  the Tina island chunk (same mechanism as the earlier FAQSection
  +5.2KB island extraction).
- **Outcome:** Sanctioned budget re-approval 88 -> 96KB with measured
  justification + failure-injection fixture 89 -> 97KB (PR #90); local
  clean build reproduced CI byte-for-byte (93.6KB).
- **Cause:** Per-component scoped CSS counted twice by design of the
  island architecture; cost is structural, not a regression.
- **Counterexample:** Unregistered islands 404 on bridge re-render --
  the CSS cost buys correct editing and cannot be designed away at
  component level.
- **Rule:** Every new TinaIsland registration must be followed by a
  clean-build cssTotal measurement; budget changes follow the
  re-approval chain in `check-perf.mjs`, never drive-by edits, and the
  injection fixture must move in the same commit.
- **Verified-by:** clean local build = CI value; PERF_STATUS PASS;
  injection 8/8 PASS; PR #90 green.
- **Status:** VERIFIED.

## AL-035 -- AxeBuilder has .exclude(), not .excluding()

- **Observation:** L4 admin axe fix chained `.excluding('.bg-tina-orange-dark')`;
  CI Playwright failed `TypeError: (intermediate value).withTags(...).excluding
  is not a function`. Installed `@axe-core/playwright@4.13.0`
  `dist/index.js:61` defines `exclude(selector)`.
- **Cause:** Method name invented from the axe-core (non-Playwright)
  API memory instead of reading the installed package.
- **Rule:** Verify chained test-API names against the installed
  `node_modules` dist before pushing, not from memory.
- **Verified-by:** `Select-String exclude(selector` hit in installed
  dist; biome clean; next CI run green.
- **Status:** VERIFIED.

## AL-036 -- E2E pins on CMS-editable copy rot on first save

- **Observation:** `R-GATE-02` asserted headline fragments
  (`not just` / `a team.`); the headline is Tina-editable and changed
  via a real Save (`fbf05f2`), so the pin would break post-merge
  regardless of the static-server issue.
- **Cause:** Pinning exact marketing copy that the CMS is designed to change.
- **Rule:** Pins on CMS-editable regions assert stable markers
  (`data-tina-island`, eyebrow constants) + absence-of-corruption
  (`[object Object]`) — never exact editable wording.
- **Verified-by:** PR #96 CI green after replacement.
- **Status:** VERIFIED.

## AL-037 -- Live-route pins fail on static preview servers

- **Observation:** 8 `tina-protocol` tests POST `/tina-island/*`
  expecting 200/403; CI serves `dist/client/` statically
  (`serve-static.mjs`), so the on-demand Worker route 404s there by
  design (dev + production serve it; T3 matrix + smoke own that coverage).
- **Cause:** Asserting server behavior the CI harness never provides.
- **Rule:** Probe once per worker (`page.request`, cached); `test.skip`
  with reason where the route is absent; keep live coverage owned
  explicitly elsewhere. Never weaken the live assertion to fit CI.
- **Verified-by:** PR #96 Playwright pass; R-GATE-01 still asserts 403
  where the route is live.
- **Status:** VERIFIED.

## AL-038 -- Runner-egress challenge is not a user-facing outage

- **Observation:** Post-deploy smoke FAILed all 6 paths (`403
  mitigated=challenge`, `Just a moment...`) from the GH runner while
  production returned 200 externally (homepage incl. new headline,
  `/about`, `/admin/`). Retry failed identically in 9s: standing
  policy, not transient.
- **Cause:** Cloudflare challenges runner-egress IPs; smoke runs from
  that egress.
- **Rule:** On smoke FAIL, first re-probe from an independent vantage
  (external fetch) before touching code; attach `ray/server/mitigated`
  forensics (PR #100) and escalate the rule name via dashboard
  Security Events. Never relax smoke or protection to fit the runner.
- **Verified-by:** external 200s vs runner 403s, same window; final
  closeout `20260923-final-closeout.md`.
- **Status:** VERIFIED.

### AL-039: PowerShell Argument Tokenization on `gh pr create --body`

- **Observation:** `gh pr create` fails with `unknown arguments [...] please quote all values that have spaces`.
- **Cause:** PowerShell parses unquoted or complex multi-line markdown strings containing quotes, hyphens, and escape characters before passing them to native binaries (`gh.exe`).
- **Rule:** When creating PRs from PowerShell, use `--fill` (inheriting git commit metadata) or write the PR body to a temporary markdown file and pass `--body-file <path>` (or `-F <path>`), rather than inline multi-line `--body` strings.
- **Verified-by:** PR #102 creation with `--fill`.
- **Status:** VERIFIED.

### AL-040 — PowerShell background jobs are reaped; use a Scheduled Task for a persistent local server

- **Observation:** `Start-Job { node serve-static.mjs }` served 200 within
  the turn but every job was gone (`Get-Job` empty, port closed) by the
  next turn — repeatedly, across five restarts.
- **Outcome:** registered Scheduled Task `UKBT-Preview` (user account,
  `node <repo>/apps/web/tests/serve-static.mjs`, started on demand via
  `Start-ScheduledTask`) — survives turns; verified 200 after.
- **Cause:** harness-scoped background jobs die with the turn; only
  session-external processes (MCP servers, Task Scheduler) persist.
- **Counterexample:** jobs still fine for in-turn background work
  (build-then-probe in one command); persistence need is the trigger.
- **Rule:** when a local server must outlive the turn, register it as a
  Scheduled Task (or equivalent session-external runner) instead of
  `Start-Job`; note its stop/remove commands alongside the URL.
- **Verified-by:** 200 from `http://127.0.0.1:4321/players/` served by
  the task after the registering turn ended.
- **Status:** PROVISIONAL.

### AL-041 — schtasks.exe cannot take spaced paths; use the ScheduledTask cmdlets

- **Observation:** `schtasks /create /tr` with a spaced repo path failed
  with `Invalid argument/option` — PowerShell-to-native quoting mangled
  the path.
- **Outcome:** `New-ScheduledTaskAction -Execute node -Argument
  '"<full spaced path>"'` + `Register-ScheduledTask` worked first
  try; same class of fix as AL-039.
- **Cause:** legacy CLIs re-parse the command line; embedded quotes do
  not survive two parsing layers.
- **Counterexample:** spaceless paths work with schtasks; but cmdlets
  are strictly safer regardless.
- **Rule:** prefer `New-ScheduledTaskAction` / `Register-ScheduledTask`
  over `schtasks.exe` whenever a path may contain spaces.
- **Verified-by:** `UKBT-Preview` registered and running.
- **Status:** PROVISIONAL.

### AL-042 — Component scripts that bind at load go dead after a ClientRouter navigation

- **Observation:** homepage slideshow dots worked on fresh entry but did
  nothing after navigating to another page and back; same signature as
  the earlier mobile-hamburger death (fixed by delegation). `SquadGrid`
  filters share it — worse: the `data-squad-ready` gate means the filter
  buttons stay hidden, not just inert.
- **Outcome:** open — fix plan `docs/superpowers/plans/ukbt-clientrouter-rewire.md`.
- **Cause:** Astro bundled `<script>` runs once per document load;
  `<ClientRouter />` swaps `<body>` without reload and never re-runs
  already-executed scripts, so listeners bound directly to swapped-out
  elements point at detached nodes. (`Header.astro` and the
  `BaseLayout` motion controller already carry the proofed pattern:
  document-delegated handlers + `window.__ukbt*Wired` once-guard +
  `astro:page-load` re-init / `astro:after-swap` reset.)
- **Counterexample:** document-level delegation and `astro:*`
  lifecycle listeners survive swaps by construction — only direct
  per-element binding at load is affected.
- **Rule:** every component `<script>` must assume its DOM will be
  swapped: re-query per event or re-init on `astro:page-load` behind a
  window once-guard; never cache element references at load. Audit all
  five scripts (Header, BaseLayout x2, ClubIntro, SquadGrid) when
  touching any one.
- **Verified-by:** code-reading + in-repo comments documenting the same
  mechanism (Header.astro:169-179, BaseLayout.astro:172-178); Playwright
  repro spec ships with the fix plan.
- **Status:** PROVISIONAL.

