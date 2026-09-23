import { type Browser, expect, test } from '@playwright/test';

/**
 * Motion interaction tests — reduced-motion mode, no-JS fallback, and
 * drawer operability independent of animation. CI executes; local
 * render-verification happened during implementation (screenshots read).
 */

async function reducedContext(browser: Browser) {
  return browser.newContext({ reducedMotion: 'reduce' });
}

async function noJsContext(browser: Browser) {
  return browser.newContext({ javaScriptEnabled: false });
}

test('reduced motion: hero resolves to its final visible state', async ({
  browser,
}) => {
  const context = await reducedContext(browser);
  const page = await context.newPage();
  await page.goto('/');
  const headline = page.locator('.ukbt-hero__headline');
  await expect(headline, 'headline visible under reduced motion').toBeVisible();
  // Sweet-spot assertions: entrances resolve (opacity 1 after the short
  // fade), but nothing positional ever eases — the choreography degrades
  // to the soft fade, never the full rise.
  await page.waitForTimeout(800);
  const style = await headline.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      opacity: cs.opacity,
      transform: cs.transform,
      animationName: cs.animationName,
    };
  });
  expect(opaque(style.opacity), 'fade resolves under reduced motion').toBe(
    true,
  );
  expect(style.transform, 'no positional easing under reduced motion').toBe(
    'none',
  );
  expect(style.animationName, 'soft fade, not choreography').toContain(
    'ukbt-soft-fade',
  );
  await context.close();
});

function opaque(value: string): boolean {
  return Number(value) >= 0.99;
}

test('reduced motion: drawer still opens and closes by keyboard', async ({
  browser,
}) => {
  const context = await reducedContext(browser);
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.ukbt-header__toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  const drawerLink = page.locator('.ukbt-header__drawer-menu a').first();
  await expect(
    drawerLink,
    'drawer opens under reduced motion',
  ).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(
    drawerLink,
    'drawer closes under reduced motion',
  ).not.toBeInViewport();
  await context.close();
});

test('no-JS: hero content visible, navigation performs document loads', async ({
  browser,
}) => {
  const context = await noJsContext(browser);
  const page = await context.newPage();
  await page.goto('/');
  const headline = page.locator('.ukbt-hero__headline');
  await expect(headline, 'headline visible without JS').toBeVisible();
  // The hero load choreography is pure CSS, so it runs without JS too —
  // wait past its final keyframe (650ms delay + 400ms fade) before
  // asserting the settled state. What this test proves: nothing stays
  // hidden when the JS controller never runs.
  await page.waitForTimeout(1500);
  const opacity = await headline.evaluate((el) => getComputedStyle(el).opacity);
  expect(opaque(opacity), 'hero settles visible without JS').toBe(true);
  // Reveal utility must not hide content when the controller never runs.
  const motionClass = await page.evaluate(() =>
    document.documentElement.classList.contains('ukbt-motion-js'),
  );
  expect(motionClass, 'no arming class without JS').toBe(false);
  await page.locator('.ukbt-header__nav a[href="/about"]').click();
  await expect(page, 'document navigation works without JS').toHaveURL(
    /\/about\/?$/,
  );
  await context.close();
});

test('hero choreography settles: no infinite animation', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2500);
  const running = await page.evaluate(() => {
    const slideshow = new Set(
      document.querySelector('.ukbt-hero__bg--alt')?.getAnimations() ?? [],
    );
    return document
      .getAnimations()
      .filter((a) => a.playState === 'running' && !slideshow.has(a)).length;
  });
  // MOTION-CONTRACT.md Amendment 02 authorizes exactly one ambient
  // loop (the hero background crossfade); this asserts everything
  // ELSE settles. A scoped exemption, not a weakened gate (BL-10).
  expect(running, 'no looping animations after settle').toBe(0);
});

test('logo intro plays once: fresh visit, never on client navigation', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const introState = () =>
    page.evaluate(() => ({
      armed: document.documentElement.classList.contains('ukbt-logo-intro'),
      flag: localStorage.getItem('ukbt-logo-intro-seen'),
    }));

  // Fresh visit: intro armed, flag persisted.
  await page.goto('/');
  expect((await introState()).armed, 'intro armed on first visit').toBe(true);
  expect((await introState()).flag, 'flag persisted on first visit').toBe('1');
  // Let the 700ms intro finish before navigating.
  await page.waitForTimeout(1000);

  // ClientRouter journey: Home → About → Players → Back → Forward.
  await page.locator('.ukbt-header__nav a[href="/about"]').click();
  await expect(page, 'landed on About').toHaveURL(/\/about\/?$/);
  expect((await introState()).armed, 'no intro after client nav').toBe(false);
  await page.locator('.ukbt-header__nav a[href="/players"]').click();
  await expect(page, 'landed on Players').toHaveURL(/\/players\/?$/);
  expect((await introState()).armed, 'no intro on second nav').toBe(false);
  await page.goBack();
  await expect(page, 'back to About').toHaveURL(/\/about\/?$/);
  expect((await introState()).armed, 'no intro on Back').toBe(false);
  await page.goForward();
  await expect(page, 'forward to Players').toHaveURL(/\/players\/?$/);
  expect((await introState()).armed, 'no intro on Forward').toBe(false);

  // Hard reload: still no intro.
  await page.reload();
  expect((await introState()).armed, 'no intro on reload').toBe(false);
  await context.close();
});

test('logo intro cannot replay from a surviving html class', async ({
  browser,
}) => {
  // Forced failure mode: class present + fresh header DOM after a
  // ClientRouter swap must still produce no running intro animation.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.evaluate(() =>
    document.documentElement.classList.add('ukbt-logo-intro'),
  );
  await page.locator('.ukbt-header__nav a[href="/about"]').click();
  await expect(page, 'landed on About').toHaveURL(/\/about\/?$/);
  const state = await page.evaluate(() => {
    const brand = document.querySelector(
      '.ukbt-header__brand',
    ) as HTMLElement | null;
    const anims = brand
      ? document
          .getAnimations()
          .filter(
            (a) => (a as CSSAnimation).animationName === 'ukbt-logo-intro',
          )
      : [];
    return {
      classSurvived:
        document.documentElement.classList.contains('ukbt-logo-intro'),
      runningIntro: anims.filter((a) => a.playState === 'running').length,
      brandVisible: brand ? getComputedStyle(brand).opacity : 'missing',
    };
  });
  expect(state.classSurvived, 'swap lifecycle clears the class').toBe(false);
  expect(state.runningIntro, 'no intro animation runs after swap').toBe(0);
  expect(state.brandVisible, 'brand visible after swap').toBe('1');
  await context.close();
});

test('logo intro degrades safely when storage throws', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const throwing = () => {
      throw new Error('storage blocked');
    };
    Storage.prototype.getItem = throwing as never;
    Storage.prototype.setItem = throwing as never;
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const brand = page.locator('.ukbt-header__brand');
  await expect(brand, 'logo renders with storage blocked').toBeVisible();
  const opacity = await brand.evaluate((el) => getComputedStyle(el).opacity);
  expect(opaque(opacity), 'final logo state with storage blocked').toBe(true);
  expect(errors, 'no page-breaking errors').toEqual([]);
  await context.close();
});

test('logo intro respects reduced motion and stays keyboard-operable', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const brand = page.locator('.ukbt-header__brand');
  const animationName = await brand.evaluate(
    (el) => getComputedStyle(el).animationName,
  );
  expect(animationName, 'no logo animation under reduced motion').toBe('none');
  await expect(brand, 'logo visible under reduced motion').toBeVisible();
  await brand.focus();
  await expect(brand, 'logo stays keyboard-focusable').toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page, 'logo link still navigates home').toHaveURL(/\/$/);
  await context.close();
});
