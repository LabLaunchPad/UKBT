#!/usr/bin/env node
// UI-gate failure injection — proves scripts/check-ui.mjs fails closed on
// each defect class and passes on a healthy tree, using isolated temp
// fixture trees via UKBT_CHECK_ROOT (never the repo). Follows the existing
// test-*-failure-injection.mjs pattern: synthetic fixtures, real gate code.
// Output ends with:
//   UI_INJECTION_STATUS = PASS | FAIL
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const gate = join(root, 'scripts/check-ui.mjs');
const results = [];

const GOOD_HTML =
  '<html><body><h1>T</h1><h2>S</h2><p>x</p><img src="a.webp" alt="a" width="1" height="1"></body></html>';
const GOOD_FAQ_SECTION = '<div><p>{item.answer}</p></div>';
const GOOD_LAYOUT =
  '<html><head><script type="application/ld+json" set:html={JSON.stringify({})}></script></head></html>';

function buildTree({ html, tournaments, component, faq, faqSection, layout }) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-ui-inj-'));
  mkdirSync(join(dir, 'apps/web/dist/client'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/components'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/content'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/pages'), { recursive: true });
  mkdirSync(join(dir, 'apps/web/src/layouts'), { recursive: true });
  if (html !== null) {
    writeFileSync(join(dir, 'apps/web/dist/client/index.html'), html);
  }
  if (tournaments !== null) {
    writeFileSync(
      join(dir, 'apps/web/src/content/tournaments-data.ts'),
      tournaments,
    );
  }
  writeFileSync(
    join(dir, 'apps/web/src/components/Ok.astro'),
    component ?? '<div>ok</div>',
  );
  writeFileSync(
    join(dir, 'apps/web/src/pages/faq.astro'),
    faq ?? '<div>faq</div>',
  );
  writeFileSync(
    join(dir, 'apps/web/src/components/FAQSection.astro'),
    faqSection ?? GOOD_FAQ_SECTION,
  );
  writeFileSync(
    join(dir, 'apps/web/src/layouts/BaseLayout.astro'),
    layout ?? GOOD_LAYOUT,
  );
  return dir;
}

const GOOD = {
  html: GOOD_HTML,
  tournaments: 'export const tournaments = [];',
};

function runCase(name, tree, expectExit, expectRule) {
  const dir =
    tree === null
      ? mkdtempSync(join(tmpdir(), 'ukbt-ui-inj-'))
      : buildTree(tree);
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

await runCase('healthy-tree-passes', GOOD, 0, 'UI_STATUS = PASS');
await runCase('missing-dist-fails', null, 1, 'no dist');
await runCase(
  'double-h1-fails',
  {
    ...GOOD,
    html: '<html><body><h1>A</h1><h1>B</h1></body></html>',
  },
  1,
  'single-h1',
);
await runCase(
  'heading-skip-fails',
  {
    ...GOOD,
    html: '<html><body><h1>A</h1><h3>C</h3></body></html>',
  },
  1,
  'heading-order',
);
await runCase(
  'img-no-alt-fails',
  {
    ...GOOD,
    html: '<html><body><h1>A</h1><img src="a.webp" width="1" height="1"></body></html>',
  },
  1,
  'img-alt',
);
await runCase(
  'stale-upcoming-fails',
  {
    ...GOOD,
    tournaments:
      "export const t = [{ when: 'January 2020', status: 'Upcoming' }];",
  },
  1,
  'stale-upcoming',
);
await runCase(
  'focus-uncovered-fails',
  {
    ...GOOD,
    component:
      '---\n---\n<button>x</button>\n<style>\n.x { color: surface-inverse; }\n</style>',
  },
  1,
  'focus-coverage',
);
await runCase(
  'faq-sink-missing-fails',
  {
    ...GOOD,
    faqSection: '<div>no approved sink here</div>',
  },
  1,
  'faq-sink-wiring',
);
await runCase(
  'extra-raw-sink-fails',
  {
    ...GOOD,
    layout: `${GOOD_LAYOUT}<div set:html={x}></div>`,
  },
  1,
  'raw-sink-count',
);

const failed = results.filter((r) => !r.pass);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(`UI_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
