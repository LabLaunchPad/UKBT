import { expect, test } from '@playwright/test';
import { renderFaqAnswer } from '../../src/lib/faq-answer';

/**
 * REM-001 regression suite — FAQ stored-markup injection (CORR-W1-01).
 *
 * Proves the FAQ answer renderer emits inert text, never executable markup:
 * BEFORE (vulnerable port) hostile cases FAIL; AFTER (escaped renderer) all PASS.
 * Includes a DOM-level proof via page.setContent (no CMS writes involved).
 */

const hostileScript = {
  type: 'root',
  children: [
    {
      type: 'p',
      children: [{ type: 'text', text: 'Hi <script>alert(1)</script>' }],
    },
  ],
};

const hostileImg = {
  type: 'root',
  children: [
    {
      type: 'p',
      children: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }],
    },
  ],
};

const hostileFallback = '</p><img src=x onerror=alert(1)><p>';

test('hostile script text is escaped, never emitted as markup', () => {
  const out = renderFaqAnswer(hostileScript);
  expect(out).toContain('&lt;script&gt;');
  expect(out).not.toContain('<script>');
});

test('hostile img text is escaped, never emitted as element', () => {
  const out = renderFaqAnswer(hostileImg);
  expect(out).toContain('&lt;img');
  expect(out).not.toContain('<img');
});

test('non-object fallback branch escapes markup', () => {
  const out = renderFaqAnswer(hostileFallback);
  expect(out).toContain('&lt;img');
  expect(out).not.toContain('<img');
});

test('benign text renders byte-identical to the legacy renderer', () => {
  const benign = {
    type: 'root',
    children: [
      {
        type: 'p',
        children: [
          { type: 'text', text: 'Visit the Join page or contact us.' },
        ],
      },
    ],
  };
  expect(renderFaqAnswer(benign)).toBe(
    '<p>Visit the Join page or contact us.</p>',
  );
});

test('ampersand text is escaped', () => {
  const out = renderFaqAnswer({
    type: 'root',
    children: [{ type: 'p', children: [{ type: 'text', text: 'Q & A' }] }],
  });
  expect(out).toBe('<p>Q &amp; A</p>');
});

test('rendered hostile output creates no executable DOM nodes', async ({
  page,
}) => {
  await page.setContent(
    `<div class="ukbt-faq-answer">${renderFaqAnswer(hostileScript)}</div>`,
  );
  expect(await page.locator('script').count()).toBe(0);
  await page.setContent(
    `<div class="ukbt-faq-answer">${renderFaqAnswer(hostileImg)}</div>`,
  );
  expect(await page.locator('img').count()).toBe(0);
  expect(await page.locator('.ukbt-faq-answer p').count()).toBe(1);
});

test('live /faq/ answers render with no script elements in answer slots', async ({
  page,
}) => {
  await page.goto('/faq/');
  expect(await page.locator('.ukbt-faq-answer script').count()).toBe(0);
  expect(await page.locator('.ukbt-faq-answer p').count()).toBeGreaterThan(0);
});
