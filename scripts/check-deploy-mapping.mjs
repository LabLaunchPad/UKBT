#!/usr/bin/env node
// Deploy-mapping gate — verifies the Wrangler deployment configuration
// points at the ACTUAL Astro build output. Added 2026-09-15 after the
// production 404: `@astrojs/cloudflare` moved static output to
// `dist/client/` and emitted the Worker entry at
// `dist/server/entry.mjs`, while root `wrangler.jsonc` still served
// `./apps/web/dist` with no `main` — every route 404'd at the platform
// layer while all 15 CI gates stayed green.
//
// This gate derives every path from the current build/config instead of
// hardcoding adapter output locations: it fails BEFORE deployment when
// the serve mapping and the generated artifacts diverge.
// Output ends with:
//   DEPLOY_MAPPING_STATUS = PASS | FAIL
import { existsSync, readFileSync, statSync } from 'node:fs';
import { globSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sandbox override for scripts/test-deploy-failure-injection.mjs: point the
// gate at a fixture tree instead of the real repo. Production behavior
// unchanged (env var unset in CI and deploy:verify).
const root = process.env.UKBT_CHECK_ROOT
  ? resolve(process.env.UKBT_CHECK_ROOT)
  : dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

// Minimal JSONC strip: line comments, block comments, trailing commas.
// String-aware (audit 2026-09-18): the previous regex stripped `//` inside
// string values too (e.g. a route value containing " //"), corrupting the
// parse; walk the text tracking in-string state instead.
function stripJsonc(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += text[i + 1] ?? '';
        i++;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}
function parseJsonc(text) {
  const noComments = stripJsonc(text);
  const noTrailing = noComments.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(noTrailing);
}

// 1. Root Wrangler config exists and parses; no duplicate/conflicting config.
const wranglerPath = join(root, 'wrangler.jsonc');
if (!existsSync(wranglerPath)) {
  fail('wrangler-missing', 'root wrangler.jsonc absent');
}
let wrangler = null;
if (existsSync(wranglerPath)) {
  try {
    wrangler = parseJsonc(readFileSync(wranglerPath, 'utf8'));
  } catch (error) {
    fail('wrangler-unparseable', String(error).slice(0, 160));
  }
}
for (const dup of [
  'apps/web/wrangler.jsonc',
  'apps/web/wrangler.toml',
  'apps/web/wrangler.json',
  'wrangler.toml',
]) {
  if (existsSync(join(root, dup))) {
    fail('duplicate-wrangler-config', dup);
  }
}

// 2. Adapter-active detection (derived, not assumed).
const webPkg = JSON.parse(
  readFileSync(join(root, 'apps/web/package.json'), 'utf8'),
);
const astroConfig = readFileSync(
  join(root, 'apps/web/astro.config.mjs'),
  'utf8',
);
const adapterDep =
  webPkg.dependencies?.['@astrojs/cloudflare'] ||
  webPkg.devDependencies?.['@astrojs/cloudflare'];
const adapterWired = /@astrojs\/cloudflare/.test(astroConfig);
const adapterActive = Boolean(adapterDep && adapterWired);

// 3. Worker-required detection: any pages route opting out of prerender.
const pagesFiles = globSync('apps/web/src/pages/**/*.{astro,ts}', {
  cwd: root,
});
const onDemandRoutes = pagesFiles.filter((f) => {
  const src = readFileSync(join(root, f), 'utf8');
  return /export\s+const\s+prerender\s*=\s*false/.test(src);
});
const workerRequired = onDemandRoutes.length > 0;

if (wrangler) {
  // 4. assets.directory must exist and contain the served homepage/404/headers.
  const assetsDir = wrangler.assets?.directory;
  if (!assetsDir) {
    fail('assets-directory-missing', 'wrangler assets.directory unset');
  } else {
    const abs = resolve(root, assetsDir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      fail('assets-directory-absent', `${assetsDir} does not exist`);
    } else {
      for (const [rule, file] of [
        ['homepage-artifact', 'index.html'],
        ['not-found-artifact', '404.html'],
        ['headers-artifact', '_headers'],
      ]) {
        if (!existsSync(join(abs, file))) {
          fail(rule, `${assetsDir}/${file} absent (build output moved?)`);
        }
      }
    }
  }

  // 5. Worker runtime mapping: required when the adapter is active or any
  // route is on-demand. `main` must point at an existing entry file.
  if (adapterActive || workerRequired) {
    if (!wrangler.main) {
      fail(
        'worker-entry-missing',
        `adapter-active=${adapterActive} on-demand=[${onDemandRoutes.join(',')}] but wrangler has no main entry`,
      );
    } else if (!existsSync(resolve(root, wrangler.main))) {
      fail('worker-entry-absent', `${wrangler.main} does not exist`);
    }
  }
}

// 6. Consistency: adapter active but assets dir has no index is already
// covered by (4); adapter REMOVED while main still points into dist/server
// would deploy a stale worker — flag a main entry whose file is absent
// (covered by 5) and an adapter-less config carrying a main into dist.
if (wrangler?.main && !adapterActive && !workerRequired) {
  fail(
    'stale-worker-entry',
    'no adapter and no on-demand routes, but wrangler.main is set',
  );
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ DEPLOY_MAPPING_STATUS: status, failures }));
console.log(`DEPLOY_MAPPING_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
