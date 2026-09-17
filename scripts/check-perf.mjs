#!/usr/bin/env node
// Performance-budget gate — file-weight budgets over the BUILT output
// plus the LCP fetchpriority structural rule. Sizes are raw bytes, which
// overstate gzip/brotli transfer (conservative direction: a PASS here
// cannot hide a transfer-weight regression). Budgets were set 2026-09-06
// from measured baselines with ~25% headroom, then re-approved upward for
// Stacki compat (css 56→72), Tina (html 64→72, js 32→48) and the
// Cloudflare adapter (css 72→80) — see docs/12-roadmap-and-open-items.md
// §2.13. Any further numeric change is a re-approval event, not a drive-by
// edit. Warnings flag optimization candidates.
// Output ends with:
//   PERF_STATUS = PASS | FAIL
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sandbox override for scripts/test-perf-failure-injection.mjs (same
// pattern as check-deploy-mapping.mjs). Production behavior unchanged.
const root = process.env.UKBT_CHECK_ROOT
  ? resolve(process.env.UKBT_CHECK_ROOT)
  : dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;

const KB = 1024;
const BUDGETS = {
  htmlPerPage: 72 * KB,
  cssTotal: 80 * KB,
  jsTotal: 48 * KB,
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
// Tina admin bundle is an authenticated app shell, not public content:
// excluded from transfer budgets (separately unbounded; never counted
// against the public-site css/js/html budgets). Prefix match covers both
// posix and win32 separators (glob returns backslashes on Windows, which
// `ignore:` patterns do not match — hence explicit filtering).
const ADMIN_OWNED = (f) =>
  f === 'admin' || f.startsWith('admin/') || f.startsWith('admin\\');
const distHtml = (pattern) =>
  globSync(pattern, { cwd: distDir }).filter((f) => !ADMIN_OWNED(f));
for (const file of distHtml('**/*.html')) {
  const html = readFileSync(join(distDir, file), 'utf8');
  const htmlBytes = Buffer.byteLength(html);
  if (htmlBytes > BUDGETS.htmlPerPage) {
    fail('html-weight', `${file}: ${kb(htmlBytes)} > 72KB`);
  }
  const seen = new Set(
    [...html.matchAll(/<img\b[^>]*src="(\/[^"]+)"/g)].map((m) => m[1]),
  );
  let imgBytes = 0;
  for (const src of seen) {
    // Query/hash variants address the same file (cache-bust `?v=`,
    // CMS-generated URLs). Resolving the file must ignore them, or a
    // valid asset false-fails as missing (gate-attack 2026-09-15).
    const fileSrc = src.split('?')[0].split('#')[0];
    try {
      const b = statSync(join(distDir, fileSrc)).size;
      imgBytes += b;
      if (/\.(jpe?g|png|webp)$/i.test(fileSrc)) {
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
for (const f of distHtml('**/*.css')) {
  css += statSync(join(distDir, f)).size;
}
for (const f of distHtml('**/*.js')) {
  js += statSync(join(distDir, f)).size;
}
if (css > BUDGETS.cssTotal) fail('css-weight', `${kb(css)} > 80KB`);
if (js > BUDGETS.jsTotal) fail('js-weight', `${kb(js)} > 48KB`);

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
