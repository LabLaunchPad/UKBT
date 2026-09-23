---
description: Authenticated browser-first TinaCloud commissioning — Save → Git commit → CI → Workers → production → click-to-edit → revert
agent: tinacloud-commissioner
---

Delegate to `tinacloud-commissioner` subagent. Scope: $ARGUMENTS (empty = FAQ pageEyebrow E2E).

Tasks:
1. Verify TinaCloud project (LabLaunchPad/UKBT, branch main, indexing) and GitHub App bypass ruleset via evidence (screenshots/API where available).
2. Use real browser session (`playwright` + `chrome-devtools` MCP) at `https://ukbanglatigers.co.uk/admin/` — login as M Chowdhury. Exhaust MCP capabilities before declaring blocked; never fabricate auth.
3. Perform TinaCloud Save: edit FAQ `pageEyebrow` `FAQ → FAQ-TINA-E2E-<UTC>` → preview → Save.
4. Trace: Tina commit SHA → `gh` commit → CI run → Workers Build SHA → live probe (`curl https://ukbanglatigers.co.uk/faq/`) → click-to-edit marker check.
5. Revert via Tina (`FAQ-TINA-E2E-* → FAQ`) and trace second SHA.

Return commit SHAs, CI/Build links, live values, and final status VERIFIED_E2E / HUMAN_ACTION_REQUIRED / FAILED. Never simulate Save with manual `git commit`.
