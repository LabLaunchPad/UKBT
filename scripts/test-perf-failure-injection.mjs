#!/usr/bin/env node
// Perf-gate failure-injection suite — proves scripts/check-perf.mjs fails
// on budget violations instead of passing silently. Builds minimal fixture
// trees under the OS temp dir and runs the gate with UKBT_CHECK_ROOT.
// Output ends with:
//   PERF_INJECTION_STATUS = PASS | FAIL
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const gate = join(here, 'check-perf.mjs');
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
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-perf-'));
  const client = join(dir, 'apps/web/dist/client');
  const write = (rel, content) => {
    const full = join(client, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  // Baseline GOOD fixture: small page, hero keeps fetchpriority, tiny css/js.
  write(
    'index.html',
    '<html><body><img class="ukbt-hero__bg" src="/media/hero.webp" fetchpriority="high"></body></html>',
  );
  write('media/hero.webp', Buffer.alloc(1024));
  write('app.css', 'a{color:red}');
  write('app.js', 'console.log(1)');
  setup(write);
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
  { name: 'good-fixture-passes', setup: () => {}, expectPass: true },
  {
    name: 'css-over-budget',
    setup: (w) => w('big.css', 'x'.repeat(81 * 1024)),
    expectPass: false,
    expectRule: 'css-weight',
  },
  {
    name: 'js-over-budget',
    setup: (w) => w('big.js', 'x'.repeat(49 * 1024)),
    expectPass: false,
    expectRule: 'js-weight',
  },
  {
    name: 'html-over-budget',
    setup: (w) =>
      w(
        'huge/index.html',
        `<html><body>${'x'.repeat(73 * 1024)}</body></html>`,
      ),
    expectPass: false,
    expectRule: 'html-weight',
  },
  {
    name: 'lcp-priority-lost',
    setup: (w) =>
      w(
        'index.html',
        '<html><body><img class="ukbt-hero__bg" src="/media/hero.webp"></body></html>',
      ),
    expectPass: false,
    expectRule: 'lcp-priority',
  },
  {
    name: 'oversize-raster',
    setup: (w) => {
      w('index.html', '<html><body><img src="/media/big.jpg"></body></html>');
      w('media/big.jpg', Buffer.alloc(351 * 1024));
    },
    expectPass: false,
    expectRule: 'image-weight',
  },
  {
    name: 'missing-referenced-asset',
    setup: (w) =>
      w('index.html', '<html><body><img src="/media/gone.webp"></body></html>'),
    expectPass: false,
    expectRule: 'image-missing',
  },
];

for (const c of cases) {
  const dir = fixture(c.setup);
  try {
    const r = runGate(dir);
    if (c.expectPass) {
      if (r.exit === 0 && r.out.includes('PERF_STATUS = PASS')) {
        ok(c.name, 'gate PASS on good fixture');
      } else {
        bad(c.name, `expected PASS, got exit=${r.exit}`);
      }
    } else if (
      r.exit !== 0 &&
      r.out.includes('PERF_STATUS = FAIL') &&
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
    PERF_INJECTION_STATUS: status,
    passed: results.length - failed.length,
    total: results.length,
    failed: failed.map((f) => f.name),
  }),
);
console.log(`PERF_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
