#!/usr/bin/env node
// Control-plane self-audit gate — verifies the AI engineering control
// plane is wired, not merely written. Fails closed: any missing contract,
// knowledge file, gate script, CI job, or release-gate step is a FAIL.
// Normative source: contracts/AI-EXECUTION-CONTRACT.md §13.
// Output ends with:
//   CONTROL_PLANE_STATUS = PASS | FAIL
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const read = (p) => readFileSync(join(root, p), 'utf8');
const has = (p) => existsSync(join(root, p));

// 1. Normative contract present with the state machine and fail-closed terms.
if (!has('contracts/AI-EXECUTION-CONTRACT.md')) {
  fail('contract-missing', 'contracts/AI-EXECUTION-CONTRACT.md absent');
} else {
  const c = read('contracts/AI-EXECUTION-CONTRACT.md');
  for (const token of [
    'HISTORY_AUDIT',
    'IMPACT_ANALYSIS',
    'IMPLEMENTATION_AUTHORIZED',
    'ADVERSARIAL_REVIEW',
    'RELEASE_GATE',
    'CHANGE_IMPACT_MATRIX',
    'VERIFIED_WITH_LIMITATIONS',
  ]) {
    if (!c.includes(token)) fail('contract-incomplete', `missing ${token}`);
  }
}

// 2. Compact knowledge substrate present and versioned.
if (!has('knowledge/12-AI-CONTROL-PLANE.yaml')) {
  fail('knowledge-missing', 'knowledge/12-AI-CONTROL-PLANE.yaml absent');
} else {
  const k = read('knowledge/12-AI-CONTROL-PLANE.yaml');
  for (const token of ['DR-C01', 'DR-C12', 'INV-C01', 'PLAN_READY']) {
    if (!k.includes(token)) fail('knowledge-incomplete', `missing ${token}`);
  }
}

// 3. Task template carries the required evidence fields (P9).
if (!has('contracts/task-contract.template.yaml')) {
  fail('task-template-missing', 'contracts/task-contract.template.yaml absent');
} else {
  const t = read('contracts/task-contract.template.yaml');
  for (const field of [
    'repository_sha',
    'files_inspected',
    'change_plan',
    'test_plan',
    'rollback_plan',
    'verification_results',
  ]) {
    if (!t.includes(field))
      fail('task-template-incomplete', `missing ${field}`);
  }
}

// 4. Gate scripts present.
for (const s of [
  'scripts/check-deploy-mapping.mjs',
  'scripts/smoke-deploy.mjs',
  'scripts/test-deploy-failure-injection.mjs',
]) {
  if (!has(s)) fail('gate-script-missing', s);
}

// 5. CI wires the control-plane jobs (all merge-blocking by file header rule).
// Job keys are matched as YAML mapping keys at 2-space indent — a comment
// mentioning the job name must NOT satisfy this (adversarial finding
// 2026-09-15: substring matching passed a commented-out job as present).
const ci = has('.github/workflows/ci.yml')
  ? read('.github/workflows/ci.yml')
  : '';
for (const job of ['deploy-mapping', 'failure-injection', 'control-plane']) {
  if (!new RegExp(`^  ${job}:`, 'm').test(ci)) {
    fail('ci-job-missing', `ci.yml lacks job key '${job}:'`);
  }
}

// 6. deploy:verify runs the control-plane gate and deploy mapping in order.
const pkg = has('package.json') ? JSON.parse(read('package.json')) : {};
const verify = pkg.scripts?.['deploy:verify'] || '';
for (const step of ['check:control-plane', 'check:deploy-mapping']) {
  if (!verify.includes(step))
    fail('release-gate-missing', `deploy:verify lacks ${step}`);
}
if (
  verify.includes('check:control-plane') &&
  verify.includes('pnpm run build') &&
  verify.indexOf('check:control-plane') > verify.indexOf('pnpm run build')
) {
  fail('release-gate-order', 'check:control-plane must run before build');
}

// 7. Single-authority pointers: agent guides reference the contract instead
// of restating it (INV-C01 — no parallel rule systems).
for (const guide of ['AGENTS.md', 'CLAUDE.md']) {
  if (!has(guide) || !read(guide).includes('AI-EXECUTION-CONTRACT')) {
    fail(
      'guide-pointer-missing',
      `${guide} must reference AI-EXECUTION-CONTRACT`,
    );
  }
}

// 8. Contracts index lists the new contract (one source of truth per subject).
if (
  !has('contracts/README.md') ||
  !read('contracts/README.md').includes('AI-EXECUTION-CONTRACT.md')
) {
  fail('contract-index-missing', 'contracts/README.md must index the contract');
}

// 9. Incident knowledge persists: 404 postmortem recorded in the catalog.
if (
  !has('artifacts/adaptive-learning/ERROR-CATALOG.md') ||
  !read('artifacts/adaptive-learning/ERROR-CATALOG.md').includes('AL-026')
) {
  fail('incident-knowledge-missing', 'ERROR-CATALOG.md must record AL-026');
}

// 10. Adversarial suite present (independent falsification lives here).
if (!has('adversarial/cases.yaml')) {
  fail('adversarial-missing', 'adversarial/cases.yaml absent');
}

const status = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(JSON.stringify({ CONTROL_PLANE_STATUS: status, failures }));
console.log(`CONTROL_PLANE_STATUS = ${status}`);
process.exit(failures.length === 0 ? 0 : 1);
