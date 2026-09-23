#!/usr/bin/env node
// Sitemap generator — derives the sitemap from the BUILT output, never a
// hand-maintained route list (same philosophy as check-internal-links).
// For every dist/*.html (except 404): skip pages carrying a noindex
// robots meta, take the page's own canonical link as the sitemap URL —
// so sitemap==canonical agreement holds by construction, not by review.
// Run after `pnpm build` (wired into the root build script).
import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;

if (!existsSync(distDir)) {
  console.error(
    JSON.stringify({
      status: 'FAIL',
      reason: 'apps/web/dist does not exist — run `pnpm build` first',
    }),
  );
  process.exit(1);
}

const canonicalPattern = /<link rel="canonical" href="([^"]+)"\s*\/?>/;
const robotsPattern = /<meta name="robots" content="([^"]+)"\s*\/?>/;

const urls = [];
const skipped = [];

const isAdminOwned = (f) =>
  f === 'admin' || f.startsWith('admin/') || f.startsWith('admin\\');
for (const file of globSync('**/*.html', { cwd: distDir }).filter(
  (f) => !isAdminOwned(f),
)) {
  if (file === '404.html' || file.endsWith('/404.html')) {
    skipped.push({ file, reason: 'error page' });
    continue;
  }
  const html = readFileSync(join(distDir, file), 'utf8');
  const robots = html.match(robotsPattern)?.[1] ?? '';
  if (robots.includes('noindex')) {
    skipped.push({ file, reason: 'noindex' });
    continue;
  }
  const canonical = html.match(canonicalPattern)?.[1];
  if (!canonical) {
    console.error(
      JSON.stringify({
        status: 'FAIL',
        reason: `indexable page has no canonical: ${file}`,
      }),
    );
    process.exit(1);
  }
  urls.push(canonical);
}

urls.sort();
const entries = urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

writeFileSync(join(distDir, 'sitemap.xml'), xml);
console.log(
  JSON.stringify({ status: 'PASS', urls: urls.length, skipped }, null, 2),
);
