import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { VIEWPORT_MATRIX } from './viewports.js';

/**
 * Stage 7 About Us (artifacts/pages/ABOUT-CONTRACT.md acceptance
 * criteria). Real, executing checks — not asserted.
 */

test('axe-core scan reports zero violations on the About Us page', async ({
  page,
}) => {
  await page.goto('/about');
  // Settle reveals/transitions before scanning (same rationale as
  // homepage.spec.ts: mid-flight opacity blends into bogus ~1.01
  // ratios — this exact footer signature failed on CI).
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => {
      const slideshow = new Set(
        document.querySelector('.ukbt-hero__bg--alt')?.getAnimations() ?? [],
      );
      return (
        Array.from(document.querySelectorAll('[data-motion="reveal"]')).every(
          (el) => el.classList.contains('is-visible'),
        ) &&
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState === 'finished' ||
              a.playState === 'idle' ||
              slideshow.has(a),
          )
      );
    },
    null,
    { timeout: 15000 },
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  if (results.violations.length > 0) {
    console.log(JSON.stringify(results.violations, null, 2));
  }
  expect(
    results.violations,
    `axe violations: ${results.violations.map((v) => v.id).join(', ')}`,
  ).toEqual([]);
});

test('mobile nav toggle works on the About Us page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  const toggle = page.locator('.ukbt-header__toggle');
  await expect(toggle).toBeVisible();
  // Below the collapse breakpoint the nav becomes an off-canvas drawer
  // (reference `.sidebar`), not an inline expansion — assert the drawer.
  const drawerLink = page.locator('.ukbt-header__drawer-menu a').first();
  await expect(drawerLink).not.toBeInViewport();
  await toggle.click();
  await expect(drawerLink).toBeInViewport();
});

test('no content-contamination strings appear anywhere in the rendered About Us page', async ({
  page,
}) => {
  await page.goto('/about');
  const html = await page.content();
  const forbidden = [
    'Adelux',
    'Padel Club',
    'Fox Creation',
    'Nipo Khadem',
    'Nipo',
  ];
  for (const term of forbidden) {
    expect(
      html.includes(term),
      `forbidden term "${term}" found in rendered HTML`,
    ).toBe(false);
  }
});

test('excluded images are never referenced by the built About Us page', async ({
  page,
}) => {
  await page.goto('/about');
  const html = await page.content();
  const excluded = [
    'home-hero.webp',
    'join-us.webp',
    // gallery-06.webp REMOVED from this list 2026-09-11: owner explicitly
    // confirmed it depicts a UKBT team/event photo (overrides
    // EV-20260826-030 §4 for this file) and directed it as the About
    // banner background. Explicit re-approval, not a weakening.
    'nordic-smash-slide.webp',
  ];
  for (const file of excluded) {
    expect(
      html.includes(file),
      `excluded asset "${file}" referenced in rendered HTML`,
    ).toBe(false);
  }
});

test('leadership imagery is limited to the owner-authorised portraits', async ({
  page,
}) => {
  await page.goto('/about');
  // Owner direction 2026-09-11: the management-team graphic and the
  // standalone spotlights are removed; each roster card carries its
  // member's cleared portrait instead (Chowdhury via founder-trophy,
  // Ratan EV-20260911-001, Sayem EV-20260910-001). Exactly this set
  // renders — nothing else, no unconfirmed photos.
  const html = await page.content();
  expect(
    html.includes('management-team.webp'),
    'management-team graphic must not render anymore',
  ).toBe(false);
  expect(
    await page.locator('.ukbt-leadership__spotlight').count(),
    'no standalone spotlight blocks remain',
  ).toBe(0);
  const cardImgs = page.locator('.ukbt-leadership__card img');
  await expect(cardImgs).toHaveCount(3);
  await expect(cardImgs.nth(0)).toHaveAttribute('src', /founder-trophy\.webp$/);
  await expect(cardImgs.nth(1)).toHaveAttribute(
    'src',
    /shahidul-alam-ratan\.webp$/,
  );
  await expect(cardImgs.nth(2)).toHaveAttribute('src', /sayem-rahman\.jpg$/);
});

test('no horizontal overflow on the About Us page at any frozen viewport', async ({
  page,
}) => {
  for (const size of VIEWPORT_MATRIX) {
    await page.setViewportSize(size);
    await page.goto('/about');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(
      scrollWidth,
      `horizontal overflow at ${size.width}x${size.height}`,
    ).toBeLessThanOrEqual(clientWidth);
  }
});

test('leadership title precedes cards in DOM order', async ({
  page,
  browser,
}) => {
  await page.goto('/about/');
  const order = await page
    .locator('.ukbt-leadership > *')
    .evaluateAll((els) => els.map((e) => e.className));
  expect(order[0]).toMatch(/title/);
  expect(order[1]).toMatch(/cards/);
  // Mobile visual order (stacked layout ≤1025px): title above cards.
  const mobileContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4321',
    viewport: { width: 390, height: 844 },
  });
  try {
    const mobile = await mobileContext.newPage();
    await mobile.goto('/about/');
    const [titleTop, cardsTop] = await mobile
      .locator('.ukbt-leadership__title, .ukbt-leadership__cards')
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect(titleTop).toBeLessThan(cardsTop);
  } finally {
    await mobileContext.close();
  }
});

test('leadership heading precedes leader names in the heading sequence', async ({
  page,
}) => {
  await page.goto('/about/');
  const seq = await page
    .locator('main h2, main h3')
    .evaluateAll((els) =>
      els.map(
        (e) => e.tagName + ':' + (e.textContent || '').trim().slice(0, 20),
      ),
    );
  const titleIdx = seq.findIndex((s) => s.includes('Meet the People'));
  const firstLeader = await page
    .locator('.ukbt-leadership h3')
    .first()
    .evaluate((e) => 'H3:' + (e.textContent || '').trim().slice(0, 20));
  expect(titleIdx).toBeGreaterThan(-1);
  expect(seq.indexOf(firstLeader)).toBeGreaterThan(titleIdx);
});

test('about section titles sit at h2 with no orphan caption headings', async ({
  page,
}) => {
  await page.goto('/about/');
  await expect(page.locator('.ukbt-about-cta__headline')).toHaveCount(1);
  expect(
    await page.locator('.ukbt-about-cta__headline').evaluate((e) => e.tagName),
  ).toBe('H2');
  const seq = await page
    .locator('main h1, main h2, main h3')
    .evaluateAll((els) => els.map((e) => e.tagName));
  // Reconciled 2026-09-29 (Task 2): brief's verbatim array placed the
  // leadership H2 AFTER the 3 leader H3s (pre-Task-1 cards-first order).
  // Task 1 committed title-first DOM order (see 'leadership title precedes
  // cards in DOM order' + 'leadership heading precedes leader names' above),
  // so the true sequence is founder H2, leadership H2, 3 leader H3s, CTA H2.
  // Same 15-entry strictness — order corrected, not weakened: the story
  // detail-caption H3 is GONE and the CTA is H2.
  expect(seq).toEqual([
    'H1',
    'H2',
    'H3',
    'H3',
    'H3',
    'H3',
    'H2',
    'H3',
    'H2',
    'H2',
    'H2',
    'H3',
    'H3',
    'H3',
    'H2',
  ]);
});
