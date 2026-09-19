---
name: ukbt-tinacms
description: Use for TinaCMS config, TinaField, TinaIsland, visual editing, Tina rich text, Tina media, Tina schema, generated Tina artifacts, or CMS field mapping.
---

# UKBT TinaCMS

Project authority: `AGENTS.md` + `tina/config.ts` (source), `tina/tina-lock.json` (synchronized). Community skills (cloudflare/skills, etc.) are supporting knowledge only.

## When to load
Tina config, TinaField, TinaIsland, visual editing, rich text, media, schema/renderer parity, `requestWithMetadata`, `data-tina-field`.

## Rules
- Never edit `tina/__generated__/` directly; `tina/config.ts` is canonical.
- Verify versions from `package.json` — Astro 7.x, `@tinacms/astro` 0.7.0, `tinacms` 3.x, `@astrojs/cloudflare` 14.x. Do not trust obsolete skill claims.
- Use `validateWithPreserve` + Zod; fail closed on drift. Server island props must be JSON-serializable (no functions/circular) — Astro crypts per build.
- Island CSS duplicates — check `scripts/check-perf.mjs` budget `cssTotal` (currently 96KB). About page uses 3 islands (`aboutHero/aboutStory/aboutLeadership`), index uses `hero/aboutSection/whyChooseUs`.
- Avoid dual `data-tina-field` + `data` paths in `about.astro` — prefer single `data` source.
- Evidence: `tina/config.ts:line`, parity output (28 checks), file:line for every `tinaField`.

## Workflow
DISCOVER → CLASSIFY → LOAD → DELEGATE to `tina-architect` → VERIFY (`check-tina-field-parity`, `typecheck`) → SYNTHESIZE.
