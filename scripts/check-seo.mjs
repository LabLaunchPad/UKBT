#!/usr/bin/env node
// Production SEO gate — crawls the BUILT site (apps/web/dist), never
// source. Fails on any P0/P1 SEO defect. Output ends with:
//   SEO_STATUS = PASS | FAIL
// plus machine-readable detail as JSON.
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sandbox override for scripts/test-seo-failure-injection.mjs (same pattern
// as the deploy/perf gates). Production behavior unchanged.
const root = process.env.UKBT_CHECK_ROOT
  ? resolve(process.env.UKBT_CHECK_ROOT)
  : dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;
const SITE = 'https://ukbanglatigers.co.uk';

const failures = [];
const fail = (file, rule, detail) => failures.push({ file, rule, detail });

if (!existsSync(distDir)) {
  console.log(
    JSON.stringify({ SEO_STATUS: 'FAIL', reason: 'no dist — run build first' }),
  );
  console.log('SEO_STATUS = FAIL');
  process.exit(1);
}

const pick = (html, re) => html.match(re)?.[1] ?? null;
const pickAll = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

const titles = new Map();
const descriptions = new Map();

for (const file of globSync('**/*.html', { cwd: distDir }).filter(
  // Tina admin is an authenticated app shell, not indexable site content.
  (f) => f !== 'admin' && !f.startsWith('admin/') && !f.startsWith('admin\\'),
)) {
  if (file === '404.html' || file.endsWith('/404.html')) continue;
  const html = readFileSync(join(distDir, file), 'utf8');
  const robots = pick(html, /<meta name="robots" content="([^"]+)"\s*\/?>/);
  const noindex = (robots ?? '').includes('noindex');

  if (!robots) fail(file, 'robots-missing', 'no robots meta');

  // Title / description presence + uniqueness (indexable pages only).
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"\s*\/?>/);
  if (!noindex) {
    if (!title?.trim()) fail(file, 'title-missing', 'empty <title>');
    else {
      if (titles.has(title)) {
        fail(file, 'title-duplicate', `also on ${titles.get(title)}`);
      } else titles.set(title, file);
    }
    if (!desc?.trim()) fail(file, 'description-missing', 'empty description');
    else {
      if (descriptions.has(desc)) {
        fail(
          file,
          'description-duplicate',
          `also on ${descriptions.get(desc)}`,
        );
      } else descriptions.set(desc, file);
    }
  }

  // Canonical: present iff indexable; absolute, https, production host.
  // Trailing-slash form is REQUIRED (root excepted): the platform
  // 307-redirects no-slash route URLs to their slash form, so a no-slash
  // canonical disagrees with the served URL and puts redirecting URLs in
  // the sitemap (Semrush 2026-09-15). See src/lib/seo.ts normalizePath.
  const canonical = pick(html, /<link rel="canonical" href="([^"]+)"\s*\/?>/);
  if (noindex) {
    if (canonical) {
      fail(file, 'canonical-on-noindex', canonical);
    }
  } else {
    if (!canonical) fail(file, 'canonical-missing', 'indexable, no canonical');
    else {
      if (!canonical.startsWith(`${SITE}/`)) {
        fail(file, 'canonical-host', canonical);
      }
      if (canonical !== `${SITE}/` && !canonical.endsWith('/')) {
        fail(file, 'canonical-missing-slash', canonical);
      }
    }
  }

  // OG / Twitter essentials (og:url only on indexable pages — noindex
  // pages deliberately emit no canonical and therefore no og:url).
  const requiredMeta = [
    [/<meta property="og:title" content="([^"]*)"\s*\/?>/, 'og-title'],
    [/<meta property="og:image" content="([^"]*)"\s*\/?>/, 'og-image'],
    [/<meta property="og:image:alt" content="([^"]*)"\s*\/?>/, 'og-image-alt'],
    [/<meta property="og:site_name" content="([^"]*)"\s*\/?>/, 'og-site-name'],
    [/<meta name="twitter:image" content="([^"]*)"\s*\/?>/, 'twitter-image'],
  ];
  if (!noindex) {
    requiredMeta.push([
      /<meta property="og:url" content="([^"]*)"\s*\/?>/,
      'og-url',
    ]);
  }
  for (const [re, rule] of requiredMeta) {
    const v = pick(html, re);
    if (!v?.trim()) fail(file, `${rule}-missing`, 'empty/absent');
  }
  const ogImage = pick(
    html,
    /<meta property="og:image" content="([^"]*)"\s*\/?>/,
  );
  if (ogImage && !ogImage.startsWith('https://')) {
    fail(file, 'og-image-relative', ogImage);
  }
  const ogUrl = pick(html, /<meta property="og:url" content="([^"]*)"\s*\/?>/);
  if (!noindex && ogUrl && canonical && ogUrl !== canonical) {
    fail(file, 'og-url-canonical-mismatch', `${ogUrl} vs ${canonical}`);
  }

  // JSON-LD must parse and target schema.org.
  for (const block of pickAll(
    html,
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const data = JSON.parse(block);
      const ctx = data['@context'] ?? '';
      if (!String(ctx).includes('schema.org')) {
        fail(file, 'jsonld-context', String(ctx).slice(0, 80));
      }
    } catch {
      fail(file, 'jsonld-malformed', block.slice(0, 80));
    }
  }

  // No staging/localhost/plain-http leakage into production output.
  for (const m of html.matchAll(
    /(https?:\/\/[a-zA-Z0-9.:_-]+|href="http:\/\/[^"]*")/g,
  )) {
    const u = m[1];
    if (
      u.includes('localhost') ||
      u.includes('127.0.0.1') ||
      u.startsWith('http://')
    ) {
      // schema.org contexts are fine; everything else is a leak.
      if (!u.includes('schema.org') && !u.includes('sitemaps.org')) {
        fail(file, 'url-leak', u.slice(0, 100));
        break;
      }
    }
  }
}

// Sitemap cross-checks.
const sitemapPath = join(distDir, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  fail('sitemap.xml', 'sitemap-missing', 'run generate-sitemap.mjs');
} else {
  const xml = readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const seen = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(`${SITE}/`)) fail('sitemap.xml', 'sitemap-host', loc);
    if (seen.has(loc)) fail('sitemap.xml', 'sitemap-duplicate', loc);
    seen.add(loc);
  }
  // Every indexable canonical must appear exactly once; no noindex URL inside.
  const indexableCanonicals = [];
  for (const file of globSync('**/*.html', { cwd: distDir }).filter(
    // Tina admin is an authenticated app shell, not indexable site content.
    (f) => f !== 'admin' && !f.startsWith('admin/') && !f.startsWith('admin\\'),
  )) {
    if (file === '404.html' || file.endsWith('/404.html')) continue;
    const html = readFileSync(join(distDir, file), 'utf8');
    const robots = pick(html, /<meta name="robots" content="([^"]+)"\s*\/?>/);
    if ((robots ?? '').includes('noindex')) continue;
    const canonical = pick(html, /<link rel="canonical" href="([^"]+)"\s*\/?>/);
    if (canonical) indexableCanonicals.push(canonical);
  }
  for (const c of indexableCanonicals) {
    if (!seen.has(c)) fail('sitemap.xml', 'sitemap-missing-url', c);
  }
  for (const loc of seen) {
    if (!indexableCanonicals.includes(loc)) {
      fail('sitemap.xml', 'sitemap-unknown-url', loc);
    }
  }
}

// robots.txt checks.
const robotsPath = join(distDir, 'robots.txt');
if (!existsSync(robotsPath)) {
  fail(
    'robots.txt',
    'robots-txt-missing',
    'not in dist (add public/robots.txt)',
  );
} else {
  const txt = readFileSync(robotsPath, 'utf8');
  if (!txt.includes(`${SITE}/sitemap.xml`)) {
    fail('robots.txt', 'robots-txt-sitemap', 'no production sitemap reference');
  }
  if (/localhost|127\.0\.0\.1|staging/i.test(txt)) {
    fail('robots.txt', 'robots-txt-leak', 'non-production host referenced');
  }
}

const result = {
  SEO_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
};
console.log(JSON.stringify(result, null, 2));
console.log(`SEO_STATUS = ${result.SEO_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
