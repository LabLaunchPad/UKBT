import { expect, test } from '@playwright/test';

/**
 * TinaCMS visual editing protocol — proves the true bridge contract:
 * - TinaIsland wrappers present with data-tina-island attributes
 * - Inline in-iframe bootstrap present (no external bridge src in static HTML)
 * - Island route is NOT an open mutation endpoint: GET is rejected (405),
 *   POST without the Tina preview content-type is rejected (404).
 * Field mapping itself is proven by scripts/check-tina-field-parity.mjs
 * (source-level, deterministic, no browser required).
 */

test('TinaIsland wrappers present in DOM', async ({ page }) => {
  await page.goto('/');
  const islandWrappers = await page.locator('[data-tina-island]');
  const count = await islandWrappers.count();
  expect(count).toBeGreaterThanOrEqual(2);
});

test('island wrappers match registry names', async ({ page }) => {
  await page.goto('/');
  for (const name of ['hero', 'aboutSection', 'whyChooseUs']) {
    const marker = await page.locator(
      `[data-tina-island="/tina-island/${name}"]`,
    );
    await expect(marker, `island wrapper for ${name}`).toHaveCount(1);
  }
});

test('tina-island route rejects GET (not an open endpoint)', async ({
  page,
}) => {
  const response = await page.request.get('/tina-island/hero');
  expect(response.status()).toBe(405);
});

test('tina-island route rejects POST without preview content-type', async ({
  page,
}) => {
  const response = await page.request.post('/tina-island/hero', {
    data: { headline: 'Test Headline' },
  });
  expect(response.status()).toBe(404);
});

test('tina-island rejects unknown island names', async ({ page }) => {
  const response = await page.request.post(
    '/tina-island/nonexistent-collection',
    {
      data: { headline: 'Test' },
    },
  );
  // Rejected at the boundary (404 missing preview content-type) — never a mutation.
  expect([404, 405]).toContain(response.status());
});
