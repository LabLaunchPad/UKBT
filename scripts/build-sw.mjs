#!/usr/bin/env node
// Stamp the release identity into the built service worker.
// `apps/web/public/sw.js` ships `__UKBT_BUILD_ID__` as its cache
// namespace seed; this script replaces it in `dist/sw.js` with the
// short commit hash, so every deployment mints fresh ukbt-* caches and
// the activate handler can retire the previous release's namespaces.
// Falls back to 'dev' when git is unavailable (local preview), which
// keeps the mechanism identical while never colliding with releases.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distSwClient = join(root, 'apps/web/dist/client/sw.js');
const distSwLegacy = join(root, 'apps/web/dist/sw.js');
const distSw = existsSync(distSwClient) ? distSwClient : distSwLegacy;

let buildId = 'dev';
try {
  buildId = execSync('git rev-parse --short HEAD', {
    cwd: root,
    encoding: 'utf8',
  }).trim();
} catch {
  // No git (packed preview envs) — 'dev' namespace, same mechanics.
}

const stamped = readFileSync(distSw, 'utf8').replaceAll(
  '__UKBT_BUILD_ID__',
  buildId,
);
if (stamped.includes('__UKBT_BUILD_ID__')) {
  console.error('build-sw: placeholder replacement failed');
  process.exit(1);
}
writeFileSync(distSw, stamped);
console.log(`build-sw: service worker stamped [${buildId}]`);
