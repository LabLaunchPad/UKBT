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
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sandbox override for scripts/test-release-path-failure-injection.mjs
// (added 2026-09-18, same pattern as the deploy/perf/seo gates).
// Production behavior unchanged (env var unset in CI and deploy:verify).
const root = process.env.UKBT_CHECK_ROOT
  ? resolve(process.env.UKBT_CHECK_ROOT)
  : dirname(dirname(fileURLToPath(import.meta.url)));
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
  // Smoke must observe the CI-gated deploy, not race it (review
  // 2026-09-18). While WORKERS_DEPLOY_VIA_CI is unset the deploy job is
  // skipped and smoke proceeds against the Workers Builds publish via
  // !failure().
  if (!/^\s*needs:[^\n]*\bworkers-deploy\b/m.test(smoke)) {
    fail(
      'smoke-not-after-deploy',
      'smoke-verify must need the workers-deploy job (post-deploy observation)',
    );
  }
  // Hardened 2026-09-18 (audit): the assertions below used to test the raw
  // job block, so a comment mentioning the token satisfied the gate — the
  // exact weakness check-control-plane.mjs:77 fixed for job keys. They now
  // assert against actual `- run:` lines only.
  const smokeRuns = [...smoke.matchAll(/-\s*run:\s*(.+)/g)].map((m) => m[1]);
  if (!smokeRuns.some((l) => /smoke-deploy\.mjs/.test(l))) {
    fail(
      'smoke-no-invocation',
      'smoke-verify must invoke scripts/smoke-deploy.mjs in a run step',
    );
  }
  if (!smokeRuns.some((l) => /ukbanglatigers\.co\.uk/.test(l))) {
    fail('smoke-wrong-target', 'smoke-verify must target production');
  }
  if (!smokeRuns.some((l) => /expect-sha|EXPECTED_SHA/.test(l))) {
    fail(
      'smoke-no-identity',
      'smoke-verify must bind EXPECTED_SHA/--expect-sha in a run step',
    );
  }
  if (/continue-on-error/.test(smoke)) {
    fail('smoke-ignorable', 'smoke-verify must not set continue-on-error');
  }
  // Exit-code swallowing (`|| true`, `; true`, `|| exit 0`) would keep the
  // job green while smoke fails — reject shell-level success-forcing.
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
// unnoticed (REM-004 wiring guard). Hardened 2026-09-18 to assert actual
// run steps, not comments (same rationale as the smoke assertions above).
const controlPlane = jobBlock(ci, 'control-plane');
const controlRuns = [...controlPlane.matchAll(/-\s*run:\s*(.+)/g)].map(
  (m) => m[1],
);
if (!controlRuns.some((l) => /check-release-path\.mjs/.test(l))) {
  fail(
    'guard-unwired',
    'control-plane job must run scripts/check-release-path.mjs in a run step',
  );
}
if (!controlRuns.some((l) => /check-content-trust\.mjs/.test(l))) {
  fail(
    'content-trust-unwired',
    'control-plane job must run scripts/check-content-trust.mjs in a run step',
  );
}

// CI-gated deploy path (added 2026-09-18 closing the audit's top finding:
// with the 2026-09-10 workers-deploy removal, git-connected Workers Builds
// published every main merge independently of CI — no gate could block a
// release). The job must exist and stay honestly gated; a comment
// mentioning it must NOT satisfy these checks (run-step extraction only).
const deploy = jobBlock(ci, 'workers-deploy');
if (!deploy) {
  fail(
    'deploy-job-missing',
    "ci.yml lacks the CI-gated deploy job 'workers-deploy:' — deploys would bypass every gate",
  );
} else {
  if (!/if:\s*github\.event_name\s*==\s*['"]push['"]/.test(deploy)) {
    fail('deploy-not-push-only', 'workers-deploy must run on push only');
  }
  if (!/vars\.WORKERS_DEPLOY_VIA_CI\s*==\s*['"]true['"]/.test(deploy)) {
    fail(
      'deploy-ungated',
      'workers-deploy must be opt-in via vars.WORKERS_DEPLOY_VIA_CI',
    );
  }
  const deployRuns = [...deploy.matchAll(/-\s*run:\s*(.+)/g)].map((m) => m[1]);
  if (!deployRuns.some((l) => /wrangler\s+deploy/.test(l))) {
    fail('deploy-no-invocation', 'workers-deploy must run `wrangler deploy`');
  }
  if (!/^\s*needs:/m.test(deploy)) {
    fail('deploy-ungated', 'workers-deploy must need the gate jobs');
  }
  for (const gate of ['seo-gate', 'security-gate', 'perf-gate']) {
    if (!new RegExp(`^\\s*needs:[\\s\\S]*\\b${gate}\\b`, 'm').test(deploy)) {
      fail('deploy-ungated', `workers-deploy must need the ${gate} job`);
    }
  }
  if (/continue-on-error/.test(deploy)) {
    fail('deploy-ignorable', 'workers-deploy must not set continue-on-error');
  }
  for (const line of deployRuns) {
    if (
      /\|\|\s*true/.test(line) ||
      /;\s*true\s*$/.test(line) ||
      /\|\|\s*exit\s+0/.test(line)
    ) {
      fail(
        'deploy-exit-swallowed',
        `workers-deploy run line forces success: ${line.trim()}`,
      );
    }
  }
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ RELEASE_PATH_STATUS: status, failures }));
console.log(`RELEASE_PATH_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
