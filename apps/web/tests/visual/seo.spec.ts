import { expect, test } from '@playwright/test';
import { SEO_ROUTES, SITE } from '../../src/lib/seo';

/**
 * Production SEO contract tests — assert the built output, not source.
 * Route set comes from the central registry (`src/lib/seo.ts`), so the
 * list cannot drift from the implementation it checks.
 */

const indexable = SEO_ROUTES.filter((r) => r.indexable);
const noindexed = SEO_ROUTES.filter((r) => !r.indexable);

for (const route of indexable) {
  test(`${route.path} emits complete indexable metadata`, async ({ page }) => {
    await page.goto(route.path);

    const title = await page.title();
    expect(title.trim().length, 'non-empty title').toBeGreaterThan(0);

    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(desc?.trim().length ?? 0, 'non-empty description').toBeGreaterThan(
      0,
    );

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(canonical, 'absolute production canonical').toBe(
      `${SITE}${route.path}`,
    );

    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots ?? '', 'index robots').toContain('index');
    expect(robots ?? '', 'not noindex').not.toContain('noindex');

    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute('content');
    expect(ogUrl, 'og:url matches canonical').toBe(canonical);

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    expect(ogImage ?? '', 'absolute og:image').toMatch(/^https:\/\//);

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => el.textContent ?? ''));
    for (const block of blocks) {
      expect(() => JSON.parse(block), 'JSON-LD parses').not.toThrow();
    }
  });
}

for (const route of noindexed) {
  test(`${route.path} stays noindex with no canonical`, async ({ page }) => {
    await page.goto(route.path);
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots ?? '', 'noindex robots').toContain('noindex');
    await expect(
      page.locator('link[rel="canonical"]'),
      'no canonical on noindex URL',
    ).toHaveCount(0);
  });
}

test('indexable titles are unique', async ({ page }) => {
  const seen = new Map<string, string>();
  for (const route of indexable) {
    await page.goto(route.path);
    const title = await page.title();
    expect(
      seen.has(title),
      `duplicate title "${title}" (also on ${seen.get(title)})`,
    ).toBe(false);
    seen.set(title, route.path);
  }
});

test('sitemap lists exactly the indexable canonicals', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status(), 'sitemap serves').toBe(200);
  const xml = await res.text();
  for (const route of indexable) {
    const url = `${SITE}${route.path}`;
    const occurrences = xml.split(`<loc>${url}</loc>`).length - 1;
    expect(occurrences, `${url} appears exactly once`).toBe(1);
  }
  for (const route of noindexed) {
    expect(
      xml.includes(`<loc>${SITE}${route.path}</loc>`),
      `noindex ${route.path} excluded`,
    ).toBe(false);
  }
});

test('robots.txt references the production sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status(), 'robots.txt serves').toBe(200);
  const txt = await res.text();
  expect(txt, 'production sitemap reference').toContain(`${SITE}/sitemap.xml`);
  expect(txt, 'no localhost leakage').not.toMatch(/localhost|127\.0\.0\.1/);
});
