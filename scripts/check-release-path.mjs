#!/usr/bin/env node
// Release-path integrity gate (REM-002) — asserts the post-deploy smoke
// control is wired and cannot be silently weakened. Fails closed on:
// smoke job removed, push-ordering removed, build dependency removed,
// production target changed, identity binding removed, failure made
// ignorable, or the guard invocation itself removed from the control-plane
// job. Run in CI (control-plane job) and in `deploy:verify`.
// Output ends with:
//   RELEASE_PATH_STATUS = PASS | FAIL
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const read = (p) => readFileSync(join(root, p), 'utf8');
const has = (p) => existsSync(join(root, p));

// Block-scoped CI parsing: capture the indented block under `  <job>:`.
function jobBlock(ci, job) {
  const m = ci.match(new RegExp(`^  ${job}:\n((?:    .*\n| *\n)*)`, 'm'));
  return m ? m[1] : '';
}

if (!has('.github/workflows/ci.yml')) {
  fail('ci-missing', '.github/workflows/ci.yml absent');
}
const ci = has('.github/workflows/ci.yml')
  ? read('.github/workflows/ci.yml')
  : '';
const smoke = jobBlock(ci, 'smoke-verify');
if (!smoke) {
  fail('smoke-job-missing', "ci.yml lacks job key 'smoke-verify:'");
} else {
  // Ordered after deployment: push-only (production post-merge), gated on
  // the build, observing the live target — never a pre-deploy PR check.
  if (!/if:\s*github\.event_name\s*==\s*['"]push['"]/.test(smoke)) {
    fail(
      'smoke-not-push-only',
      'smoke-verify must run on push (post-merge) only',
    );
  }
  if (!/needs:\s*\[?[^\n]*build/.test(smoke)) {
    fail('smoke-no-build-dep', 'smoke-verify must need the build job');
  }
  if (!/smoke-deploy\.mjs/.test(smoke)) {
    fail(
      'smoke-no-invocation',
      'smoke-verify must invoke scripts/smoke-deploy.mjs',
    );
  }
  if (!/ukbanglatigers\.co\.uk/.test(smoke)) {
    fail('smoke-wrong-target', 'smoke-verify must target production');
  }
  if (!/expect-sha|EXPECTED_SHA/.test(smoke)) {
    fail(
      'smoke-no-identity',
      'smoke-verify must bind EXPECTED_SHA/--expect-sha',
    );
  }
  if (/continue-on-error/.test(smoke)) {
    fail('smoke-ignorable', 'smoke-verify must not set continue-on-error');
  }
  // Exit-code swallowing (`|| true`, `; true`, `|| exit 0`) would keep the
  // job green while smoke fails — reject shell-level success-forcing.
  const smokeRuns = [...smoke.matchAll(/-\s*run:\s*(.+)/g)].map((m) => m[1]);
  for (const line of smokeRuns) {
    if (
      /\|\|\s*true/.test(line) ||
      /;\s*true\s*$/.test(line) ||
      /\|\|\s*exit\s+0/.test(line)
    ) {
      fail(
        'smoke-exit-swallowed',
        `smoke-verify run line forces success: ${line.trim()}`,
      );
    }
  }
}

// The smoke script itself must assert identity and fail closed.
if (!has('scripts/smoke-deploy.mjs')) {
  fail('smoke-script-missing', 'scripts/smoke-deploy.mjs absent');
} else {
  const s = read('scripts/smoke-deploy.mjs');
  for (const token of [
    'deployment-identity',
    'process.exit(failures.length === 0 ? 0 : 1)',
  ]) {
    if (!s.includes(token))
      fail('smoke-script-weakened', `smoke-deploy.mjs lacks '${token}'`);
  }
}

// The injection suite must cover the smoke gate and run in the release chain.
if (!has('scripts/test-smoke-failure-injection.mjs')) {
  fail(
    'smoke-injection-missing',
    'scripts/test-smoke-failure-injection.mjs absent',
  );
}
const pkg = has('package.json') ? JSON.parse(read('package.json')) : {};
if (
  !(pkg.scripts?.['test:failure-injection'] || '').includes(
    'test-smoke-failure-injection',
  )
) {
  fail(
    'smoke-injection-unwired',
    'test:failure-injection must run the smoke suite',
  );
}
if (!/test-smoke-failure-injection\.mjs/.test(ci)) {
  fail(
    'smoke-injection-not-in-ci',
    'CI failure-injection job must run the smoke suite',
  );
}

// The content-trust gate must itself be invoked: control-plane job runs it,
// so removing the invocation breaks a required check instead of going
// unnoticed (REM-004 wiring guard).
const controlPlane = jobBlock(ci, 'control-plane');
if (!/check-release-path\.mjs/.test(controlPlane)) {
  fail(
    'guard-unwired',
    'control-plane job must run scripts/check-release-path.mjs',
  );
}
if (!/check-content-trust\.mjs/.test(controlPlane)) {
  fail(
    'content-trust-unwired',
    'control-plane job must run scripts/check-content-trust.mjs',
  );
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ RELEASE_PATH_STATUS: status, failures }));
console.log(`RELEASE_PATH_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
