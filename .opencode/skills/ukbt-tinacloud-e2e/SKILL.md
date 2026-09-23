---
name: ukbt-tinacloud-e2e
description: Use for TinaCloud Save, Git-backed CMS sync, GitHub App commits, branch indexing, production edit verification, media sync, revert verification, or end-to-end CMS commissioning.
---

# UKBT TinaCloud E2E

Project authority: `AGENTS.md`. Community skills are supporting only.

## When to load
TinaCloud Save, Git-backed sync, GitHub App commits, branch/indexing, production edit verification, media sync, revert, end-to-end commissioning.

## Rules
- Never claim E2E from static tests; real browser/network evidence required (Tina commit SHA → GH → CI → Workers Build SHA → live value).
- Never fabricate auth/session; ABSTAIN when blocked — no simulated Save, no manual commit as proof.
- Free plan: direct-save only (Editorial Workflow unavailable), single-repo toggle OFF.
- Default authoring "Act as the bot" for App-bypass verification.
- Trace full chain before VERIFIED; fail closed on gap.

## Workflow
LOAD → DELEGATE to `tinacloud-commissioner` → browser Save (Playwright/Chrome DevTools) → trace SHA chain → verify live → revert → close.
