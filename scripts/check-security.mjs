#!/usr/bin/env node
// Security-headers gate — verifies the built output ships the response
// policy from apps/web/public/_headers and contains no unsafe leakage:
// plaintext-http subresources, source maps, or sensitive files.
// Output ends with:
//   SECURITY_STATUS = PASS | FAIL
import { createHash } from 'node:crypto';
import { existsSync, globSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sandbox override for scripts/test-security-failure-injection.mjs (same
// pattern as the deploy/perf/seo gates). Production behavior unchanged.
const root = process.env.UKBT_CHECK_ROOT
  ? resolve(process.env.UKBT_CHECK_ROOT)
  : dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;

const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

if (!existsSync(distDir)) {
  console.log(JSON.stringify({ SECURITY_STATUS: 'FAIL', reason: 'no dist' }));
  console.log('SECURITY_STATUS = FAIL');
  process.exit(1);
}

// 1. _headers ships and carries the required policy.
const headersPath = join(distDir, '_headers');
if (!existsSync(headersPath)) {
  fail(
    'headers-missing',
    'dist/_headers absent (add apps/web/public/_headers)',
  );
} else {
  const headers = readFileSync(headersPath, 'utf8');
  for (const name of [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    // Added 2026-09-11 closing a B/80 third-party audit: COOP/CORP
    // isolate the document and its subresources. HSTS stays without
    // includeSubDomains until the subdomain inventory is validated.
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy',
  ]) {
    if (!headers.includes(name)) fail('header-missing', name);
  }
  if (!/frame-ancestors/.test(headers)) {
    fail('framing-policy', 'no frame-ancestors/X-Frame-Options policy');
  }
  // X-Frame-Options conflicts with frame-ancestors: when both are present
  // browsers honour XFO, which blocks even the same-origin Tina admin
  // edit iframe (audit 2026-09-18). frame-ancestors is the governing
  // control — XFO must stay absent.
  if (/^\s*X-Frame-Options:/m.test(headers)) {
    fail(
      'framing-policy',
      'X-Frame-Options present — it overrides frame-ancestors and breaks the Tina admin iframe; remove it',
    );
  }
  // CSP sanity: self-based, no eval, no unsafe-inline scripts, no
  // plaintext sources, no wildcards. 'unsafe-inline' in script-src
  // negates CSP as an XSS backstop (style-src 'unsafe-inline' is the
  // accepted exception: Astro auto-inlines small scoped stylesheets).
  const csp =
    headers.split('\n').find((l) => l.includes('Content-Security-Policy')) ??
    '';
  for (const bad of ['unsafe-eval', 'http://']) {
    if (csp.includes(bad)) fail('csp-unsafe', `CSP contains "${bad}"`);
  }
  if (/(?:^|\s)\*(?:\s|;|$)/.test(csp))
    fail('csp-unsafe', 'CSP has bare * source');
  if (!csp.includes("'self'")) fail('csp-self', 'CSP lacks self baseline');
  if (!/img-src[^;]*data:/.test(csp)) fail('csp-data', 'img-src needs data: blob: for admin');
  if (!/font-src[^;]*data:/.test(csp)) fail('csp-data', 'font-src needs data:');
  if (headers.includes('__UKBT_CSP_SCRIPT_HASHES__')) fail('csp-unstamped', 'placeholder not stamped — re-run stamp-csp.mjs');
  const scriptSrc = /script-src([^;]*)/.exec(csp)?.[1] ?? '';
  if (scriptSrc.includes("'unsafe-inline'")) {
    fail(
      'csp-unsafe',
      "script-src contains 'unsafe-inline' — use sha256 hashes",
    );
  }
  // Every inline executable script in dist must be covered by a hash in
  // the emitted CSP (stamp-csp.mjs writes them; this recomputes so a
  // stale/bypassed stamp fails the gate instead of weakening CSP).
  const cspHashes = new Set(scriptSrc.match(/'sha256-[^']+'/g) ?? []);
  const inlineScripts = [];
  for (const file of globSync('**/*.html', { cwd: distDir })) {
    const html = readFileSync(join(distDir, file), 'utf8');
    for (const m of html.matchAll(
      /<script(?![^>]*\ssrc=)([^>]*?)>([\s\S]*?)<\/script>/g,
    )) {
      if (m[1].includes('ld+json')) continue;
      const hash = `'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`;
      inlineScripts.push({ file, hash });
    }
  }
  for (const { file, hash } of inlineScripts) {
    if (!cspHashes.has(hash)) {
      fail(
        'csp-inline-script-unhashed',
        `${file}: inline script ${hash} missing from script-src — re-run stamp-csp.mjs`,
      );
    }
  }
  if (inlineScripts.length > 0 && cspHashes.size === 0) {
    fail(
      'csp-inline-script-unhashed',
      'inline scripts exist but CSP carries no hashes',
    );
  }
  // Allowlist creep: a hash left in the CSP after its script was removed
  // would silently widen the inline-script allowlist over time
  // (review 2026-09-18). Exact set equality required.
  if (cspHashes.size > new Set(inlineScripts.map((x) => x.hash)).size) {
    fail(
      'csp-stale-hash',
      'script-src carries more hashes than there are inline scripts — re-run stamp-csp.mjs',
    );
  }
}

// 2. No source maps, env files, or VCS leakage in the deploy artifact.
// A recursive readdir is load-bearing (fixed 2026-09-18): fs.globSync
// never returns dotfiles (and silently ignores the dot option), so the
// .env/.gitignore checks below were dead code — caught by
// scripts/test-security-failure-injection.mjs.
for (const entry of readdirSync(distDir, {
  recursive: true,
  withFileTypes: true,
})) {
  if (!entry.isFile()) continue;
  const f = join(entry.parentPath, entry.name).slice(distDir.length + 1);
  const base = basename(f);
  if (base.endsWith('.map')) fail('sourcemap-leak', f);
  if (/^\.env(\.|$)/.test(base) || base === '.gitignore') {
    fail('sensitive-file', f);
  }
}

// 3. No plaintext-http subresources in served HTML.
for (const file of globSync('**/*.html', { cwd: distDir })) {
  const html = readFileSync(join(distDir, file), 'utf8');
  for (const m of html.matchAll(
    /<(?:script|img|link|source|video)[^>]*(?:src|href)="http:\/\/[^"]*"/g,
  )) {
    fail('http-subresource', `${file}: ${m[0].slice(0, 80)}`);
    break;
  }
  if (html.includes('[object Object]')) fail('html-serialization', `${file} contains [object Object] — rich-text unwrap missing`);
}

const result = {
  SECURITY_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
};
console.log(JSON.stringify(result, null, 2));
console.log(`SECURITY_STATUS = ${result.SECURITY_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
