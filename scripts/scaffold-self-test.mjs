import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'CLAUDE.md',
  'AGENTS.md',
  'README.md',
  'docs/01-gap-register.md',
  'docs/02-boundary-contract.md',
  'docs/03-evidence-contract.md',
  'docs/04-task-contract.md',
  'docs/05-resume-protocol.md',
  'docs/06-security-protocol.md',
  'docs/07-visual-contract.md',
  'prompts/00-admission.md',
  'prompts/01-falsification.md',
  'prompts/02-contract-freeze.md',
  'prompts/03-task-plan.md',
  'prompts/04-implementation.md',
  'prompts/05-independent-verification.md',
  'prompts/06-release-gate.md',
  'prompts/07-adaptive-learning.md',
  'prompts/08-replay-stress.md',
  'prompts/09-first-ui-task-few-shot.md',
  'prompts/10-recovery.md',
  'adversarial/cases.yaml',
  'schemas/receipt.schema.json',
];
const missing = required.filter((x) => !fs.existsSync(path.join(root, x)));
if (missing.length) {
  console.error(JSON.stringify({ status: 'FAIL', missing }, null, 2));
  process.exit(1);
}
for (const f of required) {
  const s = fs.statSync(path.join(root, f));
  if (s.size === 0) {
    console.error(`EMPTY ${f}`);
    process.exit(1);
  }
}
console.log(
  JSON.stringify({ status: 'PASS', required_files: required.length }, null, 2),
);
