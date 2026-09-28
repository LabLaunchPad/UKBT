import { test, expect } from '@playwright/test';

test('roster badges split role-primary from tags', async ({ page }) => {
  await page.goto('/players/');
  const card = page.locator('#squad .ukbt-squad-card').first();
  await expect(card.locator('.ukbt-squad-card__badge--role')).toHaveCount(1);
  const roleText = await card.locator('.ukbt-squad-card__badge--role').innerText();
  expect(roleText.length).toBeGreaterThan(0);
});

test('badge tags never invent taxonomy', async ({ page }) => {
  await page.goto('/players/');
  const tags = await page.locator('#squad .ukbt-squad-card__badge--tag').allInnerTexts();
  for (const t of tags) {
    expect(['Wicket-keeper', 'U-19', 'All-Rounder']).toContain(t.trim());
  }
});

test('filters group cricket-meaning before photo-presence', async ({ page }) => {
  await page.goto('/players/');
  const groups = page.locator('#squad [role="group"]');
  await expect(groups).toHaveCount(2);
  await expect(groups.nth(0)).toHaveAttribute('aria-label', 'Playing role');
  await expect(groups.nth(1)).toHaveAttribute('aria-label', 'Photo availability');
  const firstKeys = await groups.nth(0).locator('[data-filter]').evaluateAll(
    (els) => els.map((e) => e.getAttribute('data-filter')),
  );
  expect(firstKeys).toEqual(['a', 'k', 'r', 'j', 't']);
});

test('grouped filters still filter and count', async ({ page }) => {
  await page.goto('/players/');
  await page.locator('#squad [data-filter="k"]').click();
  await expect(page.locator('#squad [data-squad-count]')).toContainText('of');
  const visible = await page.locator('#squad .ukbt-squad-card:not([hidden])').count();
  expect(visible).toBeGreaterThan(0);
});

test('role-duplicate tags render once, in the role pill', async ({ page }) => {
  await page.goto('/players/');
  const card = page.locator('#squad .ukbt-squad-card', { hasText: 'Roushan Singh' });
  await expect(card.locator('.ukbt-squad-card__badge--role')).toHaveText('Wicket-keeper');
  await expect(card.locator('.ukbt-squad-card__badge--tag', { hasText: 'Wicket-keeper' })).toHaveCount(0);
});
