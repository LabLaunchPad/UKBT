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
  // (href is the canonical trailing-slash form — see navigation-data.ts.)
  await page.locator('.ukbt-header__nav a[href="/about/"]').click();
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
  // (The grid root carries the id itself — and the officials instance
  // inherits the same default id — so this takes the first #squad.)
  const grid = page.locator('#squad').nth(0);
  const count = grid.locator('[data-squad-count]');
  await expect(grid, 'filters armed on fresh load').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  await grid.locator('[data-filter="p"]').click();
  const freshCount = await count.textContent();
  expect(freshCount, 'photo filter narrows the roster').toContain('50 of 58');
  await page.locator('.ukbt-header__nav a[href="/about/"]').click();
  await expect(page, 'landed on about via client nav').toHaveURL(/\/about/);
  await page.locator('.ukbt-header__nav a[href="/players/"]').click();
  await expect(page, 'back on players via client nav').toHaveURL(/\/players\//);
  await expect(grid, 'filters re-armed after navigation').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  await grid.locator('[data-filter="n"]').click();
  const postNavCount = await count.textContent();
  expect(postNavCount, 'monogram filter works post-navigation').toContain(
    '8 of 58',
  );
  await context.close();
});
