import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { VIEWPORT_MATRIX } from './viewports.js';

/**
 * Phase 2 — reference render harness (CLIENT_REQ_009/012, EV-20260826-032).
 *
 * Measures the reference template's own rendered geometry so parity work
 * is driven by numbers rather than impressions, and so the parity
 * matrices can cite measured values.
 *
 * WHY MEASUREMENTS AND NOT SCREENSHOTS ARE COMMITTED
 * `knowledge/01-VERIFIED-FACTS.yaml` records the template as
 * `in_repository: false` — it is deliberately excluded. Committing
 * full-page renders of it would import its visual expression (its
 * branding, its demo photography) into this repository through the back
 * door, which is the thing that exclusion exists to prevent. Reading and
 * measuring the reference is separately permitted
 * (`FORENSIC_PERMISSION = ALLOWED`), so this writes structured geometry
 * to `artifacts/ui/reference-geometry.json` and leaves rendered images in
 * a scratch directory that is never committed.
 *
 * The template package is not in the repo, so this suite SKIPS unless
 * UKBT_REFERENCE_DIR points at an extracted copy. It is therefore
 * reproducible by anyone holding the licensed package, and inert in CI.
 */
const REFERENCE_DIR = process.env.UKBT_REFERENCE_DIR ?? '';
const SHOT_DIR = process.env.UKBT_REFERENCE_SHOT_DIR ?? '';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
);
const outFile = path.join(
  repoRoot,
  'artifacts',
  'ui',
  'reference-geometry.json',
);

/** Template page → the UKBT route it is the reference for. */
const REFERENCE_PAGES = [
  { file: 'index.html', ukbtRoute: '/' },
  { file: 'about.html', ukbtRoute: '/about' },
  { file: 'event.html', ukbtRoute: '/tournaments' },
  { file: 'service.html', ukbtRoute: '/services' },
  { file: 'membership.html', ukbtRoute: '/membership' },
  { file: 'booking.html', ukbtRoute: '/join' },
  { file: 'faq.html', ukbtRoute: '/faq' },
  { file: 'blog.html', ukbtRoute: '/news' },
  { file: 'single-post.html', ukbtRoute: '/news/[slug]' },
  { file: 'contact.html', ukbtRoute: '/contact' },
  { file: '404-page.html', ukbtRoute: '/404' },
];

/**
 * Probes chosen to capture the geometry that actually defines the
 * template's proportions — container width, section rhythm, banner
 * depth, nav/footer height, heading scale — rather than every value in
 * the stylesheet.
 */
const PROBE = `(() => {
  const px = (v) => Math.round(parseFloat(v) || 0);
  const one = (sel) => document.querySelector(sel);
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      padTop: px(cs.paddingTop),
      padBottom: px(cs.paddingBottom),
      padLeft: px(cs.paddingLeft),
      radius: cs.borderTopLeftRadius,
    };
  };
  // Measure the BASE type scale with synthetic, unstyled elements rather
  // than the first matching element on the page. The first <p> on a real
  // page is often an eyebrow pill or a styled tagline, and the first <h3>
  // sits inside whichever section happens to come first - comparing those
  // across two differently-structured documents measures markup order,
  // not the type scale. Appending bare elements isolates the stylesheet's
  // own cascade, which is what "was the scale ported correctly" means.
  const probeHost = document.createElement('div');
  probeHost.setAttribute('data-geometry-probe', '');
  probeHost.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;';
  document.body.appendChild(probeHost);
  const typeOf = (tag) => {
    const el = document.createElement(tag);
    el.textContent = 'Probe';
    probeHost.appendChild(el);
    const cs = getComputedStyle(el);
    const out = { size: px(cs.fontSize), weight: cs.fontWeight, lh: cs.lineHeight, family: cs.fontFamily.split(',')[0].replace(/["']/g, '') };
    return out;
  };
  const sections = Array.from(document.querySelectorAll('.section')).slice(0, 6).map((el) => {
    const cs = getComputedStyle(el);
    return { padTop: px(cs.paddingTop), padBottom: px(cs.paddingBottom) };
  });
  return {
    docScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    container: box(one('.hero-container')),
    banner: box(one('.section-banner-inner')),
    navbar: box(one('.navbar-container') || one('header')),
    footer: box(one('footer .section') || one('footer')),
    sections,
    type: { h1: typeOf('h1'), h2: typeOf('h2'), h3: typeOf('h3'), h4: typeOf('h4'), p: typeOf('p') },
    _probeCleanup: (probeHost.remove(), true),
    sectionCount: document.querySelectorAll('.section, .section-wrapper').length,
  };
})()`;

test.describe('reference geometry', () => {
  test.skip(
    !REFERENCE_DIR,
    'UKBT_REFERENCE_DIR not set — reference template is not in this repo by design.',
  );

  // 13 pages x 7 viewports is well past the default per-test budget.
  test.setTimeout(300_000);

  test('measure reference pages across the frozen viewport matrix', async ({
    page,
  }) => {
    // The template's homepage embeds a YouTube iframe. This environment has
    // no outbound network, so that request hangs and the `load` event never
    // fires. Aborting non-file requests makes it fail fast; measurement only
    // needs the local CSS/JS, which loads from disk.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      return url.startsWith('file://') ? route.continue() : route.abort();
    });

    const result: Record<string, unknown> = {
      capturedAt: new Date().toISOString().slice(0, 10),
      note: 'Measured from the licensed reference package. Images are not committed; see this spec for why.',
      viewports: VIEWPORT_MATRIX.map((v) => v.name),
      pages: {},
    };

    for (const ref of REFERENCE_PAGES) {
      const file = path.join(REFERENCE_DIR, ref.file);
      if (!fs.existsSync(file)) {
        console.log(`SKIP missing reference page: ${ref.file}`);
        continue;
      }
      const perViewport: Record<string, unknown> = {};
      for (const v of VIEWPORT_MATRIX) {
        await page.setViewportSize({ width: v.width, height: v.height });
        await page.goto(`file://${file}`, { waitUntil: 'domcontentloaded' });
        // The template animates section entry; settle before measuring.
        await page.waitForTimeout(250);
        perViewport[v.name] = await page.evaluate(PROBE);

        if (SHOT_DIR) {
          fs.mkdirSync(SHOT_DIR, { recursive: true });
          await page.screenshot({
            path: path.join(
              SHOT_DIR,
              `${ref.file.replace(/\.html$/, '')}-${v.width}x${v.height}.png`,
            ),
            fullPage: true,
          });
        }
      }
      (result.pages as Record<string, unknown>)[ref.file] = {
        ukbtRoute: ref.ukbtRoute,
        viewports: perViewport,
      };
      console.log(`MEASURED ${ref.file} -> ${ref.ukbtRoute}`);
    }

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);
    console.log(`WROTE ${outFile}`);
    expect(Object.keys(result.pages as object).length).toBeGreaterThan(0);
  });
});
