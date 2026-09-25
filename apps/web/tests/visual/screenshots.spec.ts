import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';
import { VIEWPORT_MATRIX } from './viewports.js';

/**
 * Stage 7G mandatory visual review (artifacts/pages/HOMEPAGE-CONTRACT.md,
 * "Visual QA"). Saves real screenshots into the repo (not the gitignored
 * test-results/ dir) so they can actually be reviewed, per the frozen
 * 6-viewport matrix.
 */
const outDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'artifacts',
  'ui',
  'screenshots',
);

const pages = [
  { route: '/', slug: 'homepage' },
  { route: '/about', slug: 'about' },
  { route: '/club-captain', slug: 'club-captain' },
  { route: '/players', slug: 'players' },
  { route: '/franchises', slug: 'franchises' },
  { route: '/franchises/uppsala-tigers', slug: 'franchises-uppsala-tigers' },
  { route: '/tournaments', slug: 'tournaments' },
  { route: '/contact', slug: 'contact' },
  { route: '/services', slug: 'services' },
  { route: '/membership', slug: 'membership' },
  { route: '/join', slug: 'join' },
  { route: '/faq', slug: 'faq' },
  { route: '/news', slug: 'news' },
];

/**
 * Capture-only stylesheet, for deterministic comparison.
 *
 * `contracts/VISUAL-REGRESSION-CONTRACT.md` requires
 * `ANIMATION_MODE = disabled/deterministic` so diffs reflect real
 * regressions rather than the frame an animation happened to be on. This
 * enforces it at capture time, and additionally neutralises the sticky
 * header: a `fullPage` screenshot is stitched from scrolled bands, and a
 * sticky element can repaint per band. Capturing the plain document flow
 * is what a geometry diff against the reference actually wants.
 *
 * Reading note for anyone reviewing these images: the pages are very
 * tall (about/index exceed 3000px). Viewing one scaled to fit will not
 * resolve fine detail — crop the region of interest at full resolution
 * before concluding anything about it. Two apparent defects in this
 * page's banner turned out to be misreadings of a downscaled view;
 * `elementFromPoint` probing and a full-resolution crop both showed the
 * region empty.
 */
const CAPTURE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  [style*="position: sticky"], .ukbt-header { position: static !important; }
  html { scroll-behavior: auto !important; }
`;

for (const viewport of VIEWPORT_MATRIX) {
  for (const p of pages) {
    test(`${p.slug} screenshot at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(p.route);
      await page.waitForLoadState('networkidle');
      await page.addStyleTag({ content: CAPTURE_CSS });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(
          outDir,
          `${p.slug}-${viewport.width}x${viewport.height}.png`,
        ),
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
}
