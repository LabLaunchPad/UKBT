#!/usr/bin/env node
// Performance-budget gate — transfer-weight budgets over the BUILT output
// plus the LCP fetchpriority structural rule. Budgets were set 2026-09-06
// from measured baselines with ~25% headroom (see docs/12-roadmap-and-open-items.md
// §2.13): tight enough to catch regressions, loose enough to never fail
// on innocent content growth. Warnings flag optimization candidates.
// Output ends with:
//   PERF_STATUS = PASS | FAIL
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, 'apps/web/dist');

const KB = 1024;
const BUDGETS = {
  htmlPerPage: 64 * KB,
  cssTotal: 72 * KB,
  jsTotal: 32 * KB,
  singleRaster: 350 * KB,
  singleRasterWarn: 300 * KB,
  pageImages: 1600 * KB,
  pageImagesWarn: 1200 * KB,
};

const failures = [];
const warnings = [];
const warnedAssets = new Set();
const fail = (rule, detail) => failures.push({ rule, detail });
const warn = (rule, detail) => warnings.push({ rule, detail });

if (!existsSync(distDir)) {
  console.log(JSON.stringify({ PERF_STATUS: 'FAIL', reason: 'no dist' }));
  console.log('PERF_STATUS = FAIL');
  process.exit(1);
}

const kb = (n) => `${(n / 1024).toFixed(1)}KB`;

// Per-page HTML weight + referenced image weight.
for (const file of globSync('**/*.html', { cwd: distDir })) {
  const html = readFileSync(join(distDir, file), 'utf8');
  const htmlBytes = Buffer.byteLength(html);
  if (htmlBytes > BUDGETS.htmlPerPage) {
    fail('html-weight', `${file}: ${kb(htmlBytes)} > 64KB`);
  }
  const seen = new Set(
    [...html.matchAll(/<img\b[^>]*src="(\/[^"]+)"/g)].map((m) => m[1]),
  );
  let imgBytes = 0;
  for (const src of seen) {
    try {
      const b = statSync(join(distDir, src)).size;
      imgBytes += b;
      if (/\.(jpe?g|png|webp)$/i.test(src)) {
        if (b > BUDGETS.singleRaster) {
          fail('image-weight', `${src}: ${kb(b)} > 350KB`);
        } else if (b > BUDGETS.singleRasterWarn && !warnedAssets.has(src)) {
          warnedAssets.add(src);
          warn(
            'image-weight',
            `${src}: ${kb(b)} over 300KB (recompress candidate)`,
          );
        }
      }
    } catch {
      fail('image-missing', `${file} references absent asset ${src}`);
    }
  }
  if (imgBytes > BUDGETS.pageImages) {
    fail('page-image-weight', `${file}: ${kb(imgBytes)} > 1600KB`);
  } else if (imgBytes > BUDGETS.pageImagesWarn) {
    warn('page-image-weight', `${file}: ${kb(imgBytes)} over 1200KB`);
  }
}

// Global CSS/JS transfer weight.
let css = 0;
let js = 0;
for (const f of globSync('**/*.css', { cwd: distDir })) {
  css += statSync(join(distDir, f)).size;
}
for (const f of globSync('**/*.js', { cwd: distDir })) {
  js += statSync(join(distDir, f)).size;
}
if (css > BUDGETS.cssTotal) fail('css-weight', `${kb(css)} > 56KB`);
if (js > BUDGETS.jsTotal) fail('js-weight', `${kb(js)} > 32KB`);

// LCP rule: the homepage hero image must keep fetchpriority="high".
try {
  const home = readFileSync(join(distDir, 'index.html'), 'utf8');
  const hero =
    home.match(/<img\b[^>]*class="[^"]*ukbt-hero__bg[^"]*"[^>]*>/)?.[0] ?? '';
  if (!/fetchpriority="high"/.test(hero)) {
    fail('lcp-priority', 'hero LCP image lost fetchpriority="high"');
  }
} catch {
  fail('lcp-source', 'index.html unreadable');
}

const result = {
  PERF_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
  warnings,
};
console.log(JSON.stringify(result, null, 2));
console.log(`PERF_STATUS = ${result.PERF_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
