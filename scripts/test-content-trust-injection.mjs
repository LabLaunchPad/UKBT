#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
// Content-trust failure injection (REM-004) — proves scripts/check-content-
// trust.mjs fails closed on each bypass class and passes on a clean tree,
// using isolated temp fixture trees via UKBT_CHECK_ROOT (never the repo).
// Output ends with:
//   CONTENT_TRUST_INJECTION_STATUS = PASS | FAIL
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const gate = join(root, 'scripts/check-content-trust.mjs');
const results = [];

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'ukbt-trust-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

function runGate(dir) {
  const out = spawnSync(process.execPath, [gate], {
    env: { ...process.env, UKBT_CHECK_ROOT: dir },
    encoding: 'utf8',
    timeout: 60000,
  });
  return { code: out.status, text: `${out.stdout}${out.stderr}` };
}

function runCase(name, files, expectExit, expectRule) {
  const dir = tree(files);
  const { code, text } = runGate(dir);
  rmSync(dir, { recursive: true, force: true });
  const pass =
    code === expectExit && (expectRule ? text.includes(expectRule) : true);
  results.push({ name, pass, exit: code });
  console.log(`${pass ? 'ok' : 'FAIL'} - ${name}: exit=${code}`);
}

const CLEAN_CONFIG = `export default { schema: { collections: [
  { name: 'homepage', fields: [{ type: 'string', name: 'eyebrow' }] },
] } };`;
const CLEAN_POLICY = `export const TINA_FIELD_TRUST = { 'homepage.eyebrow': p('x') };
export const EXEMPT_POLICY = { 'nav.home': { category: 'ui_labels', reason: 'x' } };`;
const CLEAN_PAGE = [
  '---',
  'const graph = homepageGraph({ founded: homepage.founded });',
  '---',
  '<BaseLayout structuredData={graph} />',
].join('\n');
const CLEAN_DATA = `const exemptFields = new Set(['nav.home']);`;

const cleanFiles = {
  'tina/config.ts': CLEAN_CONFIG,
  'apps/web/src/lib/content-trust.ts': CLEAN_POLICY,
  'apps/web/src/pages/index.astro': CLEAN_PAGE,
  'apps/web/src/content/homepage-data.ts': CLEAN_DATA,
};

runCase('clean-tree-passes', cleanFiles, 0);
runCase(
  'unclassified-field-fails',
  {
    ...cleanFiles,
    'tina/config.ts': CLEAN_CONFIG.replace(
      `name: 'eyebrow'`,
      `name: 'evilNewField'`,
    ),
  },
  1,
  'unclassified-tina-field',
);
runCase(
  'structured-tina-input-fails',
  {
    ...cleanFiles,
    'apps/web/src/pages/index.astro': CLEAN_PAGE.replace(
      'homepage.founded',
      'tinaHomepage.metaDescription',
    ),
  },
  1,
  'structured-tina-input',
);
runCase(
  'unregistered-exemption-fails',
  {
    ...cleanFiles,
    'apps/web/src/content/homepage-data.ts': CLEAN_DATA.replace(
      `'nav.home'`,
      `'org.stat_players'`,
    ),
  },
  1,
  'unregistered-exemption',
);
runCase(
  'double-quoted-field-fails',
  {
    ...cleanFiles,
    'tina/config.ts': CLEAN_CONFIG.replace(`name: 'eyebrow'`, `name: "evilDq"`),
  },
  1,
  'unclassified-tina-field',
);
runCase(
  'aliased-tina-into-graph-fails',
  {
    ...cleanFiles,
    'apps/web/src/pages/index.astro': [
      '---',
      `import { tinaHomepage as tina_homepage } from '../lib/tina/loaders';`,
      'const graph = homepageGraph({ founded: tina_homepage.tagline });',
      '---',
      '<BaseLayout structuredData={graph} />',
    ].join('\n'),
  },
  1,
  'structured-tina-input',
);
runCase(
  'indirect-structured-prop-fails',
  {
    ...cleanFiles,
    'apps/web/src/pages/index.astro': [
      '---',
      `import { tinaHomepage } from '../lib/tina/loaders';`,
      'const myGraph = { description: tinaHomepage.metaDescription };',
      '---',
      '<BaseLayout structuredData={myGraph} />',
    ].join('\n'),
  },
  1,
  'structured-tina-prop',
);
runCase(
  'typed-set-exemption-fails',
  {
    ...cleanFiles,
    'apps/web/src/content/homepage-data.ts': `const exemptFields = new Set<string>(['org.stat_x']);`,
  },
  1,
  'unregistered-exemption',
);
runCase(
  'default-import-into-graph-fails',
  {
    ...cleanFiles,
    'apps/web/src/pages/index.astro': [
      '---',
      `import siteData from '../content/site/siteSettings.json';`,
      'const graph = homepageGraph({ tagline: siteData.footerTagline });',
      '---',
      '<BaseLayout structuredData={graph} />',
    ].join('\n'),
  },
  1,
  'structured-tina-input',
);
runCase(
  'spaced-set-exemption-fails',
  {
    ...cleanFiles,
    'apps/web/src/content/homepage-data.ts': `const exemptFields = new Set ([ 'org.stat_x' ]);`,
  },
  1,
  'unregistered-exemption',
);

const failed = results.filter((r) => !r.pass);
const status = failed.length === 0 ? 'PASS' : 'FAIL';
console.log(
  JSON.stringify({
    CONTENT_TRUST_INJECTION_STATUS: status,
    failed: failed.map((r) => r.name),
  }),
);
console.log(`CONTENT_TRUST_INJECTION_STATUS = ${status}`);
process.exit(failed.length === 0 ? 0 : 1);
