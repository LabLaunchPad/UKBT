#!/usr/bin/env node
// Motion-gate failure injection — proves scripts/check-motion.mjs fails
// closed on each defect class and passes on a healthy tree, using isolated
// temp fixture trees via UKBT_CHECK_ROOT (never the repo). Follows the
// existing test-*-failure-injection.mjs pattern: synthetic fixtures, real
// gate code. Output ends with:
//   MOTION_INJECTION_STATUS = PASS | FAIL
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const gate = join(root, 'scripts/check-motion.mjs');
const results = [];

const GOOD_BASE = `::view-transition-old(root) { animation: none; }
::view-transition-group(root) { animation: none; }
html.ukbt-motion-js [data-motion='reveal'] { opacity: 0; }
@keyframes ukbt-soft-fade { from { opacity: 0; } to { opacity: 1; } }
.ukbt-hero__headline { animation: var(--ukbt-motion-soft-fade); }
.ukbt-page-banner__inner { animation: var(--ukbt-motion-soft-fade); }
html.ukbt-motion-js [data-motion='reveal'] { animation: var(--ukbt-motion-soft-fade); }
`;
const GOOD_LAYOUT = '<div>ClientRouter ukbt-motion-js</div>';
const GOOD_COMPONENT = '<div>ok</div>\n<style>\n.x { color: red; }\n</style>';

function buildTree({ base, layout, component }) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-motion-inj-'));
  mkdirSync(join(dir, 'apps/web/src/styles'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/layouts'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/components'), { recursive: true });
  writeFileSync(join(dir, 'apps/web/src/styles/base.css'), base);
  writeFileSync(join(dir, 'apps/web/src/layouts/BaseLayout.astro'), layout);
  writeFileSync(join(dir, 'apps/web/src/components/Ok.astro'), component);
  return dir;
}

const GOOD = {
  base: GOOD_BASE,
  layout: GOOD_LAYOUT,
  component: GOOD_COMPONENT,
};

function runCase(name, tree, expectExit, expectRule) {
  const dir = buildTree(tree);
  const out = spawnSync(process.execPath, [gate], {
    env: { ...process.env, UKBT_CHECK_ROOT: dir },
    encoding: 'utf8',
  });
  const text = `${out.stdout}${out.stderr}`;
  const okExit = out.status === expectExit;
  const okRule = expectRule ? text.includes(expectRule) : true;
  const pass = okExit && okRule;
  results.push({ name, pass, exit: out.status });
  console.log(`${pass ? 'ok' : 'FAIL'} - ${name}: exit=${out.status}`);
}

await runCase('healthy-tree-passes', GOOD, 0, 'MOTION_STATUS = PASS');
await runCase(
  'choreography-delay-passes',
  {
    ...GOOD,
    component:
      '<div>ok</div>\n<style>\n.x {\nanimation: var(--ukbt-motion-soft-fade);\nanimation-delay: 150ms;\n}\n</style>',
  },
  0,
  'MOTION_STATUS = PASS',
);
await runCase(
  'literal-duration-fails',
  {
    ...GOOD,
    component:
      '<div>ok</div>\n<style>\n.x { transition: opacity 300ms; }\n</style>',
  },
  1,
  'literal-duration',
);
await runCase(
  'transition-all-fails',
  {
    ...GOOD,
    component:
      '<div>ok</div>\n<style>\n.x {\ntransition: all 200ms ease;\n}\n</style>',
  },
  1,
  'transition-all',
);
await runCase(
  'scroll-listener-fails',
  {
    ...GOOD,
    component: `<div>ok</div>\n<script>\nwindow.addEventListener('scroll', () => {});\n</script>`,
  },
  1,
  'scroll-listener',
);
await runCase(
  'vt-kill-missing-fails',
  {
    ...GOOD,
    base: 'body { color: red; }\n',
  },
  1,
  'vt-reduced-motion',
);
await runCase(
  'client-router-missing-fails',
  {
    ...GOOD,
    layout: '<div>ukbt-motion-js</div>',
  },
  1,
  'client-router',
);
await runCase(
  'soft-fade-missing-fails',
  {
    ...GOOD,
    base: `${'::view-transition-old(root) { animation: none; }\n'}html.ukbt-motion-js [data-motion='reveal'] { opacity: 0; }\n`,
  },
  1,
  'soft-fade-missing',
);

const failed = results.filter((r) => !r.pass);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(`MOTION_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
