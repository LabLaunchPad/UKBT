import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { VIEWPORT_MATRIX } from './viewports.js';

/**
 * Phase 2 — the UKBT half of the parity comparison.
 *
 * Measures our own build with the same probes used against the reference
 * (`reference-geometry.spec.ts`), writing `artifacts/ui/ukbt-geometry.json`.
 * `scripts/compare-geometry.mjs` diffs the two files into the parity
 * report, so a claim like "our sections match the reference's rhythm" is
 * backed by two measured numbers rather than an impression.
 *
 * Unlike the reference suite this always runs: it measures the site in
 * this repo, which is always present.
 */
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
);
const outFile = path.join(repoRoot, 'artifacts', 'ui', 'ukbt-geometry.json');

const UKBT_ROUTES = [
  '/',
  '/about',
  '/tournaments',
  '/contact',
  '/club-captain',
  '/players',
  '/franchises',
  '/franchises/uppsala-tigers',
  '/join',
  '/privacy',
];

/** Mirrors reference-geometry.spec.ts's probe, against our class names. */
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
  const sections = Array.from(document.querySelectorAll('.ukbt-section')).slice(0, 6).map((el) => {
    const cs = getComputedStyle(el);
    return { padTop: px(cs.paddingTop), padBottom: px(cs.paddingBottom) };
  });
  return {
    docScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    container: box(one('.ukbt-container')),
    banner: box(one('.ukbt-page-banner__inner')),
    navbar: box(one('.ukbt-header')),
    footer: box(one('.ukbt-footer')),
    sections,
    type: { h1: typeOf('h1'), h2: typeOf('h2'), h3: typeOf('h3'), h4: typeOf('h4'), p: typeOf('p') },
    _probeCleanup: (probeHost.remove(), true),
    sectionCount: document.querySelectorAll('.ukbt-section').length,
  };
})()`;

test.setTimeout(180_000);

test('measure UKBT pages across the frozen viewport matrix', async ({
  page,
}) => {
  const result: Record<string, unknown> = {
    capturedAt: new Date().toISOString().slice(0, 10),
    viewports: VIEWPORT_MATRIX.map((v) => v.name),
    pages: {},
  };

  for (const route of UKBT_ROUTES) {
    const perViewport: Record<string, unknown> = {};
    for (const v of VIEWPORT_MATRIX) {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto(route, { waitUntil: 'networkidle' });
      perViewport[v.name] = await page.evaluate(PROBE);
    }
    (result.pages as Record<string, unknown>)[route] = {
      viewports: perViewport,
    };
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`WROTE ${outFile}`);
  expect(Object.keys(result.pages as object).length).toBe(UKBT_ROUTES.length);
});
