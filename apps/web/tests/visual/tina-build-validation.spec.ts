import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/**
 * Build validation suite — deterministic build-time checks for every
 * Tina layer that does not require credentials or a browser: lockfile
 * presence, Vite alias wiring, requestWithMetadata usage in the data
 * layer, field-marker convention, CSP frame policy, and build hygiene.
 */

const REPO = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
);
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

test('tinacms build scripts allow --skip-cloud-checks only with --skip-search-index (schema migration)', () => {
  const rootPkg = JSON.parse(readFile(join(REPO, 'package.json')));
  const hasTinaBuild = Object.values(
    rootPkg.scripts as Record<string, string>,
  ).some((s) => String(s).includes('tinacms build'));
  expect(hasTinaBuild, 'tinacms build present in scripts').toBe(true);
  for (const [, script] of Object.entries(
    rootPkg.scripts as Record<string, string>,
  )) {
    if (String(script).includes('--skip-cloud-checks')) {
      expect(
        String(script),
        'skip-cloud-checks must be paired with --skip-search-index',
      ).toContain('--skip-search-index');
    }
  }
  const ci = readFile(join(REPO, '.github', 'workflows', 'ci.yml'));
  for (const line of ci.split('\n')) {
    if (
      line.includes('tinacms build') &&
      line.includes('--skip-cloud-checks')
    ) {
      expect(
        line,
        'CI skip-cloud-checks must be paired with --skip-search-index',
      ).toContain('--skip-search-index');
    }
  }
  // still ensure at least one tinacms invocation exists in CI
  expect(ci).toContain('tinacms build');
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
