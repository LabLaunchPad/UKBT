import { expect, test } from '@playwright/test';

/**
 * Tina admin shell — proves the generated admin app deploys and loads its
 * login UI without authentication. Login completion itself requires a
 * TinaCloud seat (owner-tested); this spec guards the deploy/packaging path.
 * The pre-login TinaCloud billing check (401, cross-origin) is expected and
 * explicitly allowed; same-origin asset failures are not.
 */

test('admin shell serves login UI with healthy same-origin assets', async ({
  page,
}) => {
  const sameOriginFailures: string[] = [];
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:4321' && response.status() >= 400) {
      sameOriginFailures.push(`${response.status()} ${url.pathname}`);
    }
  });

  const response = await page.goto('/admin/');
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/TinaCMS/);
  await expect(page.locator('#root')).toBeAttached();
  await expect(page.getByText(/editing with TinaCMS/i).first()).toBeVisible();
  expect(sameOriginFailures, 'no same-origin asset failures').toEqual([]);
});

test('frame-ancestors CSP header is present (not X-Frame-Options DENY)', async ({
  page,
}) => {
  await page.goto('/admin/');
  const headers = await page.request.fetch('/admin/').then((r) => r.headers());
  const csp = headers.get('content-security-policy') || '';
  expect(csp).toContain('frame-ancestors');
  expect(csp).toContain("'self'");
});

test('no X-Frame-Options header overrides frame-ancestors', async ({
  page,
}) => {
  const response = await page.request.fetch('/admin/');
  const xfo = response.headers()['x-frame-options'];
  expect(xfo).toBeFalsy();
});

test('Tina bridge script loads correctly on admin shell', async ({ page }) => {
  await page.goto('/admin/');
  // Bridge is staged as a static asset at /admin/bridge.js by the
  // @tinacms/astro integration (verified via astro:build:done). In the
  // admin shell it is loaded as a module; in public pages it is loaded
  // via the TinaIsland inline bootstrap. Either path proves packaging.
  const bridge = await page.request.fetch('/admin/bridge.js');
  expect(bridge.ok()).toBe(true);
});
