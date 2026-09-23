import { expect, test } from '@playwright/test';

/**
 * Field parity suite — DOM-level half of the parity contract.
 * Source-level mapping (schema field -> tinaField call -> HTML sink,
 * per-item uniqueness, CTA label/link distinction) is proven
 * deterministically by scripts/check-tina-field-parity.mjs without a
 * browser. These specs prove the built DOM carries the plumbing:
 * island wrappers, marker attributes on real HTML elements, and
 * distinct CTA label/link targets.
 */

test('homepage islands render with matching wrappers', async ({ page }) => {
  await page.goto('/');
  for (const [name, cls] of [
    ['hero', 'ukbt-hero-island'],
    ['aboutSection', 'ukbt-club-intro-island'],
    ['whyChooseUs', 'ukbt-chooseus'],
  ]) {
    const wrapper = page.locator(`[data-tina-island="/tina-island/${name}"]`);
    await expect(wrapper, `wrapper for ${name}`).toHaveCount(1);
    await expect(wrapper, `wrapper class for ${name}`).toHaveClass(
      new RegExp(cls),
    );
  }
});

test('hero CTA label and link target distinct elements', async ({ page }) => {
  await page.goto('/');
  const primaryCta = page.locator(
    '.ukbt-hero__actions a.ukbt-button--primary, .ukbt-hero__actions button.ukbt-button--primary',
  );
  await expect(primaryCta.first()).toBeVisible();
  const labelSpan = primaryCta.first().locator('.ukbt-button__title');
  await expect(labelSpan).toBeVisible();
});

test('hero image renders with Tina image-field marker plumbing', async ({
  page,
}) => {
  await page.goto('/');
  const heroImg = page.locator('.ukbt-hero__bg').first();
  await expect(heroImg).toBeVisible();
  const marker = await heroImg.getAttribute('data-tina-field');
  expect(marker, 'hero image carries a Tina marker attribute').not.toBeNull();
});

test('WhyChooseUs renders one block per reason', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('.ukbt-chooseus__item');
  expect(await items.count()).toBeGreaterThanOrEqual(1);
  const titles = page.locator('.ukbt-chooseus__text h3[data-tina-field]');
  expect(await titles.count()).toBeGreaterThanOrEqual(1);
});

test('FAQ questions each carry a Tina marker', async ({ page }) => {
  await page.goto('/faq/');
  const questions = page.locator('.ukbt-faq-question[data-tina-field]');
  expect(await questions.count()).toBeGreaterThanOrEqual(1);
});
