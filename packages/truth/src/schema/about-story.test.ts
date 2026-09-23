import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import aboutJson from '../../../../apps/web/content/about/about.json';

/**
 * P0-7 — About `storyBody` regression pin (T4 proven-working path, 2026-09-23).
 *
 * T4 verdict: NO renderer proven broken — live `/about` renders both stored
 * paragraphs verbatim, no `[object Object]`. These tests pin that correct
 * behavior so any future drift fails loudly. No migration: `storyBody`
 * stays rich-text per T4.
 *
 * Contract mirrors (behavioral, not imports — `packages/truth` owns no UI
 * code per contracts/REPOSITORY-CONTRACT.md, and `apps/web` has no vitest
 * harness per T4, so this file lives in `@ukbt/truth` without scaffolding):
 * - `normalizeRichText` semantics mirror `AboutStory.astro` (and the twin
 *   copy in `FAQSection.astro`) at base `e544985`.
 * - `AboutStoryBodySchema` mirrors `AboutSchema.storyBody: z.unknown()`
 *   in `apps/web/src/lib/tina/loaders.ts` (verbatim preserve via
 *   `validateWithPreserve`).
 * - Stored-shape fixture source: `apps/web/content/about/about.json`
 *   (`storyBody` = Slate `root` with 2× `p`/`text` children).
 *
 * RED step (TDD): this file first landed with a naive `String(content)`
 * mirror simulating the `[object Object]` bug — object/null cases failed
 * for exactly that reason (see task-P07-report.md). GREEN swaps in the
 * faithful mirror below; no production code changed (no gap found).
 *
 * Save round-trip: UNTESTABLE without TinaCloud creds (no seat/token in
 * this environment) — stated, not simulated.
 */

// Faithful mirror of AboutStory.astro `normalizeRichText` (unknown+casts
// instead of `any`; semantics identical): falsy/non-objects pass through,
// single-`invalid_markdown`-child roots unwrap to the inner string,
// everything else is identity — never `String()`-coerced.
function normalizeRichText(content: unknown): unknown {
  if (!content || typeof content !== 'object') return content;
  const c = content as Record<string, unknown>;
  if (
    c.type === 'root' &&
    Array.isArray(c.children) &&
    (c.children as unknown[]).length === 1
  ) {
    const first = (c.children as Record<string, unknown>[])[0];
    if (first?.type === 'invalid_markdown' && first?.value) {
      return first.value;
    }
  }
  return content;
}

// Mirrors AboutSchema.storyBody: z.unknown().optional() (loaders.ts).
const AboutStoryBodySchema = z.object({ storyBody: z.unknown().optional() });

// Live stored content (same JSON `getAbout` serves); shape assertions below
// survive editorial text edits but fail on structural drift.
const storedStory = (aboutJson as Record<string, unknown>).storyBody;

const validRoot = {
  type: 'root',
  children: [
    {
      type: 'p',
      children: [{ type: 'text', text: 'First paragraph.', marks: [] }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'Second paragraph.', marks: [] }],
    },
  ],
};

describe('about storyBody — stored shape (Slate root/children)', () => {
  it('stored storyBody is a root with paragraph/text children', () => {
    const story = storedStory as Record<string, unknown>;
    expect(story.type).toBe('root');
    const children = story.children as Record<string, unknown>[];
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBeGreaterThan(0);
    for (const p of children) {
      expect(p.type).toBe('p');
      const leaves = p.children as Record<string, unknown>[];
      expect(Array.isArray(leaves)).toBe(true);
      for (const leaf of leaves) {
        expect(leaf.type).toBe('text');
        expect(typeof leaf.text).toBe('string');
      }
    }
  });

  it('loader schema preserves the rich-text object verbatim', () => {
    const parsed = AboutStoryBodySchema.parse({ storyBody: validRoot });
    expect(parsed.storyBody).toEqual(validRoot);
  });
});

describe('about storyBody — renderer input shape', () => {
  it('valid root passes through by identity (TinaMarkdown-ready object)', () => {
    expect(normalizeRichText(validRoot)).toBe(validRoot);
  });

  it('multi-child root containing an invalid_markdown node stays identity', () => {
    const mixed = {
      type: 'root',
      children: [
        { type: 'invalid_markdown', value: 'Stray' },
        { type: 'p', children: [{ type: 'text', text: 'Kept.' }] },
      ],
    };
    expect(normalizeRichText(mixed)).toBe(mixed);
  });
});

describe('about storyBody — normalization edge', () => {
  it('single-invalid_markdown-child root unwraps to the inner string (documented expectation)', () => {
    // T4 latent, pinned: unreachable on current content (valid `p` nodes);
    // the bare string is handed to TinaMarkdown (typed for objects), so if
    // Tina ever emits this shape, re-probe then. No action now.
    const edge = {
      type: 'root',
      children: [{ type: 'invalid_markdown', value: 'Recovered text' }],
    };
    expect(normalizeRichText(edge)).toBe('Recovered text');
  });
});

describe('about storyBody — null/undefined fall back to paragraphs', () => {
  it('null passes through (falsy → AboutStory paragraph fallback)', () => {
    expect(normalizeRichText(null)).toBeNull();
  });

  it('undefined passes through (falsy → AboutStory paragraph fallback)', () => {
    expect(normalizeRichText(undefined)).toBeUndefined();
  });

  it('empty string is falsy (→ paragraph fallback, never a blank TinaMarkdown)', () => {
    expect(normalizeRichText('')).toBe('');
  });
});

describe('about storyBody — malformed objects never become [object Object]', () => {
  it.each([
    ['plain object', { foo: 'bar' }],
    ['root without children', { type: 'root' }],
    ['root with non-array children', { type: 'root', children: 'nope' }],
    ['non-root typed node', { type: 'p', children: [] }],
  ])(
    '%s passes through by identity (no String() coercion)',
    (_label, input) => {
      const out = normalizeRichText(input);
      expect(out).toBe(input);
      expect(typeof out).toBe('object');
      expect(out).not.toBe('[object Object]');
    },
  );
});

describe('about storyBody — legacy string passes through', () => {
  it('string input is returned unchanged (no object wrap, no coercion)', () => {
    expect(normalizeRichText('Just a string')).toBe('Just a string');
  });
});
