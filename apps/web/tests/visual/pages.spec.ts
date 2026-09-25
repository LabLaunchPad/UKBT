import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { VIEWPORT_MATRIX } from './viewports.js';

/**
 * Stage 7 site-scale pages (Club Captain, Players Profile, Our
 * Franchises, International Tournaments/Events, Contact Us). Same
 * discipline as homepage.spec.ts/about.spec.ts — real, executing checks.
 */

const routes = [
  { path: '/club-captain', name: 'Club Captain' },
  { path: '/players', name: 'Players Profile' },
  { path: '/franchises', name: 'Our Franchises' },
  { path: '/franchises/uppsala-tigers', name: 'Uppsala Tigers' },
  { path: '/tournaments', name: 'International Tournaments/Events' },
  { path: '/contact', name: 'Contact Us' },
  // Template-mirrored routes (CLIENT_REQ_009 / ROUTE-CONTRACT Amendment 01,
  // as reduced by AMENDMENT 04 which removed /community and /coaching).
  { path: '/services', name: 'What We Do' },
  { path: '/membership', name: 'Membership' },
  { path: '/join', name: 'Join the Club' },
  { path: '/faq', name: 'FAQ' },
  { path: '/news', name: 'Club News' },
];

/**
 * ROUTE-CONTRACT Amendment 01 condition 2: the commerce-shaped shells
 * describe offerings UKBT has no evidence of, so they must not be
 * indexed. An indexed page is a public claim that the club sells the
 * thing. This asserts the condition rather than trusting it was applied.
 */
const NOINDEX_ROUTES = ['/services', '/membership', '/join'];
const INDEXABLE_ROUTES = ['/', '/about', '/faq', '/news'];

for (const route of routes) {
  test(`axe-core scan reports zero violations on ${route.name}`, async ({
    page,
  }) => {
    await page.goto(route.path);
    // Settle reveals/transitions before scanning (same rationale as
    // homepage.spec.ts: mid-flight opacity blends into bogus ~1.01
    // ratios, flaky across CI routes).
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
      `axe violations on ${route.path}: ${results.violations.map((v) => v.id).join(', ')}`,
    ).toEqual([]);
  });

  test(`no content-contamination strings appear on ${route.name}`, async ({
    page,
  }) => {
    await page.goto(route.path);
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
        `forbidden term "${term}" found on ${route.path}`,
      ).toBe(false);
    }
  });

  test(`excluded images are never referenced on ${route.name}`, async ({
    page,
  }) => {
    await page.goto(route.path);
    const html = await page.content();
    const excluded = [
      'home-hero.webp',
      'join-us.webp',
      'gallery-06.webp',
      'nordic-smash-slide.webp',
    ];
    for (const file of excluded) {
      expect(
        html.includes(file),
        `excluded asset "${file}" found on ${route.path}`,
      ).toBe(false);
    }
  });

  test(`no horizontal overflow on ${route.name} at any frozen viewport`, async ({
    page,
  }) => {
    for (const size of VIEWPORT_MATRIX) {
      await page.setViewportSize(size);
      await page.goto(route.path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        scrollWidth,
        `horizontal overflow at ${size.width}x${size.height} on ${route.path}`,
      ).toBeLessThanOrEqual(clientWidth);
    }
  });

  test(`mobile nav toggle works on ${route.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route.path);
    const toggle = page.locator('.ukbt-header__toggle');
    await expect(toggle).toBeVisible();
    // Below the collapse breakpoint the nav becomes an off-canvas drawer
    // (reference `.sidebar`), not an inline expansion — assert the drawer.
    const drawerLink = page.locator('.ukbt-header__drawer-menu a').first();
    await expect(drawerLink).not.toBeInViewport();
    await toggle.click();
    await expect(drawerLink).toBeInViewport();
  });
}

test('Uppsala Tigers roster photos are exactly the evidenced set (EV-20260831-008)', async ({
  page,
}) => {
  // Roster moved from /franchises (now a card-grid landing) to the
  // Uppsala Tigers detail page — contracts/ROUTE-CONTRACT.md AMENDMENT 02.
  // Until EV-20260831-008, no player photo existed for anyone and this
  // test asserted zero roster images. All 20 squad members now
  // have a real, evidenced photo — this asserts the roster shows
  // exactly that set, neither fewer (a photo silently dropped) nor more
  // (an unevidenced image slipping in). Dhrubonil Roy wired to shared
  // /media/players/dhrubonil-roy.webp per owner photo-parity direction
  // 2026-09-25 (EV-20260831-008 set + 1). Since the Squad recomposition
  // the page renders SquadCard (.ukbt-squad-card), not RosterGrid.
  await page.goto('/franchises/uppsala-tigers');
  const srcs = await page
    .locator('#squad .ukbt-squad-card img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  expect(srcs, 'roster photo count').toHaveLength(20);
  for (const src of srcs) {
    expect(src, 'roster photo path').toMatch(
      /^\/media\/(uppsala-squad\/.+\.jpg|players\/dhrubonil-roy\.webp)$/,
    );
  }
  // Every squad photo names Uppsala Tigers (records carry no explicit
  // photoAlt, so the card's org fallback must say Uppsala Tigers —
  // never the UKBT fallback from the players page).
  const alts = await page
    .locator('#squad .ukbt-squad-card img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('alt') ?? ''));
  expect(alts.length, 'squad alt count').toBe(20);
  for (const alt of alts) {
    expect(alt, 'squad photo org').toMatch(/Uppsala Tigers/);
  }
  // Dhrubonil Roy now renders exactly 1 img with the shared photo.
  const royCard = page.locator('#squad .ukbt-squad-card', {
    hasText: 'Dhrubonil Roy',
  });
  const royImg = royCard.locator('img');
  await expect(royImg).toHaveCount(1);
  await expect(royImg).toHaveAttribute(
    'src',
    '/media/players/dhrubonil-roy.webp',
  );
  await expect(royImg).toHaveAttribute('alt', /Uppsala Tigers/);
});

test('client-confirmed captain portrait is rendered on the Club Captain page', async ({
  page,
}) => {
  // Portrait is client-supplied directly (chat 2026-09-09),
  // identity confirmed by the client directly — see captain-data.ts
  // (captainPhoto) and MANIFEST.md. Supersedes the Uppsala-squad-set
  // portrait (mohammad-chowdhury.jpg) previously asserted here.
  await page.goto('/club-captain');
  const portrait = page.locator(
    '.ukbt-profile-header img[src="/media/uppsala-squad/mohammad-chowdhury-captain.jpg"]',
  );
  await expect(portrait, 'confirmed captain portrait must render').toHaveCount(
    1,
  );
  await expect(portrait, 'portrait alt names captain and role').toHaveAttribute(
    'alt',
    'Mohammad Chowdhury, Club Captain',
  );
});

test('Contact Us page renders no submission form (no live backend exists)', async ({
  page,
}) => {
  await page.goto('/contact');
  const forms = await page.locator('form').count();
  expect(
    forms,
    'no fake/non-functional form should ship without a real backend',
  ).toBe(0);
});

for (const route of NOINDEX_ROUTES) {
  test(`${route} is noindex (ROUTE-CONTRACT Amendment 01 condition 2)`, async ({
    page,
  }) => {
    await page.goto(route);
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots, `${route} must carry a noindex robots meta`).toContain(
      'noindex',
    );
  });
}

for (const route of INDEXABLE_ROUTES) {
  test(`${route} is indexable`, async ({ page }) => {
    await page.goto(route);
    const count = await page.locator('meta[name="robots"]').count();
    const robots =
      count > 0
        ? await page.locator('meta[name="robots"]').getAttribute('content')
        : '';
    expect(robots ?? '', `${route} must not be noindex`).not.toContain(
      'noindex',
    );
  });
}

/**
 * Release-gate RM-4 (artifacts/receipts/RELEASE.md): the noindex/indexable
 * split was already tested above, but nothing asserted that an indexable
 * page actually has a real title/description to be indexed WITH. Built
 * from `routes` + the two pages tested in their own spec files, minus the
 * noindex shells — not a fourth hand-maintained list.
 */
const ALL_INDEXABLE_ROUTES = [
  '/',
  '/about',
  ...routes.map((r) => r.path),
].filter((path) => !NOINDEX_ROUTES.includes(path));

for (const route of ALL_INDEXABLE_ROUTES) {
  test(`${route} has a real, non-empty title and meta description`, async ({
    page,
  }) => {
    await page.goto(route);
    const title = await page.title();
    expect(
      title.trim().length,
      `${route} title must not be empty`,
    ).toBeGreaterThan(0);
    expect(title, `${route} title looks like a placeholder`).not.toMatch(
      /lorem|placeholder|TODO|Astro/i,
    );

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(
      description?.trim().length ?? 0,
      `${route} must have a non-empty meta description`,
    ).toBeGreaterThan(0);
  });
}

/**
 * Shell sections must say plainly that they are waiting for content.
 * Rendering an empty skeleton, or lorem text, would both fail the point
 * of CLIENT_REQ_009's "shells where UKBT content will go".
 */
test('every shell section declares CONTENT_STATUS = UNKNOWN and explains itself', async ({
  page,
}) => {
  for (const route of ['/services', '/membership', '/join', '/news']) {
    await page.goto(route);
    const pending = page.locator('[data-content-status="UNKNOWN"]');
    const n = await pending.count();
    expect(
      n,
      `${route} should render at least one pending-content block`,
    ).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const text = (await pending.nth(i).innerText()).trim();
      expect(
        text.length,
        `${route} pending block ${i} must explain itself`,
      ).toBeGreaterThan(20);
    }
  }
});
