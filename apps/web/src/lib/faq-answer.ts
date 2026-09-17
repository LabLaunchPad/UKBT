/**
 * FAQ answer renderer — REM-001 trusted renderer for untrusted CMS content.
 *
 * INVARIANT (CORR-W1-01): Tina-supplied answer text must never reach an
 * executable/raw-HTML browser sink. This module is the single choke point:
 * `apps/web/src/pages/faq.astro` renders its output via `set:html`, which is
 * safe ONLY because every string below is escaped first.
 *
 * Allowed output: `<p>` elements containing escaped text. Nothing else.
 * - Allowed elements: `p`.
 * - Allowed attributes: none.
 * - Allowed URL schemes: n/a (no URLs are emitted; links are not rendered).
 * - Rich-text marks (bold/italic/links): intentionally dropped, matching the
 *   pre-REM-001 renderer — text content is preserved, markup is not honored.
 * - Malformed/nested markup in input: escaped as literal text (no parsing).
 * - Non-object input (incl. null/undefined): escaped `String()` in `<p>`,
 *   preserving legacy semantics without the injection hole.
 */

interface FaqRichTextLeaf {
  text?: string;
}

interface FaqRichTextBlock {
  children?: FaqRichTextLeaf[];
}

/** Escape the five HTML-significant characters. Output is inert text. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render one CMS answer value to safe HTML (paragraphs of escaped text). */
export function renderFaqAnswer(answer: unknown): string {
  if (
    answer &&
    typeof answer === 'object' &&
    'children' in (answer as Record<string, unknown>)
  ) {
    const nodes = (answer as { children: FaqRichTextBlock[] }).children;
    return nodes
      .map((p) => {
        const text = (p.children || []).map((t) => t.text || '').join('');
        return `<p>${escapeHtml(text)}</p>`;
      })
      .join('');
  }
  return `<p>${escapeHtml(String(answer))}</p>`;
}
