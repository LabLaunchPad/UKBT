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
