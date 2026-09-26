import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Plan Task 4 (join-form spec §§ architecture/honesty/a11y). The v1
 * form is UI-only behind the mock adapter, so every submit path must
 * stay honest: no success state exists anywhere — not in the markup,
 * not in the script, and not in the DOM after a submit. Same
 * discipline as pages.spec.ts — real, executing checks against the
 * served dist (never `astro dev`).
 *
 * The submit button ships `disabled` in the markup (no-JS honesty:
 * with `novalidate` a native GET would mail personal data into the
 * query string) and the component script enables it — so every spec
 * that submits first waits for the button to enable, which also proves
 * the wiring ran.
 */

test('every join control renders with a programmatic label', async ({
  page,
}) => {
  await page.goto('/join/');
  // Upload picture is intentionally absent here: it is covered by the
  // disabled+explained spec below, not the labelling pass.
  const controls: Array<[string, RegExp]> = [
    ['#join-full-name', /full name/i],
    ['#join-date-of-birth', /date of birth/i],
    ['#join-nationality', /nationality/i],
    ['#join-country-of-residency', /country of residency/i],
    ['#join-phone', /phone number/i],
    ['#join-email', /email/i],
    ['#join-statistics-url', /statistics link/i],
    ['#join-video-links', /video links/i],
    ['#join-consent', /accept how the club uses my details/i],
    ['#join-age-attestation', /18 or over/i],
  ];
  for (const [id, name] of controls) {
    await expect(page.locator(id)).toHaveAccessibleName(name);
  }
});

test('empty submit renders a focused error summary and never a success state', async ({
  page,
}) => {
  await page.goto('/join/');
  const submit = page.locator('[data-join-form] button');
  await expect(submit).toBeEnabled();
  await submit.click();

  const summary = page.locator('[data-join-errors]');
  await expect(summary).toBeVisible();
  const focusedIsSummary = await page.evaluate(
    () =>
      document.activeElement === document.querySelector('[data-join-errors]'),
  );
  expect(focusedIsSummary, 'error summary receives focus').toBe(true);
  await expect(page.locator('#join-full-name')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#join-email')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  // Rendered text only (innerText, not HTML): the component script
  // legitimately names the forbidden state in its own comments.
  const text = await page.locator('body').innerText();
  expect(text, 'no success text anywhere in the DOM').not.toMatch(
    /thank you|success/i,
  );
});

test('upload control is disabled, explained, and described', async ({
  page,
}) => {
  await page.goto('/join/');
  const upload = page.locator('#join-picture');
  await expect(upload).toBeDisabled();
  const describedBy = await upload.getAttribute('aria-describedby');
  expect(describedBy).toBe('join-picture-hint');
  const hint = page.locator('#join-picture-hint');
  await expect(hint).toBeVisible();
  expect(
    (await hint.innerText()).trim().length,
    'upload explanation must say something',
  ).toBeGreaterThan(0);
  // A dangling aria-describedby is silent — prove the id resolves.
  const resolves = await page.evaluate(
    (id: string) => document.getElementById(id) !== null,
    describedBy ?? '',
  );
  expect(resolves, 'aria-describedby resolves to the explanation').toBe(true);
});

test('valid submit renders the honest not-open notice and never a success state', async ({
  page,
}) => {
  await page.goto('/join/');
  // Pre-submit honesty: the notice precedes the click, so the rule
  // holds even for someone who never presses submit.
  const notice = page.locator('.ukbt-join__notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(/not open/i);

  const submit = page.locator('[data-join-form] button');
  await expect(submit).toBeEnabled();
  await page.locator('#join-full-name').fill('Alex Test');
  await page.locator('#join-date-of-birth').fill('2000-01-15');
  await page.locator('#join-nationality').fill('British');
  await page.locator('#join-country-of-residency').fill('United Kingdom');
  await page.locator('#join-phone').fill('+447700900000');
  await page.locator('#join-email').fill('alex.test@example.com');
  await page.locator('#join-consent').check();
  await page.locator('#join-age-attestation').check();
  await submit.click();

  const result = page.locator('[data-join-result]');
  await expect(result).toContainText(/not open/i);
  // Real channels, not a dead end: the message names somewhere that works.
  await expect(result).toContainText(/@/);
  const body = await page.locator('body').innerText();
  expect(body, 'no success text anywhere in the DOM').not.toMatch(
    /thank you|success/i,
  );
});

test('axe-core scan reports zero violations on /join/', async ({ page }) => {
  await page.goto('/join/');
  // Settle reveals/transitions before scanning (same rationale as
  // pages.spec.ts: mid-flight opacity blends into bogus ~1.01 ratios,
  // flaky across CI routes).
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => {
      const slideshow = new Set(
        document.querySelector('.ukbt-hero__bg--alt')?.getAnimations() ?? [],
      );
      return (
        Array.from(document.querySelectorAll('[data-motion="reveal"]')).every(
          (el) => el.classList.contains('is-visible'),
        ) &&
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState === 'finished' ||
              a.playState === 'idle' ||
              slideshow.has(a),
          )
      );
    },
    null,
    { timeout: 15000 },
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  if (results.violations.length > 0) {
    console.log(JSON.stringify(results.violations, null, 2));
  }
  expect(
    results.violations,
    `axe violations on /join/: ${results.violations.map((v) => v.id).join(', ')}`,
  ).toEqual([]);
});

test('keyboard-only: tab reaches submit and Enter triggers the summary path', async ({
  page,
}) => {
  await page.goto('/join/');
  const submit = page.locator('[data-join-form] button');
  await expect(submit).toBeEnabled();
  // The stops before it are header chrome — not this spec's business —
  // so Tab until the submit button takes focus, bounded.
  let reached = false;
  for (let i = 0; i < 80; i++) {
    reached = await submit.evaluate((el) => document.activeElement === el);
    if (reached) break;
    await page.keyboard.press('Tab');
  }
  expect(reached, 'tab reaches the submit button').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-join-errors]')).toBeVisible();
});
