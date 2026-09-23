#!/usr/bin/env node
// Deployment failure-injection suite — proves scripts/check-deploy-mapping.mjs
// actually fails on each known-bad topology (P14). Builds minimal fixture
// trees under the OS temp dir and runs the gate with UKBT_CHECK_ROOT pointed
// at each fixture. A case passes only when the gate's verdict matches the
// expectation (PASS for good, FAIL + expected rule for bad).
// Output ends with:
//   FAILURE_INJECTION_STATUS = PASS | FAIL
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const gate = join(here, 'check-deploy-mapping.mjs');
const results = [];
const ok = (name, detail) => {
  results.push({ name, ok: true });
  console.log(`ok - ${name}: ${detail}`);
};
const bad = (name, detail) => {
  results.push({ name, ok: false, detail });
  console.log(`FAIL - ${name}: ${detail}`);
};

function fixture(setup) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-fixture-'));
  const write = (rel, content) => {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  // Baseline GOOD fixture: adapter active + on-demand route + correct mapping.
  write(
    'wrangler.jsonc',
    JSON.stringify({
      main: './apps/web/dist/server/entry.mjs',
      assets: { directory: './apps/web/dist/client' },
    }),
  );
  write(
    'apps/web/package.json',
    JSON.stringify({ dependencies: { '@astrojs/cloudflare': '14.2.5' } }),
  );
  write(
    'apps/web/astro.config.mjs',
    "import cloudflare from '@astrojs/cloudflare';\n",
  );
  write(
    'apps/web/src/pages/tina-island/[name].ts',
    'export const prerender = false;\n',
  );
  write('apps/web/dist/client/index.html', '<html>UKBT</html>');
  write('apps/web/dist/client/404.html', '<html>404</html>');
  write('apps/web/dist/client/_headers', '/*\n  X-Test: 1\n');
  write('apps/web/dist/server/entry.mjs', 'export default { fetch() {} };\n');
  setup(write, dir);
  return dir;
}

function runGate(dir) {
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

const cases = [
  {
    name: 'good-topology-passes',
    setup: () => {},
    expectPass: true,
  },
  {
    name: 'wrong-asset-directory',
    setup: (w) =>
      w(
        'wrangler.jsonc',
        JSON.stringify({
          main: './apps/web/dist/server/entry.mjs',
          assets: { directory: './apps/web/dist' },
        }),
      ),
    expectPass: false,
    expectRule: 'homepage-artifact',
  },
  {
    name: 'missing-worker-entry',
    setup: (w) =>
      w(
        'wrangler.jsonc',
        JSON.stringify({ assets: { directory: './apps/web/dist/client' } }),
      ),
    expectPass: false,
    expectRule: 'worker-entry-missing',
  },
  {
    name: 'missing-404',
    setup: (_w, dir) => rmSync(join(dir, 'apps/web/dist/client/404.html')),
    expectPass: false,
    expectRule: 'not-found-artifact',
  },
  {
    name: 'missing-headers',
    setup: (_w, dir) => rmSync(join(dir, 'apps/web/dist/client/_headers')),
    expectPass: false,
    expectRule: 'headers-artifact',
  },
  {
    name: 'stale-build-output',
    setup: (_w, dir) => rmSync(join(dir, 'apps/web/dist'), { recursive: true }),
    expectPass: false,
    expectRule: 'assets-directory-absent',
  },
  {
    name: 'missing-runtime-entry-file',
    setup: (w) =>
      w(
        'wrangler.jsonc',
        JSON.stringify({
          main: './apps/web/dist/server/missing.mjs',
          assets: { directory: './apps/web/dist/client' },
        }),
      ),
    expectPass: false,
    expectRule: 'worker-entry-absent',
  },
  {
    name: 'wrong-deployment-topology-duplicate-config',
    setup: (w) => w('apps/web/wrangler.jsonc', '{}'),
    expectPass: false,
    expectRule: 'duplicate-wrangler-config',
  },
  {
    name: 'stale-worker-entry-without-adapter',
    setup: (w) => {
      w('apps/web/package.json', JSON.stringify({ dependencies: {} }));
      w('apps/web/astro.config.mjs', 'export default {};\n');
      w(
        'apps/web/src/pages/tina-island/[name].ts',
        'export const GET = () => {};\n',
      );
    },
    expectPass: false,
    expectRule: 'stale-worker-entry',
  },
];

for (const c of cases) {
  const dir = fixture(c.setup);
  try {
    const r = runGate(dir);
    if (c.expectPass) {
      if (r.exit === 0 && r.out.includes('DEPLOY_MAPPING_STATUS = PASS')) {
        ok(c.name, 'gate PASS on good topology');
      } else {
        bad(c.name, `expected PASS, got exit=${r.exit}`);
      }
    } else if (
      r.exit !== 0 &&
      r.out.includes('DEPLOY_MAPPING_STATUS = FAIL') &&
      r.out.includes(c.expectRule)
    ) {
      ok(c.name, `gate FAIL with rule ${c.expectRule}`);
    } else {
      bad(c.name, `expected FAIL/${c.expectRule}, got exit=${r.exit}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const failed = results.filter((r) => !r.ok);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    FAILURE_INJECTION_STATUS: status,
    passed: results.length - failed.length,
    total: results.length,
    failed: failed.map((f) => f.name),
  }),
);
console.log(`FAILURE_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
