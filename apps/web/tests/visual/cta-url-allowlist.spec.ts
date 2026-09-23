import { expect, test } from '@playwright/test';
import {
  isEmailValue,
  isHttpsUrl,
  isSiteRelativeUrl,
  isTelUrl,
} from '../../src/lib/allowed-urls';

/**
 * REM-003 regression suite — server-side URL allowlist (CTA scheme validation).
 * BEFORE (permissive stub): hostile cases FAIL. AFTER (real allowlist): all PASS.
 * Covers the §8 adversarial matrix: schemes, case, whitespace, encoding,
 * control characters, protocol-relative, plus legitimate product URLs.
 */

const hostileRelative = [
  'javascript:alert(1)',
  'JAVASCRIPT:alert(1)',
  'JaVaScRiPt:alert(1)',
  'java\nscript:alert(1)',
  'java\tscript:alert(1)',
  ' javascript:alert(1)',
  'javascript:alert(1) ',
  '//evil.example',
  '//evil.example/path',
  '/\\evil.example',
  'data:text/html,<script>alert(1)</script>',
  'DATA:text/html,hi',
  'vbscript:msgbox(1)',
  '%6a%61%76%61%73%63%72%69%70%74:alert(1)',
  '%2525256a%2561%2576%2561%2573%2563%2572%2569%2570%2574%253aalert(1)',
  'java%0ascript:alert(1)',
  'java%09script:alert(1)',
  'jav\tascript:alert(1)',
  'https://evil.example',
  'http://evil.example',
  'mailto:friend@example.com',
  'tel:+447827627997',
  '',
  'join-the-club',
  'C:\\windows\\evil',
];

test('hostile navigation values are rejected as site-relative URLs', () => {
  for (const v of hostileRelative) {
    expect(isSiteRelativeUrl(v), JSON.stringify(v)).toBe(false);
  }
});

test('legitimate site-relative URLs are accepted', () => {
  for (const v of [
    '/',
    '/join/',
    '/about/',
    '/tournaments/',
    '/players/#squad',
    '/news/?page=2',
  ]) {
    expect(isSiteRelativeUrl(v), JSON.stringify(v)).toBe(true);
  }
});

test('tel: values accept phone shapes, reject schemes and markup', () => {
  expect(isTelUrl('tel:+447827627997')).toBe(true);
  expect(isTelUrl('tel:07827627997')).toBe(true);
  for (const v of [
    'javascript:alert(1)',
    '+447827627997',
    'tel:<img>',
    'tel: 123',
    'https://evil.example',
  ]) {
    expect(isTelUrl(v), JSON.stringify(v)).toBe(false);
  }
});

test('email values accept mailbox shapes, reject markup and schemes', () => {
  expect(isEmailValue('info@ukbanglatigers.co.uk')).toBe(true);
  for (const v of [
    'javascript:alert(1)',
    'not-an-email',
    'a<b@c.com',
    'a @b.com',
    '',
  ]) {
    expect(isEmailValue(v), JSON.stringify(v)).toBe(false);
  }
});

test('https: values accept web URLs, reject schemes and markup', () => {
  expect(isHttpsUrl('https://www.facebook.com/UKBanglaTigers')).toBe(true);
  expect(isHttpsUrl('https://x.com/ukbanglatigers')).toBe(true);
  for (const v of [
    'javascript:alert(1)',
    'http://evil.example',
    '//evil.example',
    'https://evil.example/x onerror=alert(1)',
    'https://evil.example/<script>',
    '',
  ]) {
    expect(isHttpsUrl(v), JSON.stringify(v)).toBe(false);
  }
});

test('live site CTA hrefs use allowed forms only', async ({ page }) => {
  await page.goto('/');
  const hrefs: Array<string | null> = await page
    .locator('.ukbt-hero__actions a')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) {
    expect(isSiteRelativeUrl(h), JSON.stringify(h)).toBe(true);
  }
});
