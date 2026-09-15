#!/usr/bin/env node
// SEO failure-injection suite — proves scripts/check-seo.mjs and
// scripts/check-internal-links.mjs fail on each known-bad SEO topology.
// Minimal fixture trees under the OS temp dir, gates run with
// UKBT_CHECK_ROOT. A case passes only when the verdict matches.
// Output ends with:
//   SEO_INJECTION_STATUS = PASS | FAIL
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const seoGate = join(here, 'check-seo.mjs');
const linksGate = join(here, 'check-internal-links.mjs');
const results = [];
const ok = (name, detail) => {
  results.push({ name, ok: true });
  console.log(`ok - ${name}: ${detail}`);
};
const bad = (name, detail) => {
  results.push({ name, ok: false, detail });
  console.log(`FAIL - ${name}: ${detail}`);
};

const PAGE = (canon, extra = '') =>
  `<html><head><title>T</title><meta name="description" content="D"><meta name="robots" content="index, follow"><link rel="canonical" href="${canon}"><meta property="og:title" content="T"><meta property="og:image" content="https://ukbanglatigers.co.uk/social-card.jpg"><meta property="og:image:alt" content="A"><meta property="og:site_name" content="UKBT"><meta name="twitter:image" content="https://ukbanglatigers.co.uk/social-card.jpg"><meta property="og:url" content="${canon}">${extra}</head><body><a href="/about/">About</a></body></html>`;

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-seo-'));
  const client = join(dir, 'apps/web/dist/client');
  const write = (rel, content) => {
    const full = join(client, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  write(
    'robots.txt',
    'User-agent: *\nAllow: /\n\nSitemap: https://ukbanglatigers.co.uk/sitemap.xml\n',
  );
  for (const [rel, content] of Object.entries(files)) write(rel, content);
  const locs = Object.keys(files)
    .filter((f) => f.endsWith('.html') && !files[f].includes('noindex'))
    .map(
      (f) => (files[f].match(/<link rel="canonical" href="([^"]+)"/) || [])[1],
    )
    .filter(Boolean);
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
  return dir;
}

function runGate(gate, dir) {
  try {
    const out = execFileSync('node', [gate], {
      env: { ...process.env, UKBT_CHECK_ROOT: dir },
      encoding: 'utf8',
    });
    return { exit: 0, out };
  } catch (error) {
    return { exit: error.status ?? 1, out: String(error.stdout ?? '') };
  }
}

const GOOD_ABOUT = PAGE('https://ukbanglatigers.co.uk/about/').replace(
  'content="D"',
  'content="About page"',
);
const GOOD_HOME = PAGE('https://ukbanglatigers.co.uk/').replace(
  '<title>T</title>',
  '<title>Home</title>',
);

const cases = [
  {
    name: 'good-fixture-passes',
    gate: seoGate,
    files: { 'index.html': GOOD_HOME, 'about/index.html': GOOD_ABOUT },
    expectPass: true,
  },
  {
    name: 'no-slash-canonical',
    gate: seoGate,
    files: {
      'index.html': GOOD_HOME,
      'about/index.html': PAGE('https://ukbanglatigers.co.uk/about'),
    },
    expectPass: false,
    expectRule: 'canonical-missing-slash',
  },
  {
    name: 'canonical-on-noindex',
    gate: seoGate,
    files: {
      'index.html': GOOD_HOME,
      'join/index.html':
        '<html><head><title>J</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="https://ukbanglatigers.co.uk/join/"></head><body></body></html>',
    },
    expectPass: false,
    expectRule: 'canonical-on-noindex',
  },
  {
    name: 'malformed-jsonld',
    gate: seoGate,
    files: {
      'index.html': GOOD_HOME,
      'about/index.html': GOOD_ABOUT.replace(
        '</head>',
        '<script type="application/ld+json">{oops</script></head>',
      ),
    },
    expectPass: false,
    expectRule: 'jsonld-malformed',
  },
  {
    name: 'missing-description',
    gate: seoGate,
    files: {
      'index.html': GOOD_HOME,
      'about/index.html': GOOD_ABOUT.replace(
        '<meta name="description" content="About page">',
        '',
      ),
    },
    expectPass: false,
    expectRule: 'description-missing',
  },
  {
    name: 'duplicate-title',
    gate: seoGate,
    files: {
      'index.html': GOOD_HOME.replace(
        '<title>Home</title>',
        '<title>T</title>',
      ),
      'about/index.html': GOOD_ABOUT,
    },
    expectPass: false,
    expectRule: 'title-duplicate',
  },
  {
    name: 'no-slash-internal-link',
    gate: linksGate,
    files: {
      'index.html': GOOD_HOME.replace('/about/', '/about'),
      'about/index.html': GOOD_ABOUT,
    },
    expectPass: false,
    expectRule: 'no_slash_route_links',
  },
  {
    name: 'broken-internal-link',
    gate: linksGate,
    files: {
      'index.html': GOOD_HOME.replace('/about/', '/gone/'),
      'about/index.html': GOOD_ABOUT,
    },
    expectPass: false,
    expectRule: 'broken_links',
  },
];

for (const c of cases) {
  const dir = fixture(c.files);
  try {
    const r = runGate(c.gate, dir);
    const statusWord = c.gate === seoGate ? 'SEO_STATUS' : '"status":"FAIL"';
    if (c.expectPass) {
      if (r.exit === 0) ok(c.name, 'gate PASS on good fixture');
      else bad(c.name, `expected PASS, got exit=${r.exit}`);
    } else if (r.exit !== 0 && r.out.includes(c.expectRule)) {
      ok(c.name, `gate FAIL with ${c.expectRule}`);
    } else {
      bad(
        c.name,
        `expected FAIL/${c.expectRule} (${statusWord}), exit=${r.exit}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const failed = results.filter((r) => !r.ok);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    SEO_INJECTION_STATUS: status,
    passed: results.length - failed.length,
    total: results.length,
    failed: failed.map((f) => f.name),
  }),
);
console.log(`SEO_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
