# ClientRouter Rewire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage slideshow dots and the squad filter buttons keep working across Astro ClientRouter navigations.

**Architecture:** Rewire the two load-bound component scripts (`ClubIntro`, `SquadGrid`) to the proofed in-repo pattern already carried by `Header.astro` and the `BaseLayout` motion controller: an `init*()` function that wires the *current* DOM, invoked immediately plus on every `astro:page-load`, with document-level listeners registered exactly once behind a `window.__ukbt*Wired` guard. A Playwright repro spec lands first (TDD) and fails on the current code.

**Tech Stack:** Astro 7 (ClientRouter view transitions), TypeScript in `.astro` `<script>`, Playwright.

**Spec:** Owner bug report 2026-09-25 (homepage slideshow dots dead after visiting another page; hamburger-menu precedent) + the Root Cause section below. There is no separate spec doc — rulings made from the report alone are provisional.

## Global Constraints

- pnpm only (`pnpm --filter @ukbt/web …`); Node ≥22, pnpm ≥10.
- Biome style: single quotes, semicolons, 2-space indent; `pnpm lint` clean.
- No new dependencies, no new routes, no contract changes.
- Reduced-motion behavior preserved exactly (slideshow stays still, motion controller untouched).
- No-JS fallbacks preserved exactly (slideshow shows slide 1, filters hidden with full roster visible).
- Inline scripts stay small — the players page lives 0.1KB under its HTML budget.
- Tina layer untouched.

## Root Cause (verified by code-reading, AL-042)

Astro bundled `<script>` executes once per document load. `<ClientRouter />` (`BaseLayout.astro:90`) turns in-site links into `<body>` swaps without a reload and never re-runs already-executed scripts. `ClubIntro.astro:302-379` and `SquadGrid.astro:127-178` both query elements and bind listeners at load, so after any away-and-back navigation their handlers point at detached nodes: dots inert, filters inert AND hidden (the `[data-squad-ready]` CSS gate at `SquadGrid.astro:196-198` never opens). `Header.astro:169-179` documents the identical hamburger failure and its fix; `BaseLayout.astro:172-178` documents the identical motion-controller failure. Second-order defects the rewire must handle: `ClubIntro` owns a `setInterval` and a document-level `visibilitychange` listener — a naive per-navigation re-run would stack intervals and leak document listeners, so the timer is stopped on `astro:before-swap` and the document listener is registered once, acting on a module-level current-root reference.

---

### Task 1: Failing repro spec (TDD red)

**Files:**
- Create: `apps/web/tests/visual/clientrouter-rewire.spec.ts`

**Interfaces:**
- Consumes: existing selectors — `.ukbt-about__slideshow [data-slide]`, `[data-dot]`, header nav link to `/about`, brand link home, `/players/` `[data-filter]`, `[data-squad-count]`, `[data-squad-ready]`.
- Produces: the red baseline Task 2–3 must turn green (no code changes here).

- [ ] **Step 1: Write the spec**

```ts
import { type Browser, expect, test } from '@playwright/test';

/**
 * ClientRouter rewire repro (AL-042): component scripts that bind at
 * load go dead after an away-and-back client navigation. Reduced-motion
 * context disables the slideshow auto-advance, keeping assertions
 * deterministic.
 */

async function reducedPage(browser: Browser) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  return { context, page };
}

test('slideshow dots survive an away-and-back navigation', async ({
  browser,
}) => {
  const { context, page } = await reducedPage(browser);
  await page.goto('/');
  const dots = page.locator('[data-dot]');
  await dots.nth(1).click();
  await expect(
    page.locator('[data-slide]').nth(1),
    'slide 2 active after dot click on fresh load',
  ).toHaveClass(/is-active/);
  // Client-side away-and-back: header About link, then brand link home.
  await page.locator('.ukbt-header__nav a[href="/about"]').click();
  await expect(page, 'landed on about via client nav').toHaveURL(/\/about/);
  await page.locator('.ukbt-header__brand').click();
  await expect(page, 'back home via client nav').toHaveURL(/\/$/);
  await page.locator('[data-dot]').nth(2).click();
  await expect(
    page.locator('[data-slide]').nth(2),
    'slide 3 active after dot click post-navigation',
  ).toHaveClass(/is-active/);
  await context.close();
});

test('squad filters survive an away-and-back navigation', async ({
  browser,
}) => {
  const { context, page } = await reducedPage(browser);
  await page.goto('/players/');
  // Scope to the #squad grid: the page renders a second (officials)
  // grid with the same component, so unscoped locators match twice.
  const grid = page.locator('#squad [data-squad-grid]');
  const count = page.locator('#squad [data-squad-count]');
  await expect(grid, 'filters armed on fresh load').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  await page.locator('#squad [data-filter="p"]').click();
  const freshCount = await count.textContent();
  expect(freshCount, 'photo filter narrows the roster').toContain('54 of 58');
  await page.locator('.ukbt-header__nav a[href="/about"]').click();
  await expect(page, 'landed on about via client nav').toHaveURL(/\/about/);
  await page.locator('.ukbt-header__nav a[href="/players/"]').click();
  await expect(page, 'back on players via client nav').toHaveURL(
    /\/players\//,
  );
  await expect(grid, 'filters re-armed after navigation').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  await page.locator('#squad [data-filter="n"]').click();
  const postNavCount = await count.textContent();
  expect(postNavCount, 'monogram filter works post-navigation').toContain(
    '4 of 58',
  );
  await context.close();
});
```

- [ ] **Step 2: Run it against the current code and confirm RED**

Run: `cmd /c "set PUBLIC_TINA_CLIENT_ID=fe5da197-2c26-4071-9d72-e8216d5b53d6 && set TINA_TOKEN=local-build-fallback && set TINA_BRANCH=main && pnpm --filter @ukbt/web exec playwright test tests/visual/clientrouter-rewire.spec.ts"`
Expected: FAIL — the two post-navigation assertions fail (dot click is a no-op; `data-squad-ready` never set). If the header link selectors do not match, fix the selectors in the spec only — never the components — and re-run to red.

- [ ] **Step 3: Commit**

```bash
git add apps/web/tests/visual/clientrouter-rewire.spec.ts
git commit -m "test(web): ClientRouter rewire repro spec (red baseline, AL-042)"
```

### Task 2: Rewire the ClubIntro slideshow

**Files:**
- Modify: `apps/web/src/components/ClubIntro.astro` (the `<script>` block only, lines ~302-379)

**Interfaces:**
- Consumes: `astro:page-load` (fires on initial load and every swap), `astro:before-swap` (timer teardown).
- Produces: working dots/slides/keyboard/auto-advance on every navigation; no stacked intervals, no duplicate document listeners.

- [ ] **Step 1: Replace the IIFE with init + lifecycle wiring**

Replace the whole `<script>` body with this shape (keep `show`/`start`/`stop` logic, the 4000ms interval, the hover/focus/visibility pauses, and the arrow-key handling verbatim — only the wiring changes):

```ts
// ClientRouter-proofed (AL-042): Astro runs this script once per
// document, but swaps the slideshow DOM on every navigation. init()
// wires the CURRENT root and runs on astro:page-load; document-level
// listeners register once and act on `current`; the timer dies on
// before-swap so navigations never stack intervals.
let current: Element | null = null;
let index = 0;
let timer: number | null = null;
const INTERVAL = 4000;

function show(n: number) { /* unchanged, reads current */ }
function start() { /* unchanged, reduceMotion check kept */ }
function stop() { /* unchanged */ }

function init() {
  stop();
  current = document.querySelector('[data-slideshow]');
  if (!current) return;
  const root = current;
  if (root.hasAttribute('data-slideshow-wired')) {
    show(0);
    start();
    return;
  }
  root.setAttribute('data-slideshow-wired', 'true');
  // ...dot click bindings, root mouse/focus/keyboard listeners (unchanged)...
  show(0);
  start();
}

const w = window as unknown as Record<string, boolean | undefined>;
if (!w['__ukbtSlideshowWired']) {
  w['__ukbtSlideshowWired'] = true;
  document.addEventListener('astro:page-load', init);
  document.addEventListener('astro:before-swap', stop);
  document.addEventListener('visibilitychange', () => {
    if (!current) return;
    if (document.hidden) stop();
    else start();
  });
}
init();
```

Note: fresh swapped-in roots never carry `data-slideshow-wired` (attributes do not survive a body swap), so the per-root flag only guards double `page-load` delivery on the same DOM — binding stays exactly-once per root.

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint` then `pnpm typecheck`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ClubIntro.astro
git commit -m "fix(web): rewire slideshow to astro:page-load (AL-042)"
```

### Task 3: Rewire the SquadGrid filters

**Files:**
- Modify: `apps/web/src/components/SquadGrid.astro` (the `<script>` block only, lines ~127-178)

**Interfaces:**
- Consumes: `astro:page-load`, same guard convention as Task 2.
- Produces: filters bound and `[data-squad-ready]` set on every navigation. No teardown needed (no timers, no document listeners — per-element clicks on fresh nodes only).

- [ ] **Step 1: Wrap the loop in init + lifecycle wiring**

Wrap the existing `for (const root of …)` body in `function init() { … }` with one addition at the top of the loop — `if (root.hasAttribute('data-squad-wired')) continue;` + `root.setAttribute('data-squad-wired', 'true');` after the `buttons.length === 0` check — then append:

```ts
const w = window as unknown as Record<string, boolean | undefined>;
if (!w['__ukbtSquadWired']) {
  w['__ukbtSquadWired'] = true;
  document.addEventListener('astro:page-load', init);
}
init();
```

Everything else (matches/apply/ready-flag) stays verbatim.

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint` then `pnpm typecheck`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/SquadGrid.astro
git commit -m "fix(web): rewire squad filters to astro:page-load (AL-042)"
```

### Task 4: Green verification + docs

**Files:**
- Modify: `docs/12-roadmap-and-open-items.md` (one entry under the roster section added 2026-09-25)

**Interfaces:**
- Consumes: Task 1 spec, Tasks 2–3 commits.
- Produces: green spec, clean gates, roadmap entry citing the CI run.

- [ ] **Step 1: Run the repro spec**

Run: same `playwright test tests/visual/clientrouter-rewire.spec.ts` command as Task 1
Expected: PASS (both tests, incl. all post-navigation assertions).

- [ ] **Step 2: Run the affected gates**

Run: `pnpm lint`, `pnpm typecheck`, `pnpm --filter @ukbt/web exec playwright test tests/visual/homepage.spec.ts tests/visual/mobile-ux.spec.ts tests/visual/motion.spec.ts`
Expected: all green (no regressions in neighboring interaction suites). Full `deploy:verify` stays the CI canonical gate — do not claim release PASS locally.

- [ ] **Step 3: Roadmap entry + commit**

Append to the roster-cards-v1 section:

```markdown
8. **ClientRouter rewire (AL-042):** slideshow dots + squad filters
   re-armed on `astro:page-load` — spec
   `tests/visual/clientrouter-rewire.spec.ts` red→green.
```

```bash
git add docs/12-roadmap-and-open-items.md
git commit -m "docs: roadmap entry for ClientRouter rewire (AL-042)"
```
