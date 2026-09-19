import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/**
 * Build validation suite — deterministic build-time checks for every
 * Tina layer that does not require credentials or a browser: lockfile
 * presence, Vite alias wiring, requestWithMetadata usage in the data
 * layer, field-marker convention, CSP frame policy, and build hygiene.
 */

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const WEB = join(REPO, 'apps', 'web');

function readFile(path: string): string {
  return readFileSync(path, 'utf8');
}

test('tina/tina-lock.json exists (commit check)', () => {
  expect(
    existsSync(join(REPO, 'tina', 'tina-lock.json')),
    'tina/tina-lock.json exists',
  ).toBe(true);
});

test('Vite @tina-client alias resolves to generated client', () => {
  const astroConfig = readFile(join(WEB, 'astro.config.mjs'));
  expect(astroConfig).toContain('@tina-client');
  expect(astroConfig).toContain('tina/__generated__/client.ts');
});

test('requestWithMetadata is used in the Tina data layer', () => {
  const dataSrc = readFile(join(WEB, 'src', 'lib', 'tina', 'data.ts'));
  expect(dataSrc).toContain('requestWithMetadata');
  const islandsSrc = readFile(join(WEB, 'src', 'lib', 'tina', 'islands.ts'));
  expect(islandsSrc).toContain('./data');
});

test('no literal data-tina-field="..." strings exist in source (all use tinaField())', () => {
  const files = [
    'src/components/Hero.astro',
    'src/components/ClubIntro.astro',
    'src/components/Button.astro',
    'src/components/FAQSection.astro',
    'src/components/WhyChooseUs.astro',
    'src/components/SectionHeader.astro',
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/pages/faq.astro',
  ];
  for (const file of files) {
    const src = readFile(join(WEB, file));
    expect(
      src.match(/data-tina-field=["']/),
      `${file} uses tinaField() not literal markers`,
    ).toBeNull();
  }
});

test('no X-Frame-Options header in _headers (frame-ancestors governs instead)', () => {
  const headers = readFile(join(WEB, 'public', '_headers'));
  const xfo = headers
    .split('\n')
    .find(
      (l) => /^\s*X-Frame-Options\s*:/.test(l) && !l.trim().startsWith('#'),
    );
  expect(xfo, 'no X-Frame-Options header in _headers').toBeUndefined();
});

test('no --skip-cloud-checks in build scripts or CI Tina invocations', () => {
  const rootPkg = JSON.parse(readFile(join(REPO, 'package.json')));
  for (const [, script] of Object.entries(
    rootPkg.scripts as Record<string, string>,
  )) {
    expect(
      String(script),
      'no --skip-cloud-checks in build scripts',
    ).not.toContain('--skip-cloud-checks');
  }
  const ci = readFile(join(REPO, '.github', 'workflows', 'ci.yml'));
  expect(ci, 'no --skip-cloud-checks in CI').not.toContain(
    '--skip-cloud-checks',
  );
});

test('tina/config.ts declares collections and tina-lock.json is committed', () => {
  const configSrc = readFile(join(REPO, 'tina', 'config.ts'));
  expect(configSrc).toContain('defineConfig');
  expect(configSrc).toContain('collections');
  for (const name of ['homepage', 'about', 'faq', 'siteSettings']) {
    expect(configSrc).toContain(`name: '${name}'`);
  }
  expect(existsSync(join(REPO, 'tina', 'tina-lock.json'))).toBe(true);
});
