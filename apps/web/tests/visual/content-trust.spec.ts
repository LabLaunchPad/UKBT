import { expect, test } from '@playwright/test';

/**
 * REM-004 allowed-path suite — the trust boundary preserves legitimate flows:
 * CMS presentation copy renders; gated facts reach HTML + JSON-LD; Tina
 * values never enter structured data. Fails if the boundary breaks either
 * direction (allowed path blocked, or Tina leaking into JSON-LD).
 */

test('homepage meta description renders (allowed editorial path)', async ({
  page,
}) => {
  await page.goto('/');
  const desc = await page
    .locator('meta[name="description"]')
    .getAttribute('content');
  expect(desc, 'meta description present').toBeTruthy();
  expect((desc || '').length).toBeGreaterThan(20);
});

test('JSON-LD carries gated founding fact, never the CMS snippet', async ({
  page,
}) => {
  await page.goto('/');
  const desc = await page
    .locator('meta[name="description"]')
    .getAttribute('content');
  const ldTexts = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => e.textContent || ''));
  expect(ldTexts.length).toBeGreaterThan(0);
  const ld = ldTexts.join(' ');
  expect(ld, 'founding fact present in JSON-LD').toContain('2020');
  // Boundary assertion: the CMS-owned snippet must not leak into graphs.
  if (desc && desc.length > 0) {
    expect(ld, 'CMS snippet absent from JSON-LD').not.toContain(desc);
  }
});

test('whyChooseUs editorial cards render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ukbt-chooseus__item').first()).toBeVisible();
});

test('FAQ answers render as inert paragraphs (allowed editorial path)', async ({
  page,
}) => {
  await page.goto('/faq/');
  const answers = page.locator('.ukbt-faq-answer');
  expect(await answers.count()).toBeGreaterThan(0);
  expect(await page.locator('.ukbt-faq-answer script').count()).toBe(0);
  // Answers may render as <p> (TinaMarkdown) or inert fallback; at least
  // ensure the slots are not empty.
  const html = await answers.first().innerHTML();
  expect(html.trim().length).toBeGreaterThan(0);
});
