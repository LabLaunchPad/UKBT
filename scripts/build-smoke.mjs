#!/usr/bin/env node
// Stamp the release identity into the smoke endpoint.
// `apps/web/src/pages/smoke.json.ts` prerenders
// `{"ok":true,"buildId":"__UKBT_BUILD_ID__"}` — the SHA cannot be baked
// in-file because prerendered endpoints execute in the adapter's runtime
// shim, where `node:child_process` is stubbed (`execSync ... is not
// implemented`, observed 2026-09-25). This script replaces the placeholder
// in `dist/.../smoke.json` with the short commit hash, mirroring
// `scripts/build-sw.mjs` (same git mechanism, same `dev` fallback when
// git is unavailable). Wired into the web `build` chain in
// `apps/web/package.json`, right after `build-sw.mjs`.
// Fail-closed: a surviving placeholder exits non-zero — an unstamped
// smoke.json would fail the deploy-identity assertion with a confusing
// mismatch instead of a build error.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// With @astrojs/cloudflare adapter, static output goes to dist/client/.
// Without adapter, it goes to dist/. Check both locations.
const distSmokeClient = join(root, 'apps/web/dist/client/smoke.json');
const distSmokeLegacy = join(root, 'apps/web/dist/smoke.json');
const distSmoke = existsSync(distSmokeClient)
  ? distSmokeClient
  : distSmokeLegacy;

if (!existsSync(distSmoke)) {
  console.error(
    `build-smoke: smoke.json not found (checked ${distSmokeClient} and ${distSmokeLegacy})`,
  );
  process.exit(1);
}

let buildId = 'dev';
try {
  buildId = execSync('git rev-parse --short HEAD', {
    cwd: root,
    encoding: 'utf8',
  }).trim();
} catch {
  // No git (packed preview envs) — 'dev' identity, same mechanics as
  // build-sw.mjs. LOUD, because the smoke gate asserts the live BUILD_ID
  // against the merge SHA: a 'dev' stamp fails deployment-identity by
  // design rather than verifying the wrong release.
  console.error(
    'build-smoke: WARNING — git absent; stamping smoke.json with the shared "dev" build id. The smoke gate will fail deployment-identity against any expected SHA.',
  );
}

const stamped = readFileSync(distSmoke, 'utf8').replaceAll(
  '__UKBT_BUILD_ID__',
  buildId,
);
if (stamped.includes('__UKBT_BUILD_ID__')) {
  console.error('build-smoke: placeholder replacement failed');
  process.exit(1);
}
writeFileSync(distSmoke, stamped);
console.log(`build-smoke: smoke endpoint stamped [${buildId}]`);
