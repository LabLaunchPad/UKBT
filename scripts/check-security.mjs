#!/usr/bin/env node
// Security-headers gate — verifies the built output ships the response
// policy from apps/web/public/_headers and contains no unsafe leakage:
// plaintext-http subresources, source maps, or sensitive files.
// Output ends with:
//   SECURITY_STATUS = PASS | FAIL
import { existsSync, globSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, 'apps/web/dist');

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
  // CSP sanity: self-based, no eval, no plaintext sources, no wildcards.
  const csp =
    headers.split('\n').find((l) => l.includes('Content-Security-Policy')) ??
    '';
  for (const bad of ['unsafe-eval', 'http://']) {
    if (csp.includes(bad)) fail('csp-unsafe', `CSP contains "${bad}"`);
  }
  if (/(?:^|\s)\*(?:\s|;|$)/.test(csp))
    fail('csp-unsafe', 'CSP has bare * source');
  if (!csp.includes("'self'")) fail('csp-self', 'CSP lacks self baseline');
}

// 2. No source maps, env files, or VCS leakage in the deploy artifact.
for (const f of globSync('**/*', { cwd: distDir, nodir: true })) {
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
}

const result = {
  SECURITY_STATUS: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
};
console.log(JSON.stringify(result, null, 2));
console.log(`SECURITY_STATUS = ${result.SECURITY_STATUS}`);
process.exit(failures.length === 0 ? 0 : 1);
