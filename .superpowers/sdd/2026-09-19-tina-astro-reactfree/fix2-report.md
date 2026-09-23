# Fix 2 Report — FAQ answer rich-text → string (unblock editor)

- Date (UTC): 2026-09-20
- Branch: `fix/tina-contract-alignment`
- Commit: fix(tina): FAQ answer rich-text -> string (unblock editor) — SHA see git log (branch fix/tina-contract-alignment)
- E2E blocker: `e2e-report2.md` BLOCKED — same `invalid_markdown` + `value.replace is not a function` after 71c8208 (marks removal insufficient); GraphQL `items { answer }` returns `invalid_markdown` wrapper for all 3 answers, Save rejected.

## 1. Before / After — tina/config.ts field config

**Before** (`tina/config.ts:263-268`):
```ts
{
  type: 'rich-text',
  name: 'answer',
  label: 'Answer',
  required: true,
},
```

**After** (`tina/config.ts:263-269`):
```ts
{
  type: 'string',
  name: 'answer',
  label: 'Answer',
  required: true,
  ui: { component: 'textarea', validate: (v: string) => (!v ? 'Required' : v.length > 500 ? 'Keep under 500 characters' : undefined) },
},
```
- Only `items > answer` changed. Other fields (`question`, `visible`, `pageHeading`, `pageEyebrow`) untouched. `about.storyBody` kept as `rich-text` per job spec (rung 1: FAQ answers are plain paragraphs, rich-text is over-engineering).

## 2. Before / After — data snippet apps/web/content/faq/faq.json

**Before** (each item, Plate JSON):
```json
"answer": {
  "type": "root",
  "children": [{ "type": "p", "children": [{ "type": "text", "text": "Visit the Join page or contact us at info@ukbanglatigers.co.uk. Trials and training details are shared via our social channels." }] }]
}
```

**After** (exact inner text, no markdown, no trimming):
```json
"answer": "Visit the Join page or contact us at info@ukbanglatigers.co.uk. Trials and training details are shared via our social channels."
```
Applied to 3 items:
- Item 1: `Visit the Join page or contact us at info@ukbanglatigers.co.uk. Trials and training details are shared via our social channels.`
- Item 2: `Training venues are confirmed seasonally. Check the Community and Coaching pages, or message the club on social media for current details.`
- Item 3: `The club fields senior internationals and supports development pathways. Contact the coaching team for the latest academy and junior provision.`
`question` and `visible` unchanged.

Full diff:
```diff
-      "answer": { "type": "root", "children": [...] },
+      "answer": "Visit the Join page or contact us at info@ukbanglatigers.co.uk. ...",
```

## 3. Component diff — FAQSection.astro + loaders + faq.astro

**apps/web/src/components/FAQSection.astro**:
```diff
-import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro';
-import { tinaField, type TinaRichTextContent } from '@tinacms/astro';
+import { tinaField } from '@tinacms/astro';
 interface FaqItem {
   question: string;
-  answer: TinaRichTextContent;
+  answer: string;
 }
-// ponytail: unwrap Tina invalid_markdown wrapper ...
-function normalizeRichText(content: any) { ... }
 ---
-        <div class="ukbt-faq-answer" data-tina-field={tinaField(item, "answer")}><TinaMarkdown content={normalizeRichText(item.answer)} /></div>
+        <div class="ukbt-faq-answer" data-tina-field={tinaField(item, "answer")}><p>{item.answer}</p></div>
```
- Removed unused `TinaMarkdown` and `normalizeRichText` (kept `tinaField` for question/answer markers). Visible filter and question rendering unchanged.

**apps/web/src/lib/tina/loaders.ts**:
```diff
 const FaqItemSchema = z.object({
   question: z.string(),
-  answer: z.unknown(),
+  answer: z.string(),
   visible: z.boolean().optional(),
 });
```

**apps/web/src/pages/faq.astro**:
```diff
-import { type TinaRichTextContent } from '@tinacms/astro';
-const visibleItems = ((tinaFaq.items || []) as Array<{ question: string; answer: TinaRichTextContent; visible?: boolean; ... }>)
+const visibleItems = ((tinaFaq.items || []) as Array<{ question: string; answer: string; visible?: boolean; ... }>)
```
- `apps/web/src/lib/tina/islands.ts` no schema; `AboutSchema.storyBody: z.unknown()` unchanged.

## 4. Verify outputs

**pnpm lint**:
```
Checked 83 files in 388ms. No fixes applied.
```

**pnpm typecheck**:
```
packages/truth typecheck: Done
apps/web typecheck: Result (75 files): - 0 errors - 0 warnings - 4 hints
  hints: 3 unused _tina* vars + inline script is:inline (pre-existing)
```

**node string check**:
```
node -e "const j=require('./apps/web/content/faq/faq.json'); console.log(j.items.every(it=>typeof it.answer==='string')?'all strings':'not strings'); console.log(j.items.map(it=>it.answer.slice(0,30)))"
all strings
[ 'Visit the Join page or contact', 'Training venues are confirmed ', 'The club fields senior interna' ]
```

**pnpm exec tinacms build --skip-search-index --skip-cloud-checks**:
```
Starting Tina build
○  Tina build complete
  🦙 Tina Config  API url: https://content.tinajs.io/3.0/content/dummy /github/main
  🤖 Auto-generated files  GraphQL Client: tina/__generated__/client.ts  Typescript Types: tina/__generated__/types.ts  Static HTML file: apps/web/public/admin/index.html
```
- `tina/__generated__` is gitignored (not in `git ls-files`); types already show `answer: string` (`FaqPartsFragment answer: string`). No manual edit.
- `tina/tina-lock.json` unchanged (`git diff -- tina/tina-lock.json` empty) — not committed per research (dev-only, string type change needs no lock).

## 5. Commit

- Branch `fix/tina-contract-alignment` only, no push to main.
- Files staged: `tina/config.ts`, `apps/web/content/faq/faq.json`, `apps/web/src/components/FAQSection.astro`, `apps/web/src/lib/tina/loaders.ts`, `apps/web/src/pages/faq.astro`, plus this report.
- Suggested next: re-run `tina-faq-e2e-r2b.js` — expect Save success, disk `pageEyebrow=FAQ-E2E-<timestamp>`, `git status --short` shows `M apps/web/content/faq/faq.json`, then `git checkout -- apps/web/content/faq/faq.json` to revert.
