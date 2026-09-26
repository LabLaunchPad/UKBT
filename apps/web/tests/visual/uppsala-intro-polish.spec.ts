import { test, expect } from '@playwright/test';

/**
 * TDD spec for the 2026-09-26 Uppsala intro + franchises-card polish.
 * Owner directives: (1) Nordic Smash T20 copy removed from the intro
 * section; (2) intro type set from the token-driven design system with one
 * source of truth (no literal font sizes/weights); (3) franchises index
 * card polished at all viewports. Written BEFORE the fix — red first.
 */

const INTRO = '.ukbt-franchise-intro';

test('uppsala intro carries no Nordic Smash T20 copy', async ({ page }) => {
  await page.goto('/franchises/uppsala-tigers/');
  await expect(page.locator(INTRO)).not.toContainText('Nordic Smash');
});

test('uppsala intro heading order is h1 banner then one intro h2', async ({
  page,
}) => {
  await page.goto('/franchises/uppsala-tigers/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator(`${INTRO} h2`)).toHaveCount(1);
  await expect(page.locator(`${INTRO} h2`)).toContainText('Uppsala Tigers');
});

test('uppsala intro crest keeps dimensions and a non-empty alt', async ({
  page,
}) => {
  await page.goto('/franchises/uppsala-tigers/');
  const crest = page.locator(`${INTRO} img`);
  await expect(crest).toHaveAttribute('width', '220');
  await expect(crest).toHaveAttribute('height', '220');
  const alt = await crest.getAttribute('alt');
  expect(alt).toBeTruthy();
});

test('franchises index card shows CTA and links to the detail page', async ({
  page,
}) => {
  await page.goto('/franchises/');
  const card = page.locator('.ukbt-franchise-card__link');
  await expect(card).toHaveAttribute('href', '/franchises/uppsala-tigers/');
  await expect(card.locator('.ukbt-franchise-card__cta')).toBeVisible();
  await expect(card.locator('h2')).toContainText('Uppsala Tigers');
});

test('franchises index card stacks cleanly at mobile 390px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/franchises/');
  const card = page.locator('.ukbt-franchise-card__link');
  await expect(card).toBeVisible();
  await expect(card.locator('.ukbt-franchise-card__cta')).toBeVisible();
  const body = page.locator('.ukbt-franchise-card__body');
  const box = await body.boundingBox();
  expect(box).toBeTruthy();
  // Body text column must use the full card width, not a 224px sliver.
  expect(box?.width).toBeGreaterThan(280);
});
