import { type Browser, expect, type Locator, test } from '@playwright/test';

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

/**
 * F3 visibility hardening: count text alone could pass while cards stay
 * wrongly shown/hidden, so after every filter click the VISIBLE
 * (non-`hidden`) cards must equal the count text — via locator counts
 * plus `toBeVisible` on the first matched card.
 */
async function expectGridVisibility(
  grid: Locator,
  shown: number,
  total: number,
  label: string,
) {
  await expect(
    grid.locator('[data-squad-count]'),
    `count text — ${label}`,
  ).toContainText(`${shown} of ${total}`);
  await expect(
    grid.locator('.ukbt-squad-card:not([hidden])'),
    `visible cards — ${label}`,
  ).toHaveCount(shown);
  await expect(
    grid.locator('.ukbt-squad-card[hidden]'),
    `hidden cards — ${label}`,
  ).toHaveCount(total - shown);
  await expect(
    grid.locator('.ukbt-squad-card:not([hidden])').first(),
    `first matched card visible — ${label}`,
  ).toBeVisible();
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
  await expect(
    page.locator('[data-slide]').nth(1),
    'slide 2 visible after dot click on fresh load',
  ).toBeVisible();
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
  await expect(
    page.locator('[data-slide]').nth(2),
    'slide 3 visible after dot click post-navigation',
  ).toBeVisible();
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
  await expectGridVisibility(grid, 50, 58, 'photo filter on fresh load');
  // Remaining players filters, fresh load: k→5, r→17, j→3, t→20.
  await grid.locator('[data-filter="n"]').click();
  await expectGridVisibility(grid, 8, 58, 'monogram filter on fresh load');
  await grid.locator('[data-filter="k"]').click();
  await expectGridVisibility(grid, 5, 58, 'wicket-keeper filter on fresh load');
  await grid.locator('[data-filter="r"]').click();
  await expectGridVisibility(grid, 17, 58, 'all-rounder filter on fresh load');
  await grid.locator('[data-filter="j"]').click();
  await expectGridVisibility(grid, 3, 58, 'u-19 filter on fresh load');
  await grid.locator('[data-filter="t"]').click();
  await expectGridVisibility(grid, 20, 58, 'uppsala filter on fresh load');
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
  await expectGridVisibility(grid, 8, 58, 'monogram filter post-navigation');
  // Remaining players filters, post-navigation: same pins as fresh load.
  await grid.locator('[data-filter="p"]').click();
  await expectGridVisibility(grid, 50, 58, 'photo filter post-navigation');
  await grid.locator('[data-filter="k"]').click();
  await expectGridVisibility(
    grid,
    5,
    58,
    'wicket-keeper filter post-navigation',
  );
  await grid.locator('[data-filter="r"]').click();
  await expectGridVisibility(
    grid,
    17,
    58,
    'all-rounder filter post-navigation',
  );
  await grid.locator('[data-filter="j"]').click();
  await expectGridVisibility(grid, 3, 58, 'u-19 filter post-navigation');
  await grid.locator('[data-filter="t"]').click();
  await expectGridVisibility(grid, 20, 58, 'uppsala filter post-navigation');
  await context.close();
});

test('uppsala filters survive an away-and-back navigation', async ({
  browser,
}) => {
  const { context, page } = await reducedPage(browser);
  await page.goto('/franchises/uppsala-tigers/');
  // Same scoping as the players test: the officials grid below carries
  // its own unique id, so the first #squad is the 20-player squad grid.
  const grid = page.locator('#squad').nth(0);
  await expect(grid, 'filters armed on fresh load').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  // F2: the All-rounders (r) button renders from role data — assert its
  // presence first, then its 5 visible cards.
  await expect(
    grid.locator('[data-filter="r"]'),
    'all-rounders filter present on Uppsala',
  ).toBeVisible();
  await grid.locator('[data-filter="k"]').click();
  await expectGridVisibility(grid, 3, 20, 'wicket-keeper filter on fresh load');
  await grid.locator('[data-filter="j"]').click();
  await expectGridVisibility(grid, 3, 20, 'u-19 filter on fresh load');
  await grid.locator('[data-filter="r"]').click();
  await expectGridVisibility(grid, 5, 20, 'all-rounder filter on fresh load');
  // Client-side away-and-back: header About link, then history back.
  await page.locator('.ukbt-header__nav a[href="/about/"]').click();
  await expect(page, 'landed on about via client nav').toHaveURL(/\/about/);
  await page.goBack();
  await expect(page, 'back on uppsala via client nav').toHaveURL(
    /\/franchises\/uppsala-tigers\//,
  );
  await expect(grid, 'filters re-armed after navigation').toHaveAttribute(
    'data-squad-ready',
    'true',
  );
  await expect(
    grid.locator('[data-filter="r"]'),
    'all-rounders filter present post-navigation',
  ).toBeVisible();
  await grid.locator('[data-filter="k"]').click();
  await expectGridVisibility(
    grid,
    3,
    20,
    'wicket-keeper filter post-navigation',
  );
  await grid.locator('[data-filter="j"]').click();
  await expectGridVisibility(grid, 3, 20, 'u-19 filter post-navigation');
  await grid.locator('[data-filter="r"]').click();
  await expectGridVisibility(grid, 5, 20, 'all-rounder filter post-navigation');
  await context.close();
});
