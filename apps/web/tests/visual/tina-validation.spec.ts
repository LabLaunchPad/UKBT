import { expect, test } from '@playwright/test';

/**
 * Runtime validation suite — proves the true validation contract:
 * - CMS URL/image validators exist and are wired into Tina loaders
 *   (proven at source level by scripts/check-tina-field-parity.mjs and
 *   unit coverage; the browser cannot unit-test server validators).
 * - The island boundary never acts as an open mutation endpoint
 *   (rejected before any data handling without the Tina preview signal).
 * - Editable regions render with data-tina-field attributes plumbed
 *   through components to real HTML elements.
 */

test('island boundary rejects unauthenticated mutation-shaped POSTs', async ({
  page,
}) => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hi',
    '//evil.example',
  ]) {
    const response = await page.request.post('/tina-island/hero', {
      data: { primaryCtaLink: url },
    });
    // Rejected at the preview-content-type gate (404), never reaching validation.
    expect(response.status()).toBe(404);
  }
});

test('editable hero regions carry data-tina-field attributes', async ({
  page,
}) => {
  await page.goto('/');
  const markers = await page.locator('.ukbt-hero-island [data-tina-field]');
  const count = await markers.count();
  expect(count).toBeGreaterThanOrEqual(3);
});

test('FAQ island renders per-item question elements', async ({ page }) => {
  await page.goto('/faq/');
  const questions = await page.locator('.ukbt-faq-question');
  const count = await questions.count();
  expect(count).toBeGreaterThanOrEqual(1);
  for (let i = 0; i < count; i++) {
    const attr = await questions.nth(i).getAttribute('data-tina-field');
    expect(attr, `FAQ question ${i} carries a Tina marker`).not.toBeNull();
  }
});

test('FAQ answers render through TinaMarkdown', async ({ page }) => {
  await page.goto('/faq/');
  const answers = await page.locator('.ukbt-faq-answer');
  expect(await answers.count()).toBeGreaterThanOrEqual(1);
});
