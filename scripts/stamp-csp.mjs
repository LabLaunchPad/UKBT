#!/usr/bin/env node
// Dist finalization stamp — runs after `astro build`:
// 1. Stamps __UKBT_CSP_SCRIPT_HASHES__ in the built _headers with the
//    sha256 hashes of every inline executable script in dist (ld+json
//    data blocks are non-executable and exempt). Same stamping pattern as
//    build-sw.mjs; scripts/check-security.mjs independently recomputes
//    the hashes and fails the gate if they disagree.
// 2. Prunes VCS-hygiene files (.gitignore — e.g. Tina's generated
//    admin/.gitignore) from the artifact: a deploy output has no source-
//    control purpose. Genuine leaks (.env*) are NOT pruned — they fail
//    the security gate instead.
// Output ends with:
//   CSP_STAMP_STATUS = PASS | FAIL
import { createHash } from 'node:crypto';
import {
  existsSync,
  globSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDirClient = join(root, 'apps/web/dist/client');
const distDirLegacy = join(root, 'apps/web/dist');
const distDir = existsSync(distDirClient) ? distDirClient : distDirLegacy;
const headersPath = join(distDir, '_headers');
const PLACEHOLDER = '__UKBT_CSP_SCRIPT_HASHES__';

const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

if (!existsSync(distDir)) {
  fail('dist-missing', 'dist absent — run the astro build first');
} else {
  for (const entry of readdirSync(distDir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (entry.isFile() && entry.name === '.gitignore') {
      rmSync(join(entry.parentPath, entry.name));
    }
  }
}

if (!existsSync(headersPath)) {
  fail('headers-missing', 'dist/_headers absent');
} else if (!readFileSync(headersPath, 'utf8').includes(PLACEHOLDER)) {
  // Already stamped (placeholder absent). Nothing to do: this script runs
  // only inside a build right after `astro build`, where dist is fresh;
  // scripts/check-security.mjs is the recomputation authority — a stale
  // stamp fails that gate.
} else {
  const hashes = new Set();
  for (const file of globSync('**/*.html', { cwd: distDir })) {
    const html = readFileSync(join(distDir, file), 'utf8');
    for (const m of html.matchAll(
      // Inline scripts without src; ld+json is a non-executable data block
      // and does not fall under script-src.
      /<script(?![^>]*\ssrc=)([^>]*?)>([\s\S]*?)<\/script>/g,
    )) {
      const attrs = m[1];
      if (attrs.includes('ld+json')) continue;
      // Hash the EXACT raw bytes between the tags — that is what the
      // browser hashes for CSP 'sha256-…' sources.
      hashes.add(
        `'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`,
      );
    }
  }
  const headers = readFileSync(headersPath, 'utf8');
  const stamped = headers.replaceAll(PLACEHOLDER, [...hashes].sort().join(' '));
  if (!stamped.includes('script-src') || stamped.includes(PLACEHOLDER)) {
    fail('stamp-failed', 'CSP line not found or placeholder unexpanded');
  } else {
    writeFileSync(headersPath, stamped);
  }
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ CSP_STAMP_STATUS: status, failures }));
console.log(`CSP_STAMP_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
