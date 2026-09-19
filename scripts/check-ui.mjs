#!/usr/bin/env node
// UI/UX release gate — structural checks over built output + component
// source. P0-structural issues FAIL; judgment calls WARN (listed, exit 0
// unless failures exist). Output ends with:
//   UI_STATUS = PASS | FAIL
import { existsSync, globSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;
const compDir = join(root, 'apps/web/src/components');
const contentDir = join(root, 'apps/web/src/content');

const failures = [];
const warnings = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const warn = (rule, detail) => warnings.push({ rule, detail });

if (!existsSync(distDir)) {
  console.log(JSON.stringify({ UI_STATUS: 'FAIL', reason: 'no dist' }));
  console.log('UI_STATUS = FAIL');
  process.exit(1);
}

// 1. Heading order + single h1 (skip 404; skip Tina admin app shell).
const siteHtml = (pattern) =>
  globSync(pattern, { cwd: distDir }).filter(
    (f) => f !== 'admin' && !f.startsWith('admin/') && !f.startsWith('admin\\'),
  );
for (const file of siteHtml('**/*.html')) {
  if (file === '404.html' || file.endsWith('/404.html')) continue;
  const html = readFileSync(join(distDir, file), 'utf8');
  const tags = [...html.matchAll(/<(h[1-6])[\s>]/g)].map((m) => m[1]);
  const h1s = tags.filter((t) => t === 'h1').length;
  if (h1s !== 1) fail('single-h1', `${file}: ${h1s} h1 elements`);
  const levels = tags.map((t) => Number(t[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      fail(
        'heading-order',
        `${file}: skips h${levels[i - 1]} to h${levels[i]}`,
      );
      break;
    }
  }
}

// 2. Images: every meaningful <img> needs alt + dimensions (admin skipped).
for (const file of siteHtml('**/*.html')) {
  const html = readFileSync(join(distDir, file), 'utf8');
  for (const m of html.matchAll(/<img\b([^>]+)>/g)) {
    const tag = m[1];
    const src = (tag.match(/src="([^"]+)"/) || [])[1] ?? '?';
    if (!/alt=/.test(tag)) fail('img-alt', `${file}: ${src} has no alt`);
    if (!/width=/.test(tag) || !/height=/.test(tag)) {
      fail('img-dims', `${file}: ${src} missing width/height`);
    }
  }
}

// 3. Event lifecycle: month-granularity `when` vs current month.
// Upcoming + past month = FAIL (stale); Upcoming + current month = WARN
// (day-unknown, needs club confirmation, never auto-flipped).
const MONTHS = {
  January: '01',
  February: '02',
  March: '03',
  April: '04',
  May: '05',
  June: '06',
  July: '07',
  August: '08',
  September: '09',
  October: '10',
  November: '11',
  December: '12',
};
const nowYm = new Date().toISOString().slice(0, 7);
try {
  const body = readFileSync(join(contentDir, 'tournaments-data.ts'), 'utf8');
  const blocks = [
    ...body.matchAll(
      /when:\s*'([A-Za-z]+)\s+(\d{4})'[\s\S]{0,120}?status:\s*'(\w+)'/g,
    ),
  ];
  for (const b of blocks) {
    const ym = `${b[2]}-${MONTHS[b[1]] ?? '00'}`;
    if (b[3] === 'Upcoming' && ym < nowYm) {
      fail('stale-upcoming', `${b[1]} ${b[2]} still Upcoming after month end`);
    } else if (b[3] === 'Upcoming' && ym === nowYm) {
      warn(
        'current-month-upcoming',
        `${b[1]} ${b[2]} is Upcoming during its month (day unknown — confirm with club)`,
      );
    }
  }
} catch {
  fail('events-source', 'tournaments-data.ts unreadable');
}

// 4. Focus coverage: dark-background components with interactive markup
// must repaint the focus ring (token or explicit rule).
for (const f of readdirSync(compDir).filter((x) => x.endsWith('.astro'))) {
  const src = readFileSync(join(compDir, f), 'utf8');
  const style = src.split('<style>')[1] ?? '';
  const markup = src.split('<style>')[0] ?? '';
  const dark = /surface-inverse/.test(style);
  if (!dark) continue;
  const interactive = /<(a|button)\b/.test(markup);
  const covered = /focus-ring|:focus-visible/.test(src);
  if (interactive && !covered) {
    fail(
      'focus-coverage',
      `${f}: dark surface + interactive, no ring override`,
    );
  } else if (!interactive && !covered) {
    warn('focus-leaf', `${f}: dark non-interactive leaf without ring token`);
  }
}

// 5. Primary-CTA duplication (judgment call — warn, owner-gated microcopy).
try {
  const home = readFileSync(join(distDir, 'index.html'), 'utf8');
  const joins = (home.match(/>Join the Club</g) ?? []).length;
  if (joins > 1) {
    warn(
      'cta-duplication',
      `index.html: "Join the Club" appears ${joins}x (header + hero)`,
    );
  }
} catch {
  fail('cta-source', 'index.html unreadable');
}

// 6. FAQ sink wiring (REM-001, amended for Tina visual editing): CMS answers
// must pass through an approved escaping renderer — either the bespoke
// renderFaqAnswer(item.answer) or Tina's supported <TinaMarkdown
// content={item.answer}> (page and island share FAQSection.astro, so the
// check covers both files). DOM-level no-<script> guarantees stay in
// apps/web/tests/visual/content-trust.spec.ts. No new raw-HTML sinks may
// appear unnoticed.
const pagesDir = join(root, 'apps/web/src/pages');
const layoutsDir = join(root, 'apps/web/src/layouts');
try {
  const faq = readFileSync(join(pagesDir, 'faq.astro'), 'utf8');
  let faqSection = '';
  try {
    faqSection = readFileSync(join(compDir, 'FAQSection.astro'), 'utf8');
  } catch {
    faqSection = '';
  }
  const combined = `${faq}\n${faqSection}`;
  const viaLegacy = /renderFaqAnswer\(item\.answer\)/.test(combined);
  const viaTina = /<TinaMarkdown\s+content=\{item\.answer/.test(combined);
  if (!viaLegacy && !viaTina) {
    fail(
      'faq-sink-wiring',
      'FAQ answers route through neither renderFaqAnswer nor TinaMarkdown',
    );
  }
} catch {
  fail('faq-source', 'faq.astro unreadable');
}
let setHtmlUses = 0;
for (const dir of [pagesDir, compDir, layoutsDir]) {
  for (const f of globSync('**/*.astro', { cwd: dir })) {
    const src = readFileSync(join(dir, f), 'utf8');
    setHtmlUses += (src.match(/set:html=\{/g) ?? []).length;
  }
}
// BaseLayout JSON-LD is the only raw sink in our source. The former FAQ
// set:html was replaced by the TinaMarkdown component sink (escaping
// renderer owned by @tinacms/astro; its internal set:html lives in the
// package, not in this repo, so the source count drops 2 -> 1 by design).
if (setHtmlUses !== 1) {
  fail(
    'raw-sink-count',
    `expected 1 set:html use (BaseLayout JSON-LD), found ${setHtmlUses}`,
  );
}

const result = {
  UI_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
  warnings,
};
console.log(JSON.stringify(result, null, 2));
console.log(`UI_STATUS = ${result.UI_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
