---
name: ukbt-browser-forensics
description: Use for browser-based debugging of Tina admin, iframe, postMessage, CSP, cookies, storage, network requests, island replacement, DevTools, or Playwright.
---

# UKBT Browser Forensics

Project authority: `AGENTS.md`; live-site observation > contracts > past chat.

## When to load
Tina admin, iframe, postMessage, CSP, cookies/storage, network, island replacement, DevTools, Playwright, `/tina-island/*`, Tina bridge.

## Rules
- Use Playwright MCP (`npx @playwright/mcp`) + Chrome DevTools MCP; exhaust MCP/browser capabilities before declaring blocked.
- `adminOrigin` is `["https://ukbanglatigers.co.uk"]` bare — trailing slash breaks bridge strict `includes(event.origin)`.
- Dual-CSP intersection: global + scoped `_headers` intersect; scoped relaxation is no-op — verify live headers.
- Never fabricate auth; ABSTAIN when session unavailable.
- Quote snapshot refs, console lines, network table with status.

## Workflow
LOAD → DELEGATE to `browser-forensics` → snapshot + console + network + frame tree → CSP/bridge analysis → verdict.
