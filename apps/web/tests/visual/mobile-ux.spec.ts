import { expect, test } from '@playwright/test';

/**
 * Mobile-only UX regression suite (component-scoped visual QA, 2026-08-27).
 *
 * WHY THIS EXISTS SEPARATELY FROM `viewports.ts`:
 * `contracts/VISUAL-REGRESSION-CONTRACT.md`'s frozen matrix stops at
 * 390x844 — its narrowest width. A real page-level horizontal scroll on
 * /club-captain existed only at 320px and 360px, so the frozen matrix
 * could not see it. Widening that matrix is a contract amendment, not a
 * test-file edit, so these narrow widths live here instead and the frozen
 * file is left untouched.
 *
 * Every assertion below encodes a defect that was measured in a real
 * browser before it was fixed — none is a hypothetical.
 */

// Narrow real-device widths. 320 = iPhone SE 1 / small Android, the
// narrowest width still in meaningful use; 360 = the most common Android.
const NARROW = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x800', width: 360, height: 800 },
];

const ALL_ROUTES = [
  '/',
  '/about',
  '/club-captain',
  '/players',
  '/franchises',
  '/franchises/uppsala-tigers',
  '/tournaments',
  '/news',
  '/contact',
  '/faq',
  '/join',
  '/membership',
  '/services',
  '/coaching',
  '/community',
  '/404',
];

for (const vp of NARROW) {
  for (const route of ALL_ROUTES) {
    test(`no horizontal overflow on ${route} at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        if (de.scrollWidth <= de.clientWidth + 1) return null;
        const vw = de.clientWidth;
        // Report the culprit, ignoring anything a scrollable/clipping
        // ancestor already contains by design (e.g. the stats table).
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.right <= vw + 1) continue;
          let contained = false;
          for (let a = el.parentElement; a; a = a.parentElement) {
            if (
              ['auto', 'scroll', 'hidden', 'clip'].includes(
                getComputedStyle(a).overflowX,
              )
            ) {
              contained = true;
              break;
            }
          }
          if (contained) continue;
          return `${el.tagName.toLowerCase()}.${String(el.className || '')} right=${Math.round(r.right)} vw=${vw}`;
        }
        return `scrollWidth ${de.scrollWidth} > clientWidth ${de.clientWidth}`;
      });
      expect(overflow, `horizontal overflow at ${vp.name}`).toBeNull();
    });
  }
}

/**
 * WCAG 2.5.8 Target Size (Minimum), level AA: 24x24 CSS px. These link
 * groups are pure navigation — every one measured as a bare ~19px line
 * box (and the one-character "X" social link only 11px wide).
 */
const TARGET_GROUPS = [
  { route: '/', selector: '.ukbt-footer__links a', label: 'footer nav links' },
  {
    route: '/',
    selector: '.ukbt-footer__social-icon',
    label: 'footer social icons',
  },
  { route: '/', selector: '.ukbt-hero__social a', label: 'hero social links' },
  {
    route: '/',
    selector: '.ukbt-about-cta__social a',
    label: 'about-CTA social links',
  },
  {
    route: '/',
    selector: '.ukbt-tournament-cta__link',
    label: 'tournaments CTA link',
  },
  {
    route: '/',
    selector: '.ukbt-captain__link',
    label: 'captain profile link',
  },
  {
    route: '/about',
    selector: '.ukbt-breadcrumb a',
    label: 'breadcrumb links',
  },
];

for (const group of TARGET_GROUPS) {
  test(`${group.label} meet the 24px WCAG 2.5.8 target-size floor at 390x844`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(group.route);
    const undersized = await page.evaluate((sel) => {
      const bad: string[] = [];
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.width < 24 || r.height < 24) {
          bad.push(
            `"${(el as HTMLElement).innerText.trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
        }
      }
      return bad;
    }, group.selector);
    expect(undersized, `${group.label} below 24x24`).toEqual([]);
  });
}

/**
 * The header's nav-drawer toggle/close controls are icon-only buttons,
 * not text links — held to the 44x44 HIG/Material recommendation, not
 * just WCAG 2.5.8's 24px floor the TARGET_GROUPS above check. Found by a
 * mobile touch-target sweep (2026-08-27): both measured under 44px on
 * every route (toggle 50x36, close 36x36) despite being the single
 * most-used mobile interactive element on the site.
 */
const ICON_BUTTONS = [
  {
    selector: '#ukbt-nav-toggle',
    label: 'nav drawer toggle',
    requiresOpen: false,
  },
  {
    selector: '#ukbt-nav-close',
    label: 'nav drawer close',
    requiresOpen: true,
  },
];

for (const btn of ICON_BUTTONS) {
  test(`${btn.label} meets the 44x44 touch-target minimum at 390x844`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    if (btn.requiresOpen) {
      await page.click('#ukbt-nav-toggle');
      await page.waitForTimeout(400);
    }
    const box = await page.locator(btn.selector).boundingBox();
    expect(box, `${btn.label} not found/rendered`).not.toBeNull();
    const { width, height } = box ?? { width: 0, height: 0 };
    expect(width, `${btn.label} width`).toBeGreaterThanOrEqual(44);
    expect(height, `${btn.label} height`).toBeGreaterThanOrEqual(44);
  });
}

test('no rendered text falls below the 12px legibility floor at 390x844', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/tournaments', '/franchises']) {
    await page.goto(route);
    const tiny = await page.evaluate(() => {
      const bad: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        let own = '';
        for (const n of el.childNodes)
          if (n.nodeType === 3) own += n.textContent;
        if (own.trim().length < 2) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const fs = Number.parseFloat(cs.fontSize);
        if (fs < 12) bad.push(`${fs}px "${own.trim().slice(0, 30)}"`);
      }
      return bad;
    });
    expect(tiny, `sub-12px text on ${route}`).toEqual([]);
  }
});

test.describe('mobile nav drawer behaves as the modal it declares itself to be', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.click('#ukbt-nav-toggle');
    await page.waitForTimeout(500);
  });

  test('locks background scroll while open', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(300);
    // Without a lock this measured scrollY 700 — the page moved silently
    // under the overlay while the menu stayed pinned.
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  });

  test('contains Tab focus, matching its aria-modal="true" promise', async ({
    page,
  }) => {
    // Tab well past the link count; focus must never leave the drawer.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const drawer = document.getElementById('ukbt-nav-drawer');
        return drawer ? drawer.contains(document.activeElement) : false;
      });
      expect(inside, `focus escaped the drawer on Tab #${i + 1}`).toBe(true);
    }
  });

  test('Escape closes it and returns focus to the toggle', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(() => ({
        expanded: document
          .getElementById('ukbt-nav-toggle')
          ?.getAttribute('aria-expanded'),
        focused: document.activeElement?.id,
        bodyOverflow: document.body.style.overflow,
      })),
    ).toEqual({
      expanded: 'false',
      focused: 'ukbt-nav-toggle',
      bodyOverflow: '',
    });
  });
});

test('horizontally scrollable stats table is reachable by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/club-captain');
  // The page carries two of these (Batting and Bowling) — both must be
  // operable. The table is intentionally wider than a phone (score
  // columns must not wrap), so the region has to be usable without a
  // drag gesture — WCAG 2.1.1 Keyboard.
  const wraps = page.locator('.ukbt-stats-table-wrap');
  const count = await wraps.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const wrap = wraps.nth(i);
    await expect(wrap).toHaveAttribute('tabindex', '0');
    await expect(wrap).toHaveAttribute('role', 'region');
    await expect(wrap).toHaveAttribute('aria-label', /.+/);

    await wrap.evaluate((el: HTMLElement) => el.focus());
    for (let k = 0; k < 12; k++) await page.keyboard.press('ArrowRight');
    const scrolled = await wrap.evaluate((el: HTMLElement) => el.scrollLeft);
    expect(
      scrolled,
      `arrow keys must scroll table region #${i + 1}`,
    ).toBeGreaterThan(0);
  }
});
