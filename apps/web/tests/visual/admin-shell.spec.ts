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
