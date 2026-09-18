#!/usr/bin/env node
// Release-path failure-injection suite — proves scripts/check-release-path.mjs
// fails on each known-bad ci.yml topology, including the hardened rules
// added 2026-09-18 (run-step assertions instead of comment-satisfiable
// substrings, and the workers-deploy wiring assertions). Minimal fixture
// trees under the OS temp dir, gate run with UKBT_CHECK_ROOT. A case
// passes only when the verdict matches.
// Output ends with:
//   RELEASE_PATH_INJECTION_STATUS = PASS | FAIL
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const gate = join(here, 'check-release-path.mjs');
const results = [];
const ok = (name, detail) => {
  results.push({ name, ok: true });
  console.log(`ok - ${name}: ${detail}`);
};
const bad = (name, detail) => {
  results.push({ name, ok: false, detail });
  console.log(`FAIL - ${name}: ${detail}`);
};

const GATES = [
  'build',
  'deploy-mapping',
  'seo-gate',
  'security-gate',
  'perf-gate',
];

const CI = (smokeBody, deployBody) => `name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    name: Build
    runs-on: ubuntu-24.04
    steps:
      - run: echo build
${GATES.slice(1)
  .map(
    (g) => `  ${g}:
    name: ${g}
    runs-on: ubuntu-24.04
    needs: build
    steps:
      - run: echo ${g}
`,
  )
  .join('\n')}
  visual-and-accessibility:
    name: Playwright
    runs-on: ubuntu-24.04
    needs: build
    steps:
      - run: echo e2e

  failure-injection:
    name: Failure injection
    runs-on: ubuntu-24.04
    steps:
      - run: node scripts/test-smoke-failure-injection.mjs

  control-plane:
    name: Control plane
    runs-on: ubuntu-24.04
    steps:
      - run: node scripts/check-control-plane.mjs
      - run: node scripts/check-release-path.mjs
      - run: node scripts/check-content-trust.mjs

  smoke-verify:
    name: Post-deploy smoke
${smokeBody}

  workers-deploy:
    name: Deploy
${deployBody}
`;

const GOOD_SMOKE = `    runs-on: ubuntu-24.04
    needs: [build, workers-deploy]
    if: github.event_name == 'push' && !failure() && !cancelled()
    steps:
      - run: node scripts/smoke-deploy.mjs https://ukbanglatigers.co.uk --expect-sha \${{ github.sha }} --wait-secs 600
`;
const GOOD_DEPLOY = `    runs-on: ubuntu-24.04
    timeout-minutes: 30
    needs:
      - build
      - deploy-mapping
      - seo-gate
      - security-gate
      - perf-gate
      - visual-and-accessibility
    if: github.event_name == 'push' && github.ref == 'refs/heads/main' && vars.WORKERS_DEPLOY_VIA_CI == 'true'
    steps:
      - run: pnpm exec wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
`;

function fixture(ci) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-rel-'));
  mkdirSync(join(dir, '.github/workflows'), { recursive: true });
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(join(dir, '.github/workflows/ci.yml'), ci);
  // The gate also asserts these files exist; supply honest minimal ones.
  writeFileSync(
    join(dir, 'scripts/smoke-deploy.mjs'),
    'console.log("deployment-identity");\nprocess.exit(failures.length === 0 ? 0 : 1);\n',
  );
  writeFileSync(
    join(dir, 'scripts/test-smoke-failure-injection.mjs'),
    'console.log("fixture");\n',
  );
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({
      scripts: {
        'test:failure-injection':
          'node scripts/test-smoke-failure-injection.mjs',
      },
    }),
  );
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
    name: 'good-fixture-passes',
    ci: CI(GOOD_SMOKE, GOOD_DEPLOY),
    expectPass: true,
  },
  {
    // Audit 2026-09-18: the smoke assertions used to test the raw job
    // block, so a comment mentioning the token satisfied the gate.
    name: 'smoke-invocation-comment-satisfiable-is-dead',
    ci: CI(
      GOOD_SMOKE.replace(
        '      - run: node scripts/smoke-deploy.mjs',
        '      # NOTE: invoke scripts/smoke-deploy.mjs here\n      - run: echo skipped',
      ),
      GOOD_DEPLOY,
    ),
    expectPass: false,
    expectRule: 'smoke-no-invocation',
  },
  {
    name: 'smoke-target-comment-only',
    ci: CI(
      GOOD_SMOKE.replace(
        /https:\/\/ukbanglatigers\.co\.uk/,
        'https://staging.example.com',
      ),
      GOOD_DEPLOY,
    ),
    expectPass: false,
    expectRule: 'smoke-wrong-target',
  },
  {
    name: 'smoke-exit-swallowed',
    ci: CI(
      GOOD_SMOKE.replace('--wait-secs 600', '--wait-secs 600 || true'),
      GOOD_DEPLOY,
    ),
    expectPass: false,
    expectRule: 'smoke-exit-swallowed',
  },
  {
    // The headline audit finding: the CI-gated deploy path must exist.
    name: 'workers-deploy-removed',
    ci: CI(GOOD_SMOKE, GOOD_DEPLOY).replace(/ {2}workers-deploy:[\s\S]*$/, ''),

    expectPass: false,
    expectRule: 'deploy-job-missing',
  },
  {
    name: 'workers-deploy-flag-gate-missing',
    ci: CI(
      GOOD_SMOKE,
      GOOD_DEPLOY.replace("&& vars.WORKERS_DEPLOY_VIA_CI == 'true'", ''),
    ),
    expectPass: false,
    expectRule: 'deploy-ungated',
  },
  {
    name: 'workers-deploy-missing-gate-needs',
    ci: CI(GOOD_SMOKE, GOOD_DEPLOY.replace('      - security-gate\n', '')),
    expectPass: false,
    expectRule: 'deploy-ungated',
  },
  {
    name: 'workers-deploy-continue-on-error',
    ci: CI(
      GOOD_SMOKE,
      GOOD_DEPLOY.replace(
        '    timeout-minutes: 30',
        '    timeout-minutes: 30\n    continue-on-error: true',
      ),
    ),
    expectPass: false,
    expectRule: 'deploy-ignorable',
  },
  {
    name: 'workers-deploy-no-wrangler-run',
    ci: CI(
      GOOD_SMOKE,
      GOOD_DEPLOY.replace(
        '      - run: pnpm exec wrangler deploy',
        '      # wrangler deploy happens elsewhere',
      ),
    ),
    expectPass: false,
    expectRule: 'deploy-no-invocation',
  },
  {
    name: 'smoke-runs-on-pr',
    ci: CI(
      GOOD_SMOKE.replace(
        "if: github.event_name == 'push' && !failure() && !cancelled()",
        'if: !failure() && !cancelled()',
      ),
      GOOD_DEPLOY,
    ),
    expectPass: false,
    expectRule: 'smoke-not-push-only',
  },
  {
    name: 'smoke-not-after-deploy',
    ci: CI(
      GOOD_SMOKE.replace('needs: [build, workers-deploy]', 'needs: build'),
      GOOD_DEPLOY,
    ),
    expectPass: false,
    expectRule: 'smoke-not-after-deploy',
  },
];

for (const c of cases) {
  const dir = fixture(c.ci);
  try {
    const r = runGate(dir);
    if (c.expectPass) {
      if (r.exit === 0) ok(c.name, 'gate PASS on good fixture');
      else
        bad(
          c.name,
          `expected PASS, got exit=${r.exit}\n${r.out.slice(0, 500)}`,
        );
    } else if (r.exit !== 0 && r.out.includes(c.expectRule)) {
      ok(c.name, `gate FAIL with ${c.expectRule}`);
    } else {
      bad(
        c.name,
        `expected FAIL/${c.expectRule}, exit=${r.exit}\n${r.out.slice(0, 500)}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const failed = results.filter((r) => !r.ok);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    RELEASE_PATH_INJECTION_STATUS: status,
    passed: results.length - failed.length,
    total: results.length,
    failed: failed.map((f) => f.name),
  }),
);
console.log(`RELEASE_PATH_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
